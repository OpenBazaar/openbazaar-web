import React from 'react';
import PropTypes from 'prop-types';
import './Error.scss';

/*
 * Will render an error or list of errors. The error can be passed in
 * as a string or an object which contains an error key containing a
 * string error.
 */
const FormError = props => {
  let errors = [];

  if (Array.isArray(props.error)) {
    errors = props.error.map(err =>
      typeof err === 'string' ? err : err.error
    );
  } else if (props.error) {
    errors =
      typeof props.error === 'string' ? [props.error] : [props.error.error];
  }

  let error = null;

  if (errors.length) {
    error = (
      <ul className={`FormError ${props.clrClass}`}>
        {errors.map((err, index) => (
          <li key={index}>{err}</li>
        ))}
      </ul>
    );
  }

  return error;
};

export default FormError;

FormError.defaultProps = {
  error: [],
  clrClass: 'clrTErr'
};

FormError.propTypes = {
  clrClass: PropTypes.string,
  error: function(props, propName, componentName) {
    if (typeof props[propName] === 'undefined') return;

    if (
      typeof props[propName] !== 'string' &&
      !Array.isArray(props[propName])
    ) {
      return new Error('error must be provided as a string or an array');
    }

    if (Array.isArray(props[propName])) {
      try {
        props[propName].forEach(err => {
          if (
            typeof err !== 'string' &&
            typeof err !== 'object' &&
            typeof err.error !== 'string'
          ) {
            throw new Error(
              'If providing an array, each item must be either ' +
                'a string or an object containing an "error" key as a string.'
            );
          }
        });
      } catch (e) {
        return e;
      }
    }
  }
};
