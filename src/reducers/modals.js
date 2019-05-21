import { move } from 'util/array';
import { createReducer } from 'redux-starter-kit';
import { MODAL_OPEN, MODAL_CLOSE, MODAL_BRING_TO_TOP } from 'actions/modals';

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
export const singletonModals = ['components/modals/Test'];

const open = (state, action) => {
  let openModals = state.openModals;

  const curModal = openModals.find(
    modal =>
      (singletonModals.includes(action.path) && modal.path === action.path) ||
      modal.id === action.id
  );

  if (curModal) {
    state.openModals = state.openModals.filter(modal => modal !== curModal);
  }

  const modalData = { ...action };
  delete modalData.type;

  state.openModals.push({
    ...curModal,
    ...modalData
  });
};

const close = (state, action) => {
  state.openModals = state.openModals.filter(modal => modal.id !== action.id);
};

const bringToTop = (state, action) => {
  let modalIndex;
  state.openModals.find((modal, index) => {
    if (modal.id === action.id) {
      modalIndex = index;
      return true;
    }

    return false;
  });

  if (typeof modalIndex === 'number') {
    move(state.openModals, modalIndex, state.openModals.length);
  }
};

export default createReducer(initialState, {
  [MODAL_OPEN]: open,
  [MODAL_CLOSE]: close,
  [MODAL_BRING_TO_TOP]: bringToTop
});
