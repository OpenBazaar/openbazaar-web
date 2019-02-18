export const AUTH_LOGIN = 'AUTH_LOGIN';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';

export const login = (props = {}) => ({
  type: AUTH_LOGIN
});

export const logout = (props = {}) => ({
  type: AUTH_LOGOUT
});
