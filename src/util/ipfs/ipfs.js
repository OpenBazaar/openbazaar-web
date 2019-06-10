import IPFS from 'ipfs';

export default class extends IPFS {
  _relayConnectPromise = null;

  static OB_PROTOCOL = '/openbazaar/app/1.0.0';

  async relayConnect(options = {}) {
    const opts = {
      relayPeerAddr: process.env.REACT_APP_IPFS_RELAY_PEER,
      ...options,
    };

    console.log(`attempting to connect to the relay peer at ${opts.relayPeerAddr}`);

    if (this._relayConnectPromise) {
      return this._relayConnectPromise;
    }

    return new Promise((resolve, reject) => {
      this.libp2p.dialFSM(
        opts.relayPeerAddr,
        this.constructor.OB_PROTOCOL,
        (err, connFSM) => {
          if (err) {
            console.error(`Unable to connect to the relay peer at ${opts.relayPeerAddr}.`);
            console.error(err);
            reject(err);
            return;
          }

          console.log('connected to the relay');

          if (opts.reconnectOnClose) {
            connFSM.on('close', () => {
              this._relayConnectPromise = null;
              this.relayConnect(options);
            });
          }
          
          resolve();
        }
      );
    });
  }
}