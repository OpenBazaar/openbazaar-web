import IPFS from 'ipfs';
import { get as getNode } from 'util/ipfs';
import protobuf from 'protobufjs';
import messageJSON from 'util/pb/message.json';
import * as messageTypes from './types';

let protoRoot;

function getProtoMessageRoot() {
  return protoRoot ||
    protobuf.Root.fromJSON(messageJSON);
}

// doc me up
// will take raw message data and return a serialized Message PB
function generateMessage(type, peerID, payload) {
  const PB = getProtoMessageRoot().lookupType(type);
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
function sendDirectMessage(ipfsNode, peerID, message) {
  const peer = `/p2p-circuit/ipfs/${peerID}`;
  console.log(`attempting to send direct message to ${peerID} at ${peer}`);
}

export async function sendMessage(ipfsNode, type, peerID, payload) {
  if (!isValidMessageType(type)) {
    throw new Error(`${type} is not a valid message type.`);
  }

  if (typeof peerID !== 'string' || !peerID) {
    throw new Error('A peerID must be provided as a non-empty string.');
  }

  if (typeof payload !== 'object') {
    throw new Error('A payload must be provided as an object.');
  }

  const node = ipfsNode || await getNode();

  if (!(node instanceof IPFS)) {
    throw new Error('An IPFS node instance is required.');
  }

  const message = generateMessage(type, peerID, payload);
}