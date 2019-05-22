import React, { Component } from 'react';
// import { connect } from 'react-redux';
import './Chat.scss';

class Chat extends Component {
  // constructor(props) {
  //   super(props);
  //   this.handleRetryClick = this.handleRetryClick.bind(this);
  // }

  render() {
    return (
      <div className="Chat">
        I am a fat ass chat burger.
      </div>
    );
  }
}

// function mapStateToProps(state, prop) {
//   return {
//     chat: state.chat,
//   };
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     actions: {
//       discovery: bindActionCreators(DiscoverActions, dispatch)
//     }
//   };
// }

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(Chat);

export default Chat;
