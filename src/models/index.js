// Errors Codes - these are for common errors. Error specific to a model
// can be declared in their own file, likely the model file.
export const ERROR_FORM_REQUIRED_FIELD = 'ERROR_FORM_REQUIRED_FIELD';
export const ERROR_FORM_INVALID_TYPE = 'ERROR_FORM_INVALID_TYPE';

/**
 * Use to build an error object where the key is the fieldName and data
 * it maps to is an array of strings or objects containing error
 * information.
 *
 * @param {string} fieldName - The name of field which has an error
 * @param {string|object} fieldError - This should be a string with
 *   an error message or an object with an error key containing the
 *   error message. Of course, the object could have other data as well,
 *   for example, an error code.
 * @param {object} errors - An object to which the new error will be added.
 *   If the key already exists in the object (and it should have an array),
 *   then the new error will be pushed to it. Otherwise, the key will be
 *   returned with a single element Array containing the given error.
 * @return {object} The given errors object with the new error infused.
 */
export const addError = (fieldName, fieldError, errors = {}) => {
  if (typeof fieldName !== 'string' || !fieldName) {
    throw new Error('Please provide a feildName as a non-empty string.');
  }

  if (
    (typeof fieldError !== 'object' && typeof fieldError !== 'string') ||
    !fieldError
  ) {
    // TODO: also check in the case of an object that it has a
    // non-empty string error key.
    throw new Error(
      'An fieldError must be provided as a non-empty string or ' +
        'as an object.'
    );
  }

  if (typeof errors !== 'object') {
    throw new Error('If provided, the errorData must be an object.');
  }

  errors[fieldName] = errors[fieldName] || [];
  errors[fieldName].push(fieldError);

  return errors;
};

/**
 * Used to build an error for a missing required field.
 *
 * @param {string} fieldName - The name of field which has an error
 * @param {object} errors - An object to which the new error will be added.
 *   If the key already exists in the object (and it should have an array),
 *   then the new error will be pushed to it. Otherwise, the key will be
 *   returned with a single element Array containing the given error.
 * @return {object} The given errors object with the new error infused.
 */
export const addRequiredError = (fieldName, errors) => {
  return addError(
    fieldName,
    {
      code: ERROR_FORM_REQUIRED_FIELD,
      error: 'Please provide a value.'
    },
    errors
  );
};

/**
 * Used to build an error for a field with data not in the expected type.
 *
 * @param {string} fieldName - The name of field which has an error
 * @param {string} type - The types the field is expected to be in. This is
 *   really just used cosmetically to be able to include the expected type(s)
 *   in the error message.
 * @param {object} errors - An object to which the new error will be added.
 *   If the key already exists in the object (and it should have an array),
 *   then the new error will be pushed to it. Otherwise, the key will be
 *   returned with a single element Array containing the given error.
 * @return {object} The given errors object with the new error infused.
 */
export const addInvalidTypeError = (fieldName, type, errors) => {
  const error = Array.isArray(type)
    ? `The value must be of one of the following types: ${type}`
    : `The value must be of type ${type}.`;
  return addError(
    fieldName,
    {
      code: ERROR_FORM_INVALID_TYPE,
      error
    },
    errors
  );
};
