import moment from 'moment';
import React from 'react';
import IosAlertOutline from 'react-ionicons/lib/IosAlertOutline';
import Avatar from 'components/ui/Avatar';
import Spinner from 'components/ui/Spinner';
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

  let timestampLine;

  if (props.sent) {
    timestampLine = moment(props.timestamp).fromNow();
  } else if (props.sending) {
    timestampLine = (
      <span className="clrT2"><Spinner size="small" /></span>
    );
  } else {
    // send error
    timestampLine = (
      <div className="flexHRight gutterHTn">
        <div className="icon clrTErr">
          <IosAlertOutline fontSize="12px" />
        </div>
        <button
          className="btnAsLink clrTErr"
          onClick={props.onRetryClick}
        >
          Retry
        </button>
        <div className="clrT2">|</div>
        <button className="btnAsLink clrTErr">Cancel</button>
      </div>
    )
  }

  timestampLine = (
    <div
      className={`clrT2 txTn ${
        !props.outgoing ? '' : 'flexHRight'
      }`}
    >{timestampLine}</div>
  );

  const messageStyle = !props.sent && !props.sending ?
    { opacity: 0.6 } : {};

  const msgText = (
    <div className="flexCol gutterVTn" style={{ marginTop: '5px' }}>
      <div className={props.outgoing ? 'flexHRight' : ''}>
        <div
          className="padSm border clrBr clrS"
          style={messageStyle}
        >
          {props.message}
        </div>
      </div>
      {timestampLine}
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
