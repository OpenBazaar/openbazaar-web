import React, { Component } from 'react';
import WrappedForm from 'components/ui/WrappedForm';
import BtnSpinner from 'components/ui/buttons/BtnSpinner';

export default class Login extends Component {
  render() {
    const formContent = (
      <div>
        <BtnSpinner
          isProcessing="true"
          label="click the slick"
          />
      </div>
    );

    return (
      <WrappedForm
        heading="Howdy Slick Rick With A Stick"
        formContent={formContent}>
      </WrappedForm>
    );
  }
}

Login.modulePath = 'components/auth/Login';