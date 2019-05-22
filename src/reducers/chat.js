import { createReducer } from 'redux-starter-kit';
import {
  CHAT_OPEN,
  CHAT_CLOSE,
} from 'actions/chat';

const initialState = {
  chatOpen: false,
};

const chatOpen = (state, action) => {
  state.chatOpen = true;
};

const chatClose = (state, action) => {
  state.chatOpen = false;
};

export default createReducer(initialState, {
  [CHAT_OPEN]: chatOpen,
  [CHAT_CLOSE]: chatClose,
});
