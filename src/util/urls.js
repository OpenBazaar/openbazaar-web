// todo: move constants.js urls here
import { GATEWAY_URL } from 'util/constants';

export const listingImgUrl = hash => `${GATEWAY_URL}images/${hash}`;

export const listingImgBgStyle = hash =>
  typeof hash === 'string' && hash
    ? `url("${listingImgUrl(hash)}"), url("../../img/defaultItem.png")`
    : 'url("../../img/defaultItem.png")';
