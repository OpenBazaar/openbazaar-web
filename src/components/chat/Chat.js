import { getPoly } from 'util/polyglot';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ChatActions from 'actions/chat';
import * as ProfileActions from 'actions/profile';
import { getChatState } from 'reducers/chat';
import IosClose from 'react-ionicons/lib/IosClose';
import IosAlertOutline from 'react-ionicons/lib/IosAlertOutline';
import ChatHead from './ChatHead';
import ChatConvo from './convo/Convo.js';
import RetryError from 'components/misc/RetryError';
import './Chat.scss';

class Chat extends Component {
  state = {
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
    this.handleMessageSend = this.handleMessageSend.bind(this);
    this.handleMessageRetrySend = this.handleMessageRetrySend.bind(this);
    this.handleMessageCancel = this.handleMessageCancel.bind(this);

    this.convoMessagesScroll = {};
  }

  componentDidMount() {
    if (this.props.convos.length) {
      this.getConvoProfiles();
    }

    this.props.actions.convosRequest();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.convos || !prevProps.convos.length) {
      this.getConvoProfiles();
    }

    if (
      this.props.chatOpen &&
      (
        (!prevProps.activeConvo && this.props.activeConvo) ||
        (!prevProps.chatOpen && this.props.activeConvo) ||
        (
          prevProps.activeConvo &&
          this.props.activeConvo &&
          prevProps.activeConvo !== this.props.activeConvo
        )
      )
    ) {
      const convo = this.props.convos.find(
        convo => convo.peerID === this.props.activeConvo.peerID
      );

      if (convo && convo.unread) {
        this.props.actions.convoMarkRead({
          peerID: this.props.activeConvo.peerID
        });
      }
    }
  }

  handleRetryConvosClick() {
    this.props.actions.convosRequest();
  }

  handleCloseClick() {
    this.props.actions.close();
  }

  handleChatHeadClick(peerID) {
    if (
      this.props.activeConvo &&
      this.props.activeConvo.peerID === peerID
    ) return;
      
    this.props.actions.activateConvo(peerID);
    if (!this.props.chatOpen) {
      this.props.actions.open();
    }
  }

  handleConvoCloseClick() {
    this.props.actions.deactivateConvo();
  }

  handleMessageInputChange(e) {
    this.setState({
      messageInputValues: {
        ...this.state.messageInputValues,
        [this.props.activeConvo.peerID]: e.target.value,
      },
    });
  }

  handleRetryMessageFetch(peerID) {
    this.props.actions.convoMessagesRequest({ peerID });
  }

  handleMessageSend(data) {
    this.props.actions.sendMessage(data);
    this.setState({
      messageInputValues: {
        ...this.state.messageInputValues,
        [data.peerID]: ''
      }
    });
  }

  handleMessageRetrySend(messageID) {
    const message = this.props.messages[messageID];

    if (!message) {
      console.warn('Unable to retry the message. The message data is not available.');
      return;
    }

    this.props.actions.sendMessage({
      messageID: message.messageID,
      peerID: message.peerID,
      timestamp: message.timestamp,
      message: message.message,
    });
  }

  handleMessageCancel(messageID) {
    this.props.actions.cancelMessage({ messageID });
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
                this.props.convosFetchError
                  ? getPoly().t('chat.fetchConvosError', {
                      error: this.props.convosFetchError
                    })
                  : getPoly().t('chat.fetchConvosErrorGeneric')
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
            .map(convo => {
              const selected =
                this.props.activeConvo &&
                this.props.activeConvo.peerID === convo.peerID;
              let lastMessage = '';

              try {
                lastMessage = this.props.messages[convo.lastMessage].message || '';
              } catch (e) {
                // pass
              }

              return (
                <ChatHead
                  {...convo}
                  key={convo.peerID}
                  selected={selected}
                  onClick={() => this.handleChatHeadClick(convo.peerID)}
                  profile={this.props.profile[convo.peerID] || null}
                  lastMessage={lastMessage}
                />
              );
            })}
        </div>
      );
    }

    let chatConvo;
    const convoData = this.props.activeConvo;

    if (convoData) {
      chatConvo = (
        <ChatConvo
          {...convoData}
          key={convoData.peerID}
          onCloseClick={this.handleConvoCloseClick}
          messageInputValue={
            this.state.messageInputValues[convoData.peerID] || ''
          }
          onMessageInputChange={this.handleMessageInputChange}
          messagesFetchFailed={convoData.messageFetchFailed}
          messagesFetchError={convoData.messageFetchError}
          onClickRetryMessageFetch={
            () => this.handleRetryMessageFetch(convoData.peerID)
          }
          onMessagesScroll={el => {
            // Store the scroll position so it can be restored if they return
            // to the convo. If theyre scrolled near the bottom, then we'll just
            // put a huge number so the scroll position remains at the bottom
            // even if new messages have arrived.
            this.convoMessagesScroll[
              convoData.peerID
            ] = ChatConvo.scrolledNearBottom(el) ? 99999999 : el.scrollTop;
          }}
          initialMessagesScrollTop={this.convoMessagesScroll[convoData.peerID]}
          onMessageSend={message =>
            this.handleMessageSend({
              message,
              peerID: convoData.peerID
            })
          }
          onMessageRetrySend={messageID => this.handleMessageRetrySend(messageID)}
          onMessageCancel={messageID => this.handleMessageCancel(messageID)}
          lastMessageOutgoing={
            !!(
              convoData.messages &&
              convoData.messages[convoData.messages.length - 1] &&
              this.props.messages[
                convoData.messages[convoData.messages.length - 1]
              ].outgoing
            )
          }
        />
      );
    }

    const chatConvoOpenClass = this.props.activeConvo ? 'Chat-convoOpen' : '';

    return (
      <div className={`Chat tx6 ${chatConvoOpenClass}`}>
        <button
          className="Chat-btnClose border clrBr clrP"
          onClick={this.handleCloseClick}
        >
          <IosClose fontSize="30px" />
        </button>
        <div className="Chat-chatHeads border padSm clrBr">{convos}</div>
        <div className="Chat-chatConvoWrap">{chatConvo}</div>
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    ...getChatState(state.chat),
    profile: state.profile,
    auth: state.auth
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
