// import {
//   take,
//   takeLatest,
//   cancel,
//   fork,
//   put,
//   call,
// } from 'redux-saga/effects';
// import { get as getNode } from 'utils/ipfs';
// import { get as getDb } from 'utils/database';
// import { OWN_PROFILE_SET } from 'actions/auth';

// const ipfsAdds = {};

// function* ipfsAdd(action) {
//   let handleError = true;
  
//   try {
//     let db;

//     try {
//       db = yield call(getDb());
//     } catch (e) {
//       // todo: how to recover from this? Is it maybe so much of an edge case that
//       // logging is enough?
//       const path = action.payload.path;
//       console.error(`Unable to add the content to IPFS at path "${path}"` +
//         `because there is no database connection.`);
//       handleError = false;
//       throw e;
//     }
//   } catch (e) {
//     if (handleError) {
//       // handle dat shit
//     }
//   } finally {
//     delete ipfsAdds[action.payload.type];
//   }
// }

// const IPFS_ADD = 'IPFS_ADD';

// export function* ipfsAddWatcher() {
//   while (true) {
//     const action = yield take(IPFS_ADD);

//     if (ipfsAdds[action.payload.type]) {
//       yield cancel(ipfsAdds[action.payload.type]);
//       delete ipfsAdds[action.payload.type];
//     }

//     ipfsAdds[action.type] = yield fork(action);
//   }
// }

// export function* ownProfileSetWatcher() {
//   while (true) {
//     const action = yield takeLatest(OWN_PROFILE_SET);

//     // TODO: make an action creator rather than hard coding the action
//     yield put({
//       type: IPFS_ADD,
//       payload: {
//         // TODO: make some type of IPFS_ADD "type" constants somewhere
//         type: 'OWN_PROFILE',
//         path: 'profile.json',
//         content: Buffer.from(action.payload.profile),
//       }
//     });
//   }
// }

// // anytime the profile changes
// // -- add it to ipfs
// // ---- upon complete
// // ------ fire action IPFS_ADDED
// // ---- upon fail, log error

// // anytime a listing changes
// // fire IPFS_ADD_LISTING

// // takeEvery IPFS_ADD_LISTING
// // -- add it to ipfs
// // ---- upon complete
// // ------ update the listing index
// // ------ add it to ipfs
// // -------- upon complete
// // ---------- fire action IPFS_ADDED
// // -------- upon fail, log error
// // ---- upon fail, log error

// // takeLatest IPFS_ADDED
// // -- toggle needIpfsAdd flag
// // -- toggle global needsPublish flag
// // -- fire PUBLISH ACTION

// // takeLatest PUBLISH
// // -- fire PUBLISHING action
// // ---- republish root
// // ---- fire PUBLISH_SUCCESS, PUBLISH_FAIL action
// // ------ on PUBLISH_SUCCESS

// // on startup
// // -- look through needIpfsAdd records
// // ---- ones that need it fire respective IPFS_ADD_* action