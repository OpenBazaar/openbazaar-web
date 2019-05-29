import React from 'react';
import Avatar from 'components/ui/Avatar';
import 'styles/layout.scss';

export default function(props) {
  const avatar = (
    <Avatar
      size="small"
      avatarHashes={props.avatarHashes || null}
      href={`/${props.peerId}`}
    />
  );

  const msgText = <div className="padSm border clrBr clrS">{props.message}</div>;

  let msg;

  if (props.outgoing) {
    msg = (
      <div className="flex gutterHSm">
        <div className="flexExpand">&nbsp;</div>
        {msgText}
        <div className="flexNoShrink">{avatar}</div>
      </div>
    )
  } else {
    msg = (
      <div className="flex gutterHSm">
        <div className="flexNoShrink">{avatar}</div>
        {msgText}
      </div>
    )    
  }

  return (
    <div className="Chat-Message">
      {msg}
    </div>
  )
}