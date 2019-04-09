import React from 'react';
import FormError from 'components/ui/form/Error';

/**
 * Will map the given errors object to FormError components which
 * display the error(s). This is useful when rendering a form to be able
 * to render any FormError components above their corresponding field in
 * the UI.
 *
 * @param {string} errors - An error object in which each key is the name
 *   of the errored field and the corresponding data is an array containing
 *   a list of errors (can be string or an object with a string error key).
 * @param {object} errorProps - Any props you want passed into the resulting
 *   FormError components.
 * @return {object} An object keyed by fieldName where the corresponding
 *   data is a FormError component.
 */
export const mapErrorsToComponents = (errors, errorProps = {}) => {
  if (typeof errors !== 'object' || errors === null) return {};

  const components = {};

  Object.keys(errors).forEach(err => {
    console.log(errors[err]);
    components[err] = <FormError error={errors[err]} {...errorProps} />;
  });

  return components;
};
