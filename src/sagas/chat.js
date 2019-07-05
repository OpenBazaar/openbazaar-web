import {
  omit,
  orderBy,
} from 'lodash';
import multihashes from 'multihashes';
import crypto from 'crypto';
import { get as getDb } from 'util/database';
import {
  takeEvery,
  put,
  call,
  select,
  debounce,
} from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
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
  messageChange,
  sendMessage,
  cancelMessage,
  convoMarkRead,
} from 'actions/chat';
import { directMessage } from 'actions/messaging';
import sizeOf from 'object-sizeof';

window.orderBy = orderBy;
window.sizeof = sizeOf;

let _messageDocs;
let _chatData;

window.muchData = () => {
  const promises = [];

  for (var i = 0; i < 4000; i++) {
    promises.push(() => window.inboundChatMessage());
  }

  promises.reduce( async (previousPromise, nextProm) => {
    await previousPromise;
    return nextProm();
  }, Promise.resolve());
}

// doc me up
const getChatData = async peerID => {
  if (!_chatData) {
    console.time('getMessages');
    if (!_messageDocs) {
      _messageDocs = new Promise((resolve, reject) => {
        let db;

        getDb()
          .then(dbInstance => {
            db = dbInstance;

            console.time('allDocs');

            return Promise.all([
              db.collections.chatmessage.pouch
                .allDocs({
                  include_docs: true,
                }),
              db.collections.unsentchatmessages.pouch
                .allDocs({
                  include_docs: true,
                }),
            ]);
          }).then(docs => {
            console.timeEnd('allDocs');

            // Some weird meta records of some sort are coming in here. For now, we'll
            // just filter them out.
            const filterOutMeta = arr =>
              arr.filter(doc => !doc.id.startsWith('_design'));

            const sentMessages = filterOutMeta(docs[0].rows);
            const unsentMessages = filterOutMeta(docs[1].rows);

            const combined = unsentMessages
              .concat(sentMessages);

            const decrypted = [];

            // todo: don't fail everything if one decrypt fails.
            animationFrameInterval(
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
            ).then(() => resolve(decrypted));
          });
      });      
    }

    const docs = await _messageDocs;

    _chatData = docs.reduce((acc, doc) => {
      const peerID = doc.peerID;
      let unread = (
        acc[peerID] &&
        acc[peerID].unread
      ) || 0;

      if (!doc.outoing && !doc.read) unread += 1;

      acc[peerID] = {
        messages: {
          ...(acc[peerID] && acc[peerID].messages),
          // todo: consider stripping the messageID from the doc to save on
          // memory consumption. It's duplicated in the key.
          // Consider removing the peerID for the same reason.
          [doc.messageID]: { ...doc },
        },
        get sorted() {
          if (!acc[peerID]._sorted) {
            acc[peerID]._sorted = orderBy(
              Object.keys(acc[peerID].messages).map(messageID => ({
                messageID,
                ...acc[peerID].messages[messageID].timestamp,
              })),
              ['timestamp'],
              ['desc']
            ).map(message => message.messageID);
          }

          return acc[peerID]._sorted;
        },
        set sorted(arr) {
          acc[peerID]._sorted = arr;
        },
        unread,
      }
      
      return acc;
    }, {});

    _messageDocs = null;
    console.timeEnd('getMessages');
  }

  return peerID ?
    _chatData[peerID] : _chatData;
};

console.log('milly');
window.milly = getChatData;

let chatMessagesCol;

const getChatMessagesCol = async database => {
  if (chatMessagesCol) return chatMessagesCol;
  console.time('getChatCol');
  const db = database || (await getDb());
  chatMessagesCol = await db.collections.chatmessage.inMemory();
  // chatMessagesCol = db.collections.chatmessage;
  console.timeEnd('getChatCol');
  return chatMessagesCol;  
};

let unsentChatMessagesCol;

const getUnsentChatMessagesCol = async database => {
  if (unsentChatMessagesCol) return unsentChatMessagesCol;
  console.time('getUnsentChatCol');
  const db = database || (await getDb());
  unsentChatMessagesCol = await db.collections.unsentchatmessages.inMemory();
  // unsentChatMessagesCol = db.collections.unsentchatmessages;
  console.timeEnd('getUnsentChatCol');
  return unsentChatMessagesCol;
};

const convoUnreads = {};

const _convoUnreadsAddRemove = (add, peerID, messageID) => {
  if (!convoUnreads[peerID]) {
    convoUnreads[peerID] = new Set();
  }

  return convoUnreads[peerID][add ? 'add' : 'delete'](messageID);
}

const convoUnreadsAdd = (peerID, messageID) => {
  return _convoUnreadsAddRemove(true, peerID, messageID);
}

