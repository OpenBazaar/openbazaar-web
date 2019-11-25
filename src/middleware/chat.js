import { get as getDb } from 'util/database';
import { AUTH_LOGIN_SUCCESS } from 'actions/auth';
import { messageDbChange } from 'actions/chat';

const middleware = store => next => action => {
  if (action.type === AUTH_LOGIN_SUCCESS) {
    // subscribe to chat db updates
    getDb().then(db => {
      // todo: shouldn't collection names be plural?
      // todo: throttle and batch messageDbChange events.
      db.chatmessage.$.subscribe(changeEvent => {
        store.dispatch(
          messageDbChange({
            operation: changeEvent.data.op,
            data: changeEvent.data.v,
            sent: true,
          })
        );
      });

      db.unsentchatmessages.$.subscribe(changeEvent => {
        store.dispatch(
          messageDbChange({
            operation: changeEvent.data.op,
            data: changeEvent.data.v,
            sent: false,
          })
        );
      });
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
