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

async function generateMessage(type, peerID, payload) {
  // const PB = getProtoMessageRoot
}

function isValidMessageType(type) {
  return typeof messageTypes[type] !== 'undefined';
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

  
}

console.log('foo json');
window.foo = protobuf;
window.json = messageJSON;
