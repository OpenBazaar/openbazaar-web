import { isCancel } from 'axios';
import { getPoly } from 'util/polyglot';
import { swallowException } from 'util/index';
import { ellipsifyAfter } from 'util/string';
import { getListing } from 'models/listing';
import {
  take,
  fork,
  put,
  call,
  select,
  cancel,
  race
} from 'redux-saga/effects';
import { open, MODAL_CLOSE, MODAL_OPEN } from 'actions/modals';
import {
  LISTING_CARD_OPEN_LISTING,
  LISTING_CARD_CANCEL_OPEN_LISTING,
  LISTING_CARD_RETRY_OPEN_LISTING
} from 'actions/listingCard';
import ListingLoadingModal from 'components/listings/card/ListingLoadingModal';
import ListingDetail from 'components/listings/ListingDetail';
import SimpleMessage from 'components/modals/SimpleMessage';

const getRouterState = state => state.router;
const getAuthState = state => state.auth;

const getOpenListingTaskId = action =>
  `${action.payload.listing.vendorId}/` + action.payload.listing.data.slug;

function* openListing(task, action) {
  let loadingModalId = null;
  let listingTitle = getPoly().t(
    'userContentLoading.unknownListingTitle.message'
  );
  let urlAtOpen = null;
  let listingFetch = null;

  const restoreUrl = () => {
    if (urlAtOpen !== null) {
      window.history.pushState({}, '', urlAtOpen);
    }
  };

  try {
    let hash = null;

    try {
      hash = action.payload.listing.data.hash;
    } catch {
      throw new Error('Please provide a hash in the listing data.');
    }

    const routerState = yield select(getRouterState);
    urlAtOpen = routerState.location.pathname;

    window.history.pushState({}, '', `/listing/${hash}`);

    let vendor = null;
    let userName = '';
    let userAvatarHashes = {};
    let ownAvatarHashes = {};

    swallowException(() => {
      vendor = action.payload.listing.relationships.vendor.data;
    });

    swallowException(() => (userName = vendor.name));
    swallowException(() => (userAvatarHashes = vendor.avatarHashes));
    swallowException(function*() {
      ownAvatarHashes = yield select(getAuthState).profile.avatarHashes;
    });
    swallowException(() => (listingTitle = action.payload.listing.data.title));

    loadingModalId = yield put(
      open({
        Component: ListingLoadingModal,
        isProcessing: true,
        userName,
        userAvatarHashes,
        ownAvatarHashes
      })
    );

    let listingDetailId;

    function wrappedGetListing(hash) {
      listingFetch = getListing(hash);
      return listingFetch;
    }

    function* fetchListing() {
      yield put({
        type: MODAL_OPEN,
        id: loadingModalId,
        contentText: '',
        isProcessing: true
      });

      let listingReponse;

      try {
        listingReponse = yield call(wrappedGetListing, hash);
      } catch (e) {
        if (isCancel(e)) return;

        yield put({
          type: MODAL_OPEN,
          id: loadingModalId,
          contentText: getPoly().t('userContentLoading.failTextListing', {
            listing: ellipsifyAfter(listingTitle, 50)
          }),
          isProcessing: false
        });
      }

      if (listingReponse && listingReponse.status === 200) {
        listingDetailId = yield put(
          open({
            Component: ListingDetail,
            listing: listingReponse.data
          })
        );
      } else {
        while (true) {
          const retryAction = yield take(LISTING_CARD_RETRY_OPEN_LISTING);
          if (retryAction.payload.id === loadingModalId) {
            yield call(fetchListing);
          }
        }
      }
    }

    const { loadCancel } = yield race({
      fetchListing: call(fetchListing),
      loadCancel: call(function*() {
        let canceled = false;

        while (!canceled) {
          const cancelAction = yield take(LISTING_CARD_CANCEL_OPEN_LISTING);
          if (cancelAction.payload.id === loadingModalId) {
            canceled = true;
            return cancelAction;
          }
        }
      })
    });

    if (loadCancel) {
      yield cancel(task.get());
    } else {
      yield put({
        type: MODAL_CLOSE,
        id: loadingModalId
      });

      while (listingDetailId) {
        const modalCloseAction = yield take(MODAL_CLOSE);
        if (modalCloseAction.id === listingDetailId) {
          listingDetailId = null;
          yield call(restoreUrl);
        }
      }
    }
  } catch (e) {
    yield put(
      open({
        Component: SimpleMessage,
        title: getPoly().t('genericErrors.unableToPerformOp'),
        // todo: remove when simplemessage is refactored to
        //   only require one-of title and body.
        body: ''
      })
    );

    console.error(e);
  } finally {
    yield call(restoreUrl);

    if (loadingModalId) {
      yield put({
        type: MODAL_CLOSE,
        id: loadingModalId
      });
    }

    if (listingFetch && listingFetch.cancel) {
      listingFetch.cancel();
    }

    yield call(task.delete);
  }
}

const openListingTasks = {};

export function* openListingWatcher() {
  while (true) {
    const action = yield take(LISTING_CARD_OPEN_LISTING);
    const id = getOpenListingTaskId(action);

    if (!openListingTasks[id]) {
      openListingTasks[id] = yield fork(
        openListing,
        {
          get: () => openListingTasks[id],
          delete: () => delete openListingTasks[id]
        },
        action
      );
    }
  }
}
