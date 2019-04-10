import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isValidMenmonic } from 'util/crypto';
import * as AuthActions from 'actions/auth';
import * as ModalActions from 'actions/modals';
import SimpleMessage from 'components/modals/SimpleMessage';
import CopyToClipboard from 'components/ui/CopyToClipboard';
import WrappedForm from 'components/ui/form/WrappedForm';
import BtnSpinner from 'components/ui/BtnSpinner';
import FormError from 'components/ui/form/Error';
import GetMnemonicContent from './GetMnemonicContent';
import 'styles/ui/form.scss';

const SCREEN_ENTER_SEED = 'ENTER_SEED';
const SCREEN_GET_SEED = 'GET_SEED';

class Login extends Component {
  static modalProps = {
    path: 'components/auth/Login',
    rootClass: 'modalS'
  };

  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleGetMnemonicClick = this.handleGetMnemonicClick.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleRefreshMnemonicClick = this.handleRefreshMnemonicClick.bind(
      this
    );

    this.state = {
      screen: SCREEN_ENTER_SEED,
      showCopiedText: false,
      mnemonic: '',
      errors: {}
    };
  }

  componentDidMount() {
    this.props.actions.auth.generateMnemonic();
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.loggedIn) {
      this.props.actions.modals.close({ id: this.props.id });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleLoginClick() {
    const mnemonic = this.state.mnemonic;

    if (!isValidMenmonic(mnemonic)) {
      this.setState({
        errors: {
          ...this.state.errors,
          mnemonic:
            'The mnemonic should contain 12 words each seperated by a space.'
        }
      });

      return;
    }

    this.props.actions.auth.login({ mnemonic }).catch(e => {
      this.props.actions.modals.open({
        Component: SimpleMessage,
        title: 'Unable to login',
        body: e.message || ''
      });
    });

    this.setState({
      errors: {
        ...this.state.errors,
        mnemonic: ''
      }
    });
  }

  handleGetMnemonicClick() {
    this.setState({ screen: SCREEN_GET_SEED });
  }

  handleBackClick() {
    clearTimeout(this.copiedTextTimeout);
    this.setState({
      screen: SCREEN_ENTER_SEED,
      showCopiedText: false
    });
  }

  handleRefreshMnemonicClick() {
    // this.props.actions.auth.refreshMnemonic();
    this.props.actions.auth.generateMnemonic();
  }

  render() {
    let formContent;
    let footerContent;
    let footerStyle;
    const menmonicError = <FormError error={this.state.errors.mnemonic} />;

    if (this.state.screen === SCREEN_ENTER_SEED) {
      formContent = (
        <form className="padMd padLeftRight0">
          {menmonicError}
          <textarea
            style={{
              marginBottom: '5px',
              minHeight: '58px'
            }}
            className={`clrBr clrSh2 ${
              this.props.auth.loggingIn ? 'disabled' : ''
            }`}
            placeholder="Enter your mnemonic"
            name="mnemonic"
            onChange={this.handleInputChange}
            value={this.state.mnemonic}
          />
          <div className="flexHRight">
            <button
              style={{ marginRight: '3px' }}
              className="btn link"
              onClick={this.handleGetMnemonicClick}
            >
              I don't have a mnemonic
            </button>
          </div>
        </form>
      );
      footerContent = (
        <BtnSpinner
          onClick={this.handleLoginClick}
          isProcessing={this.props.auth.loggingIn}
        >
          Login
        </BtnSpinner>
      );
    } else {
      formContent = (
        <GetMnemonicContent
          mnemonic={this.props.auth.mnemonic}
          generateMnemonicError={this.props.auth.generateMnemonicError}
          isFetching={this.props.auth.generatingMnemonic}
          onRegenerateClick={this.handleRefreshMnemonicClick}
        />
      );

      footerContent = (
        <div className="flexVCent">
          <button className="btn" onClick={this.handleBackClick}>
            Back
          </button>
          <div className="flexHRight flex Expand">
            <CopyToClipboard
              showCopiedText={this.state.showCopiedText}
              copyContent={this.props.auth.mnemonic}
            >
              <button
                className={`btn ${
                  !!this.props.auth.mnemonic ? '' : 'disabled'
                }`}
              >
                Copy Mnemonic
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
        headerRightContent={null}
        footerContent={footerContent}
        footerStyle={footerStyle}
      >
        {formContent}
      </WrappedForm>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    auth: state.auth
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      auth: bindActionCreators(AuthActions, dispatch),
      modals: bindActionCreators(ModalActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
