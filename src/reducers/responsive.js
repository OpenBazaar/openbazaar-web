import { createReducer } from 'redux-starter-kit';
import { SET_BREAKPOINT } from 'actions/responsive';

const breakpoints = {
  mobile:  320,
  tablet:  740,
  desktop: 980,
  wide:    1300,
};

let sortedBreakpoints;

const getSortedBreakpoints = () => {
  if (!sortedBreakpoints) {
    sortedBreakpoints = Object.keys(breakpoints)
      .map(key => ({
        size: breakpoints[key],
        breakpoint: key,
      }))
      .sort((a, b) => {
        if (a.size > b.size)
          return -1;
        if (a.size < b.size)
          return 1;
        return 0;
      });
  }

  return sortedBreakpoints;
}

const getCurBreakpoint = () => {
  const width = window.innerWidth * window.devicePixelRatio;
  const bps = getSortedBreakpoints();
  let breakpoint = null;

  bps.some(bp => {
    if (width >= bp.size) {
      breakpoint = bp.breakpoint;
      return true;
    }

    return false;
  });

  return breakpoint;
}

const initialState = {
  breakpoint: null,
}

const setBreakpoint = (state, action) => { state.breakpoint = getCurBreakpoint() }

export default createReducer(initialState, {
  [SET_BREAKPOINT]: setBreakpoint,
});
