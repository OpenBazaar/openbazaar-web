import protobuf from 'protobufjs';
import { fromByteArray } from 'base64-js';
import { ECPair } from 'bitcoinjs-lib';
import contractsJSON from 'pb/contracts.json';
import { generatePbTimestamp } from 'pb/util';
import { getIdentity } from 'util/auth';
import { getOwnProfile } from 'models/profile';

let protoRoot;

function getProtoContractsRoot() {
  return protoRoot ||
    protobuf.Root.fromJSON(contractsJSON);
}

function getRatingKeysForOrder(purchaseData = {}, ts, bip32) {
  const ratingsKeys = [];

  if (Array.isArray(purchaseData.items)) {
    // For now, we're mirroring some ob-go tech debt...
    // FIXME: bug here. This should use a different key for each item. This code doesn't look like
    // it will do that. Also the fix for this will also need to be included in the rating signing
    // code.    
    purchaseData.items.forEach(item => {
      const pubKey = bip32.neutered();
      const ratingKey = pubKey.derive(ts.seconds);
      ratingsKeys.push(
        ECPair
          .fromPublicKey(ratingKey.publicKey)
          .publicKey
          .toString('base64')
      )
    });
  }

  return ratingsKeys;
}

console.log('e');
window.e = ECPair;

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

  const timestamp = generatePbTimestamp();

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
          bitcoin: fromByteArray(identity.ecPair.publicKey),
        },
        bitcoinSig: fromByteArray(identity.bitcoinSig),
      },
      timestamp,
      ratingKeys: getRatingKeysForOrder(
        data,
        timestamp,
        identity.bip32,
      ),
    }
  };

  return contract;
}

console.log('theGoods');
window.theGoods = createContractWithOrder;