import IPFS from 'ipfs';
import pull from 'pull-stream';
import { get as getNode } from 'util/ipfs';
import protobuf from 'protobufjs';
import messageJSON from 'pb/message.json';
import messageTypes from './types';

let protoRoot;

function getProtoMessageRoot() {
  return protoRoot ||
    protobuf.Root.fromJSON(messageJSON);
}

// doc me up
// will take raw message data and return a serialized Message PB
function generateMessage(type, peerID, payload) {
  const PB = getProtoMessageRoot().lookupType(type.name);
  const pbErr = PB.verify(payload);

  if (pbErr) {
    throw new Error('The payload does verify according to the protobuf schema for the ' +
      'given type.');
  }

  const pb = PB.create(payload);
  const serializedPb = PB.encode(pb).finish();

  const messagePayload = {
    messageType: type.value,
    payload: {
      type_url: `type.googleapis.com/${type.name}`,
      value: serializedPb,
    }
  };

  const MessagePb = getProtoMessageRoot().lookupType('Message');
  const messageErr = MessagePb.verify(messagePayload);

  if (messageErr) {
    throw new Error('The message payload does not verify according to the Message ' +
      'protobuf schema.');
  }

  const messagePb = MessagePb.create(messagePayload);
  const messageSerialized = MessagePb.encodeDelimited(messagePb).finish();

  return messageSerialized;
}

function isValidMessageType(type) {
  return typeof messageTypes[type] !== 'undefined';
}

// doc me up
// message should already be a pb encoded message
async function sendDirectMessage(node, peerID, message) {
  const peer = `/p2p-circuit/ipfs/${peerID}`;
  console.group(`attempting to send direct message to ${peerID} at ${peer}`);
  
  try {
    await node.relayConnect();
  } catch (e) {
    // pass
    // Even if we can't connect to the relay, we'll still try and send the message, it
    // just means it will likely fail for nodes that can handle incoming direct connections.
  }

  await node.swarm.connect(peer);  

  return new Promise((resolve, reject) => {
    const res = (...args) => {
      console.groupEnd();
      resolve(...args);
    };

    const rej = (...args) => {
      console.groupEnd();
      reject(...args);
    };

    this._libp2pNode.dialProtocol(peer, IPFS.OB_PROTOCOL,
      (err, conn) => {
        if (err) {
          console.group('Unable to send the direct message');
          console.error(err);
          console.groupEnd();
          rej(err);
        }

        console.log('pushing outgoing message - outMess');
        window.outMess = message;

        pull(
          pull.once(message),
          conn,
        );            

        console.log('Message succssfully sent.');
        res();
      });
  });
}

export async function sendMessage(type, peerID, payload, options = {}) {
  if (!isValidMessageType(type)) {
    throw new Error(`${type} is not a valid message type.`);
  }

  if (typeof peerID !== 'string' || !peerID) {
    throw new Error('A peerID must be provided as a non-empty string.');
  }

  if (typeof payload !== 'object') {
    throw new Error('A payload must be provided as an object.');
  }

  const messageType = messageTypes[type];
  const node = options.node || await getNode();

  if (!(node instanceof IPFS)) {
    throw new Error('An IPFS node instance is required.');
  }

  const message = generateMessage(messageType, peerID, payload);
  
  try {
    await sendDirectMessage(node, peerID, message);
  } catch (e) {
    console.error('Unable to send via a direct message')
  }
}