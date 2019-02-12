import uuidv4 from 'uuid/v4';
import { singletonModals } from 'reducers/modals';

export const MODAL_OPEN = 'OPEN_MODAL';
export const MODAL_CLOSE = 'CLOSE_MODAL';
export const MODAL_BRING_TO_TOP = 'MODAL_BRING_TO_TOP';

/*
 * Will open a modal with the given props.
 *
 * @param {object} props - The props the modal will be created with or set with if
 *   it's an already open singleton modal.
 * @param {object} props.Component - The component you want to render inside the modal. The
 *   component must implement a modulePath property, which should be a static getter if its
 *   a class, otherwise a property directly on the function if it's a functional component.
 *   (The reason we're forcing this in is because we want the modal opener to have to import
 *    the component so the ModalRoot gets it from cache rather than forcing it to always
 *    be lazy-loaded. This way the modal opener or something higher up can determine what
 *    chunk it's ending up in.)
 *
 * @returns {string} - The ID of the opened modal. This will be necessary if you want to
 *   close a non-singleton modal.
 */
export const open = (props = {}) => (dispatch, getState) => {
  if (typeof props.Component !== 'function') {
    throw new Error('Please provide a Component.');
  }

  if (
    typeof props.Component.modulePath !== 'string' ||
    !props.Component.modulePath.length
  ) {
    throw new Error(
      'The component must implement a modulePath as a static getter or ' +
        'a function property.'
    );
  }

  if (props.Component.modulePath.includes(' ')) {
    throw new Error('The modulePath should not contain any spaces.');
  }

  const path = props.Component.modulePath;
  const curModal = getState().modals.openModals.find(
    modal => singletonModals.includes(path) && modal.path === path
  );

  const id = curModal ? curModal.id : uuidv4();
  const actionProps = {
    ...props,
    path
  };
  delete actionProps.Component;

  dispatch({
    type: MODAL_OPEN,
    ...actionProps,
    id
  });

  return id;
};

/*
 * When you have a method that needs to target a modal, it will need either an
 * id (for non-singleton modals) or a path (for singleton modals). This function
 * will check that at least one is provided and in the correct format.
 *
 * @param {object} options - You must provide either the id or path.
 * @param {string} [options.id] - The id of the modal to close. This should be used
 *   for non-singleton modals.
 * @param {string} [options.path] - The path of the modal to close. This should be
 *   used for singleton modals.
 */
const checkOptsTargettingModal = (options = {}) => {
  if (
    (!options.path && !options.id) ||
    (typeof options.path !== 'string' && typeof options.id !== 'string')
  ) {
    throw new Error(
      'One of options.id or options.path must be provided ' +
        'and the variable must be of type string.'
    );
  }
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
    type: MODAL_CLOSE
  };

  checkOptsTargettingModal(options);

  if (options.id) {
    dispatch({
      ...action,
      id: options.id
    });
  } else {
    if (!singletonModals.includes(options.path)) {
      throw new Error(
        'Only singleton modals should be closed via the path. Use the id ' +
          'instead.'
      );
    }

    const modal = getState().modals.openModals.find(
      modal => modal.path === options.path
    );

    if (modal) {
      dispatch({
        ...action,
        id: modal.id
      });
    }
  }
};

/*
 * Will bring a modal to the top of the stack.
 *
 * @param {object} options - You must provide either the id or path.
 * @param {string} [options.id] - The id of the modal to close. This should be used
 *   for non-singleton modals.
 * @param {string} [options.path] - The path of the modal to close. This should be
 *   used for singleton modals.
 */
export const bringToTop = (options = {}) => (dispatch, getState) => {
  const action = {
    type: MODAL_BRING_TO_TOP
  };

  checkOptsTargettingModal(options);

  if (options.id) {
    dispatch({
      ...action,
      id: options.id
    });
  } else {
    const id = getState().openModals.find(modal => (modal.path = options.path));

    if (id) {
      dispatch({
        ...action,
        id
      });
    }
  }
};
