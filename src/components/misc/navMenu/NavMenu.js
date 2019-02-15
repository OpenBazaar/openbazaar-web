import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as NavMenuActions from 'actions/navMenu';
import Menu from './Menu';
import Avatar from 'components/ui/Avatar';

let menuContainer;

class NavMenu extends Component {
  constructor(props) {
    super(props);
    this.triggerRef = React.createRef();
    this.handleAvatarClick = this.handleAvatarClick.bind(this);
    this.handleDocClick = this.handleDocClick.bind(this);
  }

  componentDidMount() {
    menuContainer = menuContainer || document.getElementById('navMenuContainer');
    document.addEventListener('click', this.handleDocClick);
    document.addEventListener('click', this.handleDocClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocClick);
  }

  handleAvatarClick(e) {
    const verb = this.props.menuOpen ?
      'close' : 'open';
    this.props.actions.navMenu[`${verb}Menu`]();
    e.nativeEvent.stopImmediatePropagation();
  }

  handleDocClick(e) {
    if (this.props.menuOpen &&
      e.target !== menuContainer &&
      !menuContainer.contains(e.target)) {
      this.props.actions.navMenu.closeMenu();
    }
  }

  render() {
    let trigger = null;

    if (this.props.auth.authUser) {
      trigger =
        <Avatar
          ref={this.triggerRef}
          size="medium"
          avatarHashes={this.props.auth.authUser.avatarHashes}
          onClick={this.handleAvatarClick} />;
    } else {
      // trigger = hamburger icon
    }

    let menu = null;

    if (this.props.menuOpen) {
      menu = (
        <Menu
          authUser={this.props.auth.authUser}
          breakpoint={this.props.responsive.breakpoint} />
      );
    } else {
      console.log('i am not not not open');
    }

    return (
      <div className="NavMenu charlie-chuckles">
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
    ...state.navMenu,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      navMenu: bindActionCreators(NavMenuActions, dispatch),
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavMenu);
