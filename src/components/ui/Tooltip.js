import React from 'react';
import { Tooltip as TippyTooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import './Tooltip.scss';

const Tooltip = props => {
  return (
    <TippyTooltip
      position="bottom"
      animation="fade"
      arrow="true"
      theme={`Tooltip ${props.tipClassName}`}
      {...props}
    >
      {props.children}
    </TippyTooltip>
  );
};

export default Tooltip;

Tooltip.defaultProps = {
  // all postfixed with -theme (ugh)
  tipClassName: 'clrP clrT clrBr clrSh1'
};
