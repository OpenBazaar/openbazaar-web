import {
  omit,
  orderBy,
} from 'lodash';
import arrayMove from 'array-move';
import multihashes from 'multihashes';
import crypto from 'crypto';
import { get as getDb } from 'util/database';
import { eventChannel, END } from 'redux-saga'
import {
  takeEvery,
  put,
  call,
  select,
  fork,
} from 'redux-saga/effects';
import { animationFrameInterval } from 'util/index';
import { sendMessage as sendChatMessage } from 'util/messaging/index';
import messageTypes from 'util/messaging/types';
import {
  convosRequest,
  convosSuccess,
  convosFail,
  convoChange,
  activateConvo,
  convoActivated,
  convoMessagesRequest,
  convoMessagesSuccess,
  convoMessagesFail,
  messageDbChange,
  activeConvoMessagesChange,
  sendMessage,
  cancelMessage,
  convoMarkRead,
} from 'actions/chat';
import { directMessage } from 'actions/messaging';
import { AUTH_LOGOUT } from 'actions/auth';

let _chatData = null;
let _gettingChatData = null;

window.muchData = () => {
  const promises = [];

  for (var i = 0; i < 1400; i++) {
    promises.push(() => window.inboundChatMessage());
  }

  promises.reduce( async (previousPromise, nextProm) => {
    await previousPromise;
    return nextProm();
  }, Promise.resolve());
}

const _cloneConvo = (base = {}) => {
  return {
    messages: { ...base.messages } || {},
    unread: base.unread || 0,
    _sorted: base._sorted,
    get sorted() {
      if (!this._sorted) {
        this._sorted = orderBy(
          Object.keys(this.messages).map(messageID => ({
            messageID,
            timestamp: this.messages[messageID].timestamp,
          })),
          ['timestamp'],
          ['asc']
        ).map(message => message.messageID);
      }

      return this._sorted;
    },
    set sorted(arr) {
      this._sorted = arr;
    },
  };  
};

const _removeMessage = (peerID, messageID) => {
  if (
    !_chatData ||
    !_chatData[peerID] ||
    !_chatData[peerID].messages ||
    !_chatData[peerID].messages[messageID]
  ) return;
  const convo = _cloneConvo(_chatData[peerID]);
  delete convo.messages[messageID];
  if (
    convo._sorted &&
    convo._sorted.includes(messageID)
  ) {
    const newSorted = [...convo._sorted];
    newSorted.splice(newSorted.indexOf(messageID), 1);
    convo._sorted = newSorted;
  }

  if (!Object.keys(convo.messages).length) {
    delete _chatData[peerID];  
  } else {
    _chatData[peerID] = convo;
  }
}

const _setMessage = (peerID, message) => {
  const convo = _cloneConvo(_chatData[peerID]);
  const prevMessage = convo.messages[message.messageID];
  const curMessage = { ...prevMessage, ...message };

  if (!curMessage.outgoing) {
    if ((prevMessage && prevMessage.read !== curMessage.read)) {
      if (curMessage.read && convo.unread > 0) {
        convo.unread -= 1;
      } else if (!curMessage.read) {
        convo.unread += 1;
      }
    } else if (!prevMessage && !curMessage.read) {
      convo.unread += 1;
    }
  }

  const _sorted = convo._sorted;

  if (_sorted && (!prevMessage || prevMessage.timestamp !== curMessage.timestamp)) {
    // If it's a new message or the timestamp changed and there was already a sorted
    // cached list, we'll try and insert the new message in the right place starting
    // from the bottom, since the vast majority of new messages should be at the end
    // of list.
    let i = _sorted.length;

    while (i > 0 && curMessage.timestamp < convo.messages[_sorted[i - 1]].timestamp) {
      i--;
    }

    if (_sorted.includes(message.messageID)) {
      convo.sorted = arrayMove(convo.sorted, _sorted.indexOf(message.messageID), i);
    } else {
      convo.sorted = [..._sorted.slice(0, i), curMessage.messageID, ..._sorted.slice(i)];
    }
  }

  convo.messages[curMessage.messageID] = curMessage;

  _chatData[peerID] = convo;
}

const createTimeoutChannel = time =>
  eventChannel(emitter => {
      const timeout = setTimeout(() => {
        emitter('something');
        emitter(END);
      }, time);
      return () => {
        clearInterval(timeout)
      }
    }
  );

let pendingActiveConvoMessageChange = null;

