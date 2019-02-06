import React, { Component } from 'react';
import Card from './Card';
import './Grid.scss';

export default class extends Component {
  render() {
    return (
      <div className="ListingsGrid">
        {
          this.props.cards
            .map( card => <Card {...card}
              key={`${card.vendorId}-${card.slug}`} />)
        }
      </div>
    );
  }
}
