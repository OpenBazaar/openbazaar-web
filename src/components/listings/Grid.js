import React, { Component } from 'react';
import Card from './Card';
import './Grid.scss';

export default class extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <div className="ListingsGrid">
        { this.props.cards.map( card => <Card {...card} />) }
      </div>
    );
  }
}
