import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ChatActions from 'actions/chat';
import { getConvos } from 'reducers/chat';
import IosClose from 'react-ionicons/lib/IosClose';
import ChatHead from 'components/chat/ChatHead';
import './Chat.scss';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  componentDidMount() {
    this.props.actions.convosRequest();
  }

  handleCloseClick() {
    this.props.actions.close();
  }

  render() {
    return (
      <div className="Chat tx6">
        <button
          className="Chat-btnClose border clrBr clrP"
          onClick={this.handleCloseClick}
        >
          <IosClose fontSize="30px" />
        </button>
        <div className="Chat-chatHeads border padSm clrBr clrP">
          <div className="gutterVSm">
            {
              this.props.convos
                .concat(this.props.convos)
                .concat(this.props.convos)
                .concat(this.props.convos)
                .concat(this.props.convos)
                .concat(this.props.convos)
                .concat(this.props.convos)
                .concat(this.props.convos)
                .map(convo => <ChatHead {...convo} key={convo.peerId} />)
            }
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    ...state.chat,
    convos: getConvos(state.chat),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators(ChatActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat);

// export default Chat;
