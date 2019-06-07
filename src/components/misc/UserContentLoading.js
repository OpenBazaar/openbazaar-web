// Used when loading a User page or a Listing
import React from 'react';
import { getPoly } from 'util/polyglot';
import Avatar from 'components/ui/Avatar';
import MdArrowForward from 'react-ionicons/lib/MdArrowForward';
import LogoTwitter from 'react-ionicons/lib/LogoTwitter';
import LogoFacebook from 'react-ionicons/lib/LogoFacebook';
import LogoReddit from 'react-ionicons/lib/LogoReddit';
import LogoGithub from 'react-ionicons/lib/LogoGithub';
import BtnSpinner from 'components/ui/BtnSpinner';
import 'styles/layout.scss';
import 'styles/type.scss';
import 'styles/theme.scss';
import slackIcon from 'img/icons/icon-slack.png';
import './UserContentLoading.scss';

const UserContentLoading = props => {
  let headerContent = null;
  let userName = null;

  if (props.userName) {
    userName = <h2 className="h4 txUnl lineHeight1 clrT">{props.userName}</h2>;
  }

  if (props.userAvatarHashes || props.userName) {
    headerContent = (
      <div>
        <div className="UserContentLoading-titleRow flexVCent gutterHSm">
          <Avatar size="tiny" avatarHashes={props.userAvatarHashes} />
          {userName}
        </div>
      </div>
    );
  }

  const headingText = props.isProcessing ? (
    <h1 className="h3 clrT">{getPoly().t('userContentLoading.connecting')}</h1>
  ) : (
    <h1 className="h3 clrT">
      {getPoly().t('userContentLoading.failedToConnect')}
    </h1>
  );

  let content = <p className="clrT2 tx5">{props.contentText}</p>;
  if (props.children) content = props.children;

  let btnSpinnerContent = props.isProcessing
    ? null
    : getPoly().t('userContentLoading.btnRetry');

  return (
    <section className="UserContentLoading">
      <div className="padMd">
        <header>{headerContent}</header>
        <div className="txCtr">
          <div className="flexVCent flexInline gutterH row">
            <Avatar size="small" avatarHashes={props.ownAvatarHashes} />
            <MdArrowForward className="clrT2 lineHeight1 tx3" />
            <Avatar size="small" avatarHashes={props.userAvatarHashes} />
          </div>

          {headingText}

          <div className="rowHg UserContentLoading-contentWrap">{content}</div>

          <p className="clrT2 tx6 rowSm">
            {getPoly().t('userContentLoading.socialHeading')}
          </p>
          <div className="flexVCent flexInline gutterHSm UserContentLoading-socialIcons">
            <a
              href="https://twitter.com/openbazaar"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LogoTwitter className="twitterColor" />
            </a>
            <a
              href="https://www.facebook.com/OpenBazaarProject"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LogoFacebook className="facebookColor" />
            </a>
            <a
              href="https://www.reddit.com/r/OpenBazaar/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LogoReddit className="redditColor" />
            </a>
            <a
              href="https://github.com/OpenBazaar/openbazaar-desktop"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LogoGithub className="githubColor" />
            </a>
            <a
              href="https://openbazaar.org/slack/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={slackIcon} alt="Slack icon" className="tx3" />
            </a>
          </div>
        </div>
      </div>
      <div className="flexRow flexBtnWrapper">
        <button
          className="txCtr btnFlx flexExpand clrP"
          onClick={props.onCancelClick}
        >
          {getPoly().t('userContentLoading.btnCancel')}
        </button>
        <BtnSpinner
          isProcessing={props.isProcessing}
          baseClassName=""
          className="btnFlx flexExpand clrP"
          onClick={props.onRetryClick}
        >
          {btnSpinnerContent}
        </BtnSpinner>
      </div>
    </section>
  );
};

export default UserContentLoading;

UserContentLoading.modalProps = {
  path: 'components/misc/UserContentLoading',
  closeable: false,
  rootClass: 'modalM',
  contentWrapBaseClass: ''
};
