export const NAV_MENU_OPEN = 'NAV_MENU_OPEN';
export const NAV_MENU_CLOSE = 'NAV_MENU_CLOSE';

export const openMenu = (props = {}) => ({
  type: NAV_MENU_OPEN
});

export const closeMenu = (props = {}) => ({
  type: NAV_MENU_CLOSE
});
