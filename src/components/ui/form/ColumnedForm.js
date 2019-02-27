import React from 'react';

const ColumnedForm = props => {
  const labelColClass = `ColumnedForm-labeCol col${props.labelColCount}`;
  const fieldColClass = `ColumnedForm-fieldCol col${props.fieldColCount}`;

  return (
    <form className={`ColumnedForm ${props.className}`}>
      {
        props.rows.map(row => {
          let helper = null;

          if (row.helperContent) {
            helper = row.helperContent;
          } else if (row.helperText) {
            helper = <div className="clrT2 txSm">{row.helperText}</div>
          }

          return (
            <div
              className="ColumnedForm-row flexRow gutterH"
              key={row.key}>
              <div className={labelColClass}>
                {row.labelColContent}
                {helper}
              </div>
              <div className={fieldColClass}>{row.fieldColContent}</div>
            </div>
          );
        })
      }
    </form>
  );
}

export default ColumnedForm;

// ====> ensure types
// props.rows
// {
//   labelColContent: <Component />,
//   fieldColContent: <Component />,
//   helperContent: <Component />,
//   helperText: '',
//   key: <require-a-unique-key-as-stringer>
// }

ColumnedForm.defaultProps = {
  className: 'box clrP padMdKids padStack',
  labelColCount: 3,
  fieldColCount: 9,
  rows: [],
};