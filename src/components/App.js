import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ModalActions from 'actions/modals';
import * as ResponsiveActions from 'actions/responsive';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import ModalRoot from 'components/modals/ModalRoot';
import Discovery from 'components/pages/Discovery';
import Modals from 'components/pages/Modals';
import About from 'components/pages/About';
import NavMenu from 'components/misc/navMenu/NavMenu';
import Onboarding from 'components/onboarding/Onboarding';
import './App.scss';
import 'styles/layout.scss';
import 'styles/ui/buttons.scss';
import logo from 'img/ob-logo.png';

class App extends Component {
  componentDidMount() {
    this.props.actions.responsive.trackBreakpoints();
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.needOnboarding && !prevProps.auth.needOnboarding) {
      this.props.actions.modals.open({ Component: Onboarding });
    }
  }

  render() {
    return (
      <div className="App" id="OBWEB">
        <header className="App-header">
          <nav className="flexVCent row gutterH">
            <Link to="/" className="App-logo-wrap">
              <img src={logo} className="App-logo" alt="logo" />
            </Link>
            <div className="flexExpand">
              <div className="flexHRight">
                <NavMenu />
              </div>
            </div>
          </nav>
        </header>
        <div className="App-mainContent">
          <div>
            <Route exact path="/" component={Discovery} />
            <Route exact path="/modals" component={Modals} />
            <Route exact path="/about" component={About} />
          </div>
        </div>
        <div className="App-modalContainer">
          {this.props.modals.openModals.map(modal => (
            <ModalRoot key={modal.id} {...modal} />
          ))}
        </div>
        <div id="navMenuContainer" />
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
      modals: bindActionCreators(ModalActions, dispatch),
      responsive: bindActionCreators(ResponsiveActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
