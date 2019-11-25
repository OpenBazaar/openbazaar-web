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
  activeConvoMessagesChange,
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

// todo: explain the idea in more detail... balancing float to top
// with no likey jumpy jumpers.
const getConvoTimestamp = (state, convoData, lastMessage) => {
  const prevConvo = state.convos[convoData.peerID];
  const ageTimestamp = timestamp => {
    const date = new Date(lastMessage.timestamp);
    date.setFullYear(date.getFullYear() - 100);
    return date.toISOString();    
  };

  if (!prevConvo) {
    // The idea is for convos with unread messages to be on top
    return !convoData.unread ?
      ageTimestamp(lastMessage.timestamp) : lastMessage.timestamp;
  } else {
    // If the convo is being updated and going from unread to read,
    // we'll float it to the top.
    if (!prevConvo.unread && prevConvo.unread) {
      return ageTimestamp(lastMessage.timestamp);
    } else {
      return convoData.sortTimestamp;
    }
  }
}

const reduceConvosSuccess = (state, action) => {
  state.fetchingConvos = false;
  state.convosFetchFailed = false;
  state.convosFetchError = null;

  state.convos = Object.keys(action.payload.convos)
    .reduce((acc, peerID) => {
      const convo = action.payload.convos[peerID];
      const message = action.payload.messages[convo.lastMessage];

      acc[peerID] = {
        ...convo,
        sortTimestamp: getConvoTimestamp(
          state,
          convo,
          message,
        ),
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
  const {
    peerID,
    removed,
  } = action.payload;

  if (removed) {
    delete state.convos[peerID];
    if (peerID === state.activeConvo.peerID) {
      state.activeConvo = null;
    }
    return;    
  }

  const convo = {
    ...state.convos[peerID],
    ...action.payload.data,
  };

  if (action.payload.message) {
    const messageID = action.payload.message.messageID;
    const messages = state.messages = {
      ...state.messages,
      [messageID]: {
        ...state.messages[messageID],
        ...action.payload.message
      },
    }

    convo.sortTimestamp = getConvoTimestamp(
      state,
      convo,
      messages[convo.lastMessage],
    );
  }

  
  state.convos[peerID] = convo;
}

// todo: doc me up.
// todo: unit test me.
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
      getConvoLastMessages(state)
    );
    state.activeConvo = null;
  }
};

const reduceConvoActivated = (state, action) => {
  if (state.activeConvo !== null) {
    state.messages = pruneMessages(
      state.activeConvo.messages,
      state.messages,
      getConvoLastMessages(state)
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

const reduceActiveConvoMessagesChange = (state, action) => {
  if (state.activeConvo === null) return;

  const {
    sorted,
    messages,
    removed,
  } = action.payload;

  if (sorted) {
    state.activeConvo.messages = sorted;
  }

  if (
    typeof messages === 'object' &&
    Object.keys(messages).length
  ) {
    state.messages = {
      ...state.messages,
      ...messages,
    }
  }

  if (
    Array.isArray(removed) &&
    removed.length
  ) {
    state.messages = pruneMessages(
      removed,
      state.messages,
      getConvoLastMessages(state)
    );
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
  [activeConvoMessagesChange]: reduceActiveConvoMessagesChange,
  [AUTH_LOGOUT]: reduceAuthLogout
});

// selectors

const getConvoLastMessages = createSelector(
  ['convos'],
  convos => (
    Object.keys(convos || {})
      .map(peerID => convos[peerID].lastMessage)    
  )
)

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

export const getChatState = rawChatState => ({
  ...rawChatState,
  convos: getConvos(rawChatState),
});
