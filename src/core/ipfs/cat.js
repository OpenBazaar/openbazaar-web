// import { getListing } from 'models/listing';
import { get } from 'axios';
import { GATEWAY_BASE_URL } from 'core/constants';

export async function cat(path, options = {}) {
  // So eventually this should come from our node. Getting by hash is relatively quick
  // so we have very little reason here not to go 100% decentralized.
  // But... for now using the gateway because IPFS is just not returning content for me,
  // the dht is not working (not sure if its necessary), I'm having difficulty getting
  // on our forked network, etc...

  // return getListing(path);
  return get(`${GATEWAY_BASE_URL}ipfs/${path}`);
}
