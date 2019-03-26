import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Card from './card/Card';
import './Grid.scss';

export default class Grid extends Component {
  render() {
    return (
      <div className="ListingsGrid">
        {this.props.cards.map(card => {
          const vendorId = this.props.vendorId || card.vendorId;

          return (
            <Card
              key={`${vendorId}-${card.data.slug}`}
              baseUrl={this.props.listingBaseUrl}
              listing={card}
            />
          );
        })}
      </div>
    );
  }
}

Grid.defaultProps = {
  cards: []
};

Grid.propTypes = {
  vendorId: PropTypes.string,
  listingBaseUrl: PropTypes.string,
  cards: function(props, propName, componentName) {
    if (!Array.isArray(props.cards)) {
      return new Error('The cards prop must be provided as an array.');
    }

    if (!props.vendorId) {
      props.cards.some(card => {
        if (typeof card.vendorId === 'string' && card.vendorId) {
          return true;
        }

        return new Error(
          'If not providing a top-level vendorId prop, then ' +
            'each card must have one set as a non-empty string.'
        );
      });
    }
  }
};
