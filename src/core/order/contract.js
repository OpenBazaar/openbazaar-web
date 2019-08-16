import protobuf from 'protobufjs';
import { fromPublicKey } from 'bip32';
import { ECPair } from 'bitcoinjs-lib';
import { createFromPubKey } from 'peer-id';
import {
  CURRENT_LISTING_VERSION,
  MIN_SUPPORTED_LISTING_VERSION,
} from 'core/constants';
import { encodeCID } from 'core/util';
import { normalizeCurCode, validateCur } from 'util/currency';
import contractsJSON from 'pb/contracts.json';
import { generatePbTimestamp, convertTimestamps } from 'pb/util';
import { getIdentity } from 'util/auth';
import { cat } from 'core/ipfs/cat';
import {
  verifySignature,
  verifyEscrowSignature,
} from 'core/signatures';
import { getOwnProfile } from 'models/profile';

let protoContractsRoot;

function getProtoContractsRoot() {
  if (!protoContractsRoot) {
    protoContractsRoot = protobuf.Root.fromJSON(contractsJSON);
  }
  
  return protoContractsRoot;
}

console.log('root');
window.root = getProtoContractsRoot();

function getRatingKeysForOrder(purchaseData = {}, ts, identity, chaincode) {
  const ratingsKeys = [];

  if (Array.isArray(purchaseData.items)) {
    const buyerHDKey = fromPublicKey(identity.ratingKey, chaincode);

    purchaseData.items.forEach((item, index) => {
      const key = buyerHDKey.derive(index);
      const ratingKey = ECPair.fromPublicKey(key.publicKey);
      ratingsKeys.push(ratingKey.publicKey);
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

  if (listing.metadata.version < MIN_SUPPORTED_LISTING_VERSION) {
    throw new Error('Unsupported listing version. The vendor will need to upgrade before this client ' +
      'could purchase.');
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

async function verifySignaturesOnListing(slPB) {
  await verifySignature(
    getProtoContractsRoot()
      .lookupType('Listing')
      .encode(slPB.listing)
      .finish(),
    slPB
      .listing
      .vendorID
      .pubkeys
      .identity,
    slPB.signature,
    slPB
      .listing
      .vendorID
      .peerID,
  );

  verifyEscrowSignature(
    slPB
      .listing
      .vendorID
      .pubkeys
      .bitcoin,
    slPB
      .listing
      .vendorID
      .bitcoinSig,
    slPB
      .listing
      .vendorID
      .peerID,
  );
}

async function getSignedListing(listingHash) {
  const listing = (await cat(listingHash)).data;

  validateListingVersionNumber(listing.listing);
  await validateVendorID(listing.listing);
  // validateListing(); <--- TODO: need to implement  

  const SignedListingPB = getProtoContractsRoot().lookupType('SignedListing');
  const slPB = SignedListingPB.fromObject(convertTimestamps(listing));
  verifySignaturesOnListing(slPB);

  const SignaturePB = getProtoContractsRoot().lookupType('Signature');
  const signature = {
    section: SignaturePB.Section.LISTING,
    signatureBytes: slPB.signature,
  };

  return {
    listing: slPB.listing,
    signature: SignaturePB.create(signature),
  }
}

function isCurrencyAccepted(curCode, acceptedCurs) {
  return acceptedCurs.includes(curCode);
}

function getContractTypes() {
  return getProtoContractsRoot()
    .Listing
    .Metadata
    .ContractType;
}

async function createContractWithOrder(data = {}, options = {}) {
  // Mainy allowing the identity and profile to be passed in to make testing easier.
  // In most cases, you won't be passing them in.
  const identity = options.identity || getIdentity();

  if (!identity) {
    throw new Error('Unable to get the identity. Ensure you are logged in ' +
      'or passing in the identity.');
  }

  const profile = options.profile || (await getOwnProfile());

  if (!profile) {
    throw new Error('Unable to obtain own profile.');
  }

  if (typeof data.paymentCoin !== 'string' || !data.paymentCoin) {
    throw new Error('The data must include a payment coin as a string.');
  }

  const timestamp = generatePbTimestamp();
  const chaincode = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
  const contractRoot = getProtoContractsRoot();

  const contract = {
    buyerOrder: {
      version: 2,
      shipping: {
        shipTo: data.shipTo,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: contractRoot.CountryCode[data.countryCode],
        addressNotes: data.addressNotes
      },
      alternateContactInfo: data.alternateContactInfo,
      // blossom wise shed elite large forum decline tribe farm embrace hat snap
      refundAddress: '1C3fRseMzvXffrX617VYDQew56W3DxtJkB',
      buyerID: {
        peerID: identity.peerID,
        handle: profile.handle,
        pubkeys: {
          identity: identity.publicKey,
          bitcoin: identity.escrowKey,
        },
        bitcoinSig: identity.escrowSig
      },
      timestamp,
      ratingKeys: getRatingKeysForOrder(data, timestamp, identity, chaincode),
      items: []
    },
    vendorListings: [],
    signatures: [],
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
    throw new Error(`Unable to obtain the signed listings: ${e.message}`);
  }

  signedListings.forEach(sl => {
    contract.vendorListings.push(sl.listing);
    contract.signatures.push(sl.signature);
  });  

  for (let i = 0; i < signedListings.length; i++) {
    const dataItem = data.items[i];
    const item = {
      memo: dataItem.memo,
    };
    const listing = signedListings[i].listing;

    if (
      !isCurrencyAccepted(
        data.paymentCoin,
        listing.metadata.acceptedCurrencies
      )
    ) {
      throw new Error(`The payment coin ${data.paymentCoin} is not accepted ` +
        `by listing ${data.items[i].listingHash}.`);
    }

    const serListing =
      contractRoot
        .lookupType('Listing')
        .encode(listing)
        .finish();

    const listingID = await encodeCID(serListing);
    item.listingHash = listingID.toString();

    item.quantity64 = dataItem.quantity;

    const contractTypes = getContractTypes();

    const isCryptoCurListing =
      listing.metadata.contractType === contractTypes['CRYPTOCURRENCY'];

    if (!isCryptoCurListing) {
      // Remove any duplicate coupons
      item.couponCodes = [...new Set(dataItem.coupons)];

      // Validate the selected options
      // todo: need to implement the validation. For now just copying the raw data
      // over.
      item.options = [...dataItem.options];
    }

    // Add shipping to physical listings, and include it for digital and service
    // listings for legacy compatibility
    if (
      [
        contractTypes['PHYSICAL_GOOD'],
        contractTypes['DIGITAL_GOOD'],
        contractTypes['SERVICE'],
      ].includes(listing.metadata.contractType)
    ) {
      item.shippingOption = { ...dataItem.shipping };
    }

    if (isCryptoCurListing) {
      item.paymentAddress = dataItem.paymentAddress;
      // todo: need to implement
      // validateCryptocurrencyOrderItem(item);
    }

    contract.buyerOrder.items.push(item);
  }

  // TODO: need to implement.
  // if containsPhysicalGood(addedListings)) {
  //   err := validatePhysicalPurchaseOrder(contract)
  //   if err != nil {
  //     return nil, err
  //   }
  // }

  const ContractPB = contractRoot.lookupType('RicardianContract');
  const contractPbErr = ContractPB.verify(contract);

  if (contractPbErr) {
    throw new Error(`Unable to validate the contract protobuf: ${contractPbErr}`);
  }

  console.log('ContractPB');
  window.ContractPB = ContractPB;

  return ContractPB.create(contract);
}

async function parseContractForListing(hash, contractPB) {
  for (let i = 0; i++; i < contractPB.vendorListings.length) {
    const listing = contractPB.vendorListings[i];
    const serListing =
      getProtoContractsRoot()
        .lookupType('Listing')
        .encode(listing)
        .finish();

    const listingID = await encodeCID(serListing);
    if (hash === listingID) return listing;
  }

  return null;
}

// just mocking it for now
function getWallet(curCode) {
  return {
    exchangeRates() {
      return {
        getExchangeRate() {
          return Math.random();
        }
      }
    }
  };
}

function getPriceInBaseUnits(paymentCoin, pricingCur, amount) {
  try {
    validateCur(paymentCoin);
  } catch (e) {
    throw new Error(`The payment coin is not valid: ${e.message}`);
  }

  try {
    validateCur(pricingCur);
  } catch (e) {
    throw new Error(`The pricingCur is not valid: ${e.message}`);
  }

  if (typeof amount !== 'number') {
    throw new Error('The amount must be provided as a number.');
  }

  if (normalizeCurCode(paymentCoin) === normalizeCurCode(pricingCur)) {
    return amount;
  }

  let wal;

  try {
    wal = getWallet(paymentCoin);
  } catch (e) {
    console.error(e);
  }

  if (!wal) {
    throw new Error(`Unable to obtain wallet for ${paymentCoin}.`);
  }

  let exchangeRate;
  
  try {
    exchangeRate = wal.getExchangeRate(pricingCur);
  } catch (e) {
    console.error(e);
  }

  if (typeof exchangeRate !== 'number' || exchangeRate < 0) {
    throw new Error(`Unable to obtain a valid exchange rate for ${paymentCoin}.`);
  }

  return (1 / exchangeRate) * amount;
}

// CalculateOrderTotal - calculate the total in base units
function calculateOrderTotal(contractPB) {
  console.log('sizzle');
  window.sizzle = contractPB;

  const physicalGoods = {};
  
  contractPB.buyerOrder.items.forEach(item => {
    const hash = item.listingHash;
    const listing = parseContractForListing(hash, contractPB);
    
    if (!listing) {
      throw new Error(`Unable to obtain the listing for item: ${hash}`);
    }

    if (
      listing.metadata.contractType === getContractTypes('PHYSICAL_GOOD')
    ) {
      physicalGoods[item.listingHash] = listing;
    }

    let priceInBaseUnits;

    if (
      listing.metadata.format ===
        getProtoContractsRoot().Listing.Metadata.Format['MARKET_PRICE']
    ) {
      throw new Error(`The pricing format of MARKET_PRICE is currently not supported.`);
    } else {
      //.getPriceInSatoshi(contract.BuyerOrder.Payment.Coin, l.Metadata.PricingCurrency, l.Item.Price)
      // priceInBaseUnits = getPriceInBaseUnits(
      //   contract.buyerOrder.Payment.Coin
      // );
    }
  });
}

console.log('theGoods');
window.theGoods = createContractWithOrder;

export async function purchase(data) {
  const contractPb = await createContractWithOrder(data);

  // Direct payment
  // just doing direct for now
  const payment = {
    // method: pb.Order_Payment_ADDRESS_REQUEST,
    coin: data.paymentCoin,
  };

  // contract.BuyerOrder.Payment = payment

  let total;

  try {
    total = calculateOrderTotal(contractPb);
  } catch (e) {
    throw new Error(`Unable to calculate the order total: ${e.stack}`);
  }
}