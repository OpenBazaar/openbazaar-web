import { save as profileSave } from 'models/profile';

export const MODELS_PROFILE_SAVING = 'MODELS_PROFILE_SAVING';
export const MODELS_PROFILE_SAVE_SUCCESS = 'MODELS_PROFILE_SAVE_SUCCESS';
export const MODELS_PROFILE_SAVE_FAILED = 'MODELS_PROFILE_SAVE_FAILED';

export const saveProfile = (props = {}) => (dispatch, getState) => {
  if (typeof props.data !== 'object') {
    throw new Error('Please provide a data object in the props.');
  }

  dispatch({ type: MODELS_PROFILE_SAVING });

  const sizzle = profileSave(props.data)
    .then(
      () => dispatch({ type: MODELS_PROFILE_SAVE_SUCCESS }),
      // e => dispatch({
      //   type: MODELS_PROFILE_SAVE_FAILED,
      //   error: e,
      // })
      e => {
        console.log('moo');
        window.moo = e;
        dispatch({
          type: MODELS_PROFILE_SAVE_FAILED,
          error: e,
        });
      }
    );

  window.sizzle = sizzle;
  return sizzle;
}