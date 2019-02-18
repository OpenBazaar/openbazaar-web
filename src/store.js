import { configureStore, getDefaultMiddleware } from 'redux-starter-kit';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from 'reducers';

export const history = createBrowserHistory();

const middleware = [...getDefaultMiddleware(), routerMiddleware(history)];

export default configureStore({
  reducer: createRootReducer(history),
  middleware,
  devTools: process.env.NODE_ENV !== 'production'
});
