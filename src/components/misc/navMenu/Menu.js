import React from 'react';
import ReactDOM from 'react-dom'
import Avatar from 'components/ui/Avatar';
import './NavMenu.scss';

let menuContainer;

export default function (props) {
  menuContainer = menuContainer || document.getElementById('navMenuContainer');
  let avatarRow = props.authUser && props.breakpoint !== 'mobile' ?
    (
      <li className="flexVCent gutterH borderBottom clrBr">
        <Avatar
          size="small"
          avatarHashes={props.authUser.avatarHashes}
          href={`/${props.authUser.peerID}`}
        />
        <a href={`/${props.authUser.peerID}`}>{props.authUser.name}</a>
      </li>
    ) :
    null;


  
  return ReactDOM.createPortal(
    (
      <div className="NavMenu-menu border pad tx4 clrP clrBr clrSh1">
        <ul className="unstyled padKids">
          {avatarRow}
          <li className="borderBottom clrBr">
            <a href="/about">About</a>
          </li>
          <li>Logout</li>
        </ul>
      </div>
    ),
    menuContainer
  );
}