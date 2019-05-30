/*
 * Will drop any chat actions if there is no logged in user.
 */
const dropChatActionsIfNoAuth = store => next => action => {
  const state = store.getState();

  if (action.type.startsWith('CHAT_')) {
    console.dir(action);
    console.log(`${action.type} - ${action.type.startsWith('CHAT_') && !state.auth.loggedIn}`);
  }

  if (action.type.startsWith('CHAT_') && !state.auth.loggedIn) {
    console.log('dropped that gnarly son of a red headd whore.')
    return undefined;
  }

  return next(action);
}

export default dropChatActionsIfNoAuth;