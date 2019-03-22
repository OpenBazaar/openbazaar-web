import React from 'react';
import FormError from 'components/ui/form/Error';

export const ERROR_FORM_REQUIRED_FIELD = 'ERROR_FORM_REQUIRED_FIELD';
export const ERROR_FORM_INVALID_TYPE = 'ERROR_FORM_INVALID_TYPE';

// todo: doc me up joe.
// error should be fieldError
export const addError = (fieldName, error, errors = {}) => {
  if (typeof fieldName !== 'string' || !fieldName) {
    throw new Error('Please provide a feildName as a non-empty string.');
  }

  if ((typeof error !== 'object' && typeof error !== 'string') || !error) {
    throw new Error(
      'An error must be provided as a non-empty string or ' + 'as an object.'
    );
  }

  if (typeof errors !== 'object') {
    throw new Error('If provided, the errorData must be an object.');
  }

  errors[fieldName] = errors[fieldName] || [];
  errors[fieldName].push(error);

  return errors;
};

// todo doc and validate args
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

// todo doc and validate args
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

// todo doc and validate args
export const mapErrorsToComponents = (errors, errorProps = {}) => {
  if (typeof errors !== 'object' || errors === null) return {};

  const components = {};

  Object.keys(errors).forEach(err => {
    components[err] = <FormError error={errors[err]} {...errorProps} />;
  });

  return components;
};
