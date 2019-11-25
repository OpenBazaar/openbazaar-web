import { generateSubscriptionKey } from 'util/crypto';
import { WEB_RELAY_SOCKET_URL } from 'core/constants';

export default class WebRelaySocket extends WebSocket {
  constructor(peerID) {
    if (typeof peerID !== 'string' || !peerID) {
      throw new Error('Please provide a peerID as a non-empty string');
    }
    
    super(WEB_RELAY_SOCKET_URL);
    this._peerID = peerID;

    return this;
  }

  get peerID() {
    return this._peerID;
  }

  async subscribe() {
    if (this.subscribed) return;

    console.log('Subscribing to the web relay.');

    const promise =
      new Promise(async (resolve, reject) => {
        this.addEventListener('message', e => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.subscribe) resolve();
            if (parsed.error) reject(parsed.error);
          } catch (e) {
            // pass
          }
        });

        const peerID = this.peerID;
        const subscriptionKey = await generateSubscriptionKey(peerID);
        console.log(`the subscription key is ${subscriptionKey}`);
        // TODO: Really the userID should be generated from the user's seed so that
        // someone else can't connect with the same userID.
        const authMessage = { userID: peerID, subscriptionKey };
        this.send(JSON.stringify({ Type: 'SubscriptionMessage', Data: authMessage }));        
      });
    
    promise.then(() => {
      this.subscribed = true;
      console.log('Subscribed to the web relay.');
      // todo: remove the message listener from above.
    });

    return promise;
  }
}

let connection = null;

// peerID is own peerID as b58 string
export function connect(peerID) {
  if (connection && connection.peerID === peerID) {
    return connection.socketPromise;
  }

  console.log('Connecting to the web relay.');

  const socketPromise =
    new Promise((resolve, reject) => {
      const socket = new WebRelaySocket(peerID);
      socket.addEventListener('open', e => resolve(socket));
    });

  socketPromise.then(() => {
    console.log('Connected to the web relay.');
  });

  connection = {
    peerID,
    socketPromise,
  };

  return socketPromise;
}