const convoUnreadsRemove = (peerID, messageID) => {
  return _convoUnreadsAddRemove(false, peerID, messageID);
}

window.mip = function* () {
  yield put(convosRequest());
}

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
    window.getConvos = convos;

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

// const messagesCache = {};

// For now, just fetching all the messages. Later, we'll probably
// want to do some form of pagination since the number of messages can get
// quite large and rendering them in one go could be too heavy.
// todo: should we cache the queries?
const getMessagesList = async (db, peerID) => {
  return {};
  console.time('messList');

  const messagesCol = await getChatMessagesCol(db);
  const docs = await messagesCol
    .find({
      peerID: {
        $eq: peerID
      },
    })
    // .sort({ timestamp: 'asc' })
    .exec();

  const unsentMessagesCol = await getUnsentChatMessagesCol(db);
  const unsentDocs = await unsentMessagesCol
    .find({
      peerID: {
        $eq: peerID
      },
    })
    // .sort({ timestamp: 'asc' })
    .exec();

  let messages = {};

  docs.forEach(doc => {
    messages[doc.messageID] = {
      ...omit(doc.toJSON(), ['_rev']),
      sent: true,
      sending: false,
    };
  });

  unsentDocs.forEach(doc => {
    if (!messages[doc.messageID]) {
      messages[doc.messageID] = {
        ...omit(doc.toJSON(), ['_rev']),
        sent: false,
        sending: !!(
          inTransitMessages[peerID] &&
          inTransitMessages[peerID][doc.messageID]
        ),
      };
    }
  });

  console.timeEnd('messList');

  return messages;
};

function* getConvoMessages(action) {
  const peerID = action.payload.peerID;

  try {
    const db = yield call(getDb);
    const messages = yield call(getMessagesList, db, peerID);

    yield put(
      convoMessagesSuccess({
        peerID,
        messages
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

const convoChangeTimeoutChannels = {};

function* handleMessageDbChange(action) {
  const state = yield select();
  const {
    peerID,
    messageID,
    read,
    timestamp,
    outgoing,
  } = action.payload.data;
  let curConvo;

  try {
    curConvo = state.chat &&
      state.chat.convos &&
      state.chat.convos[peerID];
  } catch (e) {
    // pass
  }

  if (['INSERT', 'UPDATE'].includes(action.payload.operation)) {
    let dispatchConvoChangeAction = action.payload.operation === 'INSERT';

    if (action.payload.operation === 'UPDATE' &&
      (!curConvo || curConvo.read !== read)) {
      dispatchConvoChangeAction = true;
    }

    if (!outgoing) {
      if (read) {
        convoUnreadsRemove(peerID, messageID);  
      } else {
        convoUnreadsAdd(peerID, messageID);  
      }
    }

    // todo: only include the unread count if it changed
    let changeData = {
      peerID,
      convo: {
        unread: (convoUnreads[peerID] &&
          convoUnreads[peerID].size) || 0,
      },
    };

    // 1: first message of new convo
    // ----> send unread count 1|0, lastMessage: <embeded>
    // 2: updated message
    // ----> if unread count or last message changed, send
    //       them over. reducer must know to remove the previous
    //       last message, if it's not for the active convo.
    // 3: deleted message
    // ----> If that ws the only message in the convo, remove
    //       convo.

    let curLastMessage;

    try {
      curLastMessage = state.chat.messages[curConvo.lastMessage];
    } catch (e) {
      // pass
    }

    if (curLastMessage && curLastMessage.timestamp < timestamp) {
      dispatchConvoChangeAction = true;
      changeData = {
        ...changeData,
        convo: {
          ...changeData.convo,
          // todo: maybe embed the full last message here and elimanate the
          // seperate messages?
          lastMessage: messageID,
        },
        messages: {
          [messageID]: action.payload.data,
        }
      }
    }

    if (dispatchConvoChangeAction) {
      if (convoChangeTimeoutChannels[peerID]) {
        convoChangeTimeoutChannels[peerID].close();
      }

      const createTimeout = () => eventChannel(emitter => {
        const timeout = setTimeout(() => {
          emitter('something');
        }, 100)

        return () => clearTimeout(timeout);
      });

      const channel = convoChangeTimeoutChannels[peerID] = yield call(createTimeout);
      // todo: does the spawned debounce also need to be canceled?
      yield debounce(100, channel, function* () {
        convoChangeTimeoutChannels[peerID].close();
        delete convoChangeTimeoutChannels[peerID];        
        yield put(convoChange(changeData));
      });
    }
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

// todo: doc overloaded retry and explain params difference. Or
// maybe a seperate handleRetryMessage to understand the intent?
function* handleSendMessage(action) {
  const isRetry = !!action.payload.messageID;
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

  inTransitMessages[peerID] = inTransitMessages[peerID] || {};
  inTransitMessages[peerID][messageID] = true;

  yield put(messageChange({
    // todo: constantize this?
    type: isRetry ?
      'UPDATE' : 'INSERT',
    data: {
      ...messageData,
      sent: false,
      sending: true,
      // On a retry, we won't update the timestamp in the UI until it succeeds,
      // since we don't want the meessagee needlessly changeing sort order.
      timestamp: isRetry ?
        action.payload.timestamp : timestamp,
    },
  }));

  const db = yield call(getDb);
  let unsentMessageDoc;
  
  try {
    unsentMessageDoc = yield call(
      [db.collections.unsentchatmessages, 'insert'],
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
    yield put(messageChange({
      type: 'UPDATE',
      data: {
        ...messageData,
        sent: !messageSendFailed,
        sending: false,
        timestamp: isRetry && messageSendFailed ?
          action.payload.timestamp : timestamp,
      },
    }));
    if (messageSendFailed) return;
  }

  try {
    yield call(
      [db.collections.chatmessage, 'insert'],
      messageData
    );
  } catch (e) {
    const msg = message.length > 10 ?
      `${message.slice(0, 10)}…` : message;
    console.error(`Unable to save the sent message "${msg}" in the ` +
      'chat messages DB.');
    console.error(e);
    return;
  }

  if (unsentMessageDoc) {
    try {
      yield call([unsentMessageDoc, 'remove']);
    } catch (e) {
      // pass
    }
  }
}

async function getUnsentChatMessage(messageID) {
  return await(
    (await getUnsentChatMessagesCol())
      .findOne({
        messageID: {
          $eq: messageID,
        },
      })
      .exec()
  );
}

function* handleCancelMessage(action) {
  const messageID = action.payload.messageID;

  if (
    typeof messageID !== 'string' ||
    !messageID
  ) {
    throw new Error('A messageID is required in order to cancel a message.');
  }

  yield put(messageChange({
    type: 'DELETE',
    data: { messageID },
  }));  

  const unsentMessage = yield call(getUnsentChatMessage, messageID);
  if (unsentMessage) yield call([unsentMessage, 'remove']);
}

function* handleConvoMarkRead(action) {
  console.time('markAsRead');

  const peerID = action.payload.peerID;
  const convoData = yield call(getChatData, peerID);
  const updateDocs = Object.keys(convoData.messages)
    .filter(messageID => {
      const msg = { ...convoData.messages[messageID] };
      return !msg.read && !msg.outgoing;
    });
  const encryptedUpdateDocs = [];

  if (!convoData.messages || !updateDocs.length) return;

  const db = yield call(getDb);

  yield call(
    animationFrameInterval,
    () => {
      const msg = {
        ...convoData.messages[updateDocs[encryptedUpdateDocs.length]]
      };      

      const _rev = msg._rev;
      const _id = msg.messageID;
      delete msg._rev;
      delete msg.messageID;

      if (encryptedUpdateDocs.length < updateDocs.length) {
        encryptedUpdateDocs.push({
          ...db.chatmessage._crypter.encrypt({
            ...msg,
            read: true,
          }),
          _id,
          _rev,
        });
      }
    },
    () => encryptedUpdateDocs.length < updateDocs.length,
    { maxOpsPerFrame: 25 }
  );

  yield call(
    [db.chatmessage.pouch, 'bulkDocs'],
    encryptedUpdateDocs
  );

  console.timeEnd('markAsRead');
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
    console.dir(message);

    const db = yield call(getDb);
    const state = yield select();

    try {
      yield call(
        [db.collections.chatmessage, 'insert'],
        {
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
          read: state.chat &&
            state.chat.chatOpen &&
            state.chat.activeConvo &&
            state.chat.activeConvo.peerID === peerID ?
              true : false,
        }
      );
    } catch (e) {
      // TODO: maybe some type of retry? A db insertion failure I would think
      // would be very rare.
      console.error(`Unable to insert direct message ${msg} from ${peerID} ` +
        'into the database.');
      console.error(e);
      return;      
    }
  }
}

function handleMessageChange(action) {
  // if (action.payload.type === 'DELETE') {
  //   delete messagesCache[action.payload.peerID];
  // } else {
  //   messagesCache[action.payload.peerID] = {
  //     ...messagesCache[action.payload.peerID],
  //     ...action.payload,
  //   }
  // }
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

export function* messageChangeWatcher() {
  yield takeEvery(messageChange, handleMessageChange);
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