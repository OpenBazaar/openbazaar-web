import { createReducer, createSelector } from 'redux-starter-kit';
import { orderBy } from 'lodash' ;
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
} from 'actions/chat';

const initialState = {
  chatOpen: false,
  fetchingConvos: false,
  fetchingConvosFailed: false,
  fetchingConvosError: null,
  convos: [],
  activeConvo: null,
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
}

const reduceConvosSuccess = (state, action) => {
  state.fetchingConvos = false;
  state.convosFetchFailed = false;
  state.convosFetchError = null;
  state.convos = action.payload;
}

const reduceConvosFail = (state, action) => {
  state.fetchingConvos = false;
  state.convosFetchFailed = true;
  state.convosFetchError = action.payload;
}

const reduceConvoActivated = (state, action) => {
  state.activeConvo = {
    peerId: action.payload.peerId,
    messages: action.payload.messages || [],
    fetchingMessages: false,
    messageFetchFailed: false,
    messageFetchError: null,    
  };
}

const reduceConvoMessagesRequest = (state, action) => {
  if (state.activeConvo && action.payload === state.activeConvo.peerId) {
    state.activeConvo = {
      ...state.activeConvo,
      fetchingMessages: true,
      messageFetchFailed: false,
      messageFetchError: null,    
    };
  }
}

const reduceConvoMessagesSuccess = (state, action) => {
  state.activeConvo = {
    ...state.activeConvo,
    fetchingMessages: false,
    messageFetchFailed: false,
    messageFetchError: null,    
  };
}

const reduceConvoMessagesFail = (state, action) => {
  state.activeConvo = {
    ...state.activeConvo,
    fetchingMessages: false,
    messageFetchFailed: action.payload.canceled,
    messageFetchError: action.payload.canceled ?
      null :
      action.payload.error || null,
  };
}

const reduceDeactivateConvo = state => {
  state.activeConvo = null;
}

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
});

// selectors

export const getConvos = createSelector(
  ['convos'], convos =>
    orderBy(convos, ['unread', 'lastMessageReceivedAt'], ['desc', 'desc'])
      .map(convo => ({
        ...convo,
        name: convo.name || convo.peerId,
      }))
);

