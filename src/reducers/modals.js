import { createReducer } from 'redux-starter-kit';
import { OPEN_MODAL, CLOSE_MODAL } from 'actions/modals';

let openModals = [];

const initialState = {
  openModals
};

/*
 * Singleton modals will only allow one model per type to be opened. If you
 * attempt to open a singleton modal when one is already open, the existing one
 * will be brought to the top.
 *
 */
// todo: this should be paths to the modal
export const singletonModals = ['Login'];

const openModal = (state, action) => {
  let openModals = state.openModals;

  const curModal = openModals.find(
    modal =>
      singletonModals.includes(action.path) &&
      modal.path === action.path
  );

  if (curModal) {
    // bring to top
    // test this!
    state.openModals.filter(modal => modal !== curModal);
  }

  state.openModals.push({
    ...curModal,
    ...action
  });
};

// todo: test closing via different scenarios
// const closeModal = (state, action) =>
//   state.openModals.filter(modal => modal.id !== action.id);
const closeModal = (state, action) => {
  state.openModals = state.openModals.filter(modal => modal.id !== action.id);
}

export default createReducer(initialState, {
  [OPEN_MODAL]: openModal,
  [CLOSE_MODAL]: closeModal,
});
