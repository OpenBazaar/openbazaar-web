import React from 'react';
import PropTypes from 'prop-types';

const Test = props => {
  return (
    <section>
      <h1>{props.title}</h1>
      <p>{props.body}</p>
      <p>Yummers: 🥒 🥒 🥒 🥒 🥒 🥒 🥒 🥒 🥒 🥒</p>
    </section>
  );
};

Test.modulePath = 'components/modals/Test';

export default Test;
