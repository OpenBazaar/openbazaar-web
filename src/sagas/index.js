import { spawn } from 'redux-saga/effects';
import { openListingWatcher } from './listingCard';
// todo: have sub-domains group themselves so only one import is needed here
import {
  activateConvoWatcher,
  convoMessagesRequestWatcher,
  convosRequestWatcher,
  messageDbChangeWatcher,
  sendMessageWatcher,
  convoMarkReadWatcher,
  directMessageWatcher,
  cancelMessageWatcher,
  logoutWatcher,
} from './chat';
import { getCachedProfileWatcher } from './profile';

export default function* root() {
  yield spawn(openListingWatcher);
  yield spawn(activateConvoWatcher);
  yield spawn(convoMessagesRequestWatcher);
  yield spawn(convosRequestWatcher);
  yield spawn(getCachedProfileWatcher);
  yield spawn(messageDbChangeWatcher);
  yield spawn(sendMessageWatcher);
  yield spawn(convoMarkReadWatcher);
  yield spawn(directMessageWatcher);
  yield spawn(cancelMessageWatcher);
  yield spawn(logoutWatcher);
}
