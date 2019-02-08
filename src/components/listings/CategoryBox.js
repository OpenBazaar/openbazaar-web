import React from 'react';
import ListingsGrid from 'components/listings/Grid';
import 'styles/layout.scss';
import './CategoryBox.scss';

export default function (props) {
  let cards = props.cards;
  let heading = null;

  if (props.heading) {
    heading = <h1 className="h2 CategoryBox-heading">{props.heading}</h1>;
  }

  if (['tablet', 'desktop'].includes(props.breakpoint)) {
    cards = props.cards.slice(0, 6);
  }

  const noResultsYet = props.fetching || props.fetchFailed;
  const fetchStateClass = noResultsYet ? 'CategoryBox-noResultsYet' : '';
  const btnSellAllClass = props.fetching || props.fetchFailed ?
    'btn disabled' : 'btn';

  return (
    <section className={`CategoryBox ${fetchStateClass}`}>
      { heading }
      <div className="rowHg">
        <ListingsGrid cards={cards} />
      </div>
      <div class="flexCent rowHg">
        <button className={btnSellAllClass} onClick={() => alert('coming soon')}>See All</button>
      </div>
      <hr className="clrBr" />
    </section>
  )
}
