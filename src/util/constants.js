export const GATEWAY_URL = 'https://gateway.ob1.io/ob/';
export const getSearchUrl = (query = '') =>
  `https://search.ob1.io/listings/search${query ? `?${query}` : ''}`;