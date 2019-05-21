import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ModalActions from 'actions/modals';
import SimpleMessage from 'components/modals/SimpleMessage';
import UserContentLoading from 'components/misc/UserContentLoading';

class Modals extends Component {
  constructor(props) {
    super(props);
    this.handleSimpleModalClick = this.handleSimpleModalClick.bind(this);
    this.handleUserContentLoadingClick = this.handleUserContentLoadingClick.bind(
      this
    );
  }

  handleSimpleModalClick(e) {
    this.props.actions.modals.open({
      Component: SimpleMessage,
      title: 'Hey There Slick Willy',
      body:
        'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us'
    });
  }

  handleUserContentLoadingClick(e) {
    this.props.actions.modals.open({
      Component: UserContentLoading
    });
  }

  render() {
    return (
      <div className="Modals pageWidth pagePadTopBottom">
        <div className="flex gutterH">
          <button className="btn" onClick={this.handleSimpleModalClick}>
            Simple Modal
          </button>
          <button className="btn" onClick={this.handleUserContentLoadingClick}>
            User Content Loading Modal
          </button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    modals: state.modals
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
)(Modals);
