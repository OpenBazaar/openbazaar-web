import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as OnboardingActions from 'actions/onboarding';
import * as ModalsActions from 'actions/modals';
import SimpleMessage from 'components/modals/SimpleMessage';
import WrappedForm from 'components/ui/form/WrappedForm';
import ColumnedForm from 'components/ui/form/ColumnedForm';
import 'styles/ui/form.scss';

class Onboarding extends Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        name: '',
        shortDescription: '',
      },
    };    

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      form: {
        ...this.state.form,
        [name]: value
      },
    });
  }

  handleSaveClick() {
    this.props.actions.onboarding.save({
      data: this.state.form,
    })
    .catch(e => {
      this.props.actions.modals.open({
        Component: SimpleMessage,
        title: 'Unable to save your onboarding data',
        body: e.message || '',
      });
    });
  }

  render() {
    const formContent = (
      <ColumnedForm
        rows={[
          {
            key: 'name',
            labelColContent: <label className="required">Name</label>,
            fieldColContent: (
              <input
                type="text"
                name="name"
                className="clrBr clrSh2"
                placeholder="Enter your name"
                value={this.state.name}
                onChange={this.handleInputChange} />
            ),
          },
          {
            key: 'shortDescription',
            labelColContent: <label>Short Description</label>,
            helperText: '160 characters or less.',
            fieldColContent: (
              <textarea
                type="text"
                name="shortDescription"
                className="clrBr clrSh2"
                placeholder="Describe yourself"
                value={this.state.shortDescription}
                onChange={this.handleInputChange}></textarea>
            ),
          }          
        ]}></ColumnedForm>
    )
    
    return (
      <WrappedForm
        heading="Onboarding"
        headerRightContent={null}
        isSaving={this.props.onboarding.saving}
        onSaveClick={this.handleSaveClick}>
        {formContent}
      </WrappedForm>
    );
  }
}

Onboarding.modulePath = 'components/onboarding/Onboarding';
Onboarding.rootClass = 'modalM';

function mapStateToProps(state, prop) {
  return {
    modals: state.modals,
    onboarding: state.onboarding,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      onboarding: bindActionCreators(OnboardingActions, dispatch),
      modals: bindActionCreators(ModalsActions, dispatch),
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Onboarding);