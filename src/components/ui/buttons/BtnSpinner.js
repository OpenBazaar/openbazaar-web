import React from 'react';
import Spinner from 'components/ui/Spinner';
import 'styles/layout.scss';

const BtnSpinner = props => {
  const className =
    (
      `BtnSpinner ${props.baseClassName} ${props.className}` +
        (props.isProcessing ? 'processing' : '')
    ).trim();

  const btnContent = props.isProcessing ?
    <span style={{position: 'relative'}}>
      <span className="center">
        <Spinner size="small" />
      </span>
      <span
        className="BtnSpinner-label"
        style={{visibility: 'hidden'}}>{props.children}</span>
    </span> :
    props.children;

  return (
    <button className={className}>
      {btnContent}
    </button>
  )
}

export default BtnSpinner;

BtnSpinner.defaultProps = {
  baseClassName: 'btn',
  className: '',
  isProcessing: false,
};