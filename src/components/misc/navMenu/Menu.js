import React from 'react';
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom';
import Avatar from 'components/ui/Avatar';
// import MenuItem from './MenuItem';
import './NavMenu.scss';

let menuContainer;

export default function (props) {
  menuContainer = menuContainer || document.getElementById('navMenuContainer');
  const userHref = `/${props.authUser.peerID}`;
  const avatarRow = props.authUser ?
    (
      <li className="borderBottom clrBr flexVCent gutterH">
        <Avatar
          size="small"
          avatarHashes={props.authUser.avatarHashes}
          href={`/${props.authUser.peerID}`}
        />
        <Link
          to={userHref}
          onClick={() => props.onLinkClick({ href: userHref })}>
          {props.authUser.name}
        </Link>
      </li>
    ) :
    null;
  
  const loginLink = props.authUser ?
    <div className='link' onClick={props.onLogoutClick}>Logout</div> :
    <div className='link' onClick={props.onLoginClick}>Login</div>;

  const aboutHref = '/about';
  
  return ReactDOM.createPortal(
    (
      <div className="NavMenu-Menu border pad tx4 clrP clrBr clrSh1">
        <ul className="unstyled padKids">
          {avatarRow}
          <li className="borderBottom clrBr">
            <Link to={aboutHref} onClick={() => props.onLinkClick({ href: aboutHref })}>About</Link>
          </li>
          <li>{loginLink}</li>
        </ul>
      </div>
    ),
    menuContainer
  );
}