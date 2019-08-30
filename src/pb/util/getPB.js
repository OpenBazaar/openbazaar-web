import protobuf from 'protobufjs';
// eslint-disable-next-line
import messageJSON from 'pb/message.json';
// eslint-disable-next-line
import contractsJSON from 'pb/contracts.json';

/*
 * The purpose of this map is to fascilitate lookups when you only have the PB
 * type (e.g. Chat) and you need to obtain the corresponding PB class. An example
 * is on an incoming direct message. The payload may contain the folowing type_url:
 * type.googleapis.com/RicardianContract. We would parse out RicardianContract and
 * then use the lookup function (default export of this module) to return to us
 * the RicardianContract PB which we could use to decode the message.
 */
const protoTypeRootGetterMap = {
  BitcoinSignature: getContractsRoot,
  Dispute: getContractsRoot,
  DisputeAcceptance: getContractsRoot,
  Id: getContractsRoot,
  Listing: getContractsRoot,
  Order: getContractsRoot,
  OrderCompletion: getContractsRoot,
  OrderFulfillment: getContractsRoot,
  OrderReject: getContractsRoot,
  Outpoint: getContractsRoot,
  Rating: getContractsRoot,
  RatingSignature: getContractsRoot,
  Refund: getContractsRoot,
  RicardianContract: getContractsRoot,
  Signature: getContractsRoot,
  SignedListing: getContractsRoot,
  VendorFinalizedPayment: getContractsRoot,
  Block: getMessageRoot,
  Chat: getMessageRoot,
  CidList: getMessageRoot,
  Envelope: getMessageRoot,
  Error: getMessageRoot,
  Message: getMessageRoot,
  SignedData: getMessageRoot,
};

// todo: memoize me;
// todo: memoize me;
// todo: memoize me;
export default function(type) {
  let PB;

  try {
    PB = protoTypeRootGetterMap[type]().lookupType(type);
  } catch (e) {
    // pass
  }

  return PB || null;
};

let contractsRoot;

export function getContractsRoot() {
  if (!contractsRoot) {
    contractsRoot = protobuf
      .Root
      .fromJSON(contractsJSON);
  }

  return contractsRoot;
}

let messageRoot;

export function getMessageRoot() {
  if (!messageRoot) {
    messageRoot = protobuf
      .Root
      .fromJSON(messageJSON);
  }

  return messageRoot;
}