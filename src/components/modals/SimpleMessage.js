import React from 'react';
import PropTypes from 'prop-types';

const SimpleMessage = props => {
  return (
    <section>
      <h1>{props.title}</h1>
      <p>{props.body}</p>
    </section>
  );
};

SimpleMessage.modulePath = 'components/modals/SimpleMessage';

// todo: probably only title should be required or maybe one-of title or body.
SimpleMessage.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired
};

export default SimpleMessage;
