import React from 'react';
import { GATEWAY_URL } from 'util/constants';
import './Card.scss';
import 'styles/containers.scss';
import 'styles/layout.scss';
import 'styles/type.scss';
import 'styles/theme.scss';

const listingImgUrl = hash =>
  `url('${GATEWAY_URL}images/${hash}'), url('../../img/defaultItem.png')`;

export default function(props) {
  return (
    <div className="ListingCard border clrBr tx5">
      <div
        className="ListingCard-listingImage"
        style={{
          backgroundImage: listingImgUrl(props.thumbnail.small)
        }}
      />
      <div className="ListingCard-content borderTop clrBr">
        <div className="ListingCard-title rowTn clamp">{props.title}</div>
        <div className="flexVCent gutterH noOverflow">
          <div className="flexNoShrink">0.0 (0)</div>
          <div className="flexExpand flexHRight">$1.99</div>
        </div>
      </div>
    </div>
  );
}
