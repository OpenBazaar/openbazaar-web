import bip39 from 'bip39';
import sha256 from 'js-sha256';
import { hmac, keys } from 'libp2p-crypto';
import PeerId from 'peer-id';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import libp2pCrypto from 'libp2p-crypto';
import ed2curve from 'ed2curve';

/*
 * Returns a Uint8Array(64) hash of the given text.
 */
export const hash = async (text, options = {}) => {
  const opts = {
    hash: 'SHA256',
    hmacSeed: 'ob-hash',
    ...options
  };

  const createdHmac = await hmac.create(opts.hash, naclUtil.decodeUTF8(opts.hmacSeed));
  return createdHmac.digest(naclUtil.decodeUTF8(text));
};

export async function identityKeyFromSeed(mnemonic, bits = 4096) {
  const bip39seed = bip39.mnemonicToSeed(mnemonic, '');
  const hmac = sha256.hmac.create('OpenBazaar seed');
  hmac.update(bip39seed);
  const seed = Buffer.from(hmac.array());
  const keypair =
    await keys.generateKeyPairFromSeed('ed25519', seed, bits);
  const peerID = await PeerId.createFromPubKey(keys.marshalPublicKey(keypair.public));

  // todo: strip the 'Key' suffix from pub and priv
  return {
    peerID: peerID.toBytes(),
    peerIDB58: peerID.toB58String(),
    publicKey: keypair.public.bytes,
    privateKey: keypair.bytes
  };
}

export function encrypt(pubKeyBytes, textBytes) {
  const libp2pPubKey = libp2pCrypto.keys.unmarshalPublicKey(pubKeyBytes);

  // Generate ephemeral key
  const ephemKeypair = nacl.box.keyPair();

  // Convert to curve25519 pubkey
  const pubkeyCurve = ed2curve.convertPublicKey(libp2pPubKey._key);

  // 24 bit random nonce
  const nonce = crypto.getRandomValues(new Uint8Array(24));

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
