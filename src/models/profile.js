import { get as getDB } from 'util/database';
import { getIdentity } from 'util/auth';
import { addRequiredError, addInvalidTypeError } from './';

// todo: doc me up
export const validate = (data = {}) => {
  const errors = {};

  // For now just validating the two fields in the
  // onboarding modal. Will build up as more fields
  // hit the UI.

  // todo: could probably abstract the below more to
  // not be so repetetive.

  if (typeof data.peerID !== 'string' || !data.peerID) {
    addRequiredError('peerID', errors);
  } else if (typeof data.peerID !== 'string') {
    addInvalidTypeError('peerID', 'string', errors);
  }

  if (typeof data.name !== 'string' || !data.name) {
    addRequiredError('name', errors);
  } else if (typeof data.name !== 'string') {
    addInvalidTypeError('name', 'string', errors);
  }

  if (data.shortDescription && typeof data.shortDescription !== 'string') {
    addInvalidTypeError('shortDescription', 'string', errors);
  }

  return Object.keys(errors).length ? errors : null;
};

export const save = (data = {}) => {
  const profileData = {
    moderatorInfo: null,
    contactInfo: null,
    colors: null,
    avatarHashes: null,
    ...data
  };

  return new Promise((resolve, reject) => {
    getDB()
      .then(db => {
        return db.profile.upsert(profileData);
      })
      .then(profile => resolve(profile))
      .catch(e => {
        reject(e);
        throw e;
      });
  });
};

export async function getOwnProfile() {
  const identity = getIdentity();

  if (!identity) {
    throw new Error(
      'Unable to obtain the indentity. Ensure you are logged in.'
    );
  }

  const db = await getDB();

  return db.profile
    .findOne()
    .where('peerID')
    .eq(identity.peerID)
    .exec();
}

export function getName(profile) {
  if (typeof profile !== 'object') {
    throw new Error('Please provide a profile object.');
  }

  return (
    (profile.handle && `@${profile.handle}`) || profile.name || profile.peerID
  );
}
