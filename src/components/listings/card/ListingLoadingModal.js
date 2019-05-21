import React, { Component } from 'react';
import UserContentLoading from 'components/misc/UserContentLoading';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ListingCardActions from 'actions/listingCard';

class ListingLoadingModal extends Component {
  static modalProps = {
    ...UserContentLoading.modalProps,
    path: 'components/listings/card/ListingLoadingModal'
  };

  constructor(props) {
    super(props);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleRetryClick = this.handleRetryClick.bind(this);
  }

  handleCancelClick() {
    this.props.actions.card.cancelOpenListing({ id: this.props.id });
  }

  handleRetryClick() {
    this.props.actions.card.retryOpenListing({ id: this.props.id });
  }

  render() {
    return (
      <UserContentLoading
        onCancelClick={this.handleCancelClick}
        onRetryClick={this.handleRetryClick}
        {...this.props}
      />
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      card: bindActionCreators(ListingCardActions, dispatch)
    }
  };
}

export default connect(
  () => ({}),
  mapDispatchToProps
)(ListingLoadingModal);
