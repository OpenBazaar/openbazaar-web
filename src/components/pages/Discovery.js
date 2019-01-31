import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import './Discovery.scss';

class Discovery extends Component {
  render() {
    return (
      <div className="Discovery">
        Discover the sizzle in yo shizzle.
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    // modals: state.modals,
    // router: state.router
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // actions: {
    //   modals: bindActionCreators(ModalActions, dispatch)
    // }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Discovery);
