import { get } from 'axios';
import { GATEWAY_URL } from 'util/constants';
import {
  takeEvery,
  call,
  put,
} from 'redux-saga/effects';
import {
  requestCached,
  requestCachedSuccess,
} from 'actions/profile';

// TODO: throttle concurrent request so the http queue is not clogged up...?
// TODO: return in-flight request if a second for the same peerId comes in.

// For now, getting the profile from the gateway with the usecache flag. This
// could be tweaked later (perhaps get from IPFS-JS and cache locally...?).
function* getCachedProfile(action) {
  const peerId = action.payload.peerId;

  try {
    const profile = yield call(get, [`${GATEWAY_URL}profile/${peerId}`]);
    yield put(requestCachedSuccess(profile.data));
  } catch (e) {
    // pass
  }
}

export function* getCachedProfileWatcher() {
  yield takeEvery(requestCached, getCachedProfile);
}