/*
 * This method will dispatch an activeConvoMessagesChange and conditionally
 * debounce it. If the changed data is a message being marked as read or
 * vice-versa, then any such changes will be debounced into a single change
 * action that contains the cumulitive changed data. Otherwise, the change data
 * will immediatally be dispatched.
 */
const dispatchActiveConvoMessagesChangeAction = function* (payload) {
  if (!payload.unreadUpdate) {
    // If it's not an update of the read bool, fire the action right away.
    yield put(activeConvoMessagesChange(payload));
  } else {
    if (pendingActiveConvoMessageChange) {
      pendingActiveConvoMessageChange.channel.close();
    }

    pendingActiveConvoMessageChange = pendingActiveConvoMessageChange || {};
    pendingActiveConvoMessageChange.channel =
      yield call(createTimeoutChannel, 100);

    const prevPayload = { ...pendingActiveConvoMessageChange.payload } || {};

    pendingActiveConvoMessageChange.payload = {
      messages: {
        ...prevPayload.messages,
        ...payload.messages,
      },
      removed: [
        ...new Set(
          [...prevPayload.removed || [], ...payload.removed || []]
        )
      ],
    }
    
    if (payload.sorted) {
      pendingActiveConvoMessageChange.payload.sorted = payload.sorted;
    } else if (
      pendingActiveConvoMessageChange.payload &&
      pendingActiveConvoMessageChange.payload.sorted
    ) {
      pendingActiveConvoMessageChange.payload.sorted =
        prevPayload.sorted;
    }

    yield takeEvery(pendingActiveConvoMessageChange.channel, function* () {
      yield put(activeConvoMessagesChange(pendingActiveConvoMessageChange.payload));
    });
  }
}

const convoChangeChannels = {};

const setMessage = function* (message, options = {}) {
  yield call(getChatData);

  const opts = {
    remove: false,
    ...options,
  };

  let messageID;
  let peerID = message ? message.peerID : null;

  if (typeof message !== 'object') {
    throw new Error('A message should be provided as an object.');
  }

  if (typeof message.messageID !== 'string' || !message.messageID) {
    throw new Error('The message object must contain a messageID string.');
  } else {
    messageID = message.messageID;
  }

  if (!opts.remove) {
    if (Object.keys(message).length < 2) {
      throw new Error('The message object should contain at least one property ' +
        'in addition to the messageID.');
    }
  }

  if (!peerID) {
    const peerData = Object.keys(_chatData)
      .find(peer => {
        const message = _chatData[peer] && _chatData[peer].messages ?
          _chatData[peer].messages[messageID] : null;
        if (message) {
          peerID = peer;
        }
        return !!message;
      });

    if (!peerData) {
      if (opts.remove) return;
      throw new Error('Unable to find the peer for the given messageID. If this is ' +
        'a new message, please pass in the peerID.');
    }
  }

  const state = yield select();
  const chatData = yield call(getChatData);
  const prevConvo = chatData[peerID];

  opts.remove ?
    _removeMessage(peerID, messageID) :
    _setMessage(peerID, message);
  
  const curConvo = chatData[peerID];

  const isUpdate = !!(
    !opts.remove &&
    prevConvo &&
    prevConvo.messages[messageID]
  );
  const isInsert = !opts.remove && !isUpdate;

  let convoChangeData;

  const setConvoChangeData = (topLevel = {}, data = {}) => {
    convoChangeData = {
      peerID,
      removed: false,
      ...convoChangeData,
      ...topLevel,
      data: {
        ...(convoChangeData && convoChangeData.data) || {},
        ...data,
      },
    };
  }

  if (!curConvo) {
    if (prevConvo) {
      setConvoChangeData({ removed: true });
    }
  } else {
    if (!prevConvo || prevConvo.unread !== curConvo.unread) {
      setConvoChangeData({}, { unread: curConvo.unread });
    }

    const prevLastMessage = prevConvo ?
      prevConvo.sorted[prevConvo.sorted.length - 1] : null;
    const curLastMessage = curConvo ?
      curConvo.sorted[curConvo.sorted.length - 1] : null;

    if (prevLastMessage !== curLastMessage) {
      setConvoChangeData(
        { message: curConvo.messages[curLastMessage] },
        { lastMessage: curLastMessage }
      );
    }
  }

  let activeConvoMessageChangeData;

  const setActiveConvoMessageChangeData = (data = {}) => {
    activeConvoMessageChangeData = {
      removed: [],
      ...data,
      unreadUpdate:
        isUpdate &&
        prevConvo.messages[messageID].read !==
          curConvo.messages[messageID].read
    };
  }

  let activeConvoPeerID;

  try {
    activeConvoPeerID = state.chat.activeConvo.peerID;
  } catch {
    // pass
  }

  // For efficiency purposes, there is no actual checking if the message
  // changed. The assumption is if you're calling this method it's with
  // changed message data.
  if (activeConvoPeerID === peerID) {
    if (options.remove) {
      const data = { removed: [ messageID ] };
      
      if (curConvo) {
        data.sorted = curConvo.sorted;
      }

      setActiveConvoMessageChangeData(data);
    } else {
      const data = {
        messages: {
          [message.messageID]: {
            ...curConvo.messages[messageID],
          }
        },
      };

      if (
        isInsert ||
        prevConvo.messages[messageID].timestamp !==
          curConvo.messages[messageID].timestamp
      ) {
        data.sorted = curConvo.sorted;
      }

      setActiveConvoMessageChangeData(data);
    }
  }

  if (convoChangeData) {
    // We will debounce the convoChange action so, for example, if you
    // mark a convo as read with 1000 unread messages, it results in only
    // a single convoChange action.
    if (convoChangeChannels[peerID]) {
      convoChangeChannels[peerID].close();
    }

    convoChangeChannels[peerID] = yield call(createTimeoutChannel, 100);

    yield takeEvery(convoChangeChannels[peerID], function* () {
      yield put(convoChange(convoChangeData));
    });
  }

  if (activeConvoMessageChangeData) {
    yield call(dispatchActiveConvoMessagesChangeAction, activeConvoMessageChangeData);
  }
}

