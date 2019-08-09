import protobuf from 'protobufjs';
import { fromPublicKey } from 'bip32';
import { ECPair } from 'bitcoinjs-lib';
import { createFromPubKey } from 'peer-id';
import { keys } from 'libp2p-crypto';
import { CURRENT_LISTING_VERSION } from 'core/constants';
import contractsJSON from 'pb/contracts.json';
import { generatePbTimestamp, convertTimestamps } from 'pb/util';
import { getIdentity } from 'util/auth';
import { cat } from 'core/ipfs/cat';
import { verifySignature } from 'core/signatures';
import { getOwnProfile } from 'models/profile';

console.log('sparkles');
window.sparkles = keys;

let protoContractsRoot;

function getProtoContractsRoot() {
  if (!protoContractsRoot) {
    protoContractsRoot = protobuf.Root.fromJSON(contractsJSON);
  }
  
  return protoContractsRoot;
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

function validateListingVersionNumber(listing) {
  if (typeof listing !== 'object') {
    throw new Error('The listing is not an object.');
  }

  if (typeof listing.metadata !== 'object') {
    throw new Error('The listing metadata is not an object.');
  }

  if (listing.metadata.version > CURRENT_LISTING_VERSION) {
    throw new Error('Unsupported listing version, you must upgrade to purchase this listing.');
  }
}

async function validateVendorID(listing) {
  if (typeof listing !== 'object') {
    throw new Error('The listing is not an object.');
  }

  if (typeof listing.vendorID !== 'object') {
    throw new Error('The listing vendorID is not an object.');
  }

  if (typeof listing.vendorID.pubkeys !== 'object') {
    throw new Error('The listing vendorID pubkeys is not an object.');
  }

  const peerID = await createFromPubKey(
    listing
      .vendorID
      .pubkeys
      .identity
  );

  if (peerID.toB58String() !== listing.vendorID.peerID) {
    throw new Error('The listing peerID does not match the pubkey');
  }
}

// export async function verifySignature(serializedPb, pkBytes, sigBytes, peerID) {
function verifySignaturesOnListing(slPB) {
  // verifySignature(
  //   getProtoContractsRoot()
  //     .lookupType('Listing')
  //     .encode(slPB.listing)
  //     .finish(),

  // );

  // // Verify identity signature on listing
  // if err := verifySignature(
  //   sl.Listing,
  //   sl.Listing.VendorID.Pubkeys.Identity,
  //   sl.Signature,
  //   sl.Listing.VendorID.PeerID,
  // ); err != nil {
  //   switch err.(type) {
  //   case invalidSigError:
  //     return errors.New("vendor's identity signature on contact failed to verify")
  //   case matchKeyError:
  //     return errors.New("public key in order does not match reported buyer ID")
  //   default:
  //     return err
  //   }
  // }

  // // Verify the bitcoin signature in the ID
  // if err := verifyBitcoinSignature(
  //   sl.Listing.VendorID.Pubkeys.Bitcoin,
  //   sl.Listing.VendorID.BitcoinSig,
  //   sl.Listing.VendorID.PeerID,
  // ); err != nil {
  //   switch err.(type) {
  //   case invalidSigError:
  //     return errors.New("vendor's Bitcoin signature on GUID failed to verify")
  //   default:
  //     return err
  //   }
  // }
  // return nil
}

async function getSignedListing(listingHash) {
  const listing = (await cat(listingHash)).data;
  const SignedListingPB = getProtoContractsRoot().lookupType('SignedListing');
  const slPB = SignedListingPB.fromObject(convertTimestamps(listing));
  // validateListingVersionNumber();
  // await validateVendorID();
  // // validateListing(); <--- TODO: need to implement
  // verifySignaturesOnListing();
}

console.log('flip');
window.flip = getSignedListing;

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
      }).map(item => getSignedListing(item.listingHash))
    );
  } catch (e) {
    console.error(e);
    throw new Error(`Unable to obtain signed listings: ${e.message}`);
  }

  return contract;
}

console.log('theGoods');
window.theGoods = createContractWithOrder;
