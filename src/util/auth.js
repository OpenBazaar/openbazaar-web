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
  return new Promise((resolve, reject) => {
    if (!isValidMenmonic(mnemonic)) {
      reject('Please provide a valid mnemonic.');
    }

    const nameHash = hash(mnemonic, { hmacSeed: 'ob-db-name' });
    const pwHash = hash(mnemonic, { hmacSeed: 'ob-db-password' });

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
      .then(vals =>
        vals[0]
          .profile
          .findOne()
          .where('peerID')
          .eq(_identity.peerID)
          .exec()
      )
      .then(profile => {
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
      });
  });  
}

export function logout() {
  if (_identity.peerID) destroyIpfsNode(_identity.peerID);
  if (_identity.dbName) destroyDb(_identity.dbName);
  _identity = null;
}