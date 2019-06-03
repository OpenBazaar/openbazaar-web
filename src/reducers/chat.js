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
    acc[convo.peerID] = convo;
    return acc;
  }, {});
};

const reduceConvosFail = (state, action) => {
  state.fetchingConvos = false;
  state.convosFetchFailed = true;
  state.convosFetchError = action.payload;
};

const reduceConvoActivated = (state, action) => {
  state.activeConvo = {
    peerID: action.payload.peerID,
    messages: action.payload.messages || [],
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
      messages: action.payload.messages,
    };
  }
};

const reduceConvoMessagesFail = (state, action) => {
  if (state.activeConvo && action.payload.peerID === state.activeConvo.peerID) {
    state.activeConvo = {
      ...state.activeConvo,
      fetchingMessages: false,
      messageFetchFailed: true,
      messageFetchError: action.payload.error,
    };
  }
};

const reduceDeactivateConvo = state => {
  state.activeConvo = null;
};

const reduceConvoChange = (state, action) => {
  state.convos[action.payload.data.peerID] = action.payload.data;
}

const reduceMessageChange = (state, action) => {
  if (
    action.payload.operation === 'INSERT' &&
    state.activeConvo &&
    state.activeConvo.peerID === action.payload.data.peerID
  ) {
    // for now, we're not supporting editing or deleting a chat message
    const messages = state.activeConvo.messages || [];
    messages.push(action.payload.data);
    state.activeConvo.messages = messages;
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
  [AUTH_LOGOUT]: reduceAuthLogout
});

// selectors

export const getConvos = createSelector(
  ['convos'],
  convos => orderBy(
    Object.keys(convos)
      .map(convoPeerId => convos[convoPeerId]),
    ['unread', 'timestamp'], ['desc', 'desc']
  )
);