/*
 * On first call, this method will pull all the chat data from the database.
 * decrypt it and store it in memory. Subsequent calls will return in-memory
 * data. Any chat changes that happen subsequent to the first call should
 * use setMessage to update the in-memory data structure. setMessage will
 * also dispatch change actions so reducers can update state if necessary.
 */
const getChatData = async peerID => {
  if (!_chatData) {
    if (!_gettingChatData) {
      console.time('getMessages');

      _gettingChatData = new Promise(async (chatDataResolve, chatDataReject) => {

        let unsentMessages = [];
        const db  = await getDb();

        console.time('allDocs');
        const docs = await Promise.all([
          db.collections.chatmessage.pouch
            .allDocs({
              include_docs: true,
            }),
          db.collections.unsentchatmessages.pouch
            .allDocs({
              include_docs: true,
            }),
        ]);
        console.timeEnd('allDocs');

        // Some weird meta records of some sort are coming in here. For now, we'll
        // just filter them out.
        const filterOutMeta = arr =>
          arr.filter(doc => !doc.id.startsWith('_design'));

        const messagesSent = filterOutMeta(docs[0].rows);
        const messagesUnsent = filterOutMeta(docs[1].rows);

        unsentMessages = messagesUnsent.map(msg => msg.id);

        const combined = messagesUnsent
          .concat(messagesSent);

        console.log(`${combined.length} total messages`);              

        const decrypted = [];

        // todo: don't fail everything if one decrypt fails.
        await animationFrameInterval(
          () => {
            const doc = combined[decrypted.length];

            decrypted.push({
              ...db.collections.chatmessage._crypter.decrypt({
                ...omit(doc.doc, ['_id']),
              }),
              messageID: doc.id,
            });                
          },
          () => decrypted.length < combined.length,
          { maxOpsPerFrame: 25 }
        );

        _chatData = {};
        decrypted.forEach(doc =>
          _setMessage(doc.peerID, {
            ...doc,
            sent: !inTransitMessages[doc.messageID] &&
              !unsentMessages.includes(doc.messageID),
            sending: !!inTransitMessages[doc.messageID],
          }));
        chatDataResolve(_chatData);
        console.timeEnd('getMessages');
      });
    }
  }

  const chatData = await _gettingChatData;

  return !!peerID ?
    chatData[peerID] : chatData;
};

function* getConvos(action) {
  try {
    console.time('getConvos');

    const chatData = yield call(getChatData);
    const convos = {};
    const messages = {};

    Object
      .keys(chatData)
      .forEach(peerID => {
        const lastMessage = chatData[peerID].messages[
          chatData[peerID].sorted[
            chatData[peerID].sorted.length - 1
          ]
        ];

        convos[peerID] = {
          unread: chatData[peerID].unread,
          lastMessage: lastMessage.messageID,
        };

        messages[lastMessage.messageID] = lastMessage;
      });

    console.timeEnd('getConvos');

    yield put(convosSuccess({
      convos,
      messages,
    }));
  } catch (e) {
    console.error(e);
    yield put(convosFail(e.message || ''));
  }
}

