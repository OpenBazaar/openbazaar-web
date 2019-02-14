export const APP_OPEN_NAV_MENU = 'APP_OPEN_NAV_MENU';
export const APP_CLOSE_NAV_MENU = 'APP_CLOSE_NAV_MENU';

export const openNavMenu = (props = {}) => ({
  type: APP_OPEN_NAV_MENU,
});

export const closeNavMenu = (props = {}) => ({
  type: APP_CLOSE_NAV_MENU,
});
