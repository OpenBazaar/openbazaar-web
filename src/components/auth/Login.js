import React, { Component } from 'react';
import WrappedForm from 'components/ui/WrappedForm';
import BtnSpinner from 'components/ui/buttons/BtnSpinner';
import 'styles/ui/form.scss';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

  handleLoginClick() {

  }

  render() {
    const formContent = (
      <div className="padMd padLeftRight0">
        <textarea
          style={{marginBottom: '5px'}}
          className="clrBr clrSh2 row"
          placeholder="Enter your mnemonic"></textarea>
        <div className="flexHRight">
          <button
            style={{marginRight: '3px'}}
            className="btn link">I don't have a mnemonic</button>
        </div>
      </div>
    );
    const loginBtn =
      <BtnSpinner onClick={this.handleLoginClick}>Login</BtnSpinner>;

    return (
      <WrappedForm
        heading="Login"
        formContent={formContent}
        headerRightContent={null}
        footerContent={loginBtn}>
      </WrappedForm>
    );
  }
}

Login.modulePath = 'components/auth/Login';