import { omit } from 'lodash';
import { getRandomArbitrary } from 'util/number';
import { setAsyncTimeout } from 'util/index';
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

  return docs.map(doc => (
    omit(doc.toJSON(), ['_rev'])
  ));
};

function* getConvoMessages(action) {
  const peerID = action.payload.peerID;

  try {
    const db = yield call(getDb);
    const messages = yield call(getMessagesList, db, peerID);

    console.dir(messages);
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
      const convo = state.chat.convos[action.payload.data.peerID];

      db.chatconversation.upsert({
        peerID: action.payload.data.peerID,
        lastMessage: action.payload.data.message,
        outgoing: action.payload.data.outgoing,
        timestamp: action.payload.data.timestamp,
        unread: convo ? convo.unread += 1 : 1,
      });
    } catch (e) {
      // TODO: seems like an edge case for this to error, but we should probably
      // have some fallback... maybe a retry with exponential backoff? Maybe
      // scan the chat messages on startup and if there's no corresponding convo
      // create one then?
      console.error('Unable to create / update a chat head for the following action:');
      console.error(action);
    }
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