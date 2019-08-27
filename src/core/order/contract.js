import protobuf from 'protobufjs';
import { fromPublicKey } from 'bip32';
import { ECPair } from 'bitcoinjs-lib';
import { createFromPubKey } from 'peer-id';
import { toB58String } from 'multihashes';
import {
  CURRENT_LISTING_VERSION,
  MIN_SUPPORTED_LISTING_VERSION,
} from 'core/constants';
import { encodeCID, encodeMultihash } from 'core/util';
import { cat } from 'core/ipfs/cat';
import {
  verifySignature,
  verifyEscrowSignature,
} from 'core/signatures';
import { sendRequest } from 'core/messaging/index';
import contractsJSON from 'pb/contracts.json';
import { getProtoMessageRoot } from 'pb/roots/message';
import {
  generatePbTimestamp,
  convertTimestamps,
  encodeWithoutDefaults,
} from 'pb/util';
import { getOwnProfile } from 'models/profile';
import { normalizeCurCode, validateCur } from 'util/currency';
import { getIdentity } from 'util/auth';

let protoContractsRoot;

function getProtoContractsRoot() {
  if (!protoContractsRoot) {
    protoContractsRoot = protobuf.Root.fromJSON(contractsJSON);
  }
  
  return protoContractsRoot;
}

console.log('root');
window.root = getProtoContractsRoot();

console.log('mRoot');
window.mRoot = getProtoMessageRoot();

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

    const ListingPB = 
      contractRoot
        .lookupType('Listing');

    // const serListing = encodeWithoutDefaults(listing, ListingPB);
    const serListing = ListingPB.encode(listing).finish();

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

  return ContractPB.create(contract);
}

async function parseContractForListing(hash, contractPB) {
  for (let i = 0; i < contractPB.vendorListings.length; i++) {
    const listing = contractPB.vendorListings[i];
    // const serListing = encodeWithoutDefaults(
    //   listing,
    //   getProtoContractsRoot()
    //     .lookupType('Listing')
    // );

    const serListing = getProtoContractsRoot()
      .lookupType('Listing')
      .encode(listing)
      .finish();

    const listingID = (await encodeCID(serListing)).toString();
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
          return 10785;
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
    exchangeRate =
      wal
        .exchangeRates()
        .getExchangeRate(pricingCur);
  } catch (e) {
    console.error(e);
  }

  if (typeof exchangeRate !== 'number' || exchangeRate < 0) {
    throw new Error(`Unable to obtain a valid exchange rate for ${paymentCoin}.`);
  }

  return (1 / exchangeRate) * amount;
}

function getSelectedSku(listingPB, itemOptions) {
  const variantCombo = [];

  itemOptions.forEach(opt => {
    listingPB.item.options.forEach(listingOpt => {
      if (listingOpt.name === opt.name) {
        listingOpt.variants.forEach((variant, index) => {
          if (variant.name === opt.value) {
            variantCombo.push(index);
          }
        });
      }
    });
  });

  return (
    listingPB
      .item
      .skus
      .find(sku => sku.variantCombo.toString() === variantCombo.toString())
  );
}

