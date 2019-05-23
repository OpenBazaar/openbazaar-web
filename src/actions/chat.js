import { createAction } from 'redux-starter-kit';

export const open = createAction('CHAT_OPEN');
export const close = createAction('CHAT_CLOSE');
export const convosRequest = createAction('CHAT_CONVOS_REQUEST');
export const convosSuccess = createAction('CHAT_CONVOS_SUCCESS');

// export const CHAT_OPEN = 'CHAT_OPEN';
// export const CHAT_CLOSE = 'CHAT_CLOSE';
// export const CHAT_CONVOS_REQUEST = 'CHAT_CONVOS_REQUEST';
// export const CHAT_CONVOS_FAILURE = 'CHAT_CONVOS_FAILURE';
// export const CHAT_CONVOS_SUCCESS = 'CHAT_CONVOS_SUCCESS';