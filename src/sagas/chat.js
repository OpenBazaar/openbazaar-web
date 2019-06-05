import uuid from 'uuid';
import { omit, orderBy } from 'lodash';
import { get as getDb } from 'util/database';
import { takeEvery, put, call, select } from 'redux-saga/effects';
import {
  convosRequest,
  convosSuccess,
  convosFail,
  activateConvo as activateConvoAction,
  convoActivated,
  convoMessagesRequest,
  convoMessagesSuccess,
  convoMessagesFail,
  messageChange,
  sendMessage,
  convoMarkRead,
} from 'actions/chat';

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
  const db = database || await getDb();
  return await db.collections.chatmessage.inMemory();
};

// For now, just fetching all the messages. Later, we'll probably
// want to do some form of pagination since the number of messages can get
// quite large and rendering them in one go could be too heavy.
const getMessagesList = async (db, peerID) => {
  const messageCol = await getChatMessagesCol(db)
  const docs = await messageCol
    .find({
      peerID: {
        $eq: peerID,
      }      
    })
    .exec();

  return orderBy(
    docs.map(doc => (
      omit(doc.toJSON(), ['_rev'])
    )),
    ['timestamp', 'desc']
  );
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
        error: e.message || '',
      })
    );
    return;
  }
}

function* activateConvo(action) {
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
        unread,
      });
    } catch (e) {
      // TODO: seems like an edge case for this to error, but we should probably
      // have some fallback... maybe a retry with exponential backoff? Maybe
      // scan the chat messages on startup and if there's no corresponding convo
      // create one then?
      console.error('Unable to create / update a chat head for the following action:');
      console.error(action);
      console.error(e);
    }
  }
}

function *handleSendMessage(action) {
  try {
    const messageCol = yield call(getChatMessagesCol);
    yield call([messageCol, 'insert'], {
      peerID: action.payload.peerID,
      messageID: uuid(),
      message: action.payload.message,
      outgoing: true,
      timestamp: (new Date()).toISOString(),
    });
  } catch (e) {
    // Not the best UX here, since the user only sees the failure in the
    // console and can't retry without retyping. But... this is only the
    // db message insertion which should very rarely fail and it's a bit
    // of a rabbit hole to get this into the UI. Cutting a corner, for now.
    const msg = `${action.payload.message.slice(0, 10)}…`;
    console.error(`Unable to send the chat message: ${msg}`);
    console.error(e);
    return;
  }
}

const getConvo = async (peerID, database) => {
  const db = database || await getDb();
  const doc = await db.collections.chatconversation
    .findOne(
      {
        peerID: {
          $eq: peerID,
        },
      }
    ).exec();

  return doc;
}

function *handleConvoMarkRead(action) {
  let peerID;

  try {
    peerID = action.payload.peerID;
    const convo = yield call(getConvo, peerID);

    if (!convo) {
      throw new Error(`There is no convo for peerID ${peerID}`);
    }

    yield call(
      [convo, 'update'],
      {
        $set: {
          unread: 0,
        },
      }
    );
  } catch (e) {
    if (!peerID) {
      console.error('Unable to process the handleConvoMarkRead because a ' +
        'peerID was not provided in the action payload.');
      return;
    }

    console.error(`Unable to mark convo ${peerID} as read.`);
    console.error(e);
  }
}

export function* convosRequestWatcher() {
  yield takeEvery(convosRequest, getConvos);
}

export function* activateConvoWatcher() {
  yield takeEvery(activateConvoAction, activateConvo);
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