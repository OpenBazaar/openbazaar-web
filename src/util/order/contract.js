import protobuf from 'protobufjs';
import { fromPublicKey } from 'bip32';
import { ECPair } from 'bitcoinjs-lib';
import contractsJSON from 'pb/contracts.json';
import { generatePbTimestamp } from 'pb/util';
import { getIdentity } from 'util/auth';
import { cat } from 'util/ipfs/cat';
import { getOwnProfile } from 'models/profile';

let protoRoot;

function getProtoContractsRoot() {
  return protoRoot || protobuf.Root.fromJSON(contractsJSON);
}

function getRatingKeysForOrder(purchaseData = {}, ts, identity, chaincode) {
  const ratingsKeys = [];

  if (Array.isArray(purchaseData.items)) {
    const buyerHDKey = fromPublicKey(identity.ratingKey, chaincode);

    purchaseData.items.forEach((item, index) => {
      const key = buyerHDKey.derive(index);
      const ratingKey = ECPair.fromPublicKey(key.publicKey);
      ratingsKeys.push(ratingKey.publicKey.toString('base64'));
    });
  }

  return ratingsKeys;
}

console.log('hey ho lets go on the show with a Buffer flo');
window.Buffer = Buffer;

async function getSignedListing(contract, item) {
  const listing = (await cat(item.listingHash)).data;
}

export async function createContractWithOrder(data = {}, options = {}) {
  // Mainy allowing the identity and profile to be passed in to make testing easier. In most
  // cases, you won't be passing them in.
  const identity = options.identity || getIdentity();

  if (!identity) {
    throw new Error('Unable to get the identity. Ensure you are logged in.');
  }

  const profile = options.profile || (await getOwnProfile());

  if (!profile) {
    throw new Error('Unable to obtain own profile.');
  }

  const timestamp = generatePbTimestamp();
  const chaincode = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));

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
        addressNotes: data.addressNotes
      },
      alternateContactInfo: data.alternateContactInfo,
      // blossom wise shed elite large forum decline tribe farm embrace hat snap
      refundAddress: '1C3fRseMzvXffrX617VYDQew56W3DxtJkB',
      buyerID: {
        peerID: identity.peerID,
        handle: profile.handle,
        pubkeys: {
          identity: identity.publicKey.toString('base64'),
          bitcoin: identity.escrowKey.toString('base64')
        },
        bitcoinSig: identity.escrowSig.toString('base64')
      },
      timestamp,
      ratingKeys: getRatingKeysForOrder(data, timestamp, identity, chaincode),
      items: []
    }
  };

  const listingHashes = [];
  let signedListings;

  try {
    signedListings = await Promise.all(
      data.items.filter(item => {
        if (!listingHashes.includes(item.listingHash)) {
          listingHashes.push(item.listingHash);
          return true;
        };

        return false;
      }).map(item => getSignedListing(contract, item))
    );
  } catch (e) {
    console.error(e);
    throw new Error(`Unable to obtain signed listings: ${e.message}`);
  }

  return contract;
}

console.log('theGoods');
window.theGoods = createContractWithOrder;
