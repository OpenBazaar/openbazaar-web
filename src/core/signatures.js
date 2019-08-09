import { keys } from 'libp2p-crypto';
import { createFromPubKey } from 'peer-id';

export async function verifySignature(serializedPb, pkBytes, sigBytes, peerID) {
  const pubkey = keys.unmarshalPublicKey(pkBytes);
  const validSig = pubkey.verify(serializedPb, sigBytes);

  if (!validSig) {
    throw new Error('Invalid signature.');
  }

  const pID = await createFromPubKey(pkBytes);

  if (pID.toB58String() !== peerID) {
    throw new Error('The peerID does not match the pubkey');
  }
}