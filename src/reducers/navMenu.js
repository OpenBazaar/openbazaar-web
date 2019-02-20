import { createReducer } from 'redux-starter-kit';
import { NAV_MENU_OPEN, NAV_MENU_CLOSE } from 'actions/navMenu';

const initialState = {
  menuOpen: false
};

const openMenu = (state, action) => {
  state.menuOpen = true;
};

const closeMenu = (state, action) => {
  state.menuOpen = false;
};

export default createReducer(initialState, {
  [NAV_MENU_OPEN]: openMenu,
  [NAV_MENU_CLOSE]: closeMenu
});
