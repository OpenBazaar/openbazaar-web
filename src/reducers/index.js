import { connectRouter } from 'connected-react-router';
import modals from './modals';
import responsive from './responsive';
import discovery from './discovery';
import auth from './auth';
import navMenu from './navMenu';
import onboarding from './onboarding';
import chat from './chat';
import profile from './profile';

export default history => ({
  router: connectRouter(history),
  modals,
  responsive,
  discovery,
  auth,
  navMenu,
  onboarding,
  chat,
  profile
});
