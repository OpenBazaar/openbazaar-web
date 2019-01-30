import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ModalActions from 'actions/modals';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import ModalRoot from 'components/modals/ModalRoot';
import SimpleMessage from 'components/modals/SimpleMessage';
import 'App.scss';
import 'styles/layout.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.speakInputRef = React.createRef();
    this.handleFartClick = this.handleFartClick.bind(this);
  }

  handleFartClick() {
    this.props.actions.modals.open({
      Component: SimpleMessage,
      title: 'You smell',
      body: "You smell like hell Jerry! Why don't you work on that player!?"
    });
  }
  render() {
    const pathname =
      this.props.router.location && this.props.router.location.pathname;

    return (
      <div className="App">
        <header className="App-header">
          <nav className="flexVCent row gutterH">
            <Link to="/" className={pathname === '/' ? 'active' : ''}>
              Home
            </Link>
            <Link to="/about" className={pathname === '/about' ? 'active' : ''}>
              About
            </Link>
          </nav>
        </header>
        <div className="App-mainContent">
          <div className="row flexCent gutterH">
            <input type="text" ref={this.speakInputRef} />
            <button onClick={this.handleSpeakClick}>Speak it punk</button>
            <button onClick={this.handleFartClick}>Fart it out</button>
          </div>
          <div>
            <Route
              exact
              path="/"
              component={() => <div>say you. say me.</div>}
            />
            <Route
              path="/profile"
              component={() => <div>Charlie chuckles.</div>}
            />
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
    router: state.router
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      modals: bindActionCreators(ModalActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
