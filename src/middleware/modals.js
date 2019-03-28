// TODO: Is this file needed?
// TODO: Is this file needed?
// TODO: Is this file needed?
// TODO: Is this file needed?
// TODO: Is this file needed?
import {
  MODAL_CLOSE,
  MODAL_CLOSED,
} from 'actions/modals';

export const modalClose = store => next => action => {
  const nextAction = next(action);
  const openModalsAfter = store.getState().models.openModals;

  if (
    action.type === MODAL_CLOSE &&
    !openModalsAfter.find(modal => modal.id === action.id)
  ) {
    store.dispatch({
      type: MODAL_CLOSED,
      id: action.id,
    });    
  }

  return nextAction;
};