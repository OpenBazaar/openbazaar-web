import React from 'react';
import PropTypes from 'prop-types';
import Spinner from 'components/ui/Spinner';
import 'styles/layout.scss';

/*
 * This is a button that will have a spinner in lui of the label when
 * isProcssing is true.
 */
const BtnSpinner = props => {
  const className = `BtnSpinner ${props.baseClassName} ${props.className}`;

  const btnContent = props.isProcessing ? (
    <span style={{ position: 'relative' }}>
      <span className="center">
        <Spinner size="small" />
      </span>
      <span className="BtnSpinner-label" style={{ visibility: 'hidden' }}>
        {props.children}
      </span>
    </span>
  ) : (
    props.children
  );

  return (
    <button
      className={className}
      onClick={props.onClick}
      onFocus={props.onFocus}
    >
      {btnContent}
    </button>
  );
};

export default BtnSpinner;

BtnSpinner.defaultProps = {
  baseClassName: 'btn',
  className: '',
  isProcessing: false
};

BtnSpinner.propTypes = {
  baseClassName: PropTypes.string,
  className: PropTypes.string,
  isProcessing: PropTypes.bool
};
