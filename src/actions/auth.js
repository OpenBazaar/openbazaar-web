import {
  generatePeerId,
  isValidMenmonic,
  hash,
} from 'util/crypto';
import { fromByteArray } from 'base64-js';
import { get as getDb } from 'util/database';

export const AUTH_LOGIN = 'AUTH_LOGIN';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const AUTH_GENERATING_MNEMONIC = 'AUTH_GENERATING_MNEMONIC';
export const AUTH_GENERATE_MNEMONIC_SUCCESS = 'AUTH_GENERATE_MNEMONIC_SUCCESS';
export const AUTH_GENERATE_MNEMONIC_FAIL = 'AUTH_GENERATE_MNEMONIC_FAIL';
export const AUTH_LOGGING_IN = 'AUTH_LOGGING_IN';
export const AUTH_LOGIN_FAIL = 'AUTH_LOGIN_FAIL';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';

export const login = (props = {}) => (dispatch, getState) => {
  if (!isValidMenmonic(props.mnemonic)) {
    throw new Error('Please provide a valid mnemonic.');
  }

  dispatch({ type: AUTH_LOGGING_IN });

  return new Promise((resolve, reject) => {
    const mnemonic = props.mnemonic;
    const nameHash = hash(mnemonic, { hmacSeed: 'ob-db-name' });
    const pwHash = hash(mnemonic, { hmacSeed: 'ob-db-password' });

    Promise
      .all([nameHash, pwHash])
      .then(vals => {
        return getDb(`a${vals[0].toString('hex')}`, fromByteArray(vals[1]))
      })
      .then(
        db => {
          return db.profile.find().exec();
        }, error => {
          dispatch({
            type: AUTH_LOGIN_FAIL,
            error: error.message,
          });
          reject(error);
        })
      .then(
        profiles => {
          const profile = profiles[0] || null;
          dispatch({
            type: AUTH_LOGIN_SUCCESS,
            profile,
          });
          resolve(profile);
        }, error => {
          console.error(error);
          // onboarding needed
        }
      );
  });
}

export const logout = (props = {}) => ({
  type: AUTH_LOGOUT
});

let generatingMnemonic = null;
let mnemonicData = null;

export const generateMnemonic = (props = {}) => (dispatch, getState) => {
  if (generatingMnemonic) return generatingMnemonic;

  dispatch({ type: AUTH_GENERATING_MNEMONIC });

  let promise;

  if (mnemonicData) {
    promise = new Promise(resolve => resolve(mnemonicData));
  } else {
    promise = generatingMnemonic = generatePeerId();
  }

  promise.then(data => {
    mnemonicData = data;
    dispatch({
      type: AUTH_GENERATE_MNEMONIC_SUCCESS,
      data,
    });
  }, error => {
    dispatch({
      type: AUTH_GENERATE_MNEMONIC_FAIL,
      error,
    });
  })
    .catch(() => {})
    .then(() => generatingMnemonic = null);

  return promise;
};

export const refreshMnemonic = (props = {}) => {
  mnemonicData = null;
  return generateMnemonic(props);
}
