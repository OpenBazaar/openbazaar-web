import { spawn } from 'redux-saga/effects';
import {
  openListingWatcher,
  cancelListingOpenWatcher,
  retryListingOpenWatcher,
  modalCloseWatcher,
} from './listingCard';

export default function* root() {
  yield spawn(openListingWatcher);
  yield spawn(cancelListingOpenWatcher);
  yield spawn(retryListingOpenWatcher);
  yield spawn(modalCloseWatcher);
}