import { createReducer, createSelector } from 'redux-starter-kit';
import { orderBy } from 'lodash';
import {
  open,
  close,
  convosRequest,
  convosSuccess,
  convosFail,
  convoChange,
  convoActivated,
  convoMessagesRequest,
  convoMessagesSuccess,
  convoMessagesFail,
  deactivateConvo,
  messageChange,
} from 'actions/chat';
import { AUTH_LOGOUT } from 'actions/auth';

const initialState = {
  chatOpen: false,
  fetchingConvos: false,
  convosFetchFailed: false,
  convosFetchError: null,
  convos: {},
  activeConvo: null,
  messages: {},
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

  state.convos = Object.keys(action.payload.convos)
    .reduce((acc, peerID) => {
      const convo =action.payload.convos[peerID];
      const message = action.payload.messages[convo.lastMessage];
      let sortTimestamp = message.timestamp;

      if (!convo.unread) {
        // the idea is for convos with unread messages to be on top
        const date = new Date(message.timestamp);
        date.setFullYear(date.getFullYear() - 100);
        sortTimestamp = date.toISOString();
      }

      acc[peerID] = {
        ...convo,
        sortTimestamp,
      }

      return acc;
    }, {});
  
  state.messages = {
    ...state.messages,
    ...action.payload.messages,
  };
};

const reduceConvosFail = (state, action) => {
  state.fetchingConvos = false;
  state.convosFetchFailed = true;
  state.convosFetchError = action.payload;
};

const reduceConvoChange = (state, action) => {
  const peerID = action.payload.peerID;

  state.convos[peerID] = {
    ...state.convos[peerID],
    ...action.payload.convo,
  };
  
  if (action.payload.messages) {
    state.messages = {
      ...state.messages,
      ...action.payload.messages,
    }
  }
}

// todo: doc me up.
const pruneMessages = (pruneList = [], messagesObj = {}, excludeList = []) => {
  return Object.keys(messagesObj)
    .reduce((acc, messageID) => {
      if (excludeList.includes(messageID) || !pruneList.includes(messageID)) {
        acc[messageID] = { ...messagesObj[messageID] };
      }

      return acc;
    }, {});
}

const reduceDeactivateConvo = state => {
  if (state.activeConvo !== null) {
    state.messages = pruneMessages(
      state.activeConvo.messages,
      state.messages,
      Object.keys(state.convos || {})
        .map(peerID => state.convos[peerID].lastMessage)
    );
    state.activeConvo = null;
  }
};

const reduceConvoActivated = (state, action) => {
  if (state.activeConvo !== null) {
    state.messages = pruneMessages(
      state.activeConvo.messages,
      state.messages,
      Object.keys(state.convos || {})
        .map(peerID => state.convos[peerID].lastMessage)
    );
  }

  state.activeConvo = {
    peerID: action.payload.peerID,
    messages: [],
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
      messages: action.payload.sorted,
    };

    state.messages = {
      ...state.messages,
      ...action.payload.messages,
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
      [action.payload.data.messageID]: {
        ...action.payload.data,
      },
    };
  } else if (action.payload.type === 'UPDATE') {
    state.activeConvo.messages[action.payload.data.messageID] = {
      ...state.activeConvo.messages[action.payload.data.messageID],
      ...action.payload.data,
    };
  } else {
    delete state.activeConvo.messages[action.payload.data.messageID];
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
  [convoChange]: reduceConvoChange,
  [convoActivated]: reduceConvoActivated,
  [convoMessagesRequest]: reduceConvoMessagesRequest,
  [convoMessagesSuccess]: reduceConvoMessagesSuccess,
  [convoMessagesFail]: reduceConvoMessagesFail,
  [deactivateConvo]: reduceDeactivateConvo,
  [messageChange]: reduceMessageChange,
  [AUTH_LOGOUT]: reduceAuthLogout
});

// selectors

export const getConvos = createSelector(
  ['convos'],
  convos =>
    orderBy(
      Object.keys(convos).map(convoPeerID => ({
        peerID: convoPeerID,
        ...convos[convoPeerID],
      })),
      ['sortTimestamp'],
      ['desc']
    )
);

export const getActiveConvoMessage = createSelector(
  ['activeConvo.messages'],
  // TODO: This is very ineficient since anytime any change is made to a message
  // or a new message comes in, the list will be resorted, which could be expensive
  // on chats with a lot of messages. Probably better to have the saga provide an
  // already sorted list and the saga can be smarter about selectively sorting.
  messages =>
    orderBy(
      Object.keys(messages)
        .map(messageID => ({
          ...messages[messageID],
        })),
      ['timestamp']
    )
);

// export const getChatState = rawChatState => {
//   let activeConvo = rawChatState.activeConvo;

//   if (activeConvo && activeConvo.messages) {
//     activeConvo = {
//       ...activeConvo,
//       messages: getActiveConvoMessage(rawChatState),
//     }
//   }

//   return {
//     ...rawChatState,
//     convos: getConvos(rawChatState),
//     activeConvo,
//   }
// };

export const getMoo = createSelector(
  ['activeConvo.messages'],
  // TODO: This is very ineficient since anytime any change is made to a message
  // or a new message comes in, the list will be resorted, which could be expensive
  // on chats with a lot of messages. Probably better to have the saga provide an
  // already sorted list and the saga can be smarter about selectively sorting.
  messages => {
    return Object.keys(messages)
      .map(messageID => messages[messageID]);
  }
);

export const getChatState = rawChatState => ({
  ...rawChatState,
  // activeConvo: !rawChatState.activeConvo ?
  //   null :
  //   {
  //     ...rawChatState.activeConvo,
  //     messages: getMoo(rawChatState),
  //   },
  convos: getConvos(rawChatState),
});
