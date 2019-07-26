import protobuf from 'protobufjs';
import contractsJSON from 'pb/contracts.json';

let protoRoot;

function getProtoContractsRoot() {
  return protoRoot ||
    protobuf.Root.fromJSON(contractsJSON);
}

function getContractIdentity(peerID) {
  if (typeof peerID !== 'string' || !peerID) {
    throw new Error('Please provide a peerID as a non-empty string.');
  }

  // PeerID               string      `protobuf:"bytes,1,opt,name=peerID,proto3" json:"peerID,omitempty"`
  // Handle               string      `protobuf:"bytes,2,opt,name=handle,proto3" json:"handle,omitempty"`
  // Pubkeys              *ID_Pubkeys `protobuf:"bytes,3,opt,name=pubkeys,proto3" json:"pubkeys,omitempty"`
  // BitcoinSig           []byte      `protobuf:"bytes,4,opt,name=bitcoinSig,proto3" json:"bitcoinSig,omitempty"`
}

export function createContractWithOrder(data = {}, options = {}) {
  // let mnemonic = options.peerID;
  
  // if (!peerID) {

  // }

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