// hashedListings - listings hashed by their item listing hash.
function calculateShippingTotalForListings(contractPB, hashedListings) {
  const itemShipping = [];
  let shippingTotal;

  for (let i = 0; i < contractPB.buyerOrder.items.length; i++) {
    const itemPB = contractPB.buyerOrder.items[i];
    const listingPB = hashedListings[itemPB.listingHash];

    if (!listingPB) {
      throw new Error(`Cannot determine shipping price for item ${itemPB.listingHash}. ` +
        'Unable to find the corresponding listing.');
    }

    if (listingPB.metadata.contractType !== getContractTypes()['PHYSICAL_GOOD']) continue;

    const shippingOptions = listingPB.shippingOptions.reduce((acc, shipOptPB) => {
      acc[shipOptPB.name] = shipOptPB;
      return acc;
    }, {});

    const itemOptionPB = shippingOptions[itemPB.shippingOption.name];
    
    if (!itemOptionPB) {
      throw new Error(`The shipping option ${itemPB.shippingOption.name} is not found in ` +
        `the listing.`);
    }

    const pbRoot = getProtoContractsRoot();

    if (
      itemOptionPB.type ===
        pbRoot
          .Listing
          .ShippingOption
          .ShippingType['LOCAL_PICKUP']
    ) continue;

    // Check that this option ships to us
    const shipsToAll = contractPB.buyerOrder.shipping.country === pbRoot.CountryCode.All;
    const shipsToMe =
      itemOptionPB.regions.includes(contractPB.buyerOrder.shipping.country) || shipsToAll;
    

    if (!shipsToMe) {
      throw new Error(`${listingPB.slug} does not ship to you.`);
    }

    const servicePB = itemOptionPB.services.find(
      servicePB => itemPB.shippingOption.service.toLowerCase() === servicePB.name.toLowerCase()
    );

    if (!servicePB) {
      throw new Error(`Service ${itemPB.shippingOption.service.toLowerCase()} not found in listing.`);
    }

    const shippingInBaseUnits =
      getPriceInBaseUnits(
        contractPB.buyerOrder.payment.coin,
        listingPB.metadata.pricingCurrency,
        servicePB.price
      );

    let secondaryShippingInBaseUnits = shippingInBaseUnits;

    if (
      typeof servicePB.additionalItemPrice === 'number' &&
      servicePB.additionalItemPrice > 0
    ) {
      secondaryShippingInBaseUnits = getPriceInBaseUnits(
        contractPB.buyerOrder.payment.coin,
        listingPB.metadata.pricingCurrency,
        servicePB.additionalItemPrice
      );
    }

    // Calculate tax percentage
    // not supported at this time
    
    itemShipping.push({
      primary: shippingInBaseUnits,
      secondary: secondaryShippingInBaseUnits,
      quantity: itemPB.quantity,
      // shippingTaxPercentage: shippingTaxPercentage,
      version: listingPB.metadata.version,
    });
  }

  if (!itemShipping.length) return 0;

  if (itemShipping.length === 1) {
    shippingTotal = itemShipping[0].primary;

    if (itemShipping[0].quantity > 1) {
      shippingTotal += itemShipping[0].secondary * (itemShipping[0].quantity - 1);
    }
  } else {
    throw new Error('Shipping multiple items is not supported at this time.');
  }

  return shippingTotal;
}

async function getOrderSignature(contractPB, options = {}) {
  const identity = options.identity || getIdentity();

  if (!identity) {
    throw new Error('Unable to get the identity. Ensure you are logged in ' +
      'or passing in the identity.');
  }

  const pbRoot = getProtoContractsRoot();
  const serializedOrder = encodeWithoutDefaults(
    contractPB.buyerOrder,
    pbRoot.lookupType('Order')
  );

  console.log(Buffer.from(serializedOrder).toString('base64'));

  const signature = {
    section: pbRoot.Signature.Section.ORDER,
    signatureBytes: await identity.keypair.sign(serializedOrder),
  }

  const SignaturePB = pbRoot.lookupType('Signature');
  const sigPbErr = SignaturePB.verify(signature);

  if (sigPbErr) {
    throw new Error(`Unable to validate the order signature protobuf: ${sigPbErr}`);
  }

  return SignaturePB.create(signature);
}

