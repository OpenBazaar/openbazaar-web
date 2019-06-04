import { getPoly } from 'util/polyglot';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ChatActions from 'actions/chat';
import * as ProfileActions from 'actions/profile';
import { getConvos } from 'reducers/chat';
import IosClose from 'react-ionicons/lib/IosClose';
import IosAlertOutline from 'react-ionicons/lib/IosAlertOutline';
import ChatHead from './ChatHead';
import ChatConvo from './convo/Convo.js';
import RetryError from 'components/misc/RetryError';
import './Chat.scss';

class Chat extends Component {
  state = {
    oldActiveConvo: null,
    messageInputValues: {}
  };

  constructor(props) {
    super(props);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleRetryConvosClick = this.handleRetryConvosClick.bind(this);
    this.handleChatHeadClick = this.handleChatHeadClick.bind(this);
    this.handleConvoCloseClick = this.handleConvoCloseClick.bind(this);
    this.handleMessageInputChange = this.handleMessageInputChange.bind(this);
    this.handleRetryMessageFetch = this.handleRetryMessageFetch.bind(this);

    this.convoMessagesScroll = {};
  }

  componentDidMount() {
    if (this.props.convos.length) {
      this.getConvoProfiles();

      if (!this.props.activeConvo) {
        this.activateFirstConvo();
      }
    }

    this.props.actions.convosRequest();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.convos || !prevProps.convos.length) {
      this.getConvoProfiles();

      if (!this.props.activeConvo) {
        this.activateFirstConvo();
      }
    }

    if (
      prevProps.activeConvo &&
      !this.props.activeConvo &&
      !(
        this.state.oldActiveConvo &&
        this.state.oldActiveConvo.peerID === prevProps.peerID
      )
    ) {
      // The oldActiveConvo is kept around so that the chat convo
      // component will visually remain in the UI as it slides down.
      this.setState({ oldActiveConvo: prevProps.activeConvo });
    }
  }

  handleRetryConvosClick() {
    this.props.actions.convosRequest();
  }

  handleCloseClick() {
    this.props.actions.close();
  }

  handleChatHeadClick(peerID) {
    this.props.actions.activateConvo(peerID);
    if (!this.props.chatOpen) {
      this.props.actions.open();
    }
  }

  handleConvoCloseClick() {
    this.props.actions.deactivateConvo();
  }

  handleMessageInputChange(e) {
    const messageInputValues = this.state.messageInputValues;
    messageInputValues[this.props.activeConvo.peerID] = e.target.value;
    this.setState({ messageInputValues });
  }

  handleRetryMessageFetch() {
    this.props.actions.convoMessagesRequest();
  }

  activateFirstConvo() {
    if (this.props.convos && this.props.convos.length) {
      this.props.actions.activateConvo(this.props.convos[0].peerID);
    }
  }

  getConvoProfiles() {
    this.props.convos.forEach(convo =>
      this.props.actions.profile.requestCached({ peerID: convo.peerID })
    );
  }

  render() {
    let convos = null;

    if (this.props.convosFetchFailed) {
      if (this.props.chatOpen) {
        convos = (
          <div className="row">
            <RetryError
              errorMessage={
                this.props.convosFetchError ?
                  getPoly().t('chat.fetchConvosError', {
                    error: this.props.convosFetchError
                  }) :
                  getPoly().t('chat.fetchConvosErrorGeneric')
              }
              onRetryClick={this.handleRetryConvosClick}
            />
          </div>
        );
      } else {
        convos = (
          <div className="icon clrTErr">
            <IosAlertOutline
              fontSize="42px"
              // color="red"
              onClick={() => this.props.actions.open()}
              style={{ cursor: 'pointer' }}
            />
          </div>
        );
      }
    } else {
      convos = (
        <div className="gutterVSm">
          {this.props.convos
            // .concat(this.props.convos)
            .map(convo => {
              const selected =
                this.props.activeConvo &&
                this.props.activeConvo.peerID === convo.peerID;

              return (
                <ChatHead
                  {...convo}
                  key={convo.peerID}
                  selected={selected}
                  onClick={() => this.handleChatHeadClick(convo.peerID)}
                  profile={this.props.profile[convo.peerID] || null}
                />
              );
            })}
        </div>
      );
    }

    let chatConvo;
    const convoData = this.props.activeConvo || this.state.oldActiveConvo;

    if (convoData) {
      chatConvo = (
        <ChatConvo
          {...convoData}
          key={convoData.peerID}
          profile={this.props.profile[convoData.peerID]}
          onCloseClick={this.props.activeConvo ? this.handleConvoCloseClick : null}
          messageInputValue={
            this.state.messageInputValues[convoData.peerID] || ''
          }
          onMessageInputChange={
            this.props.activeConvo ? this.handleMessageInputChange : () => {}
          }
          messagesFetchFailed={convoData.messageFetchFailed}
          messagesFetchError={convoData.messageFetchError}
          onClickRetryMessageFetch={
            this.props.activeConvo ? this.handleRetryMessageFetch : () => {}
          }
          onMessagesScroll={el => {
            // Store the scroll position so it can be restored if they return
            // to the convo. If theyre scrolled near the bottom, then we'll just
            // put a hug number so the scroll position remains at the bottom
            // even if new messages have arrived.
            this.convoMessagesScroll[convoData.peerID] =
              ChatConvo.scrolledNearBottom(el) ?
                99999999 : el.scrollTop;
          }}
          initialMessagesScrollTop={this.convoMessagesScroll[convoData.peerID]}
        />
      );
    }

    const chatConvoWrapOpenClass = this.props.activeConvo ? 'open' : '';

    return (
      <div className="Chat tx6">
        <button
          className="Chat-btnClose border clrBr clrP"
          onClick={this.handleCloseClick}
        >
          <IosClose fontSize="30px" />
        </button>
        <div className="Chat-chatHeads border padSm clrBr">{convos}</div>
        <div className={`Chat-chatConvoWrap ${chatConvoWrapOpenClass}`}>
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
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators(ChatActions, dispatch),
      profile: bindActionCreators(ProfileActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat);

// export default Chat;
