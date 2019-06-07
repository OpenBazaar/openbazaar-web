import { getPoly } from 'util/polyglot';
import React from 'react';

export default function(props) {
  return (
    <div className="RetryError">
      <div className="RetryError-errorMessage clrTErr row">
        {props.errorMessage}
      </div>
      <div className="RetryError-btnRetryWrap txCtr">
        <button
          className="RetryError-btnRetry btn clrP"
          onClick={props.onRetryClick}
        >
          {props.btnRetryLabel || getPoly().t('retryError.btnRetry')}
        </button>
      </div>
    </div>
  );
}
