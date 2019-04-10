import React from 'react';
import PropTypes from 'prop-types';

/*
 * A columnd form is a form style heavily re-used in the desktop version,
 * for example, https://imgur.com/a/WNWEi97. It mainly involes passing in
 * rows prop with an array of data related to the label and field in the
 * row (please see the propTypes for more detail).
 */
const ColumnedForm = props => {
  const labelColClass = `ColumnedForm-labeCol col${props.labelColCount}`;
  const fieldColClass = `ColumnedForm-fieldCol col${props.fieldColCount}`;

  return (
    <form className={`ColumnedForm ${props.className}`}>
      {props.rows.map(row => {
        let helper = null;

        if (row.helperContent) {
          helper = row.helperContent;
        } else if (row.helperText) {
          helper = <div className="clrT2 txSm">{row.helperText}</div>;
        }

        return (
          <div className="ColumnedForm-row flexRow gutterH" key={row.key}>
            <div className={labelColClass}>
              {row.labelColContent}
              {helper}
            </div>
            <div className={fieldColClass}>{row.fieldColContent}</div>
          </div>
        );
      })}
    </form>
  );
};

export default ColumnedForm;

ColumnedForm.defaultProps = {
  className: 'box clrP padMdKids padStack',
  labelColCount: 3,
  fieldColCount: 9,
  rows: []
};

ColumnedForm.propTypes = {
  className: PropTypes.string,
  // The number of columns in the label column.
  labelColCount: PropTypes.number,
  // The number of columns in the field column.
  fieldColCount: PropTypes.number,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      // An element for the label column.
      labelColContent: PropTypes.element,
      // An element for the field column.
      fieldColContent: PropTypes.element,
      // An element for the helper which would go underneath the label. Could
      // also be provided as a string (see below).
      helperContent: PropTypes.element,
      // A string for the helper text which would appear under the label. Could
      // also be provided as a component (see above).
      helperText: PropTypes.string,
      // A unique string to be used as a key for the row.
      key: PropTypes.string.isRequired
    })
  )
};
