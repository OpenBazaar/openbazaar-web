import { createReducer } from 'redux-starter-kit';
import {
  ONBOARDING_SAVING,
  ONBOARDING_SAVE_SUCCESS,
  ONBOARDING_SAVE_FAILED
} from 'actions/onboarding';

const initialState = {
  saving: false,
  saveFailed: false,
  saveError: ''
};

const saving = (state, action) => {
  state.saving = true;
  state.saveFailed = false;
  state.saveError = '';
};

const saveSuccess = (state, action) => {
  state.saving = false;
};

const saveError = (state, action) => {
  state.saving = false;
  state.saveFailed = true;
  state.saveError = action.error;
};

export default createReducer(initialState, {
  [ONBOARDING_SAVING]: saving,
  [ONBOARDING_SAVE_SUCCESS]: saveSuccess,
  [ONBOARDING_SAVE_FAILED]: saveError
});