// CalculateOrderTotal - calculate the total in base units
async function calculateOrderTotal(contractPB) {
  const physicalGoods = {};
  let total = 0;

  for (let i = 0; i < contractPB.buyerOrder.items.length; i++) {
    const itemPB = contractPB.buyerOrder.items[i];
    const hash = itemPB.listingHash;
    const listingPB = await parseContractForListing(hash, contractPB);
    const itemQuantity = itemPB.quantity64;
    let itemTotal = 0;

    if (!listingPB) {
      throw new Error(`Unable to obtain the listing for item: ${hash}`);
    }

    if (
      listingPB.metadata.contractType === getContractTypes()['PHYSICAL_GOOD']
    ) {
      physicalGoods[itemPB.listingHash] = listingPB;
    }

    if (
      listingPB.metadata.format ===
        getProtoContractsRoot().Listing.Metadata.Format['MARKET_PRICE']
    ) {
      throw new Error(`The pricing format of MARKET_PRICE is currently not supported.`);
    } else {
      itemTotal += getPriceInBaseUnits(
        contractPB.buyerOrder.payment.coin,
        listingPB.metadata.pricingCurrency,
        listingPB.item.price
      );
    }

    // handle variants
    if (itemPB.options.length) {
      let skuPB;

      try {
        skuPB = getSelectedSku(listingPB, itemPB.options);
      } catch (e) {
        // pass
      }

      if (!skuPB) {
        throw new Error('Unable to find the sku in the listing.');
      }

      if (typeof skuPB.surcharge === 'number') {
        itemTotal += getPriceInBaseUnits(
          contractPB.buyerOrder.payment.coin,
          listingPB.metadata.pricingCurrency,
          skuPB.surcharge
        );
      }
    }

    // subtract any coupons
    let couponsByHash;

    if (itemPB.couponCodes.length) {
      listingPB.coupons.reduce((couponsByHash, coupon) => {
        couponsByHash[coupon.hash] = coupon;
        return couponsByHash;
      }, {});

      for (let i = 0; i < itemPB.couponCodes.length; i++) {
        const couponCode = itemPB.couponCodes[i];
        const mhBytes = encodeMultihash(Buffer.from(couponCode));
        const coupon = couponsByHash[toB58String(mhBytes)];

        if (!coupon) {
          throw new Error(`${couponCode} is not a valid coupon code.`);
        }

        if (
          typeof coupon.priceDiscount === 'number' &&
          coupon.priceDiscount > 0
        ) {
          itemTotal -= getPriceInBaseUnits(
            contractPB.buyerOrder.payment.coin,
            listingPB.metadata.pricingCurrency,
            coupon.priceDiscount
          );
        } else if (
          typeof coupon.percentDiscount === 'number' &&
          coupon.percentDiscount > 0
        ) {
          itemTotal -= itemTotal * (coupon.percentDiscount / 100);
        }
      }
    }

    // apply tax
    if (listingPB.taxes.length) {
      throw new Error('Handling tax is not supported at this time.');
    }

    itemTotal *= itemQuantity;
    total += itemTotal;
  };

  const shippingTotal = await calculateShippingTotalForListings(contractPB, physicalGoods);
  total += shippingTotal;

  return total;
}

console.log('theGoods');
window.theGoods = createContractWithOrder;

function sendOrder(contractPB) {
  let vendorPeerID;

  try {
    vendorPeerID = 
      contractPB
        .vendorListings[0]
        .vendorID
        .peerID;
  } catch (e) {
    throw new Error(`Unable to determine the vendor peerID: ${e}`);
  }

  return sendRequest(
    getProtoMessageRoot()
      .Message
      .MessageType['ORDER'],
    vendorPeerID,
    getProtoContractsRoot()
      .lookupType('RicardianContract')
      .encode(contractPB)
      .finish()
  );
}

export async function purchase(data, options = {}) {
  const contractPB = await createContractWithOrder(data);
  const contractRoot = getProtoContractsRoot();

  // Direct payment
  // just doing direct for now
  const payment = {
    method:
      contractRoot
        .Order
        .Payment
        .Method['ADDRESS_REQUEST'],
    coin: data.paymentCoin,
  };

  const PaymentPB = contractRoot.lookupType('Payment');
  const paymentPbErr = PaymentPB.verify(payment);

  if (paymentPbErr) {
    throw new Error(`Unable to validate the payment protobuf: ${paymentPbErr}`);
  }

  contractPB.buyerOrder.payment = PaymentPB.create(payment);

  let total;

  try {
    total = await calculateOrderTotal(contractPB);
  } catch (e) {
    throw new Error(`Unable to calculate the order total: ${e.stack}`);
  }

  console.log(`the order total is ${total}`);

  contractPB.buyerOrder.payment.amount = total;
  contractPB.signatures.push(await getOrderSignature(contractPB));

  console.log('contract');
  window.contract = contractPB;

  const merchantResponse = await sendOrder(contractPB);

  console.log('merResp');
  window.merResp = merchantResponse;
}

console.log('foo');
window.foo = purchase;

