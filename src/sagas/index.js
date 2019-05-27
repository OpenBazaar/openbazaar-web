import { spawn } from 'redux-saga/effects';
import { openListingWatcher } from './listingCard';
// todo: have sub-domains group themselves so only one import is needed here
import {
  activateConvoWatcher,
  convoMessagesRequestWatcher,
  convosRequestWatcher,
} from './chat';

export default function* root() {
  yield spawn(openListingWatcher);
  yield spawn(activateConvoWatcher);
  yield spawn(convoMessagesRequestWatcher);
  yield spawn(convosRequestWatcher);
}
