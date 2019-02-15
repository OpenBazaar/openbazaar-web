import { connectRouter } from 'connected-react-router';
import modals from './modals';
import responsive from './responsive';
import discovery from './discovery';
import auth from './auth';
import navMenu from './navMenu';

export default history => ({
  router: connectRouter(history),
  modals,
  responsive,
  discovery,
  auth,
  navMenu,
});
