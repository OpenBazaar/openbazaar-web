import { AUTH_LOGIN_SUCCESS } from 'actions/auth';
import { ONBOARDING_SAVE_SUCCESS } from 'actions/onboarding';

export const SUBSCRIBE_OWN_PROFILE_SET = 'SUBSCRIBE_OWN_PROFILE_SET';

const subscribeOwnProfile = store => next => action => {
  const nextAction = { ...action };

  if (
    [AUTH_LOGIN_SUCCESS, ONBOARDING_SAVE_SUCCESS].includes(action.type) &&
    action.profileInstance
  ) {
    action.profileInstance.$.subscribe(p => {
      if (!p) return;
      const strippedProfile = { ...p };
      delete strippedProfile._rev;
      store.dispatch({
        type: SUBSCRIBE_OWN_PROFILE_SET,
        profile: strippedProfile
      });
    });

    // The profile on this action is an RxDB document. It's not serializable and
    // only intended for this middleware.
    delete nextAction.profileInstance;
  }

  return next(nextAction);
};

export default subscribeOwnProfile;
