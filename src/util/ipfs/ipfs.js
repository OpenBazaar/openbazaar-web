import IPFS from 'ipfs';

export default class extends IPFS {
  _relayConnectPromise = null;

  static OB_PROTOCOL = '/openbazaar/app/1.0.0';

  async relayConnect(options = {}) {
    const opts = {
      relayPeerAddr: process.env.REACT_APP_IPFS_RELAY_PEER,
      ...options,
    };

    if (this._relayConnectPromise) {
      return this._relayConnectPromise;
    }

    console.log(`attempting to connect to the relay peer at ${opts.relayPeerAddr}`);

    this._relayConnectPromise = new Promise((resolve, reject) => {
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

          console.log('Connected to the relay');

          if (opts.reconnectOnClose) {
            connFSM.on('close', () => {
              console.log('Lost the connection to the relay. Will reconnect.');
              this._relayConnectPromise = null;
              this.relayConnect(options);
            });
          }
          
          resolve();
        }
      );
    });

    return this._relayConnectPromise;
  }
}