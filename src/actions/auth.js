import bip39 from 'bip39';
import { isValidMenmonic } from 'util/crypto';
import { login as authLogin, logout as authLogout } from 'util/auth';

export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const AUTH_GENERATING_MNEMONIC = 'AUTH_GENERATING_MNEMONIC';
export const AUTH_GENERATE_MNEMONIC_SUCCESS = 'AUTH_GENERATE_MNEMONIC_SUCCESS';
export const AUTH_GENERATE_MNEMONIC_FAIL = 'AUTH_GENERATE_MNEMONIC_FAIL';
export const AUTH_LOGGING_IN = 'AUTH_LOGGING_IN';
export const AUTH_LOGIN_FAIL = 'AUTH_LOGIN_FAIL';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
export const OWN_PROFILE_SET = 'OWN_PROFILE_SET';

export const onOwnProfileObtained = (dispatch, profile) => {
  profile.$.subscribe(p => {
    if (!p) return;

    const strippedProfile = { ...p };
    delete strippedProfile._rev;
    // TODO: make action creator.
    dispatch({
      type: OWN_PROFILE_SET,
      payload: {
        profile: strippedProfile
      }
    });
  });
};

export const login = (props = {}) => async (dispatch, getState) => {
  if (!isValidMenmonic(props.mnemonic)) {
    throw new Error('Please provide a valid mnemonic.');
  }

  dispatch({ type: AUTH_LOGGING_IN });

  return authLogin(props.mnemonic)
    .then(data => {
      const profile = data.profile;

      dispatch({
        type: AUTH_LOGIN_SUCCESS,
        profile: profile ? profile.toJSON() : null
      });

      if (profile) {
        onOwnProfileObtained(dispatch, profile);
      }
    })
    .catch(err => {
      dispatch({
        type: AUTH_LOGIN_FAIL
      });
    });
};

export const logout = (props = {}) => {
  authLogout();

  return {
    type: AUTH_LOGOUT
  };
};

export const generateMnemonic = (props = {}) => (dispatch, getState) => {
  dispatch({ type: AUTH_GENERATING_MNEMONIC });

  const mnemonic = bip39.generateMnemonic();

  dispatch({
    type: AUTH_GENERATE_MNEMONIC_SUCCESS,
    data: { mnemonic }
  });
};
