import React, { Component } from 'react';
import { GATEWAY_URL } from 'util/constants';
import { formatCurrency } from 'util/currency';
import { getPoly } from 'util/polyglot';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as listingCardActions from 'actions/listingCard';
import './Card.scss';
import 'styles/containers.scss';
import 'styles/layout.scss';
import 'styles/type.scss';
import 'styles/theme.scss';

// todo: move to more global place
const listingImgUrl = hash =>
  `url('${GATEWAY_URL}images/${hash}'), url('../../img/defaultItem.png')`;

class Card extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.actions.card.openListingDetail(this.props);
  }

  render() {
    // todo: should probably be made into a component
    // todo: make that parseFloat trick into a toFixedDropZeros function in
    //   a number util module.
    let rating = this.props.averageRating === 0 ?
      `${this.props.averageRating} (${this.props.ratingCount})` :
      `${parseFloat((this.props.averageRating).toFixed(2))}  (${this.props.ratingCount})`;
    rating = (
      <div className="flexVCent">
        <div>
          <span
            role="img"
            aria-label={getPoly().t('emojis.ratingsStar')}>
            ⭐
          </span>
        </div>
        <div>{rating}</div>
      </div>
    );

    let price = null;

    if (this.props.price)  {
      price = formatCurrency(this.props.price.amount, this.props.price.currencyCode);
    }

    return (
      <div className="ListingCard border clrBr tx5" onClick={this.handleClick}>
        <div
          className="ListingCard-listingImage"
          style={{
            backgroundImage: listingImgUrl(this.props.thumbnail.small)
          }}
        />
        <div className="ListingCard-content borderTop clrBr">
          <div className="ListingCard-title rowTn clamp txB">{this.props.title}</div>
          <div className="flexVCent gutterH noOverflow">
            <div className="flexNoShrink">{rating}</div>
            <div className="flexExpand flexHRight">{price}</div>
          </div>
        </div>
      </div>
    );
  }
}

// todo: default onClick of card should router to the listing detail page

function mapStateToProps(state, prop) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      card: bindActionCreators(listingCardActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Card);
