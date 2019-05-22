export const CHAT_OPEN = 'CHAT_OPEN';
export const CHAT_CLOSE = 'CHAT_CLOSE';

export const openChat = () => ({
  type: CHAT_OPEN,
});

export const closeChat = () => ({
  type: CHAT_CLOSE,
});
