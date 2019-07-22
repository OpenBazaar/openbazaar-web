import moment from 'moment';
import { getPoly } from 'util/polyglot';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import IosAlertOutline from 'react-ionicons/lib/IosAlertOutline';
import Avatar from 'components/ui/Avatar';
import Spinner from 'components/ui/Spinner';
import 'styles/layout.scss';
import 'styles/type.scss';

class Message extends Component {
  render() {
    const messageStyle =
      this.props.message.outgoing &&
      !this.props.message.sent &&
      !this.props.message.sending ?
        { opacity: 0.6 } : {};
    const avatarWrapStyle = messageStyle;

    const avatar = (
      <Avatar
        size="small"
        avatarHashes={(this.props.profile && this.props.profile.avatarHashes) || null}
        href={`/${this.props.message.peerID}`}
      />
    );

    let timestampLine;

    if (this.props.message.sent || !this.props.message.outgoing) {
      timestampLine = moment(this.props.message.timestamp).fromNow();
    } else if (this.props.message.sending) {
      timestampLine = (
        <span className="clrT2"><Spinner size="text" /></span>
      );
    } else {
      // send error
      timestampLine = (
        <div className="flexHRight gutterHTn">
          <div className="icon clrTErr">
            <IosAlertOutline fontSize="12px" />
          </div>
          <button
            className="btnAsLink clrTErr"
            onClick={this.props.onRetryClick}
          >
            {getPoly().t('chatConvo.message.btnRetry')}
          </button>
          <div className="clrT2">|</div>
          <button
            className="btnAsLink clrTErr"
            onClick={this.props.onCancelClick}
          >
            {getPoly().t('chatConvo.message.btnCancel')}
          </button>
        </div>
      )
    }

    timestampLine = (
      <div
        className={`clrT2 txTn ${
          !this.props.message.outgoing ? '' : 'flexHRight'
        }`}
        // prevents jumping when the timestamp line switches between states
        style={{height: '11px'}}
      >{timestampLine}</div>
    );

    const msgText = (
      <div className="flexCol gutterVTn" style={{ marginTop: '5px' }}>
        <div className={this.props.message.outgoing ? 'flexHRight' : ''}>
          <div
            className="padSm border clrBr clrS"
            style={messageStyle}
          >
            {this.props.message.message}
          </div>
        </div>
        {timestampLine}
      </div>
    );

    let msg;

    if (this.props.message.outgoing) {
      msg = (
        <div className="flex gutterHSm">
          <div className="flexExpand">&nbsp;</div>
          {msgText}
          <div
            className="flexNoShrink"
            style={avatarWrapStyle}
          >
            {avatar}
          </div>
        </div>
      );
    } else {
      msg = (
        <div className="flex gutterHSm">
          <div className="flexNoShrink">{avatar}</div>
          {msgText}
        </div>
      );
    }

    return <div className="ChatMessage">{msg}</div>;
  }
}

function mapStateToProps(state, props) {
  const message = (state.chat && state.chat.messages[props.id]) || {};

  return {
    message,
    profile: (state.profile && state.profile[message.peerID]) || {},
  };
}

export default connect(
  mapStateToProps,
  null
)(Message);
