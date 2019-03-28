import { createAction } from 'redux-starter-kit'

export const listingCardOpenListing = createAction('LISTING_CARD_OPEN_LISTING');
export const listingCardCancelListingOpen = createAction('LISTING_CARD_CANCEL_OPEN_LISTING');
export const listingCardRetryListingOpen = createAction('LISTING_CARD_RETRY_OPEN_LISTING');