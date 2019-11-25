// TODO: make a createAction where args could be validated
import { createAction } from 'redux-starter-kit';

export const open = createAction('CHAT_OPEN');
export const close = createAction('CHAT_CLOSE');
export const convosRequest = createAction('CHAT_CONVOS_REQUEST');
export const convosSuccess = createAction('CHAT_CONVOS_SUCCESS');
export const convosFail = createAction('CHAT_CONVOS_FAILURE');

export const convoChange = createAction('CHAT_CONVO_CHANGE');
export const convoRemove = createAction('CHAT_CONVO_REMOVE');

export const activateConvo = createAction('CHAT_CONVO_ACTIVATE');
export const deactivateConvo = createAction('CHAT_CONVO_DEACTIVATE');
export const convoActivated = createAction('CHAT_CONVO_ACTIVATED');
export const convoMessagesRequest = createAction('CHAT_CONVO_MESSAGES_REQUEST');
export const convoMessagesSuccess = createAction('CHAT_CONVO_MESSAGES_SUCCESS');
export const convoMessagesFail = createAction('CHAT_CONVO_MESSAGES_FAILURE');
export const convoMarkRead = createAction('CHAT_CONVO_MARK_READ');
export const sendMessage = createAction('CHAT_MESSAGE_SEND');
export const cancelMessage = createAction('CHAT_MESSAGE_CANCEL');
export const messageDbChange = createAction('CHAT_CONVO_MESSAGE_DB_CHANGE');
export const activeConvoMessagesChange =
  createAction('CHAT_CONVO_ACTIVE_CONVO_MESSAGES_CHANGE');
