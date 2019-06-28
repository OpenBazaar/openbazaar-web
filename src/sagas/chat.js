import {
  omit,
  orderBy,
  memoize,
} from 'lodash';
import multihashes from 'multihashes';
import crypto from 'crypto';
import { get as getDb } from 'util/database';
import {
  takeEvery,
  put,
  call,
  select,
  all,
  debounce,
} from 'redux-saga/effects';
import {
  eventChannel,
  END,
} from 'redux-saga';
import { sendMessage as sendChatMessage } from 'util/messaging/index';
import messageTypes from 'util/messaging/types';
import {
  convosRequest,
  convosSuccess,
  convosFail,
  convoUnreadChange,
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

let chatMessagesCol;

const getChatMessagesCol = async database => {
  if (chatMessagesCol) return chatMessagesCol;
  const db = database || (await getDb());
  chatMessagesCol = await db.collections.chatmessage.inMemory();
  return chatMessagesCol;  
};

let unsentChatMessagesCol;

const getUnsentChatMessagesCol = async database => {
  if (unsentChatMessagesCol) return unsentChatMessagesCol;
  const db = database || (await getDb());
  unsentChatMessagesCol = await db.collections.unsentchatmessages.inMemory();
  return unsentChatMessagesCol;
};

let unreadCountChannels;

function unreadCountChange(query, peerID) {
  return eventChannel(emitter => {
    const sub = query.$.subscribe(docs => {
      emitter({
        unread: docs.length,
        peerID,
      });
    });        

    return () => {
      emitter(END);
      sub.unsubscribe();
    };
  });
}

// let unreadCountQueries;
const convoUnreads = {};

function* getConvos(action) {
  try {
    const messagesCol = yield call(getChatMessagesCol);
    const convos = {};
    const messages = {};
    const messageDocs = yield call([messagesCol.find(), 'exec']);

    messageDocs.forEach(messageDoc => {
      const peerID = messageDoc.get('peerID')
      const convo = convos[peerID];
      const messageID = messageDoc.get('messageID');

      if (
        !convo ||
        messages[convo.lastMessage].timestamp < messageDoc.get('timestamp')
      ) {
        messages[messageID] = { ...omit(messageDoc.toJSON(), ['_rev']) }
        convos[peerID] = {
          lastMessage: messageID,
        }
      }

      convoUnreads[peerID] = convoUnreads[peerID] || [];
      if (!messageDoc.get('read')) {
        convoUnreads[peerID].push(messageID);
      }
    });

    // yield put(convoUnreadChange(changeData));

    Object.keys(convoUnreads)
      .forEach(peerID => {
        convos[peerID].unread = convoUnreads[peerID].length;
      });

    // unreadCountQueries = Object.keys(convos)
    //   .reduce((acc, peerID) => {
    //     const query = messagesCol
    //       .find()
    //       .where('peerID')
    //       .eq(peerID)
    //       .where('read')
    //       .eq(false)
    //       .where('outgoing')
    //       .eq(false);
    //     acc[peerID] = query;
    //     return acc;
    //   }, {});

    // const unreadCountQueriesPeers = Object.keys(unreadCountQueries);

    // for (let i = 0; i < unreadCountQueriesPeers.length; i++) {
    //   const peerID = unreadCountQueriesPeers[i];
    //   const unreadCount = yield call(
    //     async () => {
    //       const unreadDocs = await unreadCountQueries[peerID]
    //         .exec()
    //         .then();
    //       return unreadDocs.length;
    //     }
    //   );
    //   convos[peerID].unread = unreadCount;
    // }

    // try {
    //   // subcribe to unreadQuery changes to update the unread counts as they
    //   // change
    //   (unreadCountChannels || []).forEach(chan => chan.close());

    //   const channels = unreadCountChannels = yield all(
    //     Object.keys(unreadCountQueries)
    //       .map(peerID => {
    //         return call(
    //           unreadCountChange,
    //           unreadCountQueries[peerID],
    //           peerID
    //         );
    //       })
    //   );

    //   // TODO: Ideally that should be throttle, but throttle is throwing an exception.
    //   yield all(channels.map(chan => debounce(100, chan, function* (changeData) {
    //     console.timeEnd('testFunk');
    //     yield put(convoUnreadChange(changeData));
    //   })));
    // } catch (e) {
    //   // todo: handle this, but not in a way where convosFail is sent.
    // } finally {
    //   yield put(convosSuccess({
    //     convos,
    //     messages,
    //   }));
    // }

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
// TODO: cancel existing async tasks on deactivate convo and logout
// TODO: cancel existing async tasks on deactivate convo and logout
// TODO: cancel existing async tasks on deactivate convo and logout
// this might make the noAuthNoChat middleware moot.

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

let unreadTimeout;

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

  // if (action.payload.fromSync) {
  //   yield put(messageChange({
  //     type: action.payload.operation,
  //     data: {
  //       ...action.payload.data,
  //       sent: true,
  //       sending: false,
  //     }
  //   }));
  // }

  // 'INSERT', 'UPDATE', 'DELETE'
  if (true) {
    yield debounce(100, 'HAPPY_BILLS', function* () {
      console.log('FIring the pilson from the drEEAM Weaver');
      yield put(convoUnreadChange({
        unread: Math.floor(Math.random() * 100),
        peerID: action.payload.data.peerID,
      })) 
    });
    yield put({ type: 'HAPPY_BILLS' });
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
  console.time('testFunk');

  const peerID = action.payload.peerID;
  // const query = unreadCountQueries[peerID];
  const chatMessagesCol = yield call(getChatMessagesCol);
  const query = chatMessagesCol
    .find()
    .where('peerID')
    .eq(peerID)
    .where('read')
    .eq(false)
    .where('outgoing')
    .eq(false);

  if (query) {
    const unreadDocs = yield call([query.exec(), 'then']);

    console.log(`i have ${unreadDocs.length} unread`);

    try {
      yield call(
        [chatMessagesCol.pouch, 'bulkDocs'],
        unreadDocs.map(doc => ({
          ...doc.toJSON(),
          _id: doc.get('messageID'),
          read: true,
        }))
      );
    } catch (e) {
      // TODO: The bulk update call should return granular info on which, if any,
      // docs failed to update. We can at least do some logging regarding that.
      console.error(`Unable to mark converesation as read for peer ${peerID}`);
    }
  }

  // console.timeEnd('testFunk');
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