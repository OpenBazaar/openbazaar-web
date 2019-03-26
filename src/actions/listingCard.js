import { getListing } from 'models/listing';
import { getPoly } from 'util/polyglot';
import { swallowException } from 'util/index';
import { ellipsifyAfter } from 'util/string';
import {
  open,
  MODAL_CLOSE,
  MODAL_OPEN,
} from 'actions/modals';
import ListingLoadingModal from 'components/listings/card/ListingLoadingModal';
import ListingDetail from 'components/listings/ListingDetail';

const loadingModals = {};
const listingDetailModals = {};

export const openListingDetail = (props = {}) => (dispatch, getState) => {
  let hash = null;

  try {
    hash = props.listing.data.hash;
  } catch {
    throw new Error('Please provide a hash in the listing data.');
  }

  const urlAtOpen = getState()
    .router
    .location
    .pathname;
  
  window.history.pushState({}, '', `/listing/${props.listing.data.hash}`);

  let vendor = null;
  let userName = '';
  let userAvatarHashes = {};
  let ownAvatarHashes = {};
  let listingTitle = getPoly().t('userContentLoading.unknownListingTitle.message');

  swallowException(() => {
    vendor = props
      .listing
      .relationships
      .vendor
      .data;
  });

  swallowException(() => (userName = vendor.name));
  swallowException(() => (userAvatarHashes = vendor.avatarHashes));
  swallowException(() => (ownAvatarHashes = getState().auth.profile.avatarHashes));
  swallowException(() => (listingTitle = props.listing.data.title));

  const loadingModalId = open({
    Component: ListingLoadingModal,
    isProcessing: true,
    userName,
    userAvatarHashes,
    ownAvatarHashes,
  })(dispatch, getState);

  const fetchListing = () => {
    dispatch({
      type: MODAL_OPEN,
      id: loadingModalId,
      contentText: '',
      isProcessing: true,
    });

    getListing(hash)
      .then(response => {
        const listingDetailId = open({
          Component: ListingDetail,
          listing: response.data,
        })(dispatch, getState);

        listingDetailModals[listingDetailId] = {
          onClose: () => {
            window.history.pushState({}, '', urlAtOpen);
          },
        };

        dispatch({
          type: MODAL_CLOSE,
          id: loadingModalId,
        });        

        // load listing detail modal -
        //   onClose restore url
        // close loading modal -
        // delete entry from loadingModals{} - do this onClose
        //   of that modal.
      })
      .catch(e => {
        // set is processing to false
        // set error text
        dispatch({
          type: MODAL_OPEN,
          id: loadingModalId,
          contentText:
            getPoly()
              .t('userContentLoading.failTextListing', {
                listing: ellipsifyAfter(listingTitle, 50),
              }),
          isProcessing: false,
        });
      });
  };

  fetchListing();

  loadingModals[loadingModalId] = {
    cancel: () => {
      dispatch({
        type: MODAL_CLOSE,
        id: loadingModalId,
      });
      window.history.pushState({}, '', urlAtOpen);
      // cancel fetch
      // move cancel fetch and resotre url to "cleanup" function
      //   and call on cancel and modal close
    },
    retry: () => fetchListing(),
  }
};

export const cancelListingDetailOpen = (props = {}) => (dispatch, getState) => {
  if (loadingModals[props.id]) {
    loadingModals[props.id].cancel();
  }
};

export const retryListingDetailOpen = (props = {}) => (dispatch, getState) => {
  if (loadingModals[props.id]) {
    loadingModals[props.id].retry();
  }
};
