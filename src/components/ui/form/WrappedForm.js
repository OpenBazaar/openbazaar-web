import React from 'react';
import BtnSpinner from 'components/ui/BtnSpinner';
import './WrappedForm.scss';

const WrappedForm = props => {
  const HeadingTag = props.headingTagName;
  const headerRightContent = props.headerRightContent === undefined ?
    <BtnSpinner
      className={!props.saveable ? 'disabled' : ''}
      onClick={props.onSaveClick}
      isProcessing={props.isSaving}>Save</BtnSpinner> :
    props.headerRightContent;
  const footerContent = props.footerContent === undefined ?
    <BtnSpinner
      className={!props.saveable ? 'disabled' : ''}
      onClick={props.onSaveClick}
      isProcessing={props.isSaving}>Save</BtnSpinner> :
    props.footerContent;  

  return (
    <section className="WrappedForm">
      <header>
        <div className="WrappedForm-headerRightContent">{props.headerLeftContent}</div>
        <HeadingTag className="WrappedForm-heading">
          {props.heading}
        </HeadingTag>
        <div className="WrappedForm-headerRightContent">{headerRightContent}</div>
      </header>
      <hr className="WrappedForm-headerHr clrBr" />
      {props.children}
      {props.showFooterHr ?
        <hr className="WrappedForm-headerHr clrBr" /> : null}
      <footer style={props.footerStyle}>
        <div className="WrappedForm-footerContent">{footerContent}</div>
      </footer>
    </section>
  );
}

export default WrappedForm;

// ====> ensure types
// props.headingTagName, optional, h1
// props.heading, required
// props.headingClass, optional, ''
// props.mainContent, optional, null
// props.headerRightContent, optional, <BtnProceessing>Save</BtnProceessing>
// props.headerLeftContent, optional,
// props.footerContent, optional, <BtnProceessing>Save</BtnProceessing>
// props.showFooterHr, optional, true
// props.footerStyle, optional, {} (no def needed?)
// ^^^ style props to other content objects?

// todo: need onSaveClick prop

WrappedForm.defaultProps = {
  headingTagName: 'h1',
  showFooterHr: true,
  // headingBaseClass: 'f2lexExpand t2xCtr',
  // headingClass: 'h3',

  // todo note about these two below
  isSaving: false,
  saveable: true,
};