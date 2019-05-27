import { getPoly } from 'util/polyglot';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ChatActions from 'actions/chat';
import { getConvos } from 'reducers/chat';
import IosClose from 'react-ionicons/lib/IosClose';
import ChatHead from 'components/chat/ChatHead';
import ChatConvo from 'components/chat/ChatConvo';
import './Chat.scss';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleRetryConvosClick = this.handleRetryConvosClick.bind(this);
    this.handleChatHeadClick = this.handleChatHeadClick.bind(this);
    this.handleConvoCloseClick = this.handleConvoCloseClick.bind(this);
  }

  componentDidMount() {
    if (!this.props.activeConvo && this.props.convos.length) {
      this.activateFirstConvo();
    }

    this.props.actions.convosRequest();
  }

  componentDidUpdate(prevProps) {
    if (
      (
        !prevProps.convos ||
        !prevProps.convos.length
      ) &&
      !this.props.activeConvo) {
      this.activateFirstConvo();
    }
  }

  handleRetryConvosClick() {
    this.props.actions.convosRequest();
  }

  handleCloseClick() {
    this.props.actions.close();
  }

  handleChatHeadClick(peerId) {
    this.props.actions.activateConvo(peerId);
  }

  handleConvoCloseClick() {
    this.props.actions.deactivateConvo();
  }

  activateFirstConvo() {
    if (this.props.convos && this.props.convos.length) {
      this.props.actions.activateConvo(this.props.convos[0].peerId);
    }
  }

  render() {
    let convos = null;

    if (this.props.convosFetchFailed) {
      convos = (
        <div className="row">
          <div className="clrTErr row">
            {
              this.props.convosFetchError ?
                getPoly().t('chat.fetchConvosError', { error: this.props.convosFetchError }) :
                getPoly().t('chat.fetchConvosErrorGeneric')
            }
          </div>
          <div className="txCtr">
            <button className="btn clrP" onClick={this.handleRetryConvosClick}>
              {getPoly().t('chat.btnRetryConvos')}
            </button>
          </div>
        </div>
      );
    } else {
      convos = (
        <div className="gutterVSm">
          {
            this.props.convos
              // .concat(this.props.convos)
              // .concat(this.props.convos)
              // .concat(this.props.convos)
              // .concat(this.props.convos)
              // .concat(this.props.convos)
              // .concat(this.props.convos)
              // .concat(this.props.convos)
              .map(convo => {
                const selected =
                  this.props.activeConvo &&
                  this.props.activeConvo.peerId=== convo.peerId;

                return (
                  <ChatHead {...convo}
                    key={convo.peerId}
                    selected={selected}
                    onClick={() => this.handleChatHeadClick(convo.peerId)}
                  />
                );
              })
          }
        </div>        
      );
    }

    let chatConvo;

    if (this.props.activeConvo) {
      chatConvo = (
        <ChatConvo
          {...this.props.activeConvo}
          onClick={this.handleConvoCloseClick}
        />
      );
    }

    const chatConvoWrapClass = this.props.activeConvo ?
      'Chat-chatConvoWrap open' : 'Chat-chatConvoWrap';

    return (
      <div className="Chat tx6">
        <button
          className="Chat-btnClose border clrBr clrP"
          onClick={this.handleCloseClick}
        >
          <IosClose fontSize="30px" />
        </button>
        <div className="Chat-chatHeads border padSm clrBr clrP">{convos}</div>
        <div className={chatConvoWrapClass}>
          {chatConvo}
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
