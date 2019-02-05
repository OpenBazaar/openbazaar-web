import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ListingsGrid from 'components/listings/Grid';
import './CategoryBox.scss';

class CatgoryBox extends Component {
  componentDidMount() {
  }

  render() {
    let heading;
    let allBtn;

    if (this.props.heading) {
      heading = <h1 className="h2 CategoryBox-heading">{this.props.heading}</h1>;
    }

    if (this.props.onAllClick || this.props.allUrl) {
      const clickHandler = this.props.onAllClick ?
        this.props.onAllClick : () => {};

      if (this.props.allUrl) {
        allBtn = <a className='btn' href={this.props.allUrl} onClick={clickHandler}>See All</a>
      } else {
        allBtn = <button className='btn' onClick={clickHandler}>See All</button>
      }
    }

    const preComponent = this.props.responsive.breakpoint !== 'tablet' ? heading : null
    return (
      <section className="CategoryBox">
        { this.props.responsive.breakpoint === 'tablet' ? heading : null }
        <ListingsGrid preComponent={preComponent} cards={this.props.cards} />
        {allBtn}
      </section>
    )
  }
}

function mapStateToProps(state, prop) {
  return {
    responsive: state.responsive,
  };
}

// function mapDispatchToProps(dispatch) {
//   return {
//     // actions: {
//     //   modals: bindActionCreators(ModalActions, dispatch)
//     // }
//   };
// }

export default connect(
  mapStateToProps,
  // mapDispatchToProps
)(CatgoryBox);
