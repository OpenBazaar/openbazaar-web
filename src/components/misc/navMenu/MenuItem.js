// The purpose of this component is so we could have common handlers on nav menu links.
import React from 'react';

export default function (props) {
  return (
    <span
      className={`NavMenu-MenuItem ${props.moreClass || ''}`}
      onClick={props.onClick}>
      {props.children}
    </span>
  );
}
