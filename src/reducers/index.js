import { connectRouter } from 'connected-react-router';
import modals from './modals';
import responsive from './responsive';
import discovery from './discovery';
<<<<<<< HEAD
import auth from './auth';
import navMenu from './navMenu';
=======
>>>>>>> initial-skeleton

export default history => ({
  router: connectRouter(history),
  modals,
  responsive,
<<<<<<< HEAD
  discovery,
  auth,
  navMenu
=======
  discovery
>>>>>>> initial-skeleton
});
