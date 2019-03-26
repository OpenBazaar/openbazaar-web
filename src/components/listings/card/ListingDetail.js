import React, { Component } from 'react';
import ListingDetail from 'components/listings/ListingDetail';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ListingCardActions from 'actions/listingCard';

class ListingLoadingModal extends Component {
  static modalProps = {
    ...ListingDetail.modalProps,
    path: 'components/listings/card/ListingDetail',
  }

  constructor(props) {
    super(props);
    // this.handleCancelClick = this.handleCancelClick.bind(this);
    // this.handleRetryClick = this.handleRetryClick.bind(this);
  }

  // handleCancelClick() {
  //   this.props.actions.listingCard
  //     .cancelListingDetailOpen({ id: this.props.id });
  // }

  // handleRetryClick() {
  //   // this.props.actions.listingCard
  //   //   .cancelListingDetailOpen({ id: this.props.id });
  // }

  render() {
    return (
      <ListingDetail
        onCancelClick={this.handleCancelClick}
        onRetryClick={this.handleRetryClick}
        { ...this.props }
      />
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      listingCard: bindActionCreators(ListingCardActions, dispatch),
    }
  };
}

export default connect(
  () => {},
  mapDispatchToProps
)(ListingLoadingModal);