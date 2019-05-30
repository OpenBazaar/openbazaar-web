import { getRandomArbitrary } from 'util/number';
import { setAsyncTimeout } from 'util/index';
import { get as getDb } from 'util/database';
import { takeEvery, put, call } from 'redux-saga/effects';
import {
  convosRequest,
  convosSuccess,
  convosFail,
  activateConvo as activateConvoAction,
  convoActivated,
  convoMessagesRequest,
  convoMessagesSuccess,
  convoMessagesFail
} from 'actions/chat';

// const getConvosList = async () => {
//   // randomly throw an error
//   if (getRandomInt(0, 1)) {
//     throw new Error('The pickles must come off the barbie!');
//   }

//   return await setAsyncTimeout(
//     () => ([
//       {
//         lastMessage: 'hey boo',
//         outgoing: false,
//         peerID: 'Qmbr7QtmKCVZ5g5mePNZHaetCKF9gryXxiLcyrdBPbMbnd',
//         timestamp: '2017-08-17T04:52:19Z',
//         unread: 3
//       },
//       {
//         lastMessage: 'hip hip ho to the rah maldives beaver',
//         outgoing: false,
//         peerID: 'QmYTXDyMNjdUSvqNc88T2VeVF3KdG7PMefnGQKrp9NZ5Tp',
//         timestamp: '2016-01-17T04:52:19Z',
//         unread: 0
//       },
//       {
//         lastMessage: 'pooper scopper no more',
//         outgoing: true,
//         peerID: 'QmQGpXWj6y4Sgmc4F8hvFFo3srhaPrv4oY3QsJ2FyGUh9K',
//         timestamp: '2017-01-17T04:52:19Z',
//         unread: 0
//       },
//       {
//         lastMessage: 'charlie says meatballs and banana peals',
//         outgoing: true,
//         peerID: 'QmU5ZSKVz2GhsqE6EmBGVCtrui4YhUXny6rbvsSf5h2xvH',
//         timestamp: '2017-08-111T01:41:19Z',
//         unread: 12
//       }
//     ]),
//     getRandomArbitrary(100, 3000)
//   );
// }

const getConvoList = async db => {
  const convos = await db.chatconversation.find().exec();
  console.log('sweet');
  window.sweet = convos;
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
    console.log('jrob');
    window.jrob = convos;
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
const getMessages = async peerID => {
  return await setAsyncTimeout(
    () => [
      {
        message:
          '🐙🔗🍶 How do you say? Is it on the ben gay thrust it up the slick donkey blue maria. No doubt he went over there for more than ta and crumpets. Right up her alley, eh?',
        messageId: 'QmV9TuiCWjBXT9W1bg4zM4jEJDpfUCZoi6q8gB6gViGUgk',
        outgoing: false,
        peerID: 'QmYTXDyMNjdUSvqNc88T2VeVF3KdG7PMefnGQKrp9NZ5Tp',
        read: true,
        subject: '',
        timestamp: '2019-05-24T14:17:28-06:00'
      },
      {
        message:
          'Thee salamander said no more. No less. Never again! How far will you go if the show is all about that snow? Will you still go? I once went to the rafters of the green billy ripken on the show. Oh oh oh no.',
        messageId: 'QmURVEiL4BKcuQMGChpe2aq13rUMFV7uZTZMLR8NHdMxqH',
        outgoing: true,
        peerID: 'QmU5ZSKVz2GhsqE6EmBGVCtrui4YhUXny6rbvsSf5h2xvH',
        read: true,
        subject: '',
        timestamp: '2019-05-24T10:42:41-06:00'
      }
    ],
    // getRandomArbitrary(100, 3000)
    getRandomArbitrary(3000, 8000)
  );
};

function* getConvoMessages(action) {
  const peerID = action.payload.peerID;
  let messages = [];

  try {
    messages = yield call(getMessages, [peerID]);
  } catch (e) {
    yield put(convoMessagesFail(e.message || ''));
    return;
  }

  yield put(
    convoMessagesSuccess({
      peerID,
      messages
    })
  );
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

export function* convosRequestWatcher() {
  yield takeEvery(convosRequest, getConvos);
}

export function* activateConvoWatcher() {
  yield takeEvery(activateConvoAction, activateConvo);
}

export function* convoMessagesRequestWatcher() {
  yield takeEvery(convoMessagesRequest, getConvoMessages);
}
