import { fromByteArray } from 'base64-js';
import {
  isValidMenmonic,
  hash,
  identityKeyFromSeed
} from 'util/crypto';
import { get as getIpfsNode, destroy as destroyIpfsNode } from 'util/ipfs';
import { get as getDb, destroy as destroyDb } from 'util/database';

let _identity = null;

export function getIdentity() {
  return _identity;
}

export function login(mnemonic) {
  if (!isValidMenmonic(mnemonic)) {
    throw new Error('Please provide a valid mnemonic.');
  }

  return new Promise((resolve, reject) => {
    const nameHash = hash(mnemonic, { hmacSeed: 'ob-db-name' });
    const pwHash = hash(mnemonic, { hmacSeed: 'ob-db-password' });
    let profile;

    Promise.all([nameHash, pwHash, identityKeyFromSeed(mnemonic)])
      .then(vals => {
        const publicKey = fromByteArray(vals[2].publicKey);
        const privateKey = fromByteArray(vals[2].privateKey);
        const peerID = vals[2].peerIDB58;
        const dbName = `ob${vals[0].toString('hex')}`;

        _identity = {
          peerID,
          publicKey,
          privateKey,
          dbName,
          mnemonic,
        };

        return Promise.all([
          getDb(dbName, fromByteArray(vals[1])),
          getIpfsNode(peerID, privateKey)
        ]);
      })
      // todo: probably better to explicitly pull profile based on peerID.
      .then(vals => vals[0].profile.find().exec())
      .then(profiles => {
        profile = profiles && profiles[0] ? profiles[0] : null;

        resolve({
          identity: _identity,
          profile,
        });
      })
      .catch(error => {
        if (_identity.peerID) destroyIpfsNode(_identity.peerID);
        if (_identity.dbName) destroyDb(_identity.dbName);
        _identity = null;
        reject(error);
        throw error;
      });
  });  
}

export function logout() {
  if (_identity.peerID) destroyIpfsNode(_identity.peerID);
  if (_identity.dbName) destroyDb(_identity.dbName);
  _identity = null;
}