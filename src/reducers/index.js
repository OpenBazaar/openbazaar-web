import { connectRouter } from 'connected-react-router';
import modals from './modals';

export default history => ({
  router: connectRouter(history),
  modals
});
