import React from 'react';
import IosClose from 'react-ionicons/lib/IosClose';
// import Avatar from 'components/ui/Avatar';

export default function(props) {
  return (
    <div className="ChatConvo pad clrP border clrBr">
      <div className="row">
        <div className="flexExpand"></div>
        <button
          className="btn ChatConvo-btnClose clrP"
          onClick={props.onClick}
        >
          <IosClose fontSize="22px" />
        </button>
      </div>
      {JSON.stringify(props)}
    </div>
  );
}