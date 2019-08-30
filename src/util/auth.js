import bip39 from 'bip39';
import { fromSeed as bip32fromSeed } from 'bip32';
import { fromByteArray } from 'base64-js';
import { ECPair, script } from 'bitcoinjs-lib';
import { isValidMenmonic, hash, identityKeyFromSeed } from 'util/crypto';
import { getOwnProfile } from 'models/profile';
import { get as getIpfsNode, destroy as destroyIpfsNode } from 'core/ipfs';
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
        const publicKey = vals[2].publicKey;
        const privateKey = vals[2].privateKey;
        const peerID = vals[2].peerIDB58;
        const dbName = `ob${vals[0].toString('hex')}`;

        let _escrowECPair;

        const getEscrowECPair = masterKey => {
          if (!_escrowECPair) {
            const twoZeroNine = masterKey.deriveHardened(209);
            const escrowHDKey = twoZeroNine.deriveHardened(0);
            _escrowECPair = ECPair.fromPrivateKey(escrowHDKey.privateKey);
          }
          return _escrowECPair;
        };

        _identity = {
          peerID,
          publicKey,
          privateKey,
          keypair: vals[2].keypair,
          dbName,
          mnemonic,
          get masterKey() {
            if (!this._masterKey) {
              const bip39seed = bip39.mnemonicToSeed(mnemonic, '');
              this._masterKey = bip32fromSeed(bip39seed);
            }
            return this._masterKey;
          },
          get escrowKey() {
            if (!this._escrowKey) {
              this._escrowKey = getEscrowECPair(this.masterKey).publicKey;
            }
            return this._escrowKey;
          },
          get escrowSig() {
            if (!this._escrowSig) {
              const sig = getEscrowECPair(this.masterKey).sign(
                Buffer.from(vals[2].peerIDB58).slice(0, 32)
              );
              const encodedSig = script.signature.encode(sig, 1);
              this._escrowSig = encodedSig.slice(0, encodedSig.length - 1);
            }
            return this._escrowSig;
          },
          get ratingKey() {
            if (!this._ratingKey) {
              const twoZeroNine = this.masterKey.deriveHardened(209);
              const ratingHDKey = twoZeroNine.deriveHardened(1);
              const ecPair = ECPair.fromPrivateKey(ratingHDKey.privateKey);
              this._ratingKey = ecPair.publicKey;
            }
            return this._ratingKey;
          }
        };

        return Promise.all([
          getDb(dbName, fromByteArray(vals[1])),
          getIpfsNode(peerID, fromByteArray(privateKey))
        ]);
      })
      .then(() => getOwnProfile())
      .then(profile => {
        resolve({
          identity: _identity,
          profile
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
  if (!_identity) return;
  if (_identity.peerID) destroyIpfsNode(_identity.peerID);
  if (_identity.dbName) destroyDb(_identity.dbName);
  _identity = null;
}
