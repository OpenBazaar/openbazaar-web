// TODO: make a createAction where args could be validated
// TODO: make a createAction where args could be validated
// TODO: make a createAction where args could be validated
// TODO: make a createAction where args could be validated
import { createAction } from 'redux-starter-kit';

export const open = createAction('CHAT_OPEN');
export const close = createAction('CHAT_CLOSE');
export const convosRequest = createAction('CHAT_CONVOS_REQUEST');
export const convosSuccess = createAction('CHAT_CONVOS_SUCCESS');
export const convosFail = createAction('CHAT_CONVOS_FAILURE');
export const convoChange = createAction('CHAT_CONVO_CHANGE');
export const activateConvo = createAction('CHAT_CONVO_ACTIVATE');
export const deactivateConvo = createAction('CHAT_CONVO_DEACTIVATE');
export const convoActivated = createAction('CHAT_CONVO_ACTIVATED');
export const convoMessagesRequest = createAction('CHAT_CONVO_MESSAGES_REQUEST');
export const convoMessagesSuccess = createAction('CHAT_CONVO_MESSAGES_SUCCESS');
export const convoMessagesFail = createAction('CHAT_CONVO_MESSAGES_FAILURE');
export const convoMarkRead = createAction('CHAT_CONVO_MARK_READ');

export const messageDbChange = createAction('CHAT_CONVO_MESSAGE_DB_CHANGE');
export const messageChange = createAction('CHAT_CONVO_MESSAGE_CHANGE');

// export const messageAdd = createAction('CHAT_CONVO_MESSAGE_ADD');
// export const messageUpdate = createAction('CHAT_CONVO_MESSAGE_UPDATE');
// export const messageRemove = createAction('CHAT_CONVO_MESSAGE_REMOVE');

export const sendMessage = createAction('CHAT_SEND_MESSAGE');
// export const sendMessageRequest = createAction('CHAT_SEND_MESSAGE_REQUEST');
// export const sendMessageFail = createAction('CHAT_SEND_MESSAGE_FAIL');