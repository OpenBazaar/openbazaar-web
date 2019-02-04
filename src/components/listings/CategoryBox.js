import React from 'react';
import ListingsGrid from 'components/listings/Grid';
import './CategoryBox.scss';

export default function (props) {
  let heading;
  let allBtn;

  if (props.heading) {
    heading = <h1 className="h2">{props.heading}</h1>;
  }

  if (props.onAllClick || props.allUrl) {
    const clickHandler = props.onAllClick ?
      props.onAllClick : () => {};

    if (props.allUrl) {
      allBtn = <a className='btn' href={props.allUrl} onClick={clickHandler}>See All</a>
    } else {
      allBtn = <button className='btn' onClick={clickHandler}>See All</button>
    }
  }

  return (
    <section className="CategoryBox">
      {heading}
      <ListingsGrid cards={props.cards} />
      {allBtn}
    </section>
  )
}