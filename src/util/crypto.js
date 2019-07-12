import bip39 from 'bip39';
import sha256 from 'js-sha256';
import { hmac, keys } from 'libp2p-crypto';
import PeerId from 'peer-id';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import libp2pCrypto from 'libp2p-crypto';
import ed2curve from 'ed2curve';
import { randomBytes } from 'crypto';

/*
 * Generates a peerID from the given menmonic. If not providing a menonic,
 * then this function will genrate one for you.
 */
export function generatePeerId(mnemonic) {
  return new Promise(function(resolve, reject) {
    if (!mnemonic) {
      mnemonic = bip39.generateMnemonic();
    }

    const bip39seed = bip39.mnemonicToSeed(mnemonic, 'Secret Passphrase');
    const hmac = sha256.hmac.create('OpenBazaar seed');
    hmac.update(bip39seed);
    const seed = new Uint8Array(hmac.array());
    keys.generateKeyPairFromSeed('ed25519', seed, (err, keypair) => {
      PeerId.createFromPubKey(
        keys.marshalPublicKey(keypair.public),
        (err, key) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            mnemonic,
            peerID: key._idB58String
          });
        }
      );
    });
  });
}

/*
 * Returns a Uint8Array(64) hash of the given text.
 */
export const hash = async (text, options = {}) => {
  const opts = {
    hash: 'SHA256',
    hmacSeed: 'ob-hash',
    ...options
  };

  return new Promise((resolve, reject) => {
    hmac.create(opts.hash, naclUtil.decodeUTF8(opts.hmacSeed), (err, hmac) => {
      if (!err) {
        hmac.digest(naclUtil.decodeUTF8(text), (err, sig) => {
          if (!err) {
            resolve(sig);
            return;
          }

          reject(err);
        });
        return;
      }

      reject(err);
    });
  });
};

export function identityKeyFromSeed(mnemonic, bits = 4096) {
  return new Promise((resolve, reject) => {
    const bip39seed = bip39.mnemonicToSeed(mnemonic, 'Secret Passphrase');
    const hmac = sha256.hmac.create('OpenBazaar seed');
    hmac.update(bip39seed);
    const seed = new Uint8Array(hmac.array());

    keys.generateKeyPairFromSeed('ed25519', seed, bits, (err, keypair) => {
      if (!err) {
        PeerId.createFromPubKey(
          keys.marshalPublicKey(keypair.public),
          (err, peerID) => {
            if (err) {
              reject(err);
              return;
            }

            // todo: strip the 'Key' suffix from pub and priv
            resolve({
              peerID: peerID.toBytes(),
              peerIDB58: peerID.toB58String(),
              publicKey: keypair.public.bytes,
              privateKey: keypair.bytes
            });
          }
        );
      } else {
        reject(err);
      }
    });
  });
}

export function encrypt(pubKeyBytes, textBytes) {
  const libp2pPubKey = libp2pCrypto.keys.unmarshalPublicKey(pubKeyBytes);

  // Generate ephemeral key
  const ephemKeypair = nacl.box.keyPair();

  // Convert to curve25519 pubkey
  const pubkeyCurve = ed2curve.convertPublicKey(libp2pPubKey._key);

  // 24 bit random nonce
  const nonce = new Uint8Array(randomBytes(24));

  // Create ciphertext
  const cipherText = nacl.box(
    textBytes,
    nonce,
    pubkeyCurve,
    ephemKeypair.secretKey
  );

  const jointCiphertext = Buffer.concat([
    Buffer.from(nonce),
    Buffer.from(ephemKeypair.publicKey),
    Buffer.from(cipherText)
  ]);

  return jointCiphertext.toString('base64');
}

export function decrypt(privKeyBytes, text) {
  const messageBytes = Buffer.from(text, 'base64');
  const nonce = messageBytes.slice(0, 24);
  const pubKey = messageBytes.slice(24, 56);
  const cipherText = messageBytes.slice(56, messageBytes.length);
  const privKey = ed2curve.convertSecretKey(privKeyBytes);

  const out = nacl.box.open(cipherText, nonce, pubKey, privKey);

  if (!out) {
    throw new Error('Unable to decrypt.');
  }

  return out;
}

/*
 * Very simple naive way of validating a mnemonic.
 */
export function isValidMenmonic(mnemonic) {
  let isValid = true;

  if (typeof mnemonic !== 'string' || !mnemonic) {
    isValid = false;
  } else {
    const match = mnemonic.match(/\S+/g);

    if (!match || match.length !== 12) {
      isValid = false;
    }
  }

  return isValid;
}
