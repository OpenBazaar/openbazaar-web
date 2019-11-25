import { getName } from 'models/profile';
import React from 'react';
import Avatar from 'components/ui/Avatar';

export default function(props) {
  const borderColor = props.selected ? 'clrBr3' : 'clrBr';
  const activeClass = props.selected ? 'active' : '';

  const unreadCount = props.unread ? (
    <div className="ChatHead-unreadCount">
      {props.unread > 99 ? '…' : props.unread}
    </div>
  ) : null;

  return (
    <div
      className={`ChatHead flexVCent gutterHSm ${activeClass}`}
      onClick={props.onClick}
    >
      <div className="flexNoShrink ChatHead-avatarWrap">
        {unreadCount}
        <Avatar
          size="medium"
          avatarHashes={props.profile ? props.profile.avatarHashes : null}
        />
      </div>
      <div className="flexExpand">
        <div
          className={`ChatHead-textContent flexVCent gutterHSm border padSm clrP ${borderColor}`}
        >
          <div className="ChatHead-name flexNoShrink clamp">
            {props.profile ? getName(props.profile) : props.peerID}
          </div>
          <div className="clamp flexExpand">{props.lastMessage}</div>
        </div>
      </div>
    </div>
  );
}
