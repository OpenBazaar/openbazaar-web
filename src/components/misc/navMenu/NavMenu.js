import React from 'react';
import Menu from './Menu';

export default function (props) {
  let trigger = null;

  if (props.authUser) {
    
  } else {
    // trigger = hamburger icon
  }

  let menu = null;

  if (props.isOpen) {
    menu = <Menu />;
  }

  return {
    <div className="NavMenu">

      {Menu}
    </div>
  }
}