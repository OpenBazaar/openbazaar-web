import React from 'react';
import BtnSpinner from 'components/ui/buttons/BtnSpinner';

const WrappedForm = props => {
  const HeadingTag = props.headingTagName;
  const headerRightContent = props.headerRightContent === undefined ?
    <BtnSpinner isProcessing={props.isSaving}>Save</BtnSpinner> :
    props.headerRightContent;

  return (
    <section className="WrappedForm">
      <header className="flexCent">
        <div className="flexNoShrink">{props.headerLeftContent}</div>
        <HeadingTag
          className={`WrappedForm-heading ${props.headingBaseClass} ${props.headingClass}`}>
          {props.heading}
        </HeadingTag>
        <div className="flexNoShrink">{headerRightContent}</div>
      </header>
      {props.formContent}
      <footer>The foot of the matter</footer>
    </section>
  );
}

export default WrappedForm;

// props.headingTagName, optional, h1
// props.heading, required
// props.headingClass, optional, ''
// props.mainContent, optional, null
// props.headerRightContent, optional, <BtnProceessing>Save</BtnProceessing>
// props.headerLeftContent, optional,

WrappedForm.defaultProps = {
  headingTagName: 'h1',
  headingBaseClass: 'flexExpand txCtr',
  headingClass: 'h3',
  // todo note about these two below
  isSaving: false,
  saveable: true,
};