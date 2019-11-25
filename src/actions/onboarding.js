import { getRandomAvatar } from 'data/sampleAvatars';
import { save as profileSave } from 'models/profile';
import { onOwnProfileObtained } from 'actions/auth';

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
    peerID = getState().auth.identity.peerID;
  } catch (e) {
    // pass
  }

  if (typeof peerID !== 'string') {
    return Promise.reject(new Error('Unable to obtain the peerID.'));
  }

  return profileSave({
    avatarHashes: getRandomAvatar(),
    ...props.data,
    peerID
  }).then(
    profile => {
      dispatch({ type: ONBOARDING_SAVE_SUCCESS });
      onOwnProfileObtained(dispatch, profile);
    },
    e => {
      return new Promise((resolve, reject) => {
        dispatch({
          type: ONBOARDING_SAVE_FAILED,
          error: e.message
        });
        throw e;
      });
    }
  );
};
