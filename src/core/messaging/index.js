import IPFS from 'core/ipfs/ipfs';
import pull from 'pull-stream';
import protobuf from 'protobufjs';
import { get as getNode } from 'core/ipfs/index';
import { getRandomInt } from 'util/number';
import messageJSON from 'pb/message.json';
// import { typesData as messageTypesData } from './types';

let protoMessageRoot;

function getProtoMessageRoot() {
  if (!protoMessageRoot) {
    protoMessageRoot = protobuf.Root.fromJSON(messageJSON);
  }
  
  return protoMessageRoot;
}

let reverseIndexedMTypes;

/*
 * Will return an object where message types are index by value as opposed to name.
 * Instead of how the PB stores it, e.g. { CHAT: 1 }, this would return { 1: 'Chat' }.
 * Will fascilate an easy way to do a reverse lookup when you have the value and
 * need the verbose name.
 */
function reverseIndexedMessageTypes() {
  if (!reverseIndexedMTypes) {
    reverseIndexedMTypes = {};
    const mTypes = getProtoMessageRoot()
      .Message
      .MessageType;
    Object
      .keys(mTypes)
      .forEach(type => (
        reverseIndexedMTypes[mTypes[type]] =
          type
            .split('_')
            .map(word => (
              `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
            ))
            .join('')
      ));
  }

  return reverseIndexedMTypes;
}

/*
 * Given an integer value, will return the message type verbose name. For example,
 * a value of 1 would return 'Chat'.
 */
function getMessageTypeName(value) {
  if (!Number.isInteger(value)) {
    throw new Error('Please provide a value as an integer.');
  }

  return reverseIndexedMessageTypes()[value];
}

/*
 * Given a verbose name (e.g. CHAT), will return the numeric message type as declared
 * in the message protobuf file.
 */
export function getMessageType(name) {
  return getProtoMessageRoot()
    .Message
    .MessageType[name];
}

// doc me up
function generateMessage(type, peerID, payloadBytes, requestID) {
  if (requestID !== undefined && !Number.isInteger(requestID)) {
    throw new Error('If providing a requestID, it must be provided as an integer.');
  }

  console.log(`the pickle type is ${type}`);

  const messagePayload = {
    messageType: type,
    payload: {
      type_url: `type.googleapis.com/${getMessageTypeName(type)}`,
      value: payloadBytes
    }
  };

  if (requestID) messagePayload.requestId = requestID;

  const MessagePb = getProtoMessageRoot().lookupType('Message');
  const messageErr = MessagePb.verify(messagePayload);

  if (messageErr) {
    throw new Error(
      'The message payload does not verify according to the Message ' +
        'protobuf schema.'
    );
  }

  const messagePb = MessagePb.create(messagePayload);
  const messageSerialized = MessagePb.encodeDelimited(messagePb).finish();

  return messageSerialized;
}

// function isValidMessageType(type) {
//   return typeof messageTypesData[type] !== 'undefined';
// }

// doc me up
// message should already be a pb encoded message
async function sendDirectMessage(node, peerID, message) {
  const peer = `/p2p-circuit/ipfs/${peerID}`;
  console.log(
    `attempting to send direct message to ${peerID} at ${peer} ` +
      `via protocol ${IPFS.OB_PROTOCOL}.`
  );

  try {
    await node.relayConnect();
  } catch (e) {
    // pass
    // Even if we can't connect to the relay, we'll still try and send the message, it
    // just means it will likely fail for nodes that can handle incoming direct connections.
  }

  return new Promise((resolve, reject) => {
    node.libp2p.dialProtocol(peer, IPFS.OB_PROTOCOL, (err, conn) => {
      if (err) {
        console.error('Unable to send the direct message');
        console.error(err);
        reject(err);
        return;
      }

      console.log('pushing outgoing message - outMess');
      window.outMess = message;

      pull(pull.once(message), conn);

      console.log('Message succssfully sent.');
      resolve();
    });
  });
}

// function prepareMessageForSend(type, peerID, serializedPb) {
//   if (!isValidMessageType(type)) {
//     throw new Error(`${type} is not a valid message type.`);
//   }

//   if (typeof peerID !== 'string' || !peerID) {
//     throw new Error('A peerID must be provided as a non-empty string.');
//   }

//   if (typeof payload !== 'object') {
//     throw new Error('A payload must be provided as an object.');
//   }

//   return generateMessage(messageType, peerID, payload);
// }

export async function sendMessage(type, peerID, payloadBytes, options = {}) {
  console.log(`sendin ${type}`);
  const node = options.node || (await getNode());

  if (!(node instanceof IPFS)) {
    throw new Error('An IPFS node instance is required.');
  }

  const message = generateMessage(type, peerID, payloadBytes);

  try {
    await sendDirectMessage(node, peerID, message);
  } catch (e) {
    console.error('Unable to send via a direct message.');
    throw e;
  }
}

export async function sendRequest(type, peerID, payloadBytes, options = {}) {
  const opts = {
    timeout: 30000,
    ...options,
  };

  const node = opts.node || (await getNode());

  if (!(node instanceof IPFS)) {
    throw new Error('An IPFS node instance is required.');
  }

  return new Promise(async (resolve, reject) => {
    const requestId = getRandomInt(1, 2147483647);
    const message = generateMessage(type, peerID, payloadBytes, requestId);

    // node.handle(() => {});

    setTimeout(
      () => reject(new Error('Request timed out.')),
      opts.timeout
    );

    await sendDirectMessage(node, peerID, message);
    resolve();
  });
}

export async function openDirectMessage(encodedMessage, peerID, options = {}) {
  if (!(encodedMessage instanceof Uint8Array)) {
    throw new Error('Please provide a protobuf encoded message.');
  }

  if (typeof peerID !== 'string' || !peerID) {
    throw new Error('A peerID must be provided as a non-empty string.');
  }

  const node = options.node || (await getNode());

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

  // if (!isValidMessageType(decodedMessage.messageType)) {
  //   throw new Error(
  //     'Unable to process the direct message because it contains ' +
  //       `an unrecognized message type: ${decodedMessage.messageType}.`
  //   );
  // }

  console.log(`1: ${decodedMessage.messageType}`);
  console.log(`2: ${getMessageTypeName(decodedMessage.messageType)}`);

  const PB = getProtoMessageRoot().lookupType(
    getMessageTypeName(decodedMessage.messageType)
  );

  return {
    type: decodedMessage.messageType,
    payload: PB.toObject(PB.decode(decodedMessage.payload.value))
  };
}
