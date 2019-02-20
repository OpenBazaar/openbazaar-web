import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ModalActions from 'actions/modals';
import * as ResponsiveActions from 'actions/responsive';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import ModalRoot from 'components/modals/ModalRoot';
import Discovery from 'components/pages/Discovery';
<<<<<<< HEAD
import Modals from 'components/pages/Modals';
import About from 'components/pages/About';
import NavMenu from 'components/misc/navMenu/NavMenu';
=======
import Modals from 'components/pages/modals/Modals';
>>>>>>> initial-skeleton
import './App.scss';
import 'styles/layout.scss';
import 'styles/ui/buttons.scss';
import logo from 'img/ob-logo.png';

class App extends Component {
  componentDidMount() {
    this.props.actions.responsive.trackBreakpoints();
  }

  render() {
    return (
      <div className="App" id="OBWEB">
        <header className="App-header">
          <nav className="flexVCent row gutterH">
            <Link to="/" className="App-logo-wrap">
              <img src={logo} className="App-logo" alt="logo" />
            </Link>
<<<<<<< HEAD
            <div className="flexExpand">
              <div className="flexHRight">
                <NavMenu />
=======
            <div className="flexHRight">
              <div className="flexExpand">
                <button className="App-btnSettings iconBtn hide" />
>>>>>>> initial-skeleton
              </div>
            </div>
          </nav>
        </header>
        <div className="App-mainContent">
          <div>
            <Route exact path="/" component={Discovery} />
            <Route exact path="/modals" component={Modals} />
<<<<<<< HEAD
            <Route exact path="/about" component={About} />
=======
>>>>>>> initial-skeleton
          </div>
        </div>
        <div className="App-modalContainer">
          {this.props.modals.openModals.map(modal => (
            <ModalRoot key={modal.id} {...modal} />
          ))}
        </div>
<<<<<<< HEAD
        <div id="navMenuContainer" />
=======
>>>>>>> initial-skeleton
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
<<<<<<< HEAD
    app: state.app,
=======
>>>>>>> initial-skeleton
    modals: state.modals,
    router: state.router,
    responsive: state.responsive
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
