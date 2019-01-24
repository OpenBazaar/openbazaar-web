import { configureStore, getDefaultMiddleware } from 'redux-starter-kit';
import { history } from './';
import { routerMiddleware } from 'react-router-redux';
import reducer from 'reducers';

const middleware = [...getDefaultMiddleware(), routerMiddleware(history)];

if (process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger');
  middleware.push(logger);
}

export default configureStore({
  reducer,
  middleware,
  devTools: process.env.NODE_ENV !== 'production'
});
