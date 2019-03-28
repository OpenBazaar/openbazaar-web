import { getPoly } from 'util/polyglot';
import { swallowException } from 'util/index';
import { ellipsifyAfter } from 'util/string';
import { getListing } from 'models/listing';
import {
  takeEvery,
  take,
  fork,
  put,
  call,
  select,
  cancel,
  cancelled,
} from 'redux-saga/effects';
import {
  open,
  MODAL_CLOSE,
  MODAL_OPEN,
} from 'actions/modals';
import {
  listingCardOpenListing,
  listingCardCancelListingOpen,
  listingCardRetryListingOpen,
} from 'actions/listingCard';
import ListingLoadingModal from 'components/listings/card/ListingLoadingModal';
import ListingDetail from 'components/listings/ListingDetail';

const getRouterState = state => state.router;
const getAuthState = state => state.auth;

const openListingTasks = {};

// A Map of the listing detail id to the openListingTasks entry.
const listingDetailModals = {};

function* openListing(action) {
  const listingCardId = getListingCardId(action);
  let loadingModalId = null;
  let listingTitle = getPoly().t('userContentLoading.unknownListingTitle.message');
  let urlAtOpen = null;

  openListingTasks[listingCardId].cleanup = function* () {
    if (urlAtOpen !== null) {
      window.history.pushState({}, '', urlAtOpen);
    }

    if (loadingModalId) {
      yield put({
        type: MODAL_CLOSE,
        id: loadingModalId,
      });
    }

    delete listingDetailModals[loadingModalId];
    delete openListingTasks[listingCardId];
  }

  try {
    let hash = null;

    try {
      hash = action.payload.listing.data.hash;
    } catch {
      throw new Error('Please provide a hash in the listing data.');
    }

    const routerState = yield select(getRouterState);
    urlAtOpen = routerState
      .location
      .pathname;

    window.history.pushState({}, '', `/listing/${hash}`);

    let vendor = null;
    let userName = '';
    let userAvatarHashes = {};
    let ownAvatarHashes = {};

    swallowException(() => {
      vendor = action
        .props
        .listing
        .relationships
        .vendor
        .data;
    });

    swallowException(() => (userName = vendor.name));
    swallowException(() => (userAvatarHashes = vendor.avatarHashes));
    swallowException(function* () {
      ownAvatarHashes = yield select(getAuthState).profile.avatarHashes
    });
    swallowException(() => (listingTitle = action.payload.listing.data.title));

    loadingModalId = yield put(
      open({
        Component: ListingLoadingModal,
        isProcessing: true,
        userName,
        userAvatarHashes,
        ownAvatarHashes,
      })
    );

    yield put({
      type: MODAL_OPEN,
      id: loadingModalId,
      contentText: '',
      isProcessing: true,
    });

    // todo does 'this' === openListingTasks[listingCardId].task???
    const listingReponse = yield call(getListing, hash);
    const listingDetailId = openListingTasks[listingCardId].listingDetailId = yield put(
      open({
        Component: ListingDetail,
        listing: listingReponse.data,
      })
    );
    listingDetailModals[listingDetailId] = openListingTasks[listingCardId].task;

    yield put({
      type: MODAL_CLOSE,
      id: loadingModalId,
    });
  } catch (e) {
    if (loadingModalId) {
      yield put({
        type: MODAL_OPEN,
        id: loadingModalId,
        contentText:
          getPoly()
            .t('userContentLoading.failTextListing', {
              listing: ellipsifyAfter(listingTitle, 50),
            }),
        isProcessing: false,
      });
    }

    console.error(e);
  } finally {
    if (yield cancelled()) {
      yield call(openListingTasks[listingCardId].cleanup);
    }
  }
}

const getListingCardId = action => (
  `${action.payload.listing.vendorId}/` +
    action.payload.listing.data.slug
)

function* cancelListingOpen(action) {
  const id = getListingCardId(action);

  if (openListingTasks[id]) {
    yield cancel(openListingTasks[id].task);
  }
};

function* retryListingOpen(action) {
  const id = getListingCardId(action);

  if (openListingTasks[id]) {
    yield cancelListingOpen(action);
    yield fork(openListingWatcher);
  }
};

// function* modalClose(action) {
//   if (action.id)
// };

export function* openListingWatcher() {
  while (true) {
    const action = yield take(listingCardOpenListing)
    const id = getListingCardId(action);

    if (!openListingTasks[id]) {
      openListingTasks[id] = {
        task: yield fork(openListing, action),
      };
    }
  }
}

export function* cancelListingOpenWatcher() {
  yield takeEvery(listingCardCancelListingOpen, cancelListingOpen);
}

export function* retryListingOpenWatcher() {
  yield takeEvery(listingCardRetryListingOpen, retryListingOpen);
}

// export function* modalCloseWatcher() {
//   yield takeEvery(MODAL_CLOSE, modalClose);
// }