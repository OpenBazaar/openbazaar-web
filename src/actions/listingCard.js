export const openListingDetail = (props = {}) => (dispatch, getState) => {
  window.history.pushState({}, '', `/listing/${props.hash}`);
};
