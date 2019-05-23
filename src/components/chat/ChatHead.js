import React from 'react';
import Avatar from 'components/ui/Avatar';

export default function(props) {
  return (
    <div className="ChatHead flexVCent gutterHSm">
      <div className="flexNoShrink">
        <Avatar
          size="medium"
          avatarHashes={props.avatarHashes}
        />
      </div>
      <div className="flexExpand">
        <div className="ChatHead-textContent flexVCent gutterHSm border padSm clrBr clrP">
          <div className="ChatHead-name flexNoShrink clamp">{props.name}</div>
          <div className="clamp flexExpand">{props.lastMessage}</div>
        </div>
      </div>
    </div>
  );
}