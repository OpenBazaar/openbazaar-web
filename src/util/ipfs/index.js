import IPFS from './ipfs';
import pull from 'pull-stream';
import { createFromBytes } from 'peer-id';
import { openDirectMessage } from 'util/messaging/index';
import { directMessage } from 'actions/messaging';

let _store;

export function init(store) {
  if (typeof store !== 'object' ||
    !Object.keys(store).length) {
    throw new Error('Please provide a store object');
  }

  _store = store;
}

const ensureInitialized = () => {
  if (!_store) {
    throw new Error('Please initialize the module via init() before ' +
      'calling this function.');
  }
}

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
    init: { privateKey },
    config: {
      Addresses: {
        Swarm: [
         '/ip4/0.0.0.0/tcp/4002',
         // '/ip4/127.0.0.1/tcp/9999/ws'
        ],
      },
      Bootstrap: [
        '/dns4/bootstrap1.openbazaar.org/tcp/443/wss/ipfs/QmWUdwXW3bTXS19MtMjmfpnRYgssmbJCwnq8Lf9vjZwDii',
        '/dns4/bootstrap2.openbazaar.org/tcp/443/wss/ipfs/QmcXwJePGLsP1x7gTXLE51BmE7peUKe2eQuR5LGbmasekt',
        '/dns4/bootstrap3.openbazaar.org/tcp/443/wss/ipfs/Qmb8i7uy6rk47hNorNLMVRMer4Nv9YWRhzZrWVqnvk5mSk'
      ],
      Discovery: {
        MDNS: {
          Enabled: false,
        },
      },
    },
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

    node.on('ready', () => {
      node.libp2p.start(async () => {
        console.log('libp2p is started');

        try {
          await node.relayConnect();
        } catch (e) {
          // pass
        }

        // handle incoming messages
        console.log(`Listinging for incoming messages with the protocol: ${IPFS.OB_PROTOCOL}`);
        node.libp2p.handle(IPFS.OB_PROTOCOL, (protocol, conn) => {
          console.log('Pulling in incoming message');

          conn.getPeerInfo((err, peerInfo) => {
            if (err) {
              console.error(`Unable to obtain the peerInfo for a direct message: ${err}`);
              return;
            }

            console.log('The peerInfo has been obtained.');

            pull(
              conn,
              pull.map(msg => {
                const sender = createFromBytes(peerInfo.id.id).toB58String();

                if (msg.length <= 1) {
                  return;
                }

                console.log('Processing incoming msg.');

                openDirectMessage(msg, sender, { node })
                  .then(openedMessage => {
                    _store.dispatch(directMessage({
                      ...openedMessage,
                      peerID: sender,
                    }));
                  })
                  .catch(e => {
                    console.error('Unable to open direct message.');
                    console.error(e.stack);
                  });

                return msg;
              }),
              // at least a no-op collect seems to be needed for the stream to go through
              // map() above
              pull.collect(() => {})
            );
          });
        });

        resolve(node);
      });
    });

    node.on('error', e => reject(e));
  });
};

let curNode = null;

export const get = (peerID, privateKey) => {
  ensureInitialized();

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
  ensureInitialized();

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