// TODO: cancel existing async tasks on deactivate convo and logout
// this might make the noAuthNoChat middleware moot.

const getMessagesList = async (db, peerID) => {
  const convoData = await getChatData(peerID);
  let sorted = [];
  let messages = {};

  if (convoData) {
    sorted = convoData.sorted;
    messages = convoData.messages;
  }

  return {
    sorted,
    messages,
  };
};

function* getConvoMessages(action) {
  const peerID = action.payload.peerID;

  try {
    const db = yield call(getDb);
    const messages = yield call(getMessagesList, db, peerID);

    yield put(
      convoMessagesSuccess({
        peerID,
        ...messages,
      })
    );
  } catch (e) {
    yield put(
      convoMessagesFail({
        peerID,
        error: e.message || ''
      })
    );
  }
}

function* handleActivateConvo(action) {
  const peerID = action.payload;

  yield put(convoActivated({ peerID }));
  yield put(convoMessagesRequest({ peerID }));
}

function* handleMessageDbChange(action) {
  // The majority of these actions can and should be ignored because if
  // the action that caused the DB change was initiated from this app,
  // then the data is already in the in-mem data structure and any necessary
  // state should have already been updated.
  //
  // The exception to that is data that is being synced over, e.g. data that
  // was generated by using the app on a different browser / device.
  //
  // Since there doesn't appear to be a way to distinguish a synced change
  // event from a non-synced one, we'll do a little data introspection to find
  // what's useful for us.

  // TODO: note about calling setMessage before a db change.

  if (
    action.payload.operation === 'DELETE' ||
    !action.payload.sent
  ) return;

  const {
    peerID,
    messageID,
    read,
  } = action.payload.data;

  const convo = yield call(getChatData, peerID);
  let message = convo  ?
    convo[messageID] : null;

  // Really, at this time, the only actions that would come via syncing would
  // be new messages or message being marked as read.
  if (
    !message || message.read !== read
  ) {
    console.log('round and around and around and around we go');
    yield call(setMessage, {
      ...action.payload.data,
      sent: true,
      sending: false,
    });
  }
}

function generatePbTimestamp(timestamp) {
  if (!(timestamp instanceof Date)) {
    throw new Error('A timestamp must be provided as a Date instance.');
  }

  return {
    seconds: Math.floor(timestamp / 1000),
    nanos: timestamp % 1000,
  };
}

function generateChatMessageData(message, options = {}) {
  if (
    typeof options.timestamp !== 'undefined' &&
    !(options.timestamp instanceof Date)
  ) {
    throw new Error('If providing a timestamp, it must be provided as ' +
      'a Date instance.');
  }

  if (
    typeof options.subject !== 'undefined' &&
    typeof options.subject !== 'string'
  ) {
    throw new Error('If providing a subject, it must be provided as ' +
      'a string.');
  }  

  const opts = {
    subject: '',
    timestamp: new Date(),
    ...options,
  };

  const combinationString = `${opts.subject}!${opts.timestamp.toISOString()}`;
  const idBytes = crypto.createHash('sha256').update(combinationString).digest();
  const idBytesArray = new Uint8Array(idBytes);
  const idBytesBuffer =  new Buffer(idBytesArray.buffer);
  const encoded = multihashes.encode(idBytesBuffer, 0x12);  
  const messageID = multihashes.toB58String(encoded);

  return {
    messageID,
    timestamp: opts.timestamp.toISOString(),
    timestampPB: generatePbTimestamp(opts.timestamp),
  }
}

const inTransitMessages = {};

/*
 * If sending a new message, only the peerID and message (actual text of the
 * message) should be provided. If retrying a failed message, it is necessary
 * to additionally provide the messageID and timestamp of the original send
 * attempt.
 */
