import { omit } from 'lodash';
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
  messageChange,
  sendMessage,
  convoMarkRead
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

const messageCache = {};

// TODO: cancel existing async tasks on deactivate convo and logout
// TODO: cancel existing async tasks on deactivate convo and logout
// TODO: cancel existing async tasks on deactivate convo and logout
// TODO: cancel existing async tasks on deactivate convo and logout
// this might make the noAuthNoChat middleware moot.

const getChatMessagesCol = async database => {
  const db = database || (await getDb());
  return await db.collections.chatmessage.inMemory();
};

// For now, just fetching all the messages. Later, we'll probably
// want to do some form of pagination since the number of messages can get
// quite large and rendering them in one go could be too heavy.
const getMessagesList = async (db, peerID) => {
  const messageCol = await getChatMessagesCol(db);
  const docs = await messageCol
    .find({
      peerID: {
        $eq: peerID
      },
    })
    .sort({ timestamp: 'asc' })
    .exec();    

  return docs.map(doc => omit(doc.toJSON(), ['_rev']));
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
  const cachedMessages = messageCache[peerID];

  yield put(
    convoActivated({
      peerID,
      messages: cachedMessages || []
    })
  );

  if (!cachedMessages) {
    yield put(convoMessagesRequest({ peerID }));
  }
}

function* messageChanged(action) {
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
        'Unable to create / update a chat head for the following action:'
      );
      console.error(action);
      console.error(e);
    }
  }
}

async function insertChatMessage(data) {
  let messageID = data.messageID;
  const subject = data.subject || '';
  const timestampDate = new Date();

  if (typeof data.messageID === 'undefined') {
    const combinationString = `${subject}!${timestampDate.toISOString()}`;
    const idBytes = crypto.createHash('sha256').update(combinationString).digest();
    const idBytesArray = new Uint8Array(idBytes);
    const idBytesBuffer =  new Buffer(idBytesArray.buffer);
    const encoded = multihashes.encode(idBytesBuffer, 0x12);  
    messageID = multihashes.toB58String(encoded);
  }

  const messageCol = await getChatMessagesCol();
  const doc = await messageCol.upsert({
    ...data,
    messageID,
    subject,
    timestamp: timestampDate.toISOString(),
  });
  await messageCol.awaitPersistence();
  return doc;
}

function* handleSendMessage(action) {
  const peerID = action.payload.peerID;
  const message = action.payload.message;
  let messageDoc;

  try {
    messageDoc = yield call(insertChatMessage, {
      peerID,
      message,
      outgoing: true,
    });
  } catch (e) {
    // Not the best UX here, since the user only sees the failure in the
    // console and can't retry without retyping. But... this is only the
    // db message insertion which should very rarely fail and it's a bit
    // of a rabbit hole to get this into the UI. Cutting a corner, for now.
    const msg = `${action.payload.message.slice(0, 10)}…`;
    console.error(`Unable to send the chat message to peerID ${peerID}: ${msg}`);
    console.error(e);
    return;
  }

  const timestamp = (new Date(messageDoc.get('timestamp'))).getTime();

  try {
    sendChatMessage(
      messageTypes.CHAT,
      peerID,
      {
        messageId: messageDoc.get('messageID'),
        subject: messageDoc.get('subject'),
        message,
        timestamp: {
          seconds: Math.floor(timestamp / 1000),
          nanos: timestamp % 1000,
        },
        flag: 0
      }      
    );
  } catch (e) {
    // todo: eventually toggle some sent state in the DB to failed and let the
    // user retry via the UI.
    console.error(`Unable to send the chat message.`);
    console.error(e);
    return;
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

    try {
      yield call(insertChatMessage, {
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
      });
    } catch (e) {
      // TODO: maybe some type of retry? A db insertion failure I would think
      // would be very rare.
      console.error(`Unable to insert the following message from ${peerID} ` +
        'into the database.');
      console.dir(message);
      console.error(e);
      return;
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

export function* messageChangeWatcher() {
  yield takeEvery(messageChange, messageChanged);
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