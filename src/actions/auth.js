import { fromByteArray } from 'base64-js';
import {
  generatePeerId,
  isValidMenmonic,
  hash,
  identityKeyFromSeed
} from 'util/crypto';
import { get as getIpfsNode, destroy as destroyIpfsNode } from 'util/ipfs';
import { get as getDb, destroy as destroyDb } from 'util/database';

export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const AUTH_GENERATING_MNEMONIC = 'AUTH_GENERATING_MNEMONIC';
export const AUTH_GENERATE_MNEMONIC_SUCCESS = 'AUTH_GENERATE_MNEMONIC_SUCCESS';
export const AUTH_GENERATE_MNEMONIC_FAIL = 'AUTH_GENERATE_MNEMONIC_FAIL';
export const AUTH_LOGGING_IN = 'AUTH_LOGGING_IN';
export const AUTH_LOGIN_FAIL = 'AUTH_LOGIN_FAIL';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
export const OWN_PROFILE_SET = 'OWN_PROFILE_SET';

let loggedInDbName = null;

// todo: stop node on logout

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
    let publicKey = null;
    let nameHashHex = null;

    Promise.all([nameHash, pwHash, identityKeyFromSeed(props.mnemonic)])
      .then(vals => {
        publicKey = fromByteArray(vals[2].publicKey);
        const privateKey = fromByteArray(vals[2].privateKey);
        const peerID = vals[2].peerIDB58;

        identity = {
          peerID,
          publicKey,
          privateKey
        };

        nameHashHex = `ob${vals[0].toString('hex')}`;

        return Promise.all([
          getDb(nameHashHex, fromByteArray(vals[1])),
          getIpfsNode(peerID, privateKey)
        ]);
      })
      // todo: probably better to explicitly pull profile based on peerID.
      .then(vals => vals[0].profile.find().exec())
      .then(profiles => {
        const profile = profiles && profiles[0] ? profiles[0] : null;

        loggedInDbName = nameHashHex;

        dispatch({
          type: AUTH_LOGIN_SUCCESS,
          profile: profile ? profile.toJSON() : null,
          identity
        });

        if (profile) {
          onOwnProfileObtained(dispatch, profile);
        }

        resolve(profile);
      })
      .catch(error => {
        destroyIpfsNode(publicKey);
        destroyDb(nameHashHex);
        reject(error);

        dispatch({
          type: AUTH_LOGIN_FAIL
        });

        throw error;
      });
  });
};

export const logout = (props = {}) => {
  destroyDb(loggedInDbName);
  loggedInDbName = null;
  return {
    type: AUTH_LOGOUT
  };
};

let generatingMnemonic = null;

export const generateMnemonic = (props = {}) => (dispatch, getState) => {
  if (generatingMnemonic) return generatingMnemonic;

  dispatch({ type: AUTH_GENERATING_MNEMONIC });

  return generatePeerId()
    .then(data => {
      dispatch({
        type: AUTH_GENERATE_MNEMONIC_SUCCESS,
        data
      });
    })
    .catch(error => {
      console.error(error);
      dispatch({
        type: AUTH_GENERATE_MNEMONIC_FAIL,
        error
      });
    })
    .then(() => (generatingMnemonic = null));
};
