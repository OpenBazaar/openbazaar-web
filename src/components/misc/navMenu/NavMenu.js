import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as NavMenuActions from 'actions/navMenu';
import * as AuthActions from 'actions/auth';
import * as ModalActions from 'actions/modals';
import Menu from './Menu';
import Avatar from 'components/ui/Avatar';
import Login from 'components/auth/Login';
import '../../../styles/theme.scss';

let menuContainer;

class NavMenu extends Component {
  constructor(props) {
    super(props);
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleDocClick = this.handleDocClick.bind(this);
    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
  }

  componentDidMount() {
    menuContainer =
      menuContainer || document.getElementById('navMenuContainer');
    document.addEventListener('click', this.handleDocClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocClick);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.router.location.pathname !== this.props.router.location.pathname
    ) {
      this.props.actions.navMenu.closeMenu();
    }
  }

  handleTriggerClick(e) {
    const verb = this.props.menuOpen ? 'close' : 'open';
    this.props.actions.navMenu[`${verb}Menu`]();
    e.nativeEvent.stopImmediatePropagation();
  }

  handleDocClick(e) {
    if (
      this.props.menuOpen &&
      e.target !== menuContainer &&
      !menuContainer.contains(e.target)
    ) {
      this.props.actions.navMenu.closeMenu();
    }
  }

  handleLoginClick() {
    // this.props.actions.auth.login();
    this.props.actions.modals.open({ Component: Login });
    this.props.actions.navMenu.closeMenu();
  }

  handleLogoutClick() {
    this.props.actions.auth.logout();
    this.props.actions.navMenu.closeMenu();
  }

  handleLinkClick(e = {}) {
    if (e.href && e.href === this.props.router.location.pathname) {
      this.props.actions.navMenu.closeMenu();
    }
  }

  render() {
    let trigger = null;

    if (this.props.auth.profile) {
      trigger = (
        <Avatar
          size="medium"
          avatarHashes={this.props.auth.profile.avatarHashes}
          onClick={this.handleTriggerClick}
        />
      );

      if (
        this.props.navMenu.menuOpen &&
        this.props.responsive.breakpoint === 'mobile'
      ) {
        trigger = (
          <button
            className="link NavMenu-trigger NavMenu-closeIcon"
            onClick={this.handleTriggerClick}
          >
            <span role="img" aria-label="close navigation menu">
              ❌
            </span>
          </button>
        );
      }
    } else {
      trigger = (
        <button
          className="link NavMenu-trigger NavMenu-hamburgerIcon"
          onClick={this.handleTriggerClick}
        />
      );
    }

    let menu = null;

    if (this.props.menuOpen) {
      menu = (
        <Menu
          loggedIn={this.props.auth.loggedIn}
          profile={this.props.auth.profile}
          breakpoint={this.props.responsive.breakpoint}
          onLoginClick={this.handleLoginClick}
          onLogoutClick={this.handleLogoutClick}
          onLinkClick={this.handleLinkClick}
        />
      );
    }

    return (
      <div className="NavMenu">
        {trigger}
        {menu}
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    auth: state.auth,
    responsive: state.responsive,
    router: state.router,
    navMenu: state.navMenu,
    ...state.navMenu
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      navMenu: bindActionCreators(NavMenuActions, dispatch),
      auth: bindActionCreators(AuthActions, dispatch),
      modals: bindActionCreators(ModalActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavMenu);
