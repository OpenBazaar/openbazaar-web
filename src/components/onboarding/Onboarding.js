import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import { isValidMenmonic } from 'util/crypto';
import * as ModelsActions from 'actions/models';
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
        description: '',
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
    window.rick = this.props.actions.models.saveProfile({
      data: this.state.form,
    })
      .then(
        () => { alert('good') },
        () => { alert('b b b bad') }
      );
    // .catch(e => {
    //   console.log('slick rick');
    //   this.props.actions.modals.open({
    //     Component: SimpleMessage,
    //     title: 'Unable to save your onboarding data',
    //     body: e.message || '',
    //   });
    // });
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
            key: 'description',
            labelColContent: <label className="required">Description</label>,
            helperText: 'Something fun. Something sassy. OB is a no '
              + 'judgment zone.',
            fieldColContent: (
              <textarea
                type="text"
                name="name"
                className="clrBr clrSh2"
                placeholder="Describe yourself"
                value={this.state.description}
                onChange={this.handleInputChange}></textarea>
            ),
          }          
        ]}></ColumnedForm>
    )
    
    return (
      <WrappedForm
        heading="Onboarding"
        headerRightContent={null}
        isSaving={this.props.models.savingProfile}
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
    // models: state.models,
    models: {},
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      models: bindActionCreators(ModelsActions, dispatch),
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Onboarding);