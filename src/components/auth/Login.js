import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import WrappedForm from 'components/ui/WrappedForm';
// import './Grid.scss';

export default class Login extends Component {
  render() {
    const formContent = <p>Pee on your shoe aroo</p>;

    return (
      <WrappedForm
        heading="Howdy Slick Rick"
        mainContent={formContent}>
      </WrappedForm>
    );
  }
}

Login.modulePath = 'components/auth/Login';

// Grid.defaultProps = {
//   cards: []
// };

// Grid.propTypes = {
//   vendorId: PropTypes.string,
//   cards: function(props, propName, componentName) {
//     if (!Array.isArray(props.cards)) {
//       return new Error('The cards prop must be provided as an array.');
//     }

//     if (!props.vendorId) {
//       props.cards.some(card => {
//         if (typeof card.vendorId === 'string' && card.vendorId) {
//           return true;
//         }

//         return new Error(
//           'If not providing a top-level vendorId prop, then ' +
//             'each card must have one set as a non-empty string.'
//         );
//       });
//     }
//   }
// };
