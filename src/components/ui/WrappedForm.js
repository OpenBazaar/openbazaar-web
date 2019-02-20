import React from 'react';

const WrappedForm = props => {
  const HeadingTag = props.headingTagName;
  const heading = props.heading ?
    <HeadingTag
      className={props.headingClass}>
      {props.heading}
    </HeadingTag> : null;

  return (
    <section className="WrappedForm">
      <header className="flexVCent">
        {heading}
      </header>
      {props.mainContent}
      <footer>The foot of the matter</footer>
    </section>
  );
}

export default WrappedForm;

// props.headingTagName, optional, h1
// props.heading, optional, ''
// props.headingClass, optional, ''
// props.mainContent, optional, null

WrappedForm.defaultProps = {
  headingTagName: 'h1'
};