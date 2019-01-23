import { createReducer } from 'redux-starter-kit';
import {
  speak,
  fart,
  silence,
} from '../actions/charlie';

const initialState = {
  response: '',
};

export default createReducer(initialState, {
  [speak]: (state, action) => {
    state.response = 'I know you are, but what am I?';
  },
  [fart]: (state, action) => {
    state.response = 'Oh that\'s harsh bro!';
  },
  [silence]: (state, action) => {
    state.response = 'ahhhhh, sweet sweet silence :)';
  },
});