import { get as getDB } from 'util/database';

export const validateProfile = (data = {}) => {
  return null;
}

export const save = (data = {}) => {
  const profileData = {
    moderatorInfo: null,
    contactInfo: null,
    colors: null,
    avatarHashes: null,
    ...data,
  }

  return new Promise((resolve, reject) => {
    getDB()
      .then(
        db => {
          return db.profile.upsert(profileData);
        }
      )
      .then(
        profile => resolve(),
      )
      .catch(e => {
        reject(e);
        throw e;
      });
  });
}