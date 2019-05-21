import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCategories } from 'reducers/discovery';
import * as DiscoverActions from 'actions/discovery';
import CategoryBox from 'components/listings/CategoryBox';
import './Discovery.scss';

class Discovery extends Component {
  constructor(props) {
    super(props);
    this.handleRetryClick = this.handleRetryClick.bind(this);
  }

  componentDidMount() {
    this.props.actions.discovery.fetchCategories();
  }

  componentWillUnmount() {
    this.props.actions.discovery.leavePage();
  }

  handleRetryClick(e) {
    this.props.actions.discovery.fetchCategory({ category: e.category });
  }

  render() {
    return (
      <div className="Discovery pageWidth pagePadTopBottom">
        {this.props.categories.map(cat => (
          <div className="Discovery-categoryBoxWrap rowHg" key={cat.id}>
            <CategoryBox
              breakpoint={this.props.responsive.breakpoint}
              {...cat}
              onRetryClick={() =>
                this.handleRetryClick({ category: cat.category })
              }
            />
          </div>
        ))}
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    categories: getCategories(state.discovery),
    responsive: state.responsive
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      discovery: bindActionCreators(DiscoverActions, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Discovery);