// const go = 'ChR0ZXN0LXRlc3QtdGVzdC1taWxseRLEAQouUW1RMlRoQkw2emNZeEJzQ0gyZlVWM0VVaVBNM3RZbWRuUDNxN2prZTIxdUJNcBpJCiQIARIg1JRiC99XTy49u47TrmPhebH2IoWanvr9rfG2+cj8O4YSIQLJRSKlbpvhAB4nyf2yr0gTbVTXwn8uL41usco/cwtyliJHMEUCIQDqnEyTrFKKNY0FRlbn9wC4+69ozF8C3meKcLQG36nseQIgfJs1dJdFTSM2lGg7hQ68O1PVjAZHWO2XRaogo3OMeUgaKwgEIgYI4LSc/wcqA0xUQyoDQlRDKgNCQ0gqA1pFQzIDVVNEQLgIUIDC1y8ioAIKFFRFU1QgVEVTVCBURVNUIG1pbGx5IGQ6/gEKDG11cmFrYW1pLmpwZxIuUW1WeVZIOFJhbTZNZTNpaHlLZ2p6SnNNMlhaeG5QajZQS1NmbmVSRmY4WmFhRBouUW1laFFoMlNDeVZuWXpZNTduVFAzOWRrbUU3Z0t5ekpHeUhUTko0dXpDM2QyRCIuUW1YcTFSTEt0d2E3VmNSemFhN0dTWEtoVWdIYnBicUhNZWhVS2RDeVVTV1hvNyouUW1VeHlBdHYzdzgxWVFnaEFtckVHTThpbjRYU01QNkROZEVnY1RqNm12UXRjMzIuUW1TODhUcVgySzlwU1VvdnFjczNXbkdhUDFRQjdoTXNSUHdMZFVXNmR5UzRoTFIDTkVXYgAqKQoMVVNBIHNoaXBzdGVyEAEaAuoBKhMKCFN0YW5kYXJkEBkaAzUtNyAK';
// const js = 'ChR0ZXN0LXRlc3QtdGVzdC1taWxseRLGAQouUW1RMlRoQkw2emNZeEJzQ0gyZlVWM0VVaVBNM3RZbWRuUDNxN2prZTIxdUJNcBIAGkkKJAgBEiDUlGIL31dPLj27jtOuY+F5sfYihZqe+v2t8bb5yPw7hhIhAslFIqVum+EAHifJ/bKvSBNtVNfCfy4vjW6xyj9zC3KWIkcwRQIhAOqcTJOsUoo1jQVGVuf3ALj7r2jMXwLeZ4pwtAbfqex5AiB8mzV0l0VNIzaUaDuFDrw7U9WMBkdY7ZdFqiCjc4x5SBo6CAQQABgAIggI4LSc/wcQACoDTFRDKgNCVEMqA0JDSCoDWkVDMgNVU0Q6AEC4CEoAUIDC1y9dAAAAACKxAgoUVEVTVCBURVNUIFRFU1QgbWlsbHkSABoAIGQoADr+AQoMbXVyYWthbWkuanBnEi5RbVZ5Vkg4UmFtNk1lM2loeUtnanpKc00yWFp4blBqNlBLU2ZuZVJGZjhaYWFEGi5RbWVoUWgyU0N5Vm5Zelk1N25UUDM5ZGttRTdnS3l6Skd5SFROSjR1ekMzZDJEIi5RbVhxMVJMS3R3YTdWY1J6YWE3R1NYS2hVZ0hicGJxSE1laFVLZEN5VVNXWG83Ki5RbVV4eUF0djN3ODFZUWdoQW1yRUdNOGluNFhTTVA2RE5kRWdjVGo2bXZRdGMzMi5RbVM4OFRxWDJLOXBTVW92cWNzM1duR2FQMVFCN2hNc1JQd0xkVVc2ZHlTNGhMTQAAAABSA05FV2IGEgAYACAAKikKDFVTQSBzaGlwc3RlchABGgLqASoTCghTdGFuZGFyZBAZGgM1LTcgCkoAUgA=';

// const ListingPB = getProtoContractsRoot().lookupType('Listing');
// const listingGo = ListingPB.decode(Buffer.from(go, 'base64'));
// const listingJs = ListingPB.decode(Buffer.from(js, 'base64'));

// console.log('go js');
// window.go = listingGo;
// window.js = listingJs;

const PicklePB = getProtoContractsRoot().lookupType('Pickle');
console.log('Pickle');
window.Pickle = PicklePB;

