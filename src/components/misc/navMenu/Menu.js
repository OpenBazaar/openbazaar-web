import React from 'react';
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom';
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
        <Link to={`/${props.authUser.peerID}`}>{props.authUser.name}</Link>
      </li>
    ) :
    null;


  
  return ReactDOM.createPortal(
    (
      <div className="NavMenu-menu border pad tx4 clrP clrBr clrSh1">
        <ul className="unstyled padKids">
          {avatarRow}
          <li className="borderBottom clrBr">
            <Link to="/about">About</Link>
          </li>
          <li>Logout</li>
        </ul>
      </div>
    ),
    menuContainer
  );
}