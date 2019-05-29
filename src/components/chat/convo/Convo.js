import { getName } from 'models/profile';
import { getPoly } from 'util/polyglot';
import React from 'react';
import IosClose from 'react-ionicons/lib/IosClose';
import Avatar from 'components/ui/Avatar';
import Message from './Message';
import 'styles/layout.scss';
import './Convo.scss';

export default function(props) {
  return (
    <section className="ChatConvo clrP border clrBr">
      <header className="flexVCent padSm clrBr gutterHSm">
        <Avatar
          size="medium"
          avatarHashes={props.profile ? props.profile.avatarHashes : null}
          href={`/${props.peerId}`}
        />
        <div className="ChatConvo-headerName flexExpand clamp txB">
          {props.profile ? getName(props.profile) : ''}
        </div>
        <button
          className="btn ChatConvo-btnClose"
          onClick={props.onClick}
        >
          <IosClose fontSize="26px" />
        </button>
      </header>
      <div className="ChatConvo-messagesWrap">
        <div className="ChatConvo-messages gutterV">
          {props.messages.map(message => (
            <Message
              {...message}
              key={message.messageId}
              avatarHashes={props.profile ? props.profile.avatarHashes : null}
            />
          ))}
        </div>
      </div>
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