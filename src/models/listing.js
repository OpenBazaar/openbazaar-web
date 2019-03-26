import { get } from 'axios';
import { GATEWAY_URL } from 'util/constants';

const getsByHash = {};

export const getListing = hash => {
  if (typeof hash !== 'string' ||
    !hash) {
    throw new Error('Please provide a listing hash as a non-empty ' +
      'string.');
  }

  let fetch = getsByHash[hash];

  if (!fetch) {
    fetch = get(`${GATEWAY_URL}listing/ipfs/${hash}`);
    fetch.then(() => (delete getsByHash[hash]));
  }

  return fetch;
}