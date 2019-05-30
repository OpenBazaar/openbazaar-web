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
  deactivateConvo
} from 'actions/chat';
import { AUTH_LOGOUT } from 'actions/auth';

const initialState = {
  chatOpen: false,
  fetchingConvos: false,
  convosFetchFailed: false,
  convosFetchError: null,
  convos: [],
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
  state.convos = action.payload;
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
      messages: action.payload.messages
    };
  }
};

const reduceConvoMessagesFail = (state, action) => {
  if (state.activeConvo && action.payload === state.activeConvo.peerID) {
    state.activeConvo = {
      ...state.activeConvo,
      fetchingMessages: false,
      messageFetchFailed: action.payload.canceled,
      messageFetchError: action.payload.canceled
        ? null
        : action.payload.error || null
    };
  }
};

const reduceDeactivateConvo = state => {
  state.activeConvo = null;
};

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
  [AUTH_LOGOUT]: reduceAuthLogout
});

// selectors

export const getConvos = createSelector(
  ['convos'],
  convos => orderBy(convos, ['unread', 'timestamp'], ['desc', 'desc'])
);