function* handleSendMessage(action) {
  if (typeof action.payload.peerID !== 'string' || !action.payload.peerID) {
    throw new Error('Please provide a peerID as a string.');
  }

  // This will likely need to be adjusted for "typing" messages where I believe
  // we send an empty message (?)
  if (typeof action.payload.message !== 'string' || !action.payload.message) {
    throw new Error('Please provide a message as a string.');
  }

  const isRetry = !!action.payload.messageID;

  if (isRetry) {
    if (typeof action.payload.timestamp !== 'string' ||
      !action.payload.timestamp) {
      throw new Error('When retrying a failed message, please include the original ' +
        'message timestamp.');
    }
  }
   
  const peerID = action.payload.peerID;
  const message = action.payload.message;
  const generatedChatMessageData = generateChatMessageData(message);
  const messageID = isRetry ?
    action.payload.messageID : generatedChatMessageData.messageID;
  const {
    timestamp,
    timestampPB,
  } = generatedChatMessageData;

  const messageData = {
    messageID,
    peerID,
    message,
    outgoing: true,
    timestamp,
    read: false,
    subject: '',
  }

  yield call(setMessage, {
    ...(
      !isRetry ?
        messageData :
        { messageID }
    ),
    sending: true,
    sent: false,
  });

  inTransitMessages[peerID] = inTransitMessages[peerID] || {};
  inTransitMessages[peerID][messageID] = true;

  const db = yield call(getDb);
  let unsentMessageDoc;
  
  try {
    unsentMessageDoc = yield call(
      [db.collections.unsentchatmessages, 'upsert'],
      messageData,
    );
  } catch (e) {
    const msg = message.length > 10 ?
      `${message.slice(0, 10)}…` : message;
    console.error(`Unable to save message "${msg}" in the ` +
      'unsent chat messages DB.');
    // We'll just proceed without it. It really just means that if the
    // send fails and the user closes the app, it will be lost.
  }

  let messageSendFailed;

  try {
    yield call(
      sendChatMessage,
      messageTypes.CHAT,
      peerID,
      {
        messageId: messageID,
        subject: messageData.subject,
        message: messageData.message,
        timestamp: timestampPB,
        flag: 0
      }
    );
  } catch (e) {
    const msg = message.length > 10 ?
      `${message.slice(0, 10)}…` : message;
    console.error(`Unable to send the chat message "${msg}".`);
    console.error(e);
    messageSendFailed = true;
  } finally {
    delete inTransitMessages[peerID][messageID];
  }

  let sentMessageInsertedDoc;

  if (!messageSendFailed) {
    try {
      sentMessageInsertedDoc = yield call(
        [db.collections.chatmessage, 'insert'],
        messageData
      );
    } catch (e) {
      const msg = message.length > 10 ?
        `${message.slice(0, 10)}…` : message;
      console.error(`Unable to save the sent message "${msg}" in the ` +
        'chat messages DB.');
      console.error(e);
    }
  }

  const completedData = {
    sent: !messageSendFailed,
    sending: false,
    timestamp: isRetry && messageSendFailed ?
      action.payload.timestamp : timestamp,
  }

  // _rev is needed for bulkDocs operations, so putting it in the cache
  if (sentMessageInsertedDoc) {
    completedData._rev = sentMessageInsertedDoc.get('_rev');
  }

  yield call(setMessage, {
    peerID,
    messageID,
    ...completedData
  });

  if (messageSendFailed || !sentMessageInsertedDoc) return;

  if (unsentMessageDoc) {
    try {
      yield call([unsentMessageDoc, 'remove']);
    } catch (e) {
      // pass
    }
  }
}

function* handleCancelMessage(action) {
  const messageID = action.payload.messageID;

  if (
    typeof messageID !== 'string' ||
    !messageID
  ) {
    throw new Error('A messageID is required in order to cancel a message.');
  }

  yield call(setMessage, { messageID }, { remove: true });

  const db = yield call(getDb);
  let unsentMessageDoc;
  
  try {
    unsentMessageDoc =
      yield call(
        async () => await db.collections.unsentchatmessages
          .findOne()
          .where('messageID')
          .eq(messageID)
          .exec()
          .then()
      );
  } catch {
    // pass
  }

  if (unsentMessageDoc) {
    yield call([unsentMessageDoc, 'remove']);
  }
}

const convoMarkingAsRead = {};

