import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as CharlieActions from 'actions/charlie';
import * as ModalActions from 'actions/modals';
import ModalRoot from 'components/modals/ModalRoot';
import SimpleMessage from 'components/modals/SimpleMessage';
import Test from 'components/modals/Test';
import 'App.scss';
import 'styles/layout.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.speakInputRef = React.createRef();
    this.handleSpeakClick = this.handleSpeakClick.bind(this);
    this.handleFartClick = this.handleFartClick.bind(this);
  }

  handleFartClick() {
    const sm = this.props.actions.modals.open({
      Component: SimpleMessage,
      title: 'You smell',
      body: 'You smell like hell Jerry! Why don\'t you work on that player!?',
    });

    const test = this.props.actions.modals.open({
      Component: Test,
      title: 'You smell big filly',
      body: 'You smell like hell Jerry! Why don\'t you work on that player!?',
    });

    const test2 = this.props.actions.modals.open({
      Component: Test,
      title: 'You smell big filly 22222',
      body: 'You smell like hell Jerry! Why don\'t you work on that player!?',
    });    

    setTimeout(() => {
      this.props.actions.modals.close({ path: Test.modulePath });
    }, 2000);
  }

  handleSpeakClick() {
    const val = this.speakInputRef.current.value;
    this.props.actions.charlie.speakAction({ text: val });
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
        <div>{this.props.charlie.response}</div>
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
    charlie: state.charlie,
    modals: state.modals,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      charlie: bindActionCreators(CharlieActions, dispatch),
      modals: bindActionCreators(ModalActions, dispatch),
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
