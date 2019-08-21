import protobuf from 'protobufjs';
import messageJSON from 'pb/message.json';

let protoMessageRoot;

export function getProtoMessageRoot() {
  if (!protoMessageRoot) {
    protoMessageRoot = protobuf.Root.fromJSON(messageJSON);
  }
  
  return protoMessageRoot;
}

