import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ModalActions from 'actions/modals';
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
      body: 'You smell like hell Jerry! Why don\'t you work on that player!?',
    });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Welcome Slick Willy</h1>
        </header>
        <div className="row flexCent gutterH">
          <input type="text" ref={this.speakInputRef} />
          <button onClick={this.handleSpeakClick}>Speak it punk</button>
          <button onClick={this.handleFartClick}>Fart it out</button>
        </div>
        <div className="App-modalContainer">
          {this.props.modals.openModals.map(modal =>
            <ModalRoot key={modal.id} {...modal} />)}
        </div>        
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    modals: state.modals,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      modals: bindActionCreators(ModalActions, dispatch),
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
