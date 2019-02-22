import React, { Component } from 'react';
import CopyToClipboard from 'components/ui/CopyToClipboard';
import WrappedForm from 'components/ui/WrappedForm';
import BtnSpinner from 'components/ui/buttons/BtnSpinner';
import 'react-tippy/dist/tippy.css'
import 'styles/ui/form.scss';

const SCREEN_ENTER_SEED = 'ENTER_SEED';
const SCREEN_GET_SEED = 'GET_SEED';

export default class Login extends Component {
  constructor(props) {
    super(props);
    
    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleGetMnemonicClick =
      this.handleGetMnemonicClick.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);

    this.state = {
      screen: SCREEN_ENTER_SEED,
      showCopiedText: false,
    };
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

  render() {
    let formContent;
    let footerContent;
    let footerStyle;

    if (this.state.screen === SCREEN_ENTER_SEED) {
      formContent = (
        <div className="padMd padLeftRight0">
          <textarea
            style={{marginBottom: '5px'}}
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
      formContent = (
        <div className="padMd padLeftRight0">
          <div
            className="border clrBr pad"
            // match the height of the text area on the prev screen
            style={{ minHeight: '54px' }}> 
            hey slick rick hows it handing stay away from weinstein
          </div>
        </div>
      );
      footerContent = (
        <div className="flexVCent">
          <button
          className="btn"
            onClick={this.handleBackClick}>Back</button>
          <div className="flexHRight flex Expand">
            <CopyToClipboard
              showCopiedText={this.state.showCopiedText}
              copyContent="silly billy and i love willy">
              <button className="btn">Copy Seed</button>
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