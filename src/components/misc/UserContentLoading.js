// Used when loading a User page or a Listing
import React from 'react';
import { getPoly } from 'util/polyglot';
import Avatar from 'components/ui/Avatar';
import MdArrowForward from 'react-ionicons/lib/MdArrowForward';
import LogoTwitter from 'react-ionicons/lib/LogoTwitter';
import LogoFacebook from 'react-ionicons/lib/LogoFacebook';
import LogoReddit from 'react-ionicons/lib/LogoReddit';
import LogoGithub from 'react-ionicons/lib/LogoGithub';
import 'styles/layout.scss';
import 'styles/type.scss';
import 'styles/theme.scss';
import slackIcon from 'img/icons/icon-slack';

export default function(props) {
  let headerContent = null;
  let userName = null;

  if (props.userName) {
    userName = <h2 className="h4 txUnl lineHeight1 clrT">{props.userName}</h2>;
  }

  if (props.userAvatarHashes || props.userName) {
    headerContent = (
      <div>
        <div className="UserContentLoading-titleRow flexVCent gutterHSm">
          <Avatar size="tiny" avatarHashes={props.avatarHashes} />
          {userName}
        </div>
      </div>      
    );
  }

  const headingText = props.isProcessing ?
    <h1 class="h3 clrT">{getPoly().t('userContentLoading.connecting')}</h1> :
    <h1 class="h3 clrT">{getPoly().t('userContentLoading.failedToConnect')}</h1>

  let content = <p class="clrT2 tx5">{props.contentText}</p>
  if (props.children) content = props.children;

  return (
    <section className="UserContentLoading box clrP clrBr clrSh3">
      <div className="padMd">
        <header>{headerContent}</header>
        <div class="txCtr">
          <div class="flexVCent flexInline gutterH row">
            <Avatar size="small" avatarHashes={props.ownAvatarHashes} />
            <MdArrowForward className="clrT2 lineHeight1 tx3" />
            <Avatar size="small" avatarHashes={props.avatarHashes} />
          </div>
          
          {headingText}
          
          <div class="rowHg contentWrap">{content}</div>
          
          <p class="clrT2 tx6 rowSm">{getPoly().t('userContentLoading.socialHeading')}</p>
          <div class="flexVCent flexInline gutterHSm socialIcons">
            <a href="https://twitter.com/openbazaar" target="_blank">
              <LogoTwitter className="twitterColor" />
            </a>
            <a href="https://www.facebook.com/OpenBazaarProject" target="_blank">
              <LogoFacebook className="facebookColor" />
            </a>
            <a href="https://www.reddit.com/r/OpenBazaar/" target="_blank">
              <LogoReddit className="redditColor" />
            </a>
            <a href="https://github.com/OpenBazaar/openbazaar-desktop" target="_blank">
              <LogoGithub className="githubColor" />
            </a>
            <a href="https://openbazaar.org/slack/" target="_blank">
              <img src={slackIcon} alt="Slack icon" />
            </a>      
          </div>
        </div>
      </div>
      <div class="flexRow flexBtnWrapper">
        <a class="txCtr btnFlx flexExpand js-btnCancel">Cancel</a>
        
    <a class="btnProcessing btnFlx flexExpand clrP js-btnRetry processing">
      <svg version="1.1" class="spinner" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="20px" height="40px" viewBox="0 0 40 40" enable-background="new 0 0 20 40" xml:space="preserve">
    <path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
      s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
      c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"></path>
    <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
      C22.32,8.481,24.301,9.057,26.013,10.047z" transform="rotate(228 20 20)">
      <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.5s" repeatCount="indefinite"></animateTransform>
      </path>
    </svg>
      <span class="js-btnText ">Try Again</span>
    </a>
      </div>
    </section>    
  );
}