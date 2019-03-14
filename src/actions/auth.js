import {
  generatePeerId,
  isValidMenmonic,
  hash,
  identityKeyFromSeed,
} from 'util/crypto';
import { fromByteArray } from 'base64-js';
import {
  get as getDb,
  destroy as destroyDb,
} from 'util/database';

export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const AUTH_GENERATING_MNEMONIC = 'AUTH_GENERATING_MNEMONIC';
export const AUTH_GENERATE_MNEMONIC_SUCCESS = 'AUTH_GENERATE_MNEMONIC_SUCCESS';
export const AUTH_GENERATE_MNEMONIC_FAIL = 'AUTH_GENERATE_MNEMONIC_FAIL';
export const AUTH_LOGGING_IN = 'AUTH_LOGGING_IN';
export const AUTH_LOGIN_FAIL = 'AUTH_LOGIN_FAIL';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';

let loggedInDbName = null;

export const login = (props = {}) => (dispatch, getState) => {
  if (!isValidMenmonic(props.mnemonic)) {
    throw new Error('Please provide a valid mnemonic.');
  }

  loggedInDbName = null;
  dispatch({ type: AUTH_LOGGING_IN });

  return new Promise((resolve, reject) => {
    const mnemonic = props.mnemonic;
    const nameHash = hash(mnemonic, { hmacSeed: 'ob-db-name' });
    const pwHash = hash(mnemonic, { hmacSeed: 'ob-db-password' });
    let identity;
    let nameHashHex = null;

    Promise
      .all([nameHash, pwHash, identityKeyFromSeed(props.mnemonic)])
      .then(vals => {
        identity = {
          peerId: vals[2].peerIdB58,
          publicKey: fromByteArray(vals[2].publicKey),
          privateKey: fromByteArray(vals[2].privateKey),
        };

        nameHashHex = `a${vals[0].toString('hex')}`;

        return getDb(nameHashHex, fromByteArray(vals[1]))
      })
      // todo: probably better to explicitly pull profile based on peerId.
      .then(db => db.profile.find().exec())
      .then(
        profiles => {
          const profile = profiles && profiles[0] ?
            profiles[0] : null;

          loggedInDbName = nameHashHex;

          dispatch({
            type: AUTH_LOGIN_SUCCESS,
            profile: profile ? profile.toJSON() : null,
            identity,
          });

          resolve(profile);
      })
      .catch(error => {
        reject(error);
        throw error;
      });
  });
};

export const logout = (props = {}) => {
  destroyDb(loggedInDbName);
  loggedInDbName = null;
  return {
    type: AUTH_LOGOUT
  }
};

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
};
