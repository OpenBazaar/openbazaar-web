import { connectRouter } from 'connected-react-router';
import modals from './modals';
import responsive from './responsive';
import discovery from './discovery';
import auth from './auth';
import app from './app';

export default history => ({
  router: connectRouter(history),
  modals,
  responsive,
  discovery,
  auth,
  app,
});
