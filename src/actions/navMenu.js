export const NAV_MENU_OPEN = 'APP_OPEN_NAV_MENU';
export const NAV_MENU_CLOSE = 'APP_CLOSE_NAV_MENU';

export const openMenu = (props = {}) => ({
  type: NAV_MENU_OPEN,
});

export const closeMenu = (props = {}) => ({
  type: NAV_MENU_CLOSE,
});
