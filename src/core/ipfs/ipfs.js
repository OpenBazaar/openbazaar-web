import IPFS from 'ipfs';

export default class extends IPFS {
  _relayConnectPromise = null;
  handlers = new Map();  

  static OB_PROTOCOL = '/openbazaar/app/1.0.0';

  async relayConnect(options = {}) {
    const opts = {
      relayPeerAddr: process.env.REACT_APP_IPFS_RELAY_PEER,
      ...options
    };

    if (this._relayConnectPromise) {
      return this._relayConnectPromise;
    }

    console.log(
      `attempting to connect to the relay peer at ${opts.relayPeerAddr}`
    );

    this._relayConnectPromise = new Promise((resolve, reject) => {
      this.libp2p.dialFSM(
        opts.relayPeerAddr,
        this.constructor.OB_PROTOCOL,
        (err, connFSM) => {
          if (err) {
            console.error(
              `Unable to connect to the relay peer at ${opts.relayPeerAddr}.`
            );
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

  // todo: clean up handler on 'peer:disconnect'
  // todo: clean up handler on 'peer:disconnect'
  // todo: clean up handler on 'peer:disconnect'
  // todo: clean up handler on 'peer:disconnect'

  /*
   * A wrapper for libp2p handle that allows you to bind multiple handlers and then using
   * the handle wrapper below unbind specific handlers. For now, not supporting the
   * matchFunc parameter.
   */
  handle(handler, protocol = this.constructor.OB_PROTOCOL) {
    if (typeof handler !== 'function') {
      throw new Error('A handler must be provided as a function.');
    }

    const handlers = (this.handlers.get(protocol) || []);
    handlers.push(handler);

    this.libp2p.unhandle(protocol);
    this.libp2p.handle(protocol, (protocol, conn) => {
      handlers.forEach(handler => handler(protocol, conn));
    });

    this.handlers.set(protocol, handlers);
    this.handlers.set(handler, protocol);
  }

  /*
   * A wrapper for libp2p handle that allows you to unbind specific handlers.
   */
  unhandle(handler, protocol) {
    if (protocol !== undefined && typeof protocol !== 'string') {
      throw new Error('If providing a protocol, it must be provided as a string.');
    }

    if (handler !== undefined && typeof handler !== 'function') {
      throw new Error('If providing a handler, it must be provided as a function.');
    }

    if (protocol === undefined && handler === undefined) {
      throw new Error('You must provide either a protocol or a handler.');
    }

    let protocolKey = protocol;

    if (handler) {
      const mappedHandler = this.handlers.get(handler);

      if (mappedHandler) {
        if (
          (protocol && mappedHandler === protocol) ||
          !protocol
        ) {
          this.handlers.delete(handler);
        }

        protocolKey = mappedHandler;
      }
    }

    const handlers = this.handlers.get(protocolKey);
    const filteredHandlers = handlers.filter(h => h !== handler);

    if (filteredHandlers.length) {
      this.handlers.set(protocolKey, handlers);
    } else {
      this.handler.delete(protocolKey);
    }

    this.libp2p.unhandle(protocolKey);
    const remainingHandlers = this.handlers.get(protocolKey);

    if (remainingHandlers.length) {
      this.handle(protocolKey, handler);
    }
  }  
}
