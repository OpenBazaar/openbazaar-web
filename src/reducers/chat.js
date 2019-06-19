import { createReducer, createSelector } from 'redux-starter-kit';
import { orderBy } from 'lodash';
import {
  open,
  close,
  convosRequest,
  convosSuccess,
  convosFail,
  convoActivated,
  convoMessagesRequest,
  convoMessagesSuccess,
  convoMessagesFail,
  deactivateConvo,
  convoChange,
  messageChange,
  // sendMessageRequest,
  // sendMessageFail,
} from 'actions/chat';
import { AUTH_LOGOUT } from 'actions/auth';

const initialState = {
  chatOpen: false,
  fetchingConvos: false,
  convosFetchFailed: false,
  convosFetchError: null,
  convos: {},
  activeConvo: null
};

const openChat = (state, action) => {
  state.chatOpen = true;
};

const closeChat = (state, action) => {
  state.chatOpen = false;
};

const reduceConvosRequest = (state, action) => {
  state.fetchingConvos = true;
  state.convosFetchFailed = false;
  state.convosFetchError = null;
};

const reduceConvosSuccess = (state, action) => {
  state.fetchingConvos = false;
  state.convosFetchFailed = false;
  state.convosFetchError = null;

  state.convos = action.payload.reduce((acc, convo) => {
    let sortTimestamp = convo.timestamp;

    if (!convo.unread) {
      // the idea is for convos with unread messages to be on top
      const date = new Date(convo.timestamp);
      date.setFullYear(date.getFullYear() - 100);
      sortTimestamp = date.toISOString();
    }

    acc[convo.peerID] = {
      ...convo,
      sortTimestamp
    };
    return acc;
  }, {});
};

const reduceConvoChange = (state, action) => {
  const peerID = action.payload.data.peerID;
  const isNew = !state.convos[peerID];

  if (isNew || action.payload.data.unread) {
    state.convos[peerID] = {
      ...action.payload.data,
      sortTimestamp: new Date().toISOString()
    };
  } else {
    state.convos[peerID] = {
      ...action.payload.data,
      sortTimestamp: state.convos[peerID].sortTimestamp
    };
  }
};

const reduceConvosFail = (state, action) => {
  state.fetchingConvos = false;
  state.convosFetchFailed = true;
  state.convosFetchError = action.payload;
};

const reduceConvoActivated = (state, action) => {
  state.activeConvo = {
    peerID: action.payload.peerID,
    messages: action.payload.messages || {},
    fetchingMessages: false,
    messageFetchFailed: false,
    messageFetchError: null
  };
};

const reduceConvoMessagesRequest = (state, action) => {
  if (state.activeConvo && action.payload === state.activeConvo.peerID) {
    state.activeConvo = {
      ...state.activeConvo,
      fetchingMessages: true,
      messageFetchFailed: false,
      messageFetchError: null
    };
  }
};

const reduceConvoMessagesSuccess = (state, action) => {
  if (state.activeConvo && action.payload.peerID === state.activeConvo.peerID) {
    state.activeConvo = {
      ...state.activeConvo,
      fetchingMessages: false,
      messageFetchFailed: false,
      messageFetchError: null,
      messages: action.payload.messages
    };
  }
};

const reduceConvoMessagesFail = (state, action) => {
  if (state.activeConvo && action.payload.peerID === state.activeConvo.peerID) {
    state.activeConvo = {
      ...state.activeConvo,
      fetchingMessages: false,
      messageFetchFailed: true,
      messageFetchError: action.payload.error
    };
  }
};

const reduceDeactivateConvo = state => {
  state.activeConvo = null;
};

const reduceSendMessageRequest = (state, action) => {
  // if (state.activeConvo && action.payload.peerID === state.activeConvo.peerID) {
  //   console.log(`feel the funk punk: ${action.payload.messageID}`);
  //   state.activeConvo.messages
  //     .slice()
  //     .reverse()
  //     .slice(0, 10)
  //     .forEach((msg, index) => {
  //       console.log('hey ===== ');
  //       console.dir(JSON.parse(JSON.stringify(msg)));
  //       console.log('hey ===== \n');
  //       if (msg.messageID === action.payload.messageID) {
  //         console.log('got dose goods');
  //         state.activeConvo.messages[index] = {
  //           ...state.activeConvo.messages[index],
  //           sending: true,
  //         };
  //       }
  //     });
  // }  
};

// const reduceSendMessageFail = (state, action) => {

// };

// const reduceMessageChange = (state, action) => {
//   if (
//     // for now, we're not supporting editing or deleting a chat message
//     action.payload.operation === 'INSERT' &&
//     state.activeConvo &&
//     state.activeConvo.peerID === action.payload.data.peerID
//   ) {
//     // TODO: insert in sorted order
//     state.activeConvo.messages = [
//       ...(state.activeConvo.messages || []),
//       action.payload.data
//     ];
//   }
// };

const reduceMessageChange = (state, action) => {
  if (
    !(
      state.activeConvo &&
      action.payload.peerID !== state.activeConvo.peerID
    )
  ) return;

  if (action.payload.type === 'INSERT') {
    state.activeConvo.messages = {
      ...state.activeConvo.messages,
      [action.payload.data.peerID]: {
        ...action.payload.data,
      },
    };
  } else if (action.payload.type === 'UPDATE') {
    state.activeConvo.messages[action.payload.data.peerID] = {
      ...state.activeConvo.messages[action.payload.data.peerID],
      ...action.payload.data,
    };
  } else {
    delete state.activeConvo.messages[action.payload.data.peerID];
  }
}

const reduceAuthLogout = state => {
  return initialState;
};

export default createReducer(initialState, {
  [open]: openChat,
  [close]: closeChat,
  [convosRequest]: reduceConvosRequest,
  [convosSuccess]: reduceConvosSuccess,
  [convosFail]: reduceConvosFail,
  [convoActivated]: reduceConvoActivated,
  [convoMessagesRequest]: reduceConvoMessagesRequest,
  [convoMessagesSuccess]: reduceConvoMessagesSuccess,
  [convoMessagesFail]: reduceConvoMessagesFail,
  [deactivateConvo]: reduceDeactivateConvo,
  [convoChange]: reduceConvoChange,
  [messageChange]: reduceMessageChange,
  // [sendMessageRequest]: reduceSendMessageRequest,
  // [sendMessageFail]: reduceSendMessageFail,
  [AUTH_LOGOUT]: reduceAuthLogout
});

// selectors

export const getConvos = createSelector(
  ['convos'],
  convos =>
    orderBy(
      Object.keys(convos).map(convoPeerId => convos[convoPeerId]),
      ['sortTimestamp'],
      ['desc']
    )
);

export const getActiveConvoMessage = createSelector(
  ['activeConvo.messages'],
  messages =>
    orderBy(
      Object.keys(messages)
        .map(messageID => ({
          ...messages[messageID],
        })),
      ['timestamp']
    )
);

export const getChatState = rawChatState => {
  let activeConvo = rawChatState.activeConvo;

  if (activeConvo && activeConvo.messages) {
    activeConvo = {
      ...activeConvo,
      messages: getActiveConvoMessage(rawChatState),
    }
  }

  return {
    ...rawChatState,
    convos: getConvos(rawChatState),
    activeConvo,
  }
};
