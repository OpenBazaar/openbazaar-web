import { createReducer } from 'redux-starter-kit';
import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_FAILURE,
  FETCH_CATEGORIES_SUCCESS,
} from 'actions/discovery';

const initialState = {
  categories: [],
};

const defaultCat = {
  fetching: false,
  fetchFailed: false,
  fetchError: '',
  cards: [],
};

const fetchCatRequest = (state, action) => {
};

const fetchCatFailure = (state, action) => {
};

const fetchCatSucceess = (state, action) => {
};

export default createReducer(initialState, {
  [FETCH_CATEGORIES_REQUEST]: fetchCatRequest,
  [FETCH_CATEGORIES_FAILURE]: fetchCatFailure,
  [FETCH_CATEGORIES_SUCCESS]: fetchCatSucceess,
});
