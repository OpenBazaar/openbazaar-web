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
let mnemonicData = null;

export const generateMnemonic = (props = {}) => (dispatch, getState) => {
  if (generatingMnemonic) return generatingMnemonic;

  dispatch({ type: AUTH_GENERATING_MNEMONIC });

  if (mnemonicData) {
    return new Promise(resolve => resolve(mnemonicData));
  } else {
    generatingMnemonic = generatePeerId()
      .then(data => {
        mnemonicData = data;
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
        .catch(() => {})
        .then(() => generatingMnemonic = null);

    return generatingMnemonic;
  }
};

export const refreshMnemonic = (props = {}) => {
  mnemonicData = null;
  return generateMnemonic(props);
}
