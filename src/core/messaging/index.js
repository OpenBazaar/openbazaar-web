import pull from 'pull-stream';
import protobuf from 'protobufjs';
import IPFS from 'core/ipfs/ipfs';
import { get as getNode } from 'core/ipfs/index';

import messageJSON from 'pb/message.json';

import getPB from 'pb/util/getPB';
import { getRandomInt } from 'util/number';

let protoMessageRoot;

function getProtoMessageRoot() {
  if (!protoMessageRoot) {
    protoMessageRoot = protobuf.Root.fromJSON(messageJSON);
  }
  
  return protoMessageRoot;
}

/*
 * Given a verbose name (e.g. CHAT), will return the numeric message type as declared
 * in the message protobuf file.
 */
export function getMessageType(name) {
  return getPB('Message')
    .MessageType[name];
}

/*
 * Will create a PB encoded message ready to send over the write.
 *
 * @param {string} messageType - The string message type corresponding to
 *   the keys in the MessageType enum from the message proto declaration,
 *   e.g. CHAT, BLOCK, etc...
 * @param {string} payloadType - The name of the protobuf class the payload
 *   represents. This may be the same as messageType, but at times is distinct.
 * @param {string} payloadBytes - The protobuf encoded payload value.
 * @param {string} [requestID] - If you are sending a request, please provide
 *   an integer request ID.
 * @returns {Uint8Array} The encoded message protobuf.
 */
function generateMessage(
  messageType,
  payloadType,
  payloadBytes,
  requestID
) {
  if (requestID !== undefined && !Number.isInteger(requestID)) {
    throw new Error('If providing a requestID, it must be provided as an integer.');
  }

  const messagePayload = {
    messageType: getMessageType(messageType),
    payload: {
      type_url: `type.googleapis.com/${payloadType}`,
      value: payloadBytes
    }
  };

  if (requestID) messagePayload.requestId = requestID;

  const MessagePb = getProtoMessageRoot().lookupType('Message');
  const messageErr = MessagePb.verify(messagePayload);

  if (messageErr) {
    throw new Error(
      'The message payload does not verify according to the Message ' +
        `protobuf schema: ${messageErr}`
    );
  }

  const messagePb = MessagePb.create(messagePayload);
  const messageSerialized = MessagePb.encodeDelimited(messagePb).finish();

  return messageSerialized;
}

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

/*
 * Will send off a network message. At this time, it will only be a direct
 * message and fail if the receiver is unreachable.
 *
 * @param {string} messageType - The string message type corresponding to
 *   the keys in the MessageType enum from the message proto declaration,
 *   e.g. CHAT, BLOCK, etc...
 * @param {string} payloadType - The name of the protobuf class the payload
 *   represents. This may be the same as messageType, but at times is distinct.
 * @param {string} payloadBytes - The protobuf encoded payload value.
 * @param {string} peerID - The base58 encoded peerID of the message recipient.
 * @returns {Object} A promise which will resolve if the message is successfully
 *   sent.
 */
export async function sendMessage(
  messageType,
  payloadType,
  payloadBytes,
  peerID,
  options = {}
) {
  const node = options.node || (await getNode());

  if (!(node instanceof IPFS)) {
    throw new Error('An IPFS node instance is required.');
  }

  const message = generateMessage(
    messageType,
    payloadType,
    payloadBytes
  );

  try {
    await sendDirectMessage(node, peerID, message);
  } catch (e) {
    console.error('Unable to send via a direct message.');
    throw e;
  }
}

/*
 * Will send off a network message. At this time, it will only be a direct
 * message and fail if the receiver is unreachable.
 *
 * @param {string} messageType - The string message type corresponding to
 *   the keys in the MessageType enum from the message proto declaration,
 *   e.g. CHAT, BLOCK, etc...
 * @param {string} payloadType - The name of the protobuf class the payload
 *   represents. This may be the same as messageType, but at times is distinct.
 * @param {string} payloadBytes - The protobuf encoded payload value.
 * @param {string} peerID - The base58 encoded peerID of the message recipient.
 * @returns {Object} A promise which will resolve if the message is successfully
 *   sent and a response is received before the timeout expires. Otherwise the
 *   promise will fail.
 */
export async function sendRequest(
  messageType,
  payloadType,
  payloadBytes,
  peerID,
  options = {}
) {
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
    const message = generateMessage(
      messageType,
      payloadType,
      payloadBytes,
      requestId
    );

    // node.handle(() => {});

    setTimeout(
      () => reject(new Error('Request timed out.')),
      opts.timeout
    );

    try {
      await sendDirectMessage(node, peerID, message);
    } catch (e) {
      reject(e);
    }

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

  console.dir(decodedMessage);

  let PB;
  let payloadType;

  try {
    const splitType = decodedMessage
        .payload
        .type_url
        .split('/');
    payloadType = splitType[splitType.length - 1];
    PB = getPB(payloadType);
  } catch (e) {
    // pass
  }

  if (!PB) {
    throw new Error(`Unable to obtain the protobuf class for type ${payloadType}`);
  }

  const decoded = { ...decodedMessage };
  delete decoded.messageType;

  return {
    ...decoded,
    type: decodedMessage.messageType,
    payload: PB.toObject(PB.decode(decodedMessage.payload.value))
  };
}
