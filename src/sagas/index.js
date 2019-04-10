import { spawn } from 'redux-saga/effects';
import { openListingWatcher } from './listingCard';

export default function* root() {
  yield spawn(openListingWatcher);
}
