import moment from 'moment';
import React from 'react';
import Avatar from 'components/ui/Avatar';
import 'styles/layout.scss';
import 'styles/type.scss';

export default function(props) {
  const avatar = (
    <Avatar
      size="small"
      avatarHashes={props.avatarHashes || null}
      href={`/${props.peerId}`}
    />
  );

  const timestamp = (
    <div 
      className={`ChatMessage-timestamp clrT2 txTn ${!props.outgoing ? 'txRgt' : ''}`}>
      {moment().format()}
    </div>    
  );

  const msgText = (
    <div className="padSm border clrBr clrS flexCol gutterVSm">
      <div>{props.message}</div>
      {timestamp}
    </div>
  );

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
    <div className="ChatMessage">
      {msg}
    </div>
  )
}