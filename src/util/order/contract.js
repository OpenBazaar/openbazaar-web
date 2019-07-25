import protobuf from 'protobufjs';
import contractsJSON from 'pb/contracts.json';

let protoRoot;

function getProtoContractsRoot() {
  return protoRoot ||
    protobuf.Root.fromJSON(contractsJSON);
}

// function getContractIdentity(peerID) {
//   if (typeof peerID !== 'string' || !)
// }

export function createContractWithOrder(data = {}, options = {}) {
  let peerID = options.peerID;
  
  if (!peerID) {

  }

  const contract = {
    buyerOrder: {
      version: 2,
      shipping: {
        shipTo: data.shipTo,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: 'UNITED_STATES',
        addressNotes: data.addressNotes,
      },
      alternateContactInfo: data.alternateContactInfo,
      // blossom wise shed elite large forum decline tribe farm embrace hat snap
      refundAddress: '1C3fRseMzvXffrX617VYDQew56W3DxtJkB'
    }
  };
}