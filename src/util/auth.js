import bip39 from 'bip39';
import { fromSeed as bip32fromSeed } from 'bip32';
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

console.log('sparky b64');
window.sparky = getIdentity;
window.b64 = fromByteArray;
window.buffer = Buffer;

export function login(mnemonic) {
  return new Promise((resolve, reject) => {
    if (!isValidMenmonic(mnemonic)) {
      reject('Please provide a valid mnemonic.');
    }

    const nameHash = hash(mnemonic, { hmacSeed: 'ob-db-name' });
    const pwHash = hash(mnemonic, { hmacSeed: 'ob-db-password' });

    Promise.all([nameHash, pwHash, identityKeyFromSeed(mnemonic)])
      .then(vals => {
        const publicKey = vals[2].publicKey;
        const privateKey = vals[2].privateKey;
        const peerID = vals[2].peerIDB58;
        const dbName = `ob${vals[0].toString('hex')}`;

        const setBitcoinKeys = (obj, peerIDBytes) => {
          console.log('sugar');
          window.sugar = peerIDBytes;
          console.log(peerIDBytes.length);
          const bip39seed = bip39.mnemonicToSeed(mnemonic, '');
          const bip32 = bip32fromSeed(bip39seed);          
          obj._bitcoinPublicKey = bip32.publicKey;
          console.log(Buffer.isBuffer(peerIDBytes));
          obj._bitcoinSig = bip32.sign(peerIDBytes, true);
        }

        _identity = {
          peerID,
          publicKey,
          privateKey,
          dbName,
          mnemonic,
          get bitcoinPublicKey() {
            if (this._bitcoinPublicKey) return this._bitcoinPublicKey;
            setBitcoinKeys(this, vals[2].peerID);
            return this._bitcoinPublicKey;
          },
          get bitcoinSig() {
            if (this._bitcoinSig) return this._bitcoinSig;
            setBitcoinKeys(this, vals[2].peerID);
            return this._bitcoinSig;
          },
        };

        return Promise.all([
          getDb(dbName, fromByteArray(vals[1])),
          getIpfsNode(peerID, fromByteArray(privateKey))
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
        // todo: app hangs here rather than displaying an error
        if (_identity && _identity.peerID) destroyIpfsNode(_identity.peerID);
        if (_identity && _identity.dbName) destroyDb(_identity.dbName);
        _identity = null;
        console.error(error);
        reject(error);
      });
  });  
}

export function logout() {
  if (_identity.peerID) destroyIpfsNode(_identity.peerID);
  if (_identity.dbName) destroyDb(_identity.dbName);
  _identity = null;
}