import uuidv4 from 'uuid/v4';
import { singletonModals } from 'reducers/modals';

export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';

/*
 * Will open a modal with the given props.
 *
 * @param {object} props - The props the modal will be created with or set with if
 *   it's an already open singleton modal.
 * @param {object} props.Component - The component you want to render inside the modal. The
 *   component must implement a modulePath property, which should be a static getter if its
 *   a class, otherwise a property direectly on the function if it's a functional component.
 *
 * @returns {string} - The ID of the opened modal. This will be necessary if you want to
 *   close a non-singleton modal.
 */
export const open = (props = {}) => (dispatch, getState) => {
  if (typeof props.Component !== 'function') {
    throw new Error('Please provide a Component.');
  }

  if (typeof props.Component.modulePath !== 'string' ||
    !props.Component.modulePath.length) {
    throw new Error('The component must implement a modulePath as a static getter or ' +
      'a function property.');
  }

  if (props.Component.modulePath.includes(' ')) {
    throw new Error('The modulePath should not contain any spaces.');
  }  

  const curModal = getState().modals.openModals.find(
    modal =>
      singletonModals.includes(props.modalType) &&
      modal.modalType === props.modalType
  );

  const id = curModal ? curModal.id : uuidv4();
  const actionProps = {
    ...props,
    path: props.Component.modulePath,
  };
  delete actionProps.Component;

  dispatch({
    type: OPEN_MODAL,
    ...actionProps,
    id,
  });

  return id;
};

/*
 * Will close a modal.
 *
 * @param {object} options - You must provide either the id or path.
 * @param {string} [options.id] - The id of the modal to close. This should be used
 *   for non-singleton modals.
 * @param {string} [options.path] - The path of the modal to close. This should be
 *   used for singleton modals.
 */
export const close = (options = {}) => (dispatch, getState) => {
  const action = {
    type: CLOSE_MODAL,
  }

  if (
    (!options.path && !options.id) ||
    (
      typeof options.path !== 'string' &&
      typeof options.id !== 'string'
    )
  ) {
    throw new Error('One of options.id or options.path must be provided ' +
      'and the variable must be of type string.');
  }

  if (options.id) {
    dispatch({
      ...action,
      id: options.id,
    });
  } else {
    const id = getState().openModals.find(modal => modal.path = options.path);

    if (id) {
      dispatch({
      ...action,
      id,
      });
    }
  }
};

// todo: bring to top