function* handleConvoMarkRead(action) {
  console.time('markAsRead');

  const peerID = action.payload.peerID;

  if (convoMarkingAsRead[peerID]) {
    console.log('no soup for you. no soup for you.');
    return;
  }

  convoMarkingAsRead[peerID] = true;

  const convoData = yield call(getChatData, peerID);
  const updateMessages = Object.keys(convoData.messages || {})
    .filter(messageID => {
      const msg = convoData.messages[messageID];
      return !msg.read && !msg.outgoing;
    });

  console.time('markAsReadSetMessage');

  for (let i = 0; i < updateMessages.length; i++) {
    yield fork(
      setMessage,
      {
        peerID,
        messageID: updateMessages[i],
        read: true
      });
  }

  console.timeEnd('markAsReadSetMessage');

  const updateMessagesDb = updateMessages
    .filter(messageID => !!convoData.messages[messageID]._rev);
  const encryptedUpdateMessagesDb = [];

  if (!updateMessagesDb.length) {
    console.timeEnd('markAsRead');
    return;
  }

  const db = yield call(getDb);

  console.time('markAsReadEncrypt');
  yield call(
    animationFrameInterval,
    () => {
      console.log('boom');
      const msg = {
        ...convoData.messages[updateMessages[encryptedUpdateMessagesDb.length]]
      };      

      const _rev = msg._rev;
      const _id = msg.messageID;
      delete msg._rev;
      delete msg.messageID;

      if (encryptedUpdateMessagesDb.length < updateMessagesDb.length) {
        encryptedUpdateMessagesDb.push({
          ...db.chatmessage._crypter.encrypt({
            ...msg,
            read: true,
          }),
          _id,
          _rev,
        });
      }
    },
    () => encryptedUpdateMessagesDb.length < updateMessagesDb.length,
    { maxOpsPerFrame: 25 }
  );
  console.timeEnd('markAsReadEncrypt');

  console.time('markAsReadBulkDocs');
  yield call(
    [db.chatmessage.pouch, 'bulkDocs'],
    encryptedUpdateMessagesDb
  );
  console.timeEnd('markAsReadBulkDocs');
  console.timeEnd('markAsRead');

  convoMarkingAsRead[peerID] = false;
}

function* handleDirectMessage(action) {
  if (action.payload && action.payload.type === messageTypes.CHAT) {
    const peerID = action.payload.peerID;
    const message = action.payload.payload;

    if (message.flag) {
      // ignore "read" and "typing" messages for now
      return;
    }

    const msg = message.message.length > 10 ?
      `${message.message.slice(0, 10)}…` : message.message;    

    console.log(`writing "${msg}" from ${peerID} to the database`);

    const db = yield call(getDb);
    const state = yield select();

    const msgData = {
      peerID,
      message: message.message,
      messageID: message.messageId,
      timestamp: (
        (new Date(
          Number(
            String(message.timestamp.seconds) +
            String(message.timestamp.nanos)
          )
        )).toISOString()
      ),
      subject: message.subject,
      outgoing: false,
      read: !!(
        state.chat &&
          state.chat.chatOpen &&
          state.chat.activeConvo &&
          state.chat.activeConvo.peerID === peerID
      ),
    };

    let chatDoc;

    try {
      chatDoc = yield call(
        [db.collections.chatmessage, 'insert'],
        msgData,
      );
    } catch (e) {
      // TODO: maybe some type of retry? A db insertion failure I would think
      // would be very rare.
      console.error(`Unable to insert direct message ${msg} from ${peerID} ` +
        'into the database.');
      console.error(e);
    }

    const setMessageData = {
      ...msgData,
      sending: false,
      sent: false,
    };
    
    if (chatDoc) {
      setMessageData._rev = chatDoc.get('_rev');
    }

    yield call(setMessage, setMessageData);
  }
}

function handleLogout() {
  _gettingChatData = null;
  _chatData = null;
}

export function* convosRequestWatcher() {
  yield takeEvery(convosRequest, getConvos);
}

export function* activateConvoWatcher() {
  yield takeEvery(activateConvo, handleActivateConvo);
}

export function* convoMessagesRequestWatcher() {
  yield takeEvery(convoMessagesRequest, getConvoMessages);
}

export function* messageDbChangeWatcher() {
  yield takeEvery(messageDbChange, handleMessageDbChange);
}

export function* sendMessageWatcher() {
  yield takeEvery(sendMessage, handleSendMessage);
}

export function* convoMarkReadWatcher() {
  yield takeEvery(convoMarkRead, handleConvoMarkRead);
}

export function* directMessageWatcher() {
  yield takeEvery(directMessage, handleDirectMessage);
}

export function* cancelMessageWatcher() {
  yield takeEvery(cancelMessage, handleCancelMessage);
}

export function* logoutWatcher() {
  yield takeEvery(AUTH_LOGOUT, handleLogout);
}