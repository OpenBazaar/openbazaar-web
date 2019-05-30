import { createAction } from 'redux-starter-kit';

export const requestCached = createAction('PROFILE_REQUEST_CACHED');
export const requestCachedSuccess = createAction(
  'PROFILE_REQUEST_CACHED_SUCCESS'
);
