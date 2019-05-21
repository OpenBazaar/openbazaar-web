import React from 'react';
import { Link } from 'react-router-dom';

const NoMatch = props => (
  <div className="pageWidth pagePad txCtr">
    <p>
      Whoopsie! I not know this url. Maybe the <Link to="/">home</Link> is the
      better for the you.
    </p>
  </div>
);

export default NoMatch;
