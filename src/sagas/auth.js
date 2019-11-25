import { takeLeading } from 'redux-saga/effects';

function* login(action) {

}

export function* loginWatcher() {
  yield takeLeading('USER_REQUESTED', login);
}
