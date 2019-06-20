import {
  omit,
  orderBy,
  memoize,
} from 'lodash';
import multihashes from 'multihashes';
import crypto from 'crypto';
import { get as getDb } from 'util/database';
import { takeEvery, put, call, select } from 'redux-saga/effects';
import { sendMessage as sendChatMessage } from 'util/messaging/index';
import messageTypes from 'util/messaging/types';
import {
  convosRequest,
  convosSuccess,
  convosFail,
  activateConvo,
  convoActivated,
  convoMessagesRequest,
  convoMessagesSuccess,
  convoMessagesFail,
  messageDbChange,
  messageChange,
  sendMessage,
  // sendMessageRequest,
  // sendMessageFail,
  convoMarkRead,
} from 'actions/chat';
import { directMessage } from 'actions/messaging';

const getConvoList = async db => {
  const convos = await db.chatconversation.find().exec();
  return convos.map(c => {
    const convo = c.toJSON();
    delete convo._rev;
    return convo;
  });
};

function* getConvos(action) {
  try {
    const db = yield call(getDb);
    const convos = yield call(getConvoList, db);
    yield put(convosSuccess(convos));
  } catch (e) {
    yield put(convosFail(e.message || ''));
  }
}

// TODO: cancel existing async tasks on deactivate convo and logout
// TODO: cancel existing async tasks on deactivate convo and logout
// TODO: cancel existing async tasks on deactivate convo and logout
// TODO: cancel existing async tasks on deactivate convo and logout
// this might make the noAuthNoChat middleware moot.

const getChatMessagesCol = async database => {
  const db = database || (await getDb());
  return await db.collections.chatmessage.inMemory();
};

const getUnsentChatMessagesCol = async database => {
  const db = database || (await getDb());
  return await db.collections.unsentchatmessages.inMemory();
};

const messagesCache = {};

// For now, just fetching all the messages. Later, we'll probably
// want to do some form of pagination since the number of messages can get
// quite large and rendering them in one go could be too heavy.
const getMessagesList = async (db, peerID) => {
  if (messagesCache[peerID]) return messagesCache[peerID];

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

  messagesCache[peerID] = {
    ...messagesCache[peerID],
    ...messages,
  };
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
    return;
  }
}

function* handleActivateConvo(action) {
  const peerID = action.payload;

  yield put(
    convoActivated({
      peerID,
      messages: messagesCache[peerID] || {},
    })
  );

  if (!messagesCache[peerID]) {
    // todo: ensure this is only called the first time thee convo is activate
    // todo: ensure this is only called the first time thee convo is activate
    // todo: ensure this is only called the first time thee convo is activate
    // todo: ensure this is only called the first time thee convo is activate
    yield put(convoMessagesRequest({ peerID }));
  }
}

function* handleMessageDbChange(action) {
  const state = yield select();

  if (action.payload.operation === 'INSERT') {
    try {
      const db = yield call(getDb);
      const peerID = action.payload.data.peerID;
      const convo = state.chat.convos[peerID];
      const isActive =
        state.chat.chatOpen &&
        state.chat.activeConvo &&
        state.chat.activeConvo.peerID === peerID;
      let unread = 0;

      if (!action.payload.data.outgoing && !isActive) {
        unread = convo ? convo.unread + 1 : 1;
      }

      db.chatconversation.upsert({
        peerID: action.payload.data.peerID,
        lastMessage: action.payload.data.message,
        outgoing: action.payload.data.outgoing,
        timestamp: action.payload.data.timestamp,
        unread
      });
    } catch (e) {
      // TODO: seems like an edge case for this to error, but we should probably
      // have some fallback... maybe a retry with exponential backoff? Maybe
      // scan the chat messages on startup and if there's no corresponding convo
      // create one then?
      console.error(
        'Unable to create / update the chat head for the following action:'
      );
      console.error(action);
      console.error(e);
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

function* handleRetryMessage(action) {
  // todo: validate action params
  return yield handleSendMessage(action);
}

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
  
  if (!isRetry) {
    try {
      unsentMessageDoc = yield call(
        [db.collections.unsentchatmessages, 'insert'],
        messageData
      );
    } catch (e) {
      const msg = message.length > 10 ?
        `${message.slice(0, 10)}…` : message;
      console.error(`Unable to save message "${msg}" in the ` +
        'unsent chat messages DB.');
      // We'll just proceed without it. It really just means that if the
      // send fails and the user closes the app, it will be lost.
    }
  }

  let messageSendFailed;

  try {
    yield call(
      sendChatMessage,
      messageTypes.CHAT,
      peerID,
      {
        ...messageData,
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

const getConvo = async (peerID, database) => {
  const db = database || (await getDb());
  const doc = await db.collections.chatconversation
    .findOne({
      peerID: {
        $eq: peerID
      }
    })
    .exec();

  return doc;
};

function* handleConvoMarkRead(action) {
  let peerID;

  try {
    peerID = action.payload.peerID;
    const convo = yield call(getConvo, peerID);

    if (!convo) {
      throw new Error(`There is no convo for peerID ${peerID}`);
    }

    yield call([convo, 'update'], {
      $set: {
        unread: 0
      }
    });
  } catch (e) {
    if (!peerID) {
      console.error(
        'Unable to process the handleConvoMarkRead because a ' +
          'peerID was not provided in the action payload.'
      );
      return;
    }

    console.error(`Unable to mark convo ${peerID} as read.`);
    console.error(e);
  }
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
      `${message.message.slice(0, 10)}…` : message;    

    console.log(`writing "${msg}" from ${peerID} to the database`);

    const db = yield call(getDb);

    try {
      yield call(
        [db.collections.chatmessage, 'insert'],
        {
          peerID,
          message: message.message,
          messageID: message.messageId,
          timestamp: (
            new Date(
              message.timestamp.seconds +
              message.timestamp.nanos
            )
          ),
          subject: message.subject,
          outgoing: false,          
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
  if (action.payload.type === 'DELETE') {
    delete messagesCache[action.payload.peerID];
  } else {
    messagesCache[action.payload.peerID] = {
      ...messagesCache[action.payload.peerID],
      ...action.payload,
    }
  }
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
  yield takeEvery(messageChange, handleMessageDbChange);
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