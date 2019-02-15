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
    console.log('i am open');
    menu = (
      <Menu
        authUser={props.authUser}
        breakpoint={props.breakpoint} />
    );
  } else {
    console.log('i am not not not open');
  }

  return (
    <div className="NavMenu charlie-chuckles">
      {trigger}
      {menu}
    </div>
  );
}