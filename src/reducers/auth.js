import { createReducer } from 'redux-starter-kit';
import {
  AUTH_LOGOUT,
  AUTH_GENERATING_MNEMONIC,
  AUTH_GENERATE_MNEMONIC_SUCCESS,
  AUTH_GENERATE_MNEMONIC_FAIL,
  AUTH_LOGGING_IN,
  AUTH_LOGIN_FAIL,
  AUTH_LOGIN_SUCCESS,
  OWN_PROFILE_SET
} from 'actions/auth';

const initialState = {
  generatingMnemonic: false,
  generateMnemonicFailed: false,
  generateMnemonicError: '',
  mnemonic: '',
  loggingIn: false,
  loggedIn: false,
  profile: null,
  identity: null,
  needOnboarding: false
};

const logout = (state, action) => {
  state.loggingIn = false;
  state.loggedIn = false;
  state.profile = null;
  state.needOnboarding = false;
  state.identity = null;
};

const generatingMnemonic = (state, action) => {
  state.generatingMnemonic = true;
  state.generateMnemonicFailed = false;
  state.generateMnemonicError = '';
};

const generateMnemonicSuccess = (state, action) => {
  state.generatingMnemonic = false;
  state.mnemonic = action.data.mnemonic;
};

const generateMnemonicFail = (state, action) => {
  state.generatingMnemonic = false;
  state.generateMnemonicFailed = true;
  state.generateMnemonicError = action.error;
};

const loggingIn = (state, action) => {
  state.loggingIn = true;
  state.loggedIn = false;
  state.profile = null;
  state.identity = null;
};

const loginSuccess = (state, action) => {
  state.loggingIn = false;
  state.loggedIn = true;
  state.profile = action.profile || null;
  state.needOnboarding = !state.profile;
  state.identity = action.identity;
};

const loginFail = (state, action) => {
  state.loggingIn = false;
  state.loggedIn = false;
};

const ownProfileSet = (state, action) => {
  if (state.identity) {
    state.profile = action.payload.profile;
  }
};

export default createReducer(initialState, {
  [AUTH_LOGOUT]: logout,
  [AUTH_GENERATING_MNEMONIC]: generatingMnemonic,
  [AUTH_GENERATE_MNEMONIC_SUCCESS]: generateMnemonicSuccess,
  [AUTH_GENERATE_MNEMONIC_FAIL]: generateMnemonicFail,
  [AUTH_LOGGING_IN]: loggingIn,
  [AUTH_LOGIN_SUCCESS]: loginSuccess,
  [AUTH_LOGIN_FAIL]: loginFail,
  [OWN_PROFILE_SET]: ownProfileSet
});
