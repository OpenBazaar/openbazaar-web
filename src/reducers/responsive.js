import { createReducer } from 'redux-starter-kit';
import { SET_BREAKPOINT } from 'actions/responsive';

const breakpoints = {
  mobile: 0,
  mobileLandscape: 480,
  tablet: 740,
  desktop: 980,
  pageWidth: 1010,
  wide: 1300
};

const getCurBreakpoint = () => {
  let breakpoint = null;
  const bps = Object.keys(breakpoints);

  bps.some((bp, index) => {
    let mq = `(min-width: ${breakpoints[bp]}px) and (max-width: ${breakpoints[
      bps[index + 1]
    ] - 1}px)`;

    if (index === bps.length - 1) {
      mq = `(min-width: ${breakpoints[bp]}px)`;
    }

    if (window.matchMedia(mq).matches) {
      breakpoint = bp;
      return true;
    }

    return false;
  });

  return breakpoint;
};

const initialState = {
  breakpoint: null
};

const setBreakpoint = (state, action) => {
  state.breakpoint = getCurBreakpoint();
};

export default createReducer(initialState, {
  [SET_BREAKPOINT]: setBreakpoint
});
