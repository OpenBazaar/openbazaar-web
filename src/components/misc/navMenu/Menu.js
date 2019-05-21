import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Avatar from 'components/ui/Avatar';
import './NavMenu.scss';

let menuContainer;

const Menu = props => {
  menuContainer = menuContainer || document.getElementById('navMenuContainer');
  let avatarRow = null;
  const profile = props.profile;

  if (profile) {
    const userHref = `/${profile.peerID}`;
    avatarRow = (
      <li className="borderBottom clrBr flexVCent gutterH">
        <Avatar
          size="small"
          avatarHashes={profile.avatarHashes}
          href={`/${profile.peerID}`}
        />
        <Link
          to={userHref}
          onClick={() => props.onLinkClick({ href: userHref })}
        >
          {profile.name}
        </Link>
      </li>
    );
  }

  const loginLink = props.loggedIn ? (
    <div className="link" onClick={props.onLogoutClick}>
      Logout
    </div>
  ) : (
    <div className="link" onClick={props.onLoginClick}>
      Login
    </div>
  );

  const aboutHref = '/about';

  return ReactDOM.createPortal(
    <div className="NavMenu-Menu border pad tx4 clrP clrBr clrSh1">
      <ul className="unstyled padKids">
        {avatarRow}
        <li className="borderBottom clrBr">
          <Link
            to={aboutHref}
            onClick={() => props.onLinkClick({ href: aboutHref })}
          >
            About
          </Link>
        </li>
        <li>{loginLink}</li>
      </ul>
    </div>,
    menuContainer
  );
};

Menu.defaultProps = {
  onLinkClick: () => {}
};

Menu.propTypes = {
  onLinkClick: PropTypes.func,
  onLogoutClick: PropTypes.func,
  onLoginClick: PropTypes.func
};

export default Menu;
