import { get } from 'axios';
import { getSearchUrl } from 'util/constants';

export const FETCH_CATEGORIES_REQUEST = 'FETCH_CATEGORIES_REQUEST';
export const FETCH_CATEGORIES_FAILURE = 'FETCH_CATEGORIES_FAILURE';
export const FETCH_CATEGORIES_SUCCESS = 'FETCH_CATEGORIES_SUCCESS';

const maxConcurrentFetchCats = 3;

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


// export const fetchCategories = (props = {}) => (dispatch, getState) => {
//   if (fetchCategoriesPromise) return fetchCategoriesPromise;

//   return fetchCategoriesPromise = new Promise((resolve, reject) => {
//     catsToFetch =
//       getState().categories.filter(cat => !cat.fetching);



//     processedCats = [];
//     const fetchCount = maxConcurrentFetchCats - (categories - catsToFetch.length);

//     const setProcessedCat = cat => {
//       processedCats.push(cat);
//       if (
//         [...new Set(categories)].length ===
//         [...new Set(processedCats)].lngth
//       ) {
//         fetchCategoriesPromise = null;
//       }
//     };

//     if (fetchCount)

//     catsToFetch.slice(0, fetchCount)
//       .forEach(cat => {
//         dispatch({
//           type: FETCH_CATEGORIES_REQUEST,
//           catgory: cat,
//         });

//         get(getSearchUrl({
//             params: { q: cat }
//           }))
//           .then(
//             response => {
//               dispatch({
//                 type: FETCH_CATEGORIES_SUCCESS,
//                 catgory: cat,
//                 response,
//               });

//               fetchCategories();
//             },
//             error => {
//               dispatch({
//                 type: FETCH_CATEGORIES_SUCCESS,
//                 catgory: cat,
//                 error,
//               });

//               fetchCategories();
//             }
//           ).catch(() => {})
//             .then(() => {
//               setProcessedCat(cat);
//               if (fetchCategoriesPromise) {
//                 // if we still have categories to fetch
//                 fetchCategories();
//               }
//             });
//       });
//   });
// };

export const fetchCategory = (props = {}) => (dispatch, getState) => {
  // const currentlyNotFetching =
  //   getState().categories.filter(cat => !cat.fetching && !cat.fetchFailed);
  // const fetchCount = maxConcurrentFetchCats - (categories - currentlyNotFetching.length);
  const cat = props.category;
  if (!categories.includes(cat)) return;

  dispatch({
    type: FETCH_CATEGORIES_REQUEST,
    catgory: cat,
  });


};


// fetchCategories => fetch any cats that are not currently fetching and when those plus the current fetches are done, return
// fetchCategory => if not fetching fetch it. Return when fetch complete.

// in-progress category fetches
let catFetches = {};
let fetchCategoriesPromise = null;

export const fetchCategories = (props = {}) => (dispatch, getState) => {
  if (fetchCategoriesPromise) return fetchCategoriesPromise;

  fetchCategoriesPromise = new Promise((resolve, reject) => {
    fetchCategoriesPromise._resolve = resolve;
    fetchCategoriesPromise._reject = reject;
  });

  return fetchCategoriesPromise;
};