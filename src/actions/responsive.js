import { throttle } from 'lodash';

export const SET_BREAKPOINT = 'SET_BREAKPOINT';

let resizeBound = false;

const handleWinResize = dispatch => {
  if (resizeBound) return;

  window.addEventListener(
    'resize',
    throttle(() => {
      dispatch({
        type: SET_BREAKPOINT
      });
    }, 100)
  );

  resizeBound = true;
};

/*
 * Initiates the reducer logic to reack breakpoints based on the window size.
 */
export const trackBreakpoints = (props = {}) => (dispatch, getState) => {
  handleWinResize(dispatch);
  dispatch({ type: SET_BREAKPOINT });
};
