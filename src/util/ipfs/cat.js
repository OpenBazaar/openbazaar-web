import { GATEWAY_BASE_URL } from 'util/constants';
import { get } from 'axios';

export function cat(path, options = {}) {
  // So eventually this should come from our node. Getting by hash is relatively quick
  // so we have very little reason here not to go 100% decentralized.
  // But... for now using the gateway because IPFS is just not returning content for me,
  // the dht is not working (not sure if its necessary), I'm having difficulty getting
  // on our forked network, etc...

  const ipfsPath = path.startsWith('/ipfs/') ? path : `/ipfs/${path}`;

  return {
    cancel() {
      // not yet
    },
    result: get(`${GATEWAY_BASE_URL}${ipfsPath}`)
  };
}
