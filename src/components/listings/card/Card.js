import React, { Component } from 'react';
import { formatCurrency } from 'util/currency';
import { getPoly } from 'util/polyglot';
import { listingImgBgStyle } from 'util/urls';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as listingCardActions from 'actions/listingCard';
import './Card.scss';
import 'styles/containers.scss';
import 'styles/layout.scss';
import 'styles/type.scss';
import 'styles/theme.scss';

class Card extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const cardData = { ...this.props };
    delete cardData.actions;
    this.props.actions.openListing(cardData);
  }

  render() {
    const cardData = this.props.listing.data;

    // todo: should probably be made into a component
    // todo: make that parseFloat trick into a toFixedDropZeros function in
    //   a number util module.
    let rating =
      cardData.averageRating === 0
        ? `${cardData.averageRating} (${cardData.ratingCount})`
        : `${parseFloat(cardData.averageRating.toFixed(2))}  (${
            cardData.ratingCount
          })`;
    rating = (
      <div className="flexVCent">
        <div>
          <span role="img" aria-label={getPoly().t('emojis.ratingsStar')}>
            ⭐
          </span>
        </div>
        <div>{rating}</div>
      </div>
    );

    let price = null;

    if (cardData.price) {
      price = formatCurrency(
        cardData.price.amount,
        cardData.price.currencyCode
      );
    }

    return (
      <div className="ListingCard border clrBr tx5" onClick={this.handleClick}>
        <div
          className="ListingCard-listingImage"
          style={{
            backgroundImage: listingImgBgStyle(cardData.thumbnail.small)
          }}
        />
        <div className="ListingCard-content borderTop clrBr">
          <div className="ListingCard-title rowTn clamp txB">
            {cardData.title}
          </div>
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
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators(listingCardActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Card);
