import React, { Component } from 'react';
import { swallowException } from 'util/index';
import { formatCurrency } from 'util/currency';
import { listingImgUrl, listingImgBgStyle } from 'util/urls';
import { getPoly } from 'util/polyglot';
import { connect } from 'react-redux';
import 'styles/containers.scss';
import 'styles/type.scss';
import 'styles/ui/buttons.scss';
import './ListingDetail.scss';

class ListingDetail extends Component {
  static modalProps = {
    path: 'components/listings/ListingDetail',
    rootClass: 'modalL'
  };

  render() {
    let innerListing = {};
    swallowException(() => (innerListing = this.props.listing.listing));

    let title = '';
    swallowException(() => (title = innerListing.item.title));

    let price = '';
    swallowException(
      () => (price = formatCurrency(innerListing.item.price, 'USD'))
    );

    let mainImageUrl = null;
    swallowException(() => (mainImageUrl = innerListing.item.images[0].large));

    const buyNowPanelHeight = 100;

    let content = null;

    if (this.props.responsive.breakpoint !== 'mobile') {
      content = (
        <div className="ListingDetail">
          <div className="contentBox padMd clrP clrBr clrSh1">
            <div className="flex gutterHLg">
              <div className="flexExpand">
                <h1 className="h2 txUnb">{title}</h1>
              </div>
              <div className="flexNoShrink">
                <h2 className="txUnb">{price}</h2>
              </div>
            </div>
            <div className="flex gutterHLg">
              <div
                className="ListingDetail-mainImage"
                style={{ backgroundImage: listingImgBgStyle(mainImageUrl) }}
              />
              <div className="flexExpand txCtr">
                <button
                  className="btnHg txUp clrBAttGrad clrBrDec1 clrTOnEmph"
                  onClick={() => alert('not yet slick willy.')}
                >
                  {getPoly().t('listingDetail.btnBuyNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      content = (
        <div
          className="ListingDetail clrP clrBr pad"
          style={{ marginBottom: `${buyNowPanelHeight + 10}px` }}
        >
          <div className="flexColRows gutterV">
            <div
              className="ListingDetail-mainImage"
              style={{ backgroundImage: listingImgBgStyle(mainImageUrl) }}
            >
              <img
                src={listingImgUrl(mainImageUrl)}
                style={{ visibility: 'hidden' }}
                alt=""
              />
            </div>
            <h1 className="h2 txUnb">{title}</h1>
          </div>
          <div
            className="ListingDetail-buyNowPanel flex pad clrP clrBr"
            style={{ height: `${buyNowPanelHeight}px` }}
          >
            <div className="flexExpand">{price}</div>
            <div>
              <button
                className="btn txUp clrBAttGrad clrBrDec1 clrTOnEmph"
                onClick={() => alert('not yet slick willy.')}
              >
                {getPoly().t('listingDetail.btnBuyNow')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return content;
  }
}

function mapStateToProps(state, prop) {
  return {
    responsive: state.responsive
  };
}

export default connect(mapStateToProps)(ListingDetail);
