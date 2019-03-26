import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import './Grid.scss';

export default class Grid extends Component {
  static modalProps = {
    path: 'components/listings/ListingDetail',
    // innerWrapClass: 'pad0',
    rootClass: 'modalL'
  };

  render() {
    console.dir(this.props);
    return (
      <div className="ListingDetail">
      </div>
    );
  }
}

// Grid.defaultProps = {
//   cards: []
// };

// Grid.propTypes = {
//   vendorId: PropTypes.string,
// };
