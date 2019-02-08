import { get } from 'axios';
import { SEARCH_URL } from 'util/constants';

export const FETCH_CATEGORIES_REQUEST = 'FETCH_CATEGORIES_REQUEST';
export const FETCH_CATEGORIES_FAILURE = 'FETCH_CATEGORIES_FAILURE';
export const FETCH_CATEGORIES_SUCCESS = 'FETCH_CATEGORIES_SUCCESS';

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

// in-progress category fetches
let catFetches = {};

const fetchCat = (cat, dispatch) => {
  if (!cat || typeof cat !== 'string') {
    throw new Error(`${cat} must be a non-empty string.`);
  }

  if (typeof dispatch !== 'function') {
    throw new Error('Please provide a dispatch function')
  }

  if (catFetches[cat]) return catFetches[cat];

  catFetches[cat] = new Promise((resolve, reject) => {
    let catFetched = false;  

    const _fetchCat = catToFetch => {
      catFetches[catToFetch] = get(`${SEARCH_URL}/listings/random`, {
        params: {
          q: cat,
          size: 8,
        }
      })
        .then(response => {
          resolve(response);
          dispatch({
            type: FETCH_CATEGORIES_SUCCESS,
            response,
          });
        })
        .catch(error => {
          reject(error);
          dispatch({
            type: FETCH_CATEGORIES_FAILURE,
            error,
          });
        })
        .then(() => {
          delete catFetches[cat];
          catFetched = true;
        });
    }

    const curFetchKeys = Object.keys(catFetches);

    if (curFetchKeys >= maxConcurrentFetchCats) {
      curFetchKeys.forEach(curFetchCat => {
        catFetches[curFetchCat]
          .then()
          .catch()
          .then(() => {
            if (!catFetches[cat] && !catFetched) {
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
  });

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