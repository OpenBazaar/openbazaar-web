import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCategories } from 'reducers/discovery';
import * as DiscoverActions from 'actions/discovery';
import CategoryBox from 'components/listings/CategoryBox';
import './Discovery.scss';

class Discovery extends Component {
  componentDidMount() {
    this.props.actions.discovery.fetchCategories();
  }

  render() {
    return (
      <div className="Discovery pageWidth pagePadTopBottom">
        {
          this.props.categories.map(cat =>
            <div className="rowHg" key={cat.id}>
              <CategoryBox
                breakpoint={this.props.responsive.breakpoint}
                {...cat} />
            </div>
          )
        }
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    categories: getCategories(state.discovery),
    responsive: state.responsive,
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
