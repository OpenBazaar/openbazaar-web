import IPFS from './ipfs';

// todo: doc me up including:
// todo: more robust arg checking here possible?
// need base58 peerID, base64 privateKey
const getIpfsNodeInitOpts = (peerID, privateKey) => {
  if (typeof peerID !== 'string') {
    throw new Error('Please provide a peerID as a string.');
  }

  if (typeof privateKey !== 'string') {
    throw new Error('Please provide a privateKey as a string.');
  }

  return {
    EXPERIMENTAL: {
      pubsub: true,
      ipnsPubsub: true
    },
    relay: {
      enabled: true
    },
    repo: `ipfs/${peerID}`,
    init: { privateKey }
  };
};

// add some logging of what the node is doing. Init'ing,
// starting, errors, etc...
// work some type of node timeout into the app in case it takes
// too long to be ready...?
const _create = async (options = {}) => {
  return new Promise((resolve, reject) => {
    const node = new IPFS(options);

    if (process.env.NODE_ENV === 'development') {
      // write to window for debugging
      window.ipfs = node;
    }

    node.on('ready', () => resolve(node));
    node.on('error', e => reject(e));
  });
};

let curNode = null;

export const get = (peerID, privateKey) => {
  if (peerID !== undefined || privateKey !== undefined) {
    ['peerID', 'privateKey'].forEach(arg => {
      if (typeof arg !== 'string' || !arg) {
        throw new Error(
          'If providing the peerID or privateKey, both must be provided ' +
            'as non-empty strings.'
        );
      }
    });
  }

  if (peerID) {
    if (
      curNode &&
      curNode.peerID === peerID &&
      curNode.privateKey === privateKey
    ) {
      return curNode.promise;
    } else {
      if (curNode) destroy(peerID);
      curNode = {
        peerID,
        privateKey,
        promise: _create(getIpfsNodeInitOpts(peerID, privateKey)).catch(e => {
          if (
            curNode &&
            curNode.peerID === peerID &&
            curNode.privateKey === privateKey
          ) {
            curNode = null;
          }

          throw e;
        })
      };

      return curNode.promise;
    }
  } else {
    return curNode
      ? curNode.promise
      : Promise.reject(
          new Error(
            'There is no current ipfs node. You can create one ' +
              'by passing in a peerID and private key.'
          )
        );
  }
};

export const destroy = peerID => {
  if (typeof peerID !== 'string' || !peerID) {
    throw new Error('Please provide a peerID as a non-empty string.');
  }

  // What happens if you try to reconnect to a node that is
  // being destroyed?
  if (curNode && curNode.peerID === peerID) {
    curNode = null;
    return curNode.promise.then(node => node.stop());
  }

  return Promise.resolve();
};
