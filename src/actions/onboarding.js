import { save as profileSave } from 'models/profile';

export const ONBOARDING_SAVING = 'ONBOARDING_SAVING';
export const ONBOARDING_SAVE_SUCCESS = 'ONBOARDING_SAVE_SUCCESS';
export const ONBOARDING_SAVE_FAILED = 'ONBOARDING_SAVE_FAILED';

export const save = (props = {}) => (dispatch, getState) => {
  if (typeof props.data !== 'object') {
    throw new Error('Please provide a data object in the props.');
  }

  dispatch({ type: ONBOARDING_SAVING });

  let peerID = null;

  try {
    peerID = getState().auth.identity.peerId;
  } catch (e) {
    // pass
  }

  if (typeof peerID !== 'string') {
    return Promise.reject(new Error('Unable to obtain the peerId.'));
  }

  return profileSave({
    ...props.data,
    peerID,
  })
    .then(
      profile => dispatch({
        type: ONBOARDING_SAVE_SUCCESS,
        profile,
      }),
      e => {
        return new Promise((resolve, reject) => {
          dispatch({
            type: ONBOARDING_SAVE_FAILED,
            error: e.message,
          });
          throw e;
        });
      }
    ).then(() => {
      
    });
}