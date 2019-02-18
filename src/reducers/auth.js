import { createReducer } from 'redux-starter-kit';
import { AUTH_LOGIN, AUTH_LOGOUT } from 'actions/auth';

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
  authUser: dummyUserProfile
};

const login = (state, action) => {
  state.authUser = dummyUserProfile;
};

const logout = (state, action) => {
  state.authUser = null;
};

export default createReducer(initialState, {
  [AUTH_LOGIN]: login,
  [AUTH_LOGOUT]: logout
});
