import React from 'react';
import { GATEWAY_URL } from 'util/constants';
import { formatCurrency } from 'util/currency';
import './Card.scss';
import 'styles/containers.scss';
import 'styles/layout.scss';
import 'styles/type.scss';
import 'styles/theme.scss';

const listingImgUrl = hash =>
  `url('${GATEWAY_URL}images/${hash}'), url('../../img/defaultItem.png')`;

export default function(props) {
  console.dir(props);
  // todo: should probably be made into a component
  // todo: make that parseFloat trick into a toFixedDropZeros function in
  //   a number util module.
  let rating = props.averageRating === 0 ?
    `${props.averageRating} (${props.ratingCount})` :
    `${parseFloat((props.averageRating).toFixed(2))}  (${props.ratingCount})`;
  rating = (
    <div className="flexVCent">
      <div>⭐</div>
      <div>{rating}</div>
    </div>
  );

  let price = null;

  if (props.price)  {
    price = formatCurrency(props.price.amount, props.price.currencyCode);
  }

  return (
    <div className="ListingCard border clrBr tx5">
      <div
        className="ListingCard-listingImage"
        style={{
          backgroundImage: listingImgUrl(props.thumbnail.small)
        }}
      />
      <div className="ListingCard-content borderTop clrBr">
        <div className="ListingCard-title rowTn clamp txB">{props.title}</div>
        <div className="flexVCent gutterH noOverflow">
          <div className="flexNoShrink">{rating}</div>
          <div className="flexExpand flexHRight">{price}</div>
        </div>
      </div>
    </div>
  );
}
