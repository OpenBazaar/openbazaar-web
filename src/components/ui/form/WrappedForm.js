import React from 'react';
import PropTypes from 'prop-types';
import BtnSpinner from 'components/ui/BtnSpinner';
import './WrappedForm.scss';

/*
 * A wrapped form is a style of form that we commonly used on the desktop
 * where the form is prefaced with a label and a horizontal ruler and followed
 * by a horizontal ruler and a button bar - either is optional. An example:
 * https://imgur.com/a/WNWEi97.
 */
const WrappedForm = props => {
  const HeadingTag = props.headingTagName;
  const headerRightContent =
    props.headerRightContent === undefined ? (
      <BtnSpinner
        className={!props.saveable ? 'disabled' : ''}
        onClick={props.onSaveClick}
        isProcessing={props.isSaving}
      >
        Save
      </BtnSpinner>
    ) : (
      props.headerRightContent
    );
  const footerContent =
    props.footerContent === undefined ? (
      <BtnSpinner
        className={!props.saveable ? 'disabled' : ''}
        onClick={props.onSaveClick}
        isProcessing={props.isSaving}
      >
        Save
      </BtnSpinner>
    ) : (
      props.footerContent
    );

  return (
    <section className="WrappedForm">
      <header>
        <div className="WrappedForm-headerRightContent">
          {props.headerLeftContent}
        </div>
        <HeadingTag className="WrappedForm-heading">{props.heading}</HeadingTag>
        <div className="WrappedForm-headerRightContent">
          {headerRightContent}
        </div>
      </header>
      <hr className="WrappedForm-headerHr clrBr" />
      {props.children}
      {props.showFooterHr ? (
        <hr className="WrappedForm-headerHr clrBr" />
      ) : null}
      <footer style={props.footerStyle}>
        <div className="WrappedForm-footerContent">{footerContent}</div>
      </footer>
    </section>
  );
};

export default WrappedForm;

WrappedForm.defaultProps = {
  headingTagName: 'h1',
  showFooterHr: true,
  isSaving: false,
  saveable: true
};

WrappedForm.propTypes = {
  // Will set isProcessing on the Save button(s). This won't apply if you are
  // overwriting the headerRightContent or footerContent since then there
  // would not be a Save button that this component manages.
  isSaving: PropTypes.bool,
  // If false, will disable the Save button(s). This won't apply if you are
  // overwriting the headerRightContent or footerContent - see note above.
  saveable: PropTypes.bool,
  headingTagName: PropTypes.string,
  heading: PropTypes.string.isRequired,
  mainContent: PropTypes.element,
  headerRightContent: PropTypes.element,
  headerLeftContent: PropTypes.element,
  footerContent: PropTypes.element,
  showFooterHr: PropTypes.bool,
  // Sets the style prop on the footer element.
  footerStyle: PropTypes.object
};
