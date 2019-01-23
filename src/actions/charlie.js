import { createAction } from 'redux-starter-kit';

let silenceTimer = null;

const setSilenceTimer = dispatch => {
  clearTimeout(silenceTimer);
  silenceTimer = setTimeout(() => {
    dispatch(silence());
  }, 3000);
}

export const speak = createAction('CHARLIE_SPEAK');

export const speakAction = (...args) => (dispatch, setState) => {
  setSilenceTimer(dispatch);
  return dispatch(speak(...args));
}

export const fart = createAction('CHARLIE_FART');
export const silence = createAction('CHARLIE_SILENCE');