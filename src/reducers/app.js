import { createReducer } from 'redux-starter-kit';
import {
  APP_OPEN_NAV_MENU,
  APP_CLOSE_NAV_MENU,
} from 'actions/app';

const initialState = {
  navMenuOpen: false,
};

const openNavMenu = (state, action) => {
  state.navMenuOpen = true;
};

const closeNavMenu = (state, action) => {
  state.navMenuOpen = false;
}

export default createReducer(initialState, {
  [APP_OPEN_NAV_MENU]: openNavMenu,
  [APP_CLOSE_NAV_MENU]: closeNavMenu,
});