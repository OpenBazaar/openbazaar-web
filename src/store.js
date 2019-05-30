import { configureStore, getDefaultMiddleware } from 'redux-starter-kit';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from 'reducers';
import createSagaMiddleware from 'redux-saga';
import noAuthNoChat from 'middleware/noAuthNoChat';
import rootSaga from 'sagas';

export const history = createBrowserHistory();
const sagaMiddleware = createSagaMiddleware();

const middleware = [
  ...getDefaultMiddleware(),
  routerMiddleware(history),
  sagaMiddleware,
  noAuthNoChat,
];

const store = configureStore({
  reducer: createRootReducer(history),
  middleware,
  devTools: process.env.NODE_ENV !== 'production'
});

sagaMiddleware.run(rootSaga);

export default store;
