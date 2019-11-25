import { configureStore, getDefaultMiddleware } from 'redux-starter-kit';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from 'reducers';
import createSagaMiddleware from 'redux-saga';
import chat from 'middleware/chat';
import rootSaga from 'sagas';
import { init as initIpfs } from 'util/ipfs/index';

export const history = createBrowserHistory();
const sagaMiddleware = createSagaMiddleware();

const middleware = [
  ...getDefaultMiddleware(),
  routerMiddleware(history),
  sagaMiddleware,
  chat
];

const store = configureStore({
  reducer: createRootReducer(history),
  middleware,
  devTools: process.env.NODE_ENV !== 'production'
});

sagaMiddleware.run(rootSaga);
initIpfs(store);

export default store;
