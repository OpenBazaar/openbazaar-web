import IPFS from 'util/ipfs/ipfs';
import pull from 'pull-stream';
import { get as getNode } from 'util/ipfs/index';
import protobuf from 'protobufjs';
import messageJSON from 'pb/message.json';
import { typesData as messageTypesData } from './types';
import { getRandomInt } from 'util/number';

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
    throw new Error('The payload does not verify according to the protobuf schema for the ' +
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
  return typeof messageTypesData[type] !== 'undefined';
}

// doc me up
// message should already be a pb encoded message
async function sendDirectMessage(node, peerID, message) {
  const peer = `/p2p-circuit/ipfs/${peerID}`;
  console.log(`attempting to send direct message to ${peerID} at ${peer} ` +
    `via protocol ${IPFS.OB_PROTOCOL}.`);
  
  try {
    await node.relayConnect();
  } catch (e) {
    // pass
    // Even if we can't connect to the relay, we'll still try and send the message, it
    // just means it will likely fail for nodes that can handle incoming direct connections.
  }

  return new Promise((resolve, reject) => {
    node.libp2p.dialProtocol(peer, IPFS.OB_PROTOCOL,
      (err, conn) => {
        if (err) {
          console.error('Unable to send the direct message');
          console.error(err);
          reject(err);
          return;
        }

        console.log('pushing outgoing message - outMess');
        window.outMess = message;

        pull(
          pull.once(message),
          conn,
        );            

        console.log('Message succssfully sent.');
        resolve();
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

  const messageType = messageTypesData[type];
  const node = options.node || await getNode();

  if (!(node instanceof IPFS)) {
    throw new Error('An IPFS node instance is required.');
  }

  const message = generateMessage(messageType, peerID, payload);
  
  try {
    await sendDirectMessage(node, peerID, message);
  } catch (e) {
    console.error('Unable to send via a direct message.')
    throw e;
  }
}

export async function openDirectMessage(encodedMessage, peerID, options = {}) {
  if (!(encodedMessage instanceof Uint8Array)) {
    throw new Error('Please provide a protobuf encoded message.');
  }

  if (typeof peerID !== 'string' || !peerID) {
    throw new Error('A peerID must be provided as a non-empty string.');
  }

  const node = options.node || await getNode();

  if (!(node instanceof IPFS)) {
    throw new Error('An IPFS node instance is required.');
  }

  const Message = getProtoMessageRoot().lookupType('Message');
  let decodedMessage;

  try {
    decodedMessage = Message.decode(encodedMessage);
  } catch (e) {
    // console.warn(`Unable to decode message in an undelimted way - ${e}. ` +
    //   'Will try delimited.');
    decodedMessage = Message.decodeDelimited(encodedMessage);
  }

  if (!isValidMessageType(decodedMessage.messageType)) {
    throw new Error('Unable to process the direct message because it contains ' +
      `an unrecognized message type: ${decodedMessage.messageType}.`);
  }

  const PB = getProtoMessageRoot()
    .lookupType(
      messageTypesData[decodedMessage.messageType].name
    );

  return {
    type: decodedMessage.messageType,
    payload: PB.toObject(
      PB.decode(decodedMessage.payload.value)
    ),
  };
}
