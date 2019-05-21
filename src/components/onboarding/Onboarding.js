import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as OnboardingActions from 'actions/onboarding';
import * as ModalsActions from 'actions/modals';
import { validate as validateProfile } from 'models/profile';
import { mapErrorsToComponents } from 'util/formErrors';
import SimpleMessage from 'components/modals/SimpleMessage';
import WrappedForm from 'components/ui/form/WrappedForm';
import ColumnedForm from 'components/ui/form/ColumnedForm';
import 'styles/ui/form.scss';

class Onboarding extends Component {
  static modalProps = {
    path: 'components/onboarding/Onboarding',
    rootClass: 'modalM'
  };

  state = {
    form: {
      name: '',
      shortDescription: ''
    },
    formErrors: null
  };

  constructor(props) {
    super(props);
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
      formErrors: null
    });
  }

  handleSaveClick() {
    const formErrors = validateProfile(this.state.form);

    // ignoring the missing peerID since that is provided by
    // the onboarding.save() action creator
    delete formErrors.peerID;

    if (formErrors && Object.keys(formErrors).length) {
      this.setState({ formErrors });
    } else {
      this.setState({ formErrors: null });

      this.props.actions.onboarding
        .save({
          data: this.state.form
        })
        .then(() => this.props.actions.modals.close({ id: this.props.id }))
        .catch(e => {
          this.props.actions.modals.open({
            Component: SimpleMessage,
            title: 'Unable to save your onboarding data',
            body: e.message || ''
          });
        });
    }
  }

  render() {
    const errorComponents = mapErrorsToComponents(this.state.formErrors);

    const formContent = (
      <div>
        <ColumnedForm
          rows={[
            {
              key: 'name',
              labelColContent: <label className="required">Name</label>,
              fieldColContent: (
                <div>
                  {errorComponents['name'] || null}
                  <input
                    type="text"
                    name="name"
                    className="clrBr clrSh2"
                    placeholder="Enter your name"
                    value={this.state.name}
                    onChange={this.handleInputChange}
                  />
                </div>
              )
            },
            {
              key: 'shortDescription',
              labelColContent: <label>Short Description</label>,
              helperText: '160 characters or less.',
              fieldColContent: (
                <div>
                  {errorComponents['shortDescription'] || null}
                  <textarea
                    type="text"
                    name="shortDescription"
                    className="clrBr clrSh2"
                    placeholder="Describe yourself"
                    value={this.state.shortDescription}
                    onChange={this.handleInputChange}
                  />
                </div>
              )
            }
          ]}
        />
      </div>
    );

    return (
      <WrappedForm
        heading="Onboarding"
        headerRightContent={null}
        isSaving={this.props.onboarding.saving}
        onSaveClick={this.handleSaveClick}
      >
        {formContent}
      </WrappedForm>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    modals: state.modals,
    onboarding: state.onboarding
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      onboarding: bindActionCreators(OnboardingActions, dispatch),
      modals: bindActionCreators(ModalsActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Onboarding);
