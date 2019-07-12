import {
  omit,
  orderBy,
} from 'lodash';
import multihashes from 'multihashes';
import crypto from 'crypto';
import { get as getDb } from 'util/database';
import { eventChannel } from 'redux-saga'
import {
  takeEvery,
  put,
  call,
  select,
  debounce,
  delay,
} from 'redux-saga/effects';
import { createAction } from 'redux-starter-kit';
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
import { AUTH_LOGOUT } from 'actions/auth';
import sizeOf from 'object-sizeof';

window.orderBy = orderBy;
window.sizeof = sizeOf;

let _messageDocs = null;
let _chatData = null;
let unsentMessages = [];

window.muchData = () => {
  const promises = [];

  for (var i = 0; i < 400; i++) {
    promises.push(() => window.inboundChatMessage());
  }

  promises.reduce( async (previousPromise, nextProm) => {
    await previousPromise;
    return nextProm();
  }, Promise.resolve());
}

const setMessage = (peerID, message) => {
  if (!_chatData) {
    throw new Error('getChatData() must be called first to populate the chat data object.');
  }

  if (typeof message !== 'object') {
    throw new Error('The message must be provided as an object.');
  }

  if (typeof message.messageID !== 'string' || !message.messageID.length) {
    throw new Error('The message must contain a messageID as a non-empty string.');
  }

  const convo = {
    messages: _chatData[peerID] ? _chatData[peerID].messages : {},
    unread: _chatData[peerID] ? _chatData[peerID].unread : 0,
    _sorted: _chatData[peerID] ? _chatData[peerID]._sorted : undefined,
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
      if (arr === this._sorted) {
        throw new Error('Do not mutate the sorted array directly. ' +
          'If changing pass in a new array.')
      }

      this._sorted = arr;
    },
  };

  const curMessage = convo.messages[message.messageID];

  if (!message.outgoing) {
    if ((curMessage && curMessage.read !== message.read)) {
      if (message.read && convo.unread > 0) {
        convo.unread -= 1;
      } else if (!message.read) {
        convo.unread += 1;
      }
    } else if (!curMessage && !message.read) {
      convo.unread += 1;
    }
  }

  const _sorted = convo._sorted;

  if (_sorted && (!curMessage || curMessage.timestamp !== message.timestamp)) {
    // If it's a new message or the timestamp changed and there was already a sorted
    // cached list, we'll try and insert the new message in the right place starting
    // from the bottom, since the vast majority of new messages should be at the end
    // of list.
    let i = _sorted.length;

    while (i > 0 && message.timestamp < convo.messages[_sorted[i - 1]].timestamp) {
      i--;
    }

    convo.sorted = [..._sorted.slice(0, i), message.messageID, ..._sorted.slice(i)];
  }

  convo.messages[message.messageID] = {
    ...curMessage,
    ...message,
  };

  _chatData[peerID] = convo;
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

            const messagesSent = filterOutMeta(docs[0].rows);
            const messagesUnsent = filterOutMeta(docs[1].rows);

            unsentMessages = messagesUnsent.map(msg => msg.id);

            const combined = messagesUnsent
              .concat(messagesSent);

            console.log(`${combined.length} total messages`);              

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
    _chatData = {};
    docs.forEach(doc => setMessage(doc.peerID, doc));
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

const getMessagesList = async (db, peerID) => {
  const convoData = await getChatData(peerID);
  let sorted = [];
  let messages = {};

  if (convoData) {
    sorted = convoData.sorted;
    messages = Object.keys(convoData.messages)
      .reduce((acc, messageID) => {
        acc[messageID] = {
          ...convoData.messages[messageID],
          sent: !inTransitMessages[messageID] && !unsentMessages.includes(messageID),
          sending: !!inTransitMessages[messageID],
        };
        return acc;
      }, {});
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

const dispatchConvoChange = createAction('CHAT_DISPATCH_CONVO_CHANGE');

const convoChangeChannels = {};

function* handleMessageDbChange(action) {
  console.log(Date.now());
  if (action.payload.operation === 'DELETE') return;

  const { peerID } = action.payload.data;

  const prevConvo = yield call(getChatData, peerID);
  setMessage(peerID, action.payload.data);
  const curConvo = yield call(getChatData, peerID);

  const convoChangeData = { peerID };

  if (
    !prevConvo ||
    prevConvo.sorted[prevConvo.sorted.length - 1] !==
      curConvo.sorted[curConvo.sorted.length - 1]
  ) {
    convoChangeData.convo = {
      lastMessage: curConvo.sorted[curConvo.sorted.length - 1],
    };
  }

  if (!prevConvo || prevConvo.unread !== curConvo.unread) {
    convoChangeData.convo = {
      ...convoChangeData.convo,
      unread: curConvo.unread,
    };    
  }

  if (Object.keys(convoChangeData).length > 1) {
    if (convoChangeChannels[peerID]) {
      convoChangeChannels[peerID].close();
    }

    convoChangeChannels[peerID] = yield call(
      () => eventChannel(emitter => {
          const timeout = setTimeout(() => {
            emitter('something');
          }, 100);
          return () => {
            clearInterval(timeout)
          }
        }
      )
    );

    yield debounce(0, convoChangeChannels[peerID], function* () {
      yield put(convoChange(convoChangeData));
    });
  }

  // todo: potential activeConvoChange event + note about sequencing in relation
  // to convoChangeEvent
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
  const updateDocs = Object.keys(convoData.messages || {})
    .filter(messageID => {
      const msg = convoData.messages[messageID];
      return !msg.read && !msg.outgoing;
    });
  const encryptedUpdateDocs = [];

  if (!updateDocs.length) return;

  const db = yield call(getDb);

  console.time('markAsReadEncrypt');
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
  console.timeEnd('markAsReadEncrypt');

  console.time('markAsReadBulkDocs');
  yield call(
    [db.chatmessage.pouch, 'bulkDocs'],
    encryptedUpdateDocs
  );
  console.timeEnd('markAsReadBulkDocs');
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

function handleLogout() {
  _messageDocs = null;
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

export function* logoutWatcher() {
  yield takeEvery(AUTH_LOGOUT, handleLogout);
}