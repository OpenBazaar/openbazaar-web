import protobuf from 'protobufjs';
import { fromByteArray } from 'base64-js';
import contractsJSON from 'pb/contracts.json';
import { getIdentity } from 'util/auth';
import { getOwnProfile } from 'models/profile';

let protoRoot;

function getProtoContractsRoot() {
  return protoRoot ||
    protobuf.Root.fromJSON(contractsJSON);
}

export async function createContractWithOrder(data = {}, options = {}) {
  // Mainy allowing the identity and profile to be passed in to make testing easier. In most
  // cases, you won't be passing them in.
  const identity = options.identity || getIdentity();

  if (!identity) {
    throw new Error('Unable to get the identity. Ensure you are logged in.');
  }

  const profile = options.profile || await getOwnProfile();

  if (!profile) {
    throw new Error('Unable to obtain own profile.');
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
      refundAddress: '1C3fRseMzvXffrX617VYDQew56W3DxtJkB',
      buyerID: {
        peerID: identity.peerID,
        handle: profile.handle,
        pubkeys: {
          identity: fromByteArray(identity.publicKey),
          bitcoin: fromByteArray(identity.bitcoinPublicKey),
        },
        bitcoinSig: fromByteArray(identity.bitcoinSig),
      }
    }
  };

  return contract;
}