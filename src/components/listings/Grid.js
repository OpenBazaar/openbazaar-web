import React, { Component } from 'react';
import Card from './Card';
// import './Grid.scss';

export default class extends Component {
  componentDidMount() {
  }

  render() {
    console.dir(this.props);
    return (
      <div className="ListingsGrid">
        { this.props.cards.map( card => <Card {...card} />) }
      </div>
    );
  }
}
