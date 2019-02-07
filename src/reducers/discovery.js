import { get } from 'axios';
import { stringify } from 'query-string';
import { createReducer } from 'redux-starter-kit';
import { getSearchUrl } from 'util/constants';
import { FETCH_CATEGORIES } from 'actions/discovery';

const initialState = {
  categories: [],
};

const defaultCat = {
  fetching: false,
  cards: [],
};

const maxConcurrentFetchCats = 4;

const categories = [
  'bitcoin',
  'crypto',
  'music',
  'books',
  'games',
  'art',
  'handmade',
  'clothing',
  'toys',
  'health',
  'electronics',
];

const fetchCategories = (state, action) => {
  const currentlyFetching = state.categories.filter(cat => !!cat.fetching);
  const fetchCount = maxConcurrentFetchCats - currentlyFetching.length;

  for (let i = 0; i < fetchCount; i++) {
    const qs = stringify({ q: 'fat pickles'});
    get(getSearchUrl())
  }
};

export default createReducer(initialState, {
  [FETCH_CATEGORIES]: fetchCategories,
});
