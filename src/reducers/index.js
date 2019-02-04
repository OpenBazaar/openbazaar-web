import { connectRouter } from 'connected-react-router';
import modals from './modals';
import responsive from './responsive';

export default history => ({
  router: connectRouter(history),
  modals,
  responsive,
});
