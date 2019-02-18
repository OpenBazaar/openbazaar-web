import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ModalActions from 'actions/modals';
import * as ResponsiveActions from 'actions/responsive';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import ModalRoot from 'components/modals/ModalRoot';
import Discovery from 'components/pages/Discovery';
import Modals from 'components/pages/modals/Modals';
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
            <div className="flexHRight">
              <div className="flexExpand">
                <button className="App-btnSettings iconBtn hide" />
              </div>
            </div>
          </nav>
        </header>
        <div className="App-mainContent">
          <div>
            <Route exact path="/" component={Discovery} />
            <Route exact path="/modals" component={Modals} />
          </div>
        </div>
        <div className="App-modalContainer">
          {this.props.modals.openModals.map(modal => (
            <ModalRoot key={modal.id} {...modal} />
          ))}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
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
