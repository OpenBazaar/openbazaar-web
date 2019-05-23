import { createReducer, createSelector } from 'redux-starter-kit';
import { orderBy } from 'lodash' ;
import {
  open,
  close,
  convosRequest,
  convosSuccess,
} from 'actions/chat';

const initialState = {
  chatOpen: false,
  fetchingConvos: false,
  convos: [],
};

const openChat = (state, action) => {
  state.chatOpen = true;
};

const closeChat = (state, action) => {
  state.chatOpen = false;
};

const reduceConvosRequest = (state, action) => {
  state.fetchingConvos = true;
}

const reduceConvosSuccess = (state, action) => {
  state.fetchingConvos = false;
  state.convos = action.payload;
}

export default createReducer(initialState, {
  [open]: openChat,
  [close]: closeChat,
  [convosRequest]: reduceConvosRequest,
  [convosSuccess]: reduceConvosSuccess,
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

