export const LISTING_CARD_OPEN_LISTING = 'LISTING_CARD_OPEN_LISTING';
export const LISTING_CARD_CANCEL_OPEN_LISTING =
  'LISTING_CARD_CANCEL_OPEN_LISTING';
export const LISTING_CARD_RETRY_OPEN_LISTING =
  'LISTING_CARD_RETRY_OPEN_LISTING';

export const openListing = (payload = {}) => ({
  type: LISTING_CARD_OPEN_LISTING,
  payload
});

export const cancelOpenListing = (payload = {}) => ({
  type: LISTING_CARD_CANCEL_OPEN_LISTING,
  payload
});

export const retryOpenListing = (payload = {}) => ({
  type: LISTING_CARD_RETRY_OPEN_LISTING,
  payload
});
