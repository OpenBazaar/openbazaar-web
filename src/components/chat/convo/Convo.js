import { getName } from 'models/profile';
import { getPoly } from 'util/polyglot';
import React from 'react';
import IosClose from 'react-ionicons/lib/IosClose';
import Avatar from 'components/ui/Avatar';
import Message from './Message';
import RetryError from 'components/misc/RetryError';
import 'styles/layout.scss';
import './Convo.scss';

export default function(props) {
  let messages;

  if (props.messagesFetchFailed) {
    messages = (
      <div className="padSm">
        <RetryError
          errorMessage={
            getPoly().t('chatConvo.fetchMessagesError', {
              error: props.messagesFetchError || '',
            })
          }
          onRetryClick={props.onClickRetryMessageFetch}
        />
      </div>
    );
  } else {
    messages = (
      <div className="ChatConvo-messages gutterV">
        {props.messages.map(message => (
          <Message
            {...message}
            key={message.messageID}
            avatarHashes={props.profile ? props.profile.avatarHashes : null}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="ChatConvo clrP border clrBr">
      <header className="flexVCent padSm clrBr gutterHSm">
        <Avatar
          size="medium"
          avatarHashes={props.profile ? props.profile.avatarHashes : null}
          href={`/${props.peerID}`}
        />
        <div className="ChatConvo-headerName flexExpand clamp txB">
          {props.profile ? getName(props.profile) : ''}
        </div>
        <button className="btn ChatConvo-btnClose" onClick={props.onCloseClick}>
          <IosClose fontSize="26px" />
        </button>
      </header>
      <div className="ChatConvo-messagesWrap">{messages}</div>
      <input
        className="ChatConvo-messageInput clrBr clrP"
        type="text"
        placeholder={getPoly().t('chat.placeholderMessageInput')}
        value={props.messageInputValue}
        onChange={props.onMessageInputChange}
      />
    </section>
  );
}
