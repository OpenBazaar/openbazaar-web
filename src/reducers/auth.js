import { createReducer } from 'redux-starter-kit';
import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_GENERATING_MNEMONIC,
  AUTH_GENERATE_MNEMONIC_SUCCESS,
  AUTH_GENERATE_MNEMONIC_FAIL,
  AUTH_LOGGING_IN,
  AUTH_LOGIN_FAIL,
  AUTH_LOGIN_SUCCESS,
} from 'actions/auth';

const dummyUserProfile = {
  peerID: 'QmQ2ThBL6zcYxBsCH2fUV3EUiPM3tYmdnP3q7jke21uBMp',
  name: 'Johnny Pickles',
  avatarHashes: {
    tiny: 'zb2rhkDnSniPbTDo65Seu1YcqNk1GFMohUTnmMUM2m4XiS5yB',
    small: 'zb2rhi692DwEHNDAxeN7ci6jDQ98Cu5PcezAJXNv33v4yohKd',
    medium: 'zb2rhYc8zZvLV1rnUnxzESwuPZMJTFnrZxf2UGAt1S8rYoTQm',
    large: 'zb2rhdwD157sLCsGgChCACVfCBgvRFRGu1vo3ADhDKspXjcrK',
    original: 'zb2rhg48XvyXKcygzdmq1KxEfxJXvwYuz7xFsTM45uDEbXbRJ'
  }
};

const initialState = {
  authUser: null,
  generatingMnemonic: false,
  generateMnemonicFailed: false,
  generateMnemonicError: '',
  mnemonic: '',
  loggingIn: false,
  loggedIn: false,
  // loginFailed: false,
  // loginError: '',
  profile: null,
};

const login = (state, action) => {
  state.authUser = dummyUserProfile;
};

const logout = (state, action) => {
  state.authUser = null;
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
  // state.loginFailed = false;
  // state.loginError = '';
}

const loginSuccess = (state, action) => {
  state.loggingIn = false;
  state.loggedIn = true;
  state.profile = action.profile || null;
}

const loginFail = (state, action) => {
  state.loggingIn = false;
  state.loggedIn = false;
  state.profile = null;
  // state.loginFailed = true;
  // state.loginError = action.error || '';
}

export default createReducer(initialState, {
  [AUTH_LOGIN]: login,
  [AUTH_LOGOUT]: logout,
  [AUTH_GENERATING_MNEMONIC]: generatingMnemonic,
  [AUTH_GENERATE_MNEMONIC_SUCCESS]: generateMnemonicSuccess,
  [AUTH_GENERATE_MNEMONIC_FAIL]: generateMnemonicFail,
  [AUTH_LOGGING_IN]: loggingIn,
  [AUTH_LOGIN_SUCCESS]: loginSuccess,
  [AUTH_LOGIN_FAIL]: loginFail
});
