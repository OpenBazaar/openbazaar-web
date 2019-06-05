import { omit } from 'lodash';
import { get as getDb } from 'util/database';
import { AUTH_LOGIN_SUCCESS } from 'actions/auth';
import { convoChange, messageChange } from 'actions/chat';

const middleware = store => next => action => {
  if (action.type === AUTH_LOGIN_SUCCESS) {
    // subscribe to chat db updates
    getDb().then(db => {
      // todo: shouldn't collection names be plural?
      // todo: shouldn't collection names be plural?
      db.chatconversation.$.subscribe(changeEvent =>
        store.dispatch(
          convoChange({
            operation: changeEvent.data.op,
            data: omit(changeEvent.data.v, ['_rev']),
          })
        )
      );

      db.chatmessage.$.subscribe(changeEvent =>
        store.dispatch(
          messageChange({
            operation: changeEvent.data.op,
            data: omit(changeEvent.data.v, ['_rev']),
          })
        )
      );
    });
  } else if (
    action.type.startsWith('CHAT_') &&
    !store.getState().auth.loggedIn
  ) {
    // drop any chat action if there is no logged in user
    return undefined;
  }

  return next(action);
};

export default middleware;
