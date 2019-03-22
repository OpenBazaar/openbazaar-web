import React from 'react';
import ListingsGrid from 'components/listings/Grid';
import Spinner from 'components/ui/Spinner';
import 'styles/layout.scss';
import './CategoryBox.scss';

export default function(props) {
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
  const btnSellAllClass =
    props.fetching || props.fetchFailed ? 'btn disabled' : 'btn';
  let results = <ListingsGrid cards={cards} />;

  if (props.fetching) {
    // TODO: bake greaterThan(breakpoint) and lessThan(breakpoint) functions
    // into the responsive reducer file.
    const spinnerSize = ['tablet', 'desktop', 'pageWidth', 'wide'].includes(
      props.breakpoint
    )
      ? 'large'
      : 'medium';

    results = (
      <div className="flexCent">
        <Spinner size={spinnerSize} />
      </div>
    );
  } else if (props.fetchFailed) {
    const errorText = props.fetchError ? (
      <span>
        There was an error retrieving the results:
        <br />
        {props.fetchError}
      </span>
    ) : (
      'There was an error retrieving the results.'
    );
    const retryButton = props.onRetryClick ? (
      <button className="btn" onClick={props.onRetryClick}>
        Retry
      </button>
    ) : null;

    results = (
      <div className="flexCent">
        <div className="txCtr">
          <p>{errorText}</p>
          {retryButton}
        </div>
      </div>
    );
  }

  let seeAll =
    props.fetching || props.fetchFailed ? null : (
      <div className="flexCent rowHg">
        <button
          className={btnSellAllClass}
          onClick={() => alert('coming soon')}
        >
          See All
        </button>
      </div>
    );

  return (
    <section className={`CategoryBox ${fetchStateClass}`}>
      {heading}
      <div className="rowHg CategoryBox-resultsWrap">{results}</div>
      {seeAll}
      <hr className="clrBr" />
    </section>
  );
}
