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
      href={`/${props.peerID}`}
    />
  );

  const timestamp = (
    <div
      className={`ChatMessage-timestamp clrT2 txTn ${
        !props.outgoing ? '' : 'flexHRight'
      }`}
    >
      {moment(props.timestamp).fromNow()}
    </div>
  );

  const msgText = (
    <div className="flexCol gutterVTn" style={{marginTop: '5px'}}>
      <div className={props.outgoing ? 'flexHRight' : ''}>
        <div className="padSm border clrBr clrS">{props.message}</div>
      </div>
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
    );
  } else {
    msg = (
      <div className="flex gutterHSm">
        <div className="flexNoShrink">{avatar}</div>
        {msgText}
      </div>
    );
  }

  return <div className="ChatMessage">{msg}</div>;
}
