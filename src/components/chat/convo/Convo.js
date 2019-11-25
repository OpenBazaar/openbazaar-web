import { getName } from 'models/profile';
import { getPoly } from 'util/polyglot';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import IosClose from 'react-ionicons/lib/IosClose';
import Avatar from 'components/ui/Avatar';
import Message from './Message';
import RetryError from 'components/misc/RetryError';
import 'styles/layout.scss';
import './Convo.scss';

class Convo extends Component {
  static scrolledNearBottom(el) {
    return el.scrollHeight - (el.scrollTop + el.offsetHeight) <= 10;
  }

  static scrollBottomHeight = 99999999;

  constructor(props) {
    super(props);
    this.hasUpdated = false;
    this.programaticallyScrolling = false;
    this.handleMessagesScroll = this.handleMessagesScroll.bind(this);
    this.handleMessageInputKeyUp = this.handleMessageInputKeyUp.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.scrollMessages(
        typeof this.props.initialMessagesScrollTop === 'number' ?
          this.props.initialMessagesScrollTop : this.constructor.scrollBottomHeight
      );
    });
  }

  getSnapshotBeforeUpdate(prevProps) {
    // If we have a new message at the bottom and it's an outgoing message
    // or we're scrolled at or near the bottom, we'll scroll to the bottom
    // so the new message is shown.
    if (this.props.messages.length && this.hasUpdated) {
      const prevLastMessage = prevProps.messages &&
        prevProps.messages.length &&
        prevProps.messages[prevProps.messages.length - 1];
      const lastMessage = this.props.messages[
        this.props.messages.length - 1
      ];

      if (
        (
          !prevLastMessage ||
          prevLastMessage !== lastMessage
        ) &&
        (
          this.props.lastMessageOutgoing ||
          this.scrolledNearBottom()
        )
      ) {
        return { scrollTo: this.constructor.scrollBottomHeight };
      }
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapShot) {
    if (this.hasUpdated && snapShot && typeof snapShot.scrollTo === 'number') {
      this.scrollMessages(snapShot.scrollTo);
    }
    this.hasUpdated = true;
  }  

  scrolledNearBottom() {
    return this.constructor.scrolledNearBottom(this.messagesWrapEl);
  }

  handleMessagesScroll(e) {
    if (this.programaticallyScrolling) {
      this.programaticallyScrolling = false;
      return;
    }

    if (typeof this.props.onMessagesScroll === 'function') {
      this.props.onMessagesScroll(e.target);
    }
  }

  scrollMessages(amount) {
    this.programaticallyScrolling = true;
    this.messagesWrapEl.scrollTop = amount;
  }

  handleMessageInputKeyUp(e) {
    if (
      typeof this.props.onMessageSend === 'function' &&
      e.target.value &&
      e.key === 'Enter'
    ) {
      this.props.onMessageSend(e.target.value);
    }
  }

  render() {
    let messages;

    if (this.props.messagesFetchFailed) {
      messages = (
        <div className="padSm">
          <RetryError
            errorMessage={getPoly().t('chatConvo.fetchMessagesError', {
              error: this.props.messagesFetchError || ''
            })}
            onRetryClick={this.props.onClickRetryMessageFetch}
          />
        </div>
      );
    } else {
      messages = (
        <div className="ChatConvo-messages gutterV">
          {this.props.messages.map(messageID => {
            return (
              <Message
                key={messageID}
                id={messageID}
                onRetryClick={() =>
                  this.props.onMessageRetrySend(messageID)
                }
                onCancelClick={() =>
                  this.props.onMessageCancel(messageID)
                }
              />
            );
          })}
        </div>
      );
    }

    return (
      <section className="ChatConvo clrP border clrBr">
        <header className="flexVCent padSm clrBr gutterHSm">
          <div className="flexNoShrink">
            <Avatar
              size="medium"
              avatarHashes={
                this.props.profile[this.props.peerID] &&
                this.props.profile[this.props.peerID].avatarHashes
              }
              href={`/${this.props.peerID}`}
            />
          </div>
          <div className="ChatConvo-headerName flexExpand clamp txB">
            {this.props.profile[this.props.peerID]
              ? getName(this.props.profile[this.props.peerID])
              : this.props.peerID}
          </div>
          <button
            className="btn ChatConvo-btnClose flexNoShrink"
            onClick={this.props.onCloseClick}
          >
            <IosClose fontSize="26px" />
          </button>
        </header>
        <div
          className="ChatConvo-messagesWrap"
          ref={el => (this.messagesWrapEl = el)}
          onScroll={this.handleMessagesScroll}
        >
          {messages}
        </div>
        <input
          className="ChatConvo-messageInput clrBr clrP"
          type="text"
          placeholder={getPoly().t('chat.placeholderMessageInput')}
          value={this.props.messageInputValue}
          onChange={this.props.onMessageInputChange}
          onKeyUp={this.handleMessageInputKeyUp}
        />
      </section>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    profile: state.profile,
    auth: state.auth
  };
}

export default connect(
  mapStateToProps,
  null
)(Convo);
