import { createReducer } from 'redux-starter-kit';
import { SET_BREAKPOINT } from 'actions/responsive';

const breakpoints = {
  mobile:  320,
  tablet:  740,
  desktop: 980,
  wide:    1300,
};

const getCurBreakpoint = () => {
  let breakpoint = null;

  Object.keys(breakpoints).some(bp => {
    if (window.matchMedia(`(max-width: ${breakpoints[bp]}px)`).matches) {
      breakpoint = bp;
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
