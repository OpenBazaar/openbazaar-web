import React, { Component } from 'react';
import WrappedForm from 'components/ui/WrappedForm';

export default class Login extends Component {
  render() {
    const formContent = (
      <div>
        Hey There Slick Rickers
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