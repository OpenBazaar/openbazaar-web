import { generatePeerId } from 'util/crypto';

export const AUTH_LOGIN = 'AUTH_LOGIN';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const AUTH_GENERATING_MNEMONIC = 'AUTH_GENERATING_MNEMONIC';
export const AUTH_GENERATE_MNEMONIC_SUCCESS = 'AUTH_GENERATE_MNEMONIC_SUCCESS';
export const AUTH_GENERATE_MNEMONIC_FAIL = 'AUTH_GENERATE_MNEMONIC_FAIL';

export const login = (props = {}) => ({
  type: AUTH_LOGIN
});

export const logout = (props = {}) => ({
  type: AUTH_LOGOUT
});

let generatingMnemonic = null;

// cache mnemonic and explicit different refresh

export const generateMnemonic = (props = {}) => (dispatch, getState) => {
  if (generatingMnemonic) return generatingMnemonic;

  dispatch({ type: AUTH_GENERATING_MNEMONIC });

  generatingMnemonic = generatePeerId()
    .then(data => {
      dispatch({
        type: AUTH_GENERATE_MNEMONIC_SUCCESS,
        data,
      });
    }, error => {
      dispatch({
        type: AUTH_GENERATE_MNEMONIC_FAIL,
        error,
      });
    })
      .catch()
      .then(() => generatingMnemonic = null);
};
