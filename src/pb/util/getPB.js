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
const protoJSONMap = {
  BitcoinSignature: contractsJSON,
  CountryCode: contractsJSON,
  Dispute: contractsJSON,
  DisputeAcceptance: contractsJSON,
  Id: contractsJSON,
  Listing: contractsJSON,
  Order: contractsJSON,
  OrderCompletion: contractsJSON,
  OrderFulfillment: contractsJSON,
  OrderReject: contractsJSON,
  Outpoint: contractsJSON,
  Rating: contractsJSON,
  RatingSignature: contractsJSON,
  Refund: contractsJSON,
  RicardianContract: contractsJSON,
  Signature: contractsJSON,
  SignedListing: contractsJSON,
  VendorFinalizedPayment: contractsJSON,
  Block: messageJSON,
  Chat: messageJSON,
  CidList: messageJSON,
  Envelope: messageJSON,
  Error: messageJSON,
  Message: messageJSON,
  SignedData: messageJSON,
};

export default function(type) {
  let PB;

  try {
    PB = protobuf
      .Root
      .fromJSON(protoJSONMap[type])
      .lookupType(type);
  } catch (e) {
    // pass
  }

  return PB || null;
};