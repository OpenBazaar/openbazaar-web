import React from 'react';
import Menu from './Menu';
import Avatar from 'components/ui/Avatar';

export default function (props) {
  let trigger = null;

  if (props.authUser) {
    trigger = <Avatar
      size="medium"
      avatarHashes={props.authUser.avatarHashes}
      onClick={props.onClick} />;
  } else {
    // trigger = hamburger icon
  }

  let menu = null;

  if (props.isOpen) {
    menu = <Menu />;
  }

  return (
    <div className="NavMenu charlie-chuckles">
      {trigger}
      {menu}
    </div>
  );
}