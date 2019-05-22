import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ModalActions from 'actions/modals';
import * as ResponsiveActions from 'actions/responsive';
import * as ChatActions from 'actions/chat';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { loadLang } from 'util/polyglot';
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

class App extends Component {
  state = {
    langLoaded: false
  };

  componentDidMount() {
    this.props.actions.responsive.trackBreakpoints();

    console.log('moo');
    window.moo = () => {
      this.props.actions.chat[
        this.props.chat.chatOpen ?
          'closeChat' : 'openChat'
      ]();
    }


    // hard-coded for now
    const lang = 'en_US';
    loadLang(lang)
      .then(() => this.setState({ langLoaded: true }))
      .catch(e => console.error(e));
    // todo: handle error case better here.
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.needOnboarding && !prevProps.auth.needOnboarding) {
      this.props.actions.modals.open({ Component: Onboarding });
    }
  }

  render() {
    const chatOpenClass =
      this.props.chat.chatOpen ? 'Chat-chatOpen' : '';

    const Content = !this.state.langLoaded ? (
      <div className="flexCent">
        <Spinner size="large" />
      </div>
    ) : (
      <div className={`App ${chatOpenClass}`} id="OBWEB">
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
        <div className="App-mainContent">
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
            <ModalRoot key={modal.id} {...modal} />
          ))}
        </div>
        <div className="App-chatContainer">
          <Chat />
        </div>        
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
    chat: state.chat,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      modals: bindActionCreators(ModalActions, dispatch),
      responsive: bindActionCreators(ResponsiveActions, dispatch),
      chat: bindActionCreators(ChatActions, dispatch),
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
