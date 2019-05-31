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

// stub until the db part is done and we get the message from there.
// Please note: For now, just fetching all the messages. Later, we'll probably
// want to do some form of pagination since the number of messages can get
// quite large and rendering them in one go could be too heavy.
// const getMessages = async peerID => {
//   return await setAsyncTimeout(
//     () => [
//       {
//         message:
//           '🐙🔗🍶 How do you say? Is it on the ben gay thrust it up the slick donkey blue maria. No doubt he went over there for more than ta and crumpets. Right up her alley, eh?',
//         messageId: 'QmV9TuiCWjBXT9W1bg4zM4jEJDpfUCZoi6q8gB6gViGUgk',
//         outgoing: false,
//         peerID: 'QmYTXDyMNjdUSvqNc88T2VeVF3KdG7PMefnGQKrp9NZ5Tp',
//         read: true,
//         subject: '',
//         timestamp: '2019-05-24T14:17:28-06:00'
//       },
//       {
//         message:
//           'Thee salamander said no more. No less. Never again! How far will you go if the show is all about that snow? Will you still go? I once went to the rafters of the green billy ripken on the show. Oh oh oh no.',
//         messageId: 'QmURVEiL4BKcuQMGChpe2aq13rUMFV7uZTZMLR8NHdMxqH',
//         outgoing: true,
//         peerID: 'QmU5ZSKVz2GhsqE6EmBGVCtrui4YhUXny6rbvsSf5h2xvH',
//         read: true,
//         subject: '',
//         timestamp: '2019-05-24T10:42:41-06:00'
//       }
//     ],
//     // getRandomArbitrary(100, 3000)
//     getRandomArbitrary(3000, 8000)
//   );
// };

// For now, just fetching all the messages. Later, we'll probably
// want to do some form of pagination since the number of messages can get
// quite large and rendering them in one go could be too heavy.
const getMessagesList = async (db, peerID) => {
  const allMessages = await db.chatmessage.find().exec();
  console.log(`SHART MASTA: ${peerID}`);
  console.dir(allMessages.map(m => m.toJSON()));
  console.log(`<==== SHART MASTA`);

  const messages = await db.chatmessage
    .find({
      peerID: {
        $eq: peerID,
      }
    }).exec();
  const sizzle = messages.map(m => {
    const message = m.toJSON();
    delete message._rev;
    return message;
  });
  console.log(`FART STARTTER: ${peerID}`);
  console.dir(sizzle);
  console.log('<==== FART STARTTER');
  console.log('\n');
  return sizzle;
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
    yield put(convoMessagesFail(e.message || ''));
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