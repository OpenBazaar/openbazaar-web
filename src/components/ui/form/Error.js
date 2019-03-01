import React from 'react';
import './Error.scss';

const Error = props => {
  let errors = [];

  if (Array.isArray(props.error)) {
    errors = props.error.map(err =>
      typeof err === 'string' ? err : err.error);
  } else {
    errors = typeof  props.error === 'string' ?
      [props.error] : [props.error.error];
  }

  let error = null;

  if (errors.length) {
    error = <p className={`FormError ${props.clrClass}`}>{errors[0]}</p>;
    
    if (errors.length > 1) {
      error = (
        <ul className={`FormError ${props.clrClass}`}>
          {
            errors.map(err => (
              <li>{err}</li>
            ))
          }
        </ul>
      );
    }
  }

  return error;
}

export default Error;

// todo validate that props.error is string or array of strings
// or object with an error prop as a string or an array of objects
// with error props as a string.
Error.defaultProps = {
  error: [],
  clrClass: 'clrTErr',
}