import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AuthActions from 'actions/auth';
import CopyToClipboard from 'components/ui/CopyToClipboard';
import WrappedForm from 'components/ui/WrappedForm';
import BtnSpinner from 'components/ui/buttons/BtnSpinner';
import GetMnemonicContent from './GetMnemonicContent';
import 'react-tippy/dist/tippy.css'
import 'styles/ui/form.scss';

const SCREEN_ENTER_SEED = 'ENTER_SEED';
const SCREEN_GET_SEED = 'GET_SEED';

class Login extends Component {
  constructor(props) {
    super(props);
    
    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleGetMnemonicClick =
      this.handleGetMnemonicClick.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleRefreshMnemonicClick = this.handleRefreshMnemonicClick.bind(this);

    this.state = {
      screen: SCREEN_ENTER_SEED,
      showCopiedText: false,
    };
  }

  componentDidMount() {
    this.props.actions.auth.generateMnemonic();
  }

  handleLoginClick() {

  }

  handleGetMnemonicClick() {
    this.setState({ screen: SCREEN_GET_SEED });
  }

  handleBackClick() {
    clearTimeout(this.copiedTextTimeout);
    this.setState({
      screen: SCREEN_ENTER_SEED,
      showCopiedText: false,
    });
  }

  handleRefreshMnemonicClick() {
    this.props.actions.auth.refreshMnemonic();
  }

  render() {
    let formContent;
    let footerContent;
    let footerStyle;

    if (this.state.screen === SCREEN_ENTER_SEED) {
      formContent = (
        <div className="padMd padLeftRight0">
          <textarea
            style={{
              marginBottom: '5px',
              minHeight: '58px'
            }}
            className="clrBr clrSh2"
            placeholder="Enter your mnemonic"></textarea>
          <div className="flexHRight">
            <button
              style={{marginRight: '3px'}}
              className="btn link"
              onClick={this.handleGetMnemonicClick}>I don't have a mnemonic</button>
          </div>
        </div>
      );
      footerContent =
        <BtnSpinner onClick={this.handleLoginClick}>Login</BtnSpinner>
    } else {
      formContent = <GetMnemonicContent
        mnemonic={this.props.auth.mnemonic}
        generateMnemonicError={this.props.auth.generateMnemonicError}
        isFetching={this.props.auth.generatingMnemonic}
        onRegenerateClick={this.handleRefreshMnemonicClick} />

      footerContent = (
        <div className="flexVCent">
          <button
          className="btn"
            onClick={this.handleBackClick}>Back</button>
          <div className="flexHRight flex Expand">
            <CopyToClipboard
              showCopiedText={this.state.showCopiedText}
              copyContent={this.props.auth.mnemonic}>
              <button
                className={`btn ${!!this.props.auth.mnemonic ? '' : 'disabled'}`}>
                Copy Seed
              </button>
            </CopyToClipboard>
          </div>
        </div>
      );
      footerStyle = { display: 'block' };
    }

    return (
      <WrappedForm
        heading="Login"
        formContent={formContent}
        headerRightContent={null}
        footerContent={footerContent}
        footerStyle={footerStyle}>
      </WrappedForm>
    );
  }
}

Login.modulePath = 'components/auth/Login';

function mapStateToProps(state, prop) {
  return {
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      auth: bindActionCreators(AuthActions, dispatch),
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);