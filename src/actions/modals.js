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
 * @param {object} props.Component - The component you want to render inside the
 *   modal.
 * @param {object} props.Component.modalProps - This should be implemented as a
 *   static getter if its a class, otherwise a property directly on the function if
 *   it's a functional component.
 * @param {string} props.Component.modalProps.path - The path to the Component
 *   on disk which ModalRoot will dynamically import. Since you're passing in the
 *   Component, it will already be in cache.
 * @param {string} props.Component.modalProps.modalProps - Default props that will
 *   be applied to all instances of your Component. They will be merged with any
 *   props passed into this action creator.
 * @param {string} props.Component.modalProps.rootClass - The class that will be
 *   applied to the ModalRoot element.
 * @param {string} [props.Component.modalProps.closeable=true] - Determines whether
 *   the modal is closeable via the user (close button and esc press). This setting
 *   overrides the closeableViaCloseButton and closeableViaEsc props.
 * @param {string} [props.Component.modalProps.closeableViaCloseButton=true] -
 *   Determines whether the modal is closeable via the close button. The close button
 *   will not be rendered if this value is false.
 * @param {string} [props.Component.modalProps.closeableViaEsc=true] - Determines
 *   whether the modal can be close via an Esc key press.
 *
 * @returns {string} - The ID of the opened modal. This will be necessary if you want to
 *   close a non-singleton modal.
 */
export const open = (props = {}) => (dispatch, getState) => {
  if (typeof props.Component !== 'function') {
    throw new Error('Please provide a Component.');
  }

  if (
    typeof props.Component.modalProps !== 'object' ||
    (typeof props.Component.modalProps.path !== 'string' ||
      !props.Component.modalProps.path)
  ) {
    throw new Error(
      'The component must implement a modalProps object as a static getter or ' +
        'a function property. At a minimum it must contain a path property ' +
        'as a string.'
    );
  }

  // todo: a more robust path validator..?
  if (props.Component.modalProps.path.includes(' ')) {
    throw new Error('The path should not contain any spaces.');
  }

  const modalProps = {
    rootClass: '',
    closeable: true,
    closeableViaCloseButton: true,
    closeableViaEsc: true,
    ...props.Component.modalProps,
    ...props
  };

  delete modalProps.Component;

  const curModal = getState().modals.openModals.find(
    modal =>
      singletonModals.includes(modalProps.path) &&
      modal.path === modalProps.path
  );

  const id = curModal ? curModal.id : uuidv4();

  dispatch({
    type: MODAL_OPEN,
    ...modalProps,
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
