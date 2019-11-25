import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ModalActions from 'actions/modals';
import * as ResponsiveActions from 'actions/responsive';
import * as ChatActions from 'actions/chat';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { loadLang } from 'util/polyglot';
import { getScrollBarWidth } from 'util/dom';
import { getChatState } from 'reducers/chat';
import ModalRoot from 'components/modals/ModalRoot';
import Discovery from 'components/pages/Discovery';
import Modals from 'components/pages/Modals';
import About from 'components/pages/About';
import NoMatch from 'components/pages/NoMatch';
import NavMenu from 'components/misc/navMenu/NavMenu';
import Onboarding from 'components/onboarding/Onboarding';
import Spinner from 'components/ui/Spinner';
import Chat from 'components/chat/Chat';
import './App.scss';
import 'styles/layout.scss';
import 'styles/ui/buttons.scss';
import logo from 'img/ob-logo.png';
import 'util/messaging/index';

class App extends Component {
  state = {
    langLoaded: false
  };

  componentDidMount() {
    this.props.actions.responsive.trackBreakpoints();

    // hard-coded for now
    const lang = 'en_US';
    loadLang(lang)
      .then(() => this.setState({ langLoaded: true }))
      .catch(e => console.error(e));
    // todo: handle error case better here.

    window.initiateChatConvo = peerID => {
      if (typeof peerID !== 'string' || !peerID) {
        throw new Error('Please provide a peerID as a non-empty string.');
      }

      this.props.actions.chat.open();
      this.props.actions.chat.activateConvo(peerID);
    };

    console.log('initiateChatConvo() is ready to go.');
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.needOnboarding && !prevProps.auth.needOnboarding) {
      this.props.actions.modals.open({ Component: Onboarding });
    }
  }

  render() {
    const isChatOpen = this.props.chat.chatOpen && this.props.auth.loggedIn;
    const chatOpenClass = isChatOpen ? 'Chat-chatOpen' : '';

    const isChatVisible =
      this.props.chat.convos.length ||
      this.props.chat.convosFetchFailed ||
      this.props.chat.activeConvo;
    const chatVisibleClass = isChatVisible ? 'Chat-chatVisible' : '';

    const upToMobileLandscape = ['mobile', 'mobileLandscape'].includes(
      this.props.responsive.breakpoint
    );
    const chatWidth = 250;
    const chatClosedWidth = 52;
    // TODO: bake greaterThan(breakpoint) and lessThan(breakpoint) functions
    // into the responsive reducer file.
    const scrollBarOffset = !upToMobileLandscape ? getScrollBarWidth() : 0;
    const chatWidthWithScroll = chatWidth + scrollBarOffset;
    const chatClosedWidthWithScroll = chatClosedWidth + scrollBarOffset;

    // Used for containers that need to shrink to allow space for chat.
    let chatWidthOffset = '0px';

    if (isChatVisible && !isChatOpen) {
      chatWidthOffset = `${chatClosedWidthWithScroll}px`;
    } else if (isChatOpen && !upToMobileLandscape) {
      chatWidthOffset = `${chatWidthWithScroll}px`;
    }

    const chat = this.props.auth.loggedIn ? (
      <div
        className="App-chatContainer"
        style={{
          transform: this.props.chat.chatOpen
            ? `translateX(${0 - scrollBarOffset}px)`
            : `translateX(calc(100% - ${chatClosedWidthWithScroll}px))`,
          width: upToMobileLandscape ? '100%' : `${chatWidth}px`
        }}
      >
        <Chat />
      </div>
    ) : null;

    const Content = !this.state.langLoaded ? (
      <div className="flexCent">
        <Spinner size="large" />
      </div>
    ) : (
      <div className={`App ${chatOpenClass} ${chatVisibleClass}`} id="OBWEB">
        <header className="App-header">
          <nav className="flexVCent row gutterH">
            <Link to="/" className="App-logo-wrap">
              <img src={logo} className="App-logo" alt="logo" />
            </Link>
            <div className="flexExpand">
              <div className="flexHRight">
                <NavMenu />
              </div>
            </div>
          </nav>
        </header>
        <div
          className="App-mainContent"
          style={{
            paddingRight: chatWidthOffset
          }}
        >
          <div>
            <Switch>
              <Route exact path="/" component={Discovery} />
              <Route exact path="/modals" component={Modals} />
              <Route exact path="/about" component={About} />
              <Route component={NoMatch} />
            </Switch>
          </div>
        </div>
        <div className="App-modalContainer">
          {this.props.modals.openModals.map(modal => (
            <ModalRoot
              key={modal.id}
              chatWidthOffset={chatWidthOffset}
              {...modal}
            />
          ))}
        </div>
        {chat}
        <div id="navMenuContainer" />
      </div>
    );

    return Content;
  }
}

function mapStateToProps(state, prop) {
  return {
    app: state.app,
    modals: state.modals,
    router: state.router,
    responsive: state.responsive,
    auth: state.auth,
    chat: getChatState(state.chat)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      modals: bindActionCreators(ModalActions, dispatch),
      responsive: bindActionCreators(ResponsiveActions, dispatch),
      chat: bindActionCreators(ChatActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
