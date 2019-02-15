import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ModalActions from 'actions/modals';
import * as ResponsiveActions from 'actions/responsive';
import * as AppActions from 'actions/app';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import ModalRoot from 'components/modals/ModalRoot';
import Discovery from 'components/pages/Discovery';
import Modals from 'components/pages/modals/Modals';
import NavMenu from 'components/misc/navMenu/NavMenu';
import './App.scss';
import 'styles/layout.scss';
import 'styles/ui/buttons.scss';
import logo from 'img/ob-logo.png';

class App extends Component {
  constructor(props) {
    super(props);
    this.onNavMenuClick = this.onNavMenuClick.bind(this);
  }

  componentDidMount() {
    this.props.actions.responsive.trackBreakpoints();
  }

  onNavMenuClick() {
    const verb = this.props.app.navMenuOpen ?
      'close' : 'open';
    this.props.actions.app[`${verb}NavMenu`]();
  }

  render() {
    return (
      <div className="App" id="OBWEB">
        <header className="App-header">
          <nav className="flexVCent row gutterH">
            <Link to="/" className="App-logo-wrap">
              <img src={logo} className="App-logo" alt="logo" />
            </Link>
            <div class="flexExpand">
              <div className="flexHRight">
                <NavMenu
                  authUser={this.props.auth.authUser}
                  isOpen={this.props.app.navMenuOpen}
                  onClick={this.onNavMenuClick}
                  breakpoint={this.props.responsive.breakpoint}
                />
              </div>
            </div>
          </nav>
        </header>
        <div className="App-mainContent">
          <div>
            <Route
              exact
              path="/"
              component={Discovery}
            />
            <Route
              exact
              path="/modals"
              component={Modals}
            />            
          </div>
        </div>
        <div className="App-modalContainer">
          {this.props.modals.openModals.map(modal => (
            <ModalRoot key={modal.id} {...modal} />
          ))}
        </div>
        <div id="navMenuContainer"></div>
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    app: state.app,
    modals: state.modals,
    router: state.router,
    responsive: state.responsive,
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      app: bindActionCreators(AppActions, dispatch),
      modals: bindActionCreators(ModalActions, dispatch),
      responsive: bindActionCreators(ResponsiveActions, dispatch),
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
