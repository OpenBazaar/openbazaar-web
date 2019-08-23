import multihashing from 'multihashing-async';
import CID from 'cids';

// EncodeCID - Hash with SHA-256 and encode as a multihash
export async function encodeCID(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error('Bytes must be provided as a Uint8Array.');
  }

  const mh = await encodeMultihash(Buffer.from(bytes));
  return new CID(1, 'raw', mh, 'base58btc');
}

// EncodeMultihash - sha256 encode
export async function encodeMultihash(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error('Bytes must be provided as a Uint8Array.');
  }

  return multihashing(Buffer.from(bytes), 'sha2-256')
}

console.log('eencode');
window.encode = encodeCID;