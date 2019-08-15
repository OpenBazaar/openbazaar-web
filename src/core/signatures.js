import { keys } from 'libp2p-crypto';
import { createFromPubKey } from 'peer-id';
import { ECPair, script } from 'bitcoinjs-lib';

export async function verifySignature(serializedPb, pubkeyBytes, sigBytes, peerID) {
  const pubkey = keys.unmarshalPublicKey(pubkeyBytes);
  const validSig = pubkey.verify(serializedPb, sigBytes);

  if (!validSig) {
    throw new Error('Invalid signature.');
  }

  const pID = await createFromPubKey(Buffer.from(pubkeyBytes));

  if (pID.toB58String() !== peerID) {
    throw new Error('The peerID does not match the pubkey');
  }
}

/*
 * Verifies the ECDSA escrow signature that is added to listings. Referred to as
 * the bitcoin signature in ob-go.
 *
 * @param {string} pubkey - A base64 representation of the public key.
 * @param {string} sig - A base64 representation of the signature.
 * @returns {boolean} A boolean indiciating whether the signature verifies.
 */
export function verifyEscrowSignature(pubkeyBytes, sigBytes, peerID) {
  const ecPair = ECPair.fromPublicKey(
    Buffer.from(pubkeyBytes)
  );

  // The signature does not contain the last byte representing the hash type since
  // ob-go does not include it and to match ob-go we strip it. Since it's required
  // by the signature verification method, we'll put it back in here.
  const sig = 
    Buffer.from(
      (`${sigBytes.join(',')},1`).split(',')
    );

  const decodedSig = script.signature.decode(sig);

  return ecPair.verify(Buffer.from(peerID).slice(0, 32), decodedSig.signature);
}