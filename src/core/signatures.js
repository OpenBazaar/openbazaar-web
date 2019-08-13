import { keys } from 'libp2p-crypto';
import { createFromPubKey } from 'peer-id';
import { ECPair, script } from 'bitcoinjs-lib';
import { createFromB58String } from 'peer-id';

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

console.log('ECPair');
window.ECPair = ECPair;

console.log('createFromB58String');
window.createFromB58String = createFromB58String;

console.log('script');
window.script = script;

export function verifyBitcoinSignature (pubkeyBytes, sigBytes, peerID) {
  // ECPair
  // bitcoinPubkey, err := btcec.ParsePubKey(pubkeyBytes, btcec.S256())
  // if err != nil {
  //   return err
  // }
  // bitcoinSig, err := btcec.ParseSignature(sigBytes, btcec.S256())
  // if err != nil {
  //   return err
  // }
  // if !bitcoinSig.Verify([]byte(guid), bitcoinPubkey) {
  //   return invalidSigError{}
  // }
  // return nil
}