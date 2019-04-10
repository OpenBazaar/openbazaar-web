import { get, CancelToken, isCancel } from 'axios';
import { SEARCH_RANDOM_URL } from 'util/constants';

export const FETCH_CATEGORIES_REQUEST = 'FETCH_CATEGORIES_REQUEST';
export const FETCH_CATEGORIES_FAILURE = 'FETCH_CATEGORIES_FAILURE';
export const FETCH_CATEGORIES_SUCCESS = 'FETCH_CATEGORIES_SUCCESS';

const maxConcurrentFetchCats = 4;

export const categories = [
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
  'electronics'
];

// in-progress category fetches
let catFetches = {};

const fetchCat = (cat, dispatch) => {
  if (!cat || typeof cat !== 'string') {
    throw new Error(`${cat} must be a non-empty string.`);
  }

  if (typeof dispatch !== 'function') {
    throw new Error('Please provide a dispatch function');
  }

  if (catFetches[cat]) return catFetches[cat];

  const source = CancelToken.source();

  catFetches[cat] = new Promise((resolve, reject) => {
    let catFetched = false;
    let catFetching = false;

    const _fetchCat = catToFetch => {
      catFetching = true;
      get(SEARCH_RANDOM_URL, {
        params: {
          q: cat,
          size: 8
        },
        cancelToken: source.token
      })
        .then(response => {
          resolve(response.data);
          dispatch({
            type: FETCH_CATEGORIES_SUCCESS,
            response: response.data,
            category: cat
          });
        })
        .catch(error => {
          if (isCancel(error)) return;
          console.error(error);
          dispatch({
            type: FETCH_CATEGORIES_FAILURE,
            error: error.message,
            category: cat
          });
        })
        .then(() => {
          delete catFetches[cat];
          catFetched = true;
          catFetching = false;
        });
    };

    const curFetchKeys = Object.keys(catFetches);

    if (curFetchKeys.length >= maxConcurrentFetchCats) {
      curFetchKeys.forEach(curFetchCat => {
        catFetches[curFetchCat]
          .then()
          .catch(() => {})
          .then(() => {
            if (!catFetching && !catFetched) {
              _fetchCat(cat);
            }
          });
      });
    } else {
      _fetchCat(cat);
    }
  });

  dispatch({
    type: FETCH_CATEGORIES_REQUEST,
    category: cat
  });

  catFetches[cat].cancel = msg => source.cancel(msg);

  return catFetches[cat];
};

export const fetchCategories = (props = {}) => (dispatch, getState) => {
  categories.forEach(cat => fetchCat(cat, dispatch));
};

export const fetchCategory = (props = {}) => (dispatch, getState) => {
  if (!props.category || typeof props.category !== 'string') {
    throw new Error('Please provide a category as a non-empty string.');
  }

  return fetchCat(props.category, dispatch);
};

export const leavePage = (props = {}) => (dispatch, getState) => {
  Object.keys(catFetches).forEach(cat => catFetches[cat].cancel());
};
