import { createReducer, createSelector } from 'redux-starter-kit';
import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_FAILURE,
  FETCH_CATEGORIES_SUCCESS,
  categories
} from 'actions/discovery';

const initialState = {
  categories: categories.reduce((acc, cat) => {
    acc[cat] = {
      id: cat.replace(/\s+/g, '-').toLowerCase(),
      category: cat,
      // eventually this should come from a translation keyed by the id
      heading: cat.charAt(0).toUpperCase() + cat.substr(1),
      fetching: false,
      fetchFailed: false,
      fetchError: '',
      cards: []
    };

    return acc;
  }, {}),
  categoriesOrder: categories
};

const fetchCatRequest = (state, action) => {
  state.categories[action.category] = {
    ...state.categories[action.category],
    fetching: true,
    fetchFailed: false,
    fetchError: ''
  };
};

const fetchCatFailure = (state, action) => {
  state.categories[action.category] = {
    ...state.categories[action.category],
    fetching: false,
    fetchFailed: true,
    fetchError: action.error
  };
};

const fetchCatSucceess = (state, action) => {
  state.categories[action.category] = {
    ...state.categories[action.category],
    fetching: false,
    fetchFailed: false,
    fetchError: '',
    cards: action.response.results.results.map(result => {
      const cardData = { ...result };
      delete cardData.type;
      return {
        vendorId: cardData.relationships.vendor.data.peerID,
        ...cardData
      };
    })
  };
};

export default createReducer(initialState, {
  [FETCH_CATEGORIES_REQUEST]: fetchCatRequest,
  [FETCH_CATEGORIES_FAILURE]: fetchCatFailure,
  [FETCH_CATEGORIES_SUCCESS]: fetchCatSucceess
});

// selectors

export const getCategories = createSelector(
  ['categories', 'categoriesOrder'],
  (cats, order) => {
    return order.map(cat => cats[cat]);
  }
);
