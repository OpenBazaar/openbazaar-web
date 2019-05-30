import { createReducer } from 'redux-starter-kit';
import { requestCachedSuccess } from 'actions/profile';

const initialState = {};

const reduceRequestCachedSuccess = (state, action) => {
  state[action.payload.peerID] = action.payload;
};

export default createReducer(initialState, {
  [requestCachedSuccess]: reduceRequestCachedSuccess
});
