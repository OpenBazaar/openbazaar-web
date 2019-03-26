import { get } from 'axios';
import { GATEWAY_URL } from 'util/constants';

const getsByHash = {};

export const getListing = hash => {
  console.log(`duly noted. getting ${hash}`);
  if (typeof hash !== 'string' ||
    !hash) {
    throw new Error('Please provide a listing hash as a non-empty ' +
      'string.');
  }

  return getsByHash[hash] || (
    get(`${GATEWAY_URL}44444ipfs/${hash}`)
      .then(() => (delete getsByHash[hash]))
  );
}