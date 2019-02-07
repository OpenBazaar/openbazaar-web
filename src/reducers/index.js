import { connectRouter } from 'connected-react-router';
import modals from './modals';
import responsive from './responsive';
import discovery from './discovery';

export default history => ({
  router: connectRouter(history),
  modals,
  responsive,
  discovery,
});
