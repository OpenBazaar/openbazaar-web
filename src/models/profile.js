import { get as getDB } from 'util/database';

export const validateProfile = (data = {}) => {
  return null;
}

export const save = (data = {}) => {
  console.log('scoob');
  const scoob = new Promise((resolve, reject) => {
    console.log('noob');
    getDB()
      .then(
        db => {
          console.log('boob');
          return db.instance.profile.upsert(data);
        },
        e => {
          console.log('how dare charlie funkers');
          window.dare = e;
          reject(`Unable to connect to the database: ${e}`);
        }
      )
      .then(
        profile => resolve(),
        e => reject(`Unable to save the profile: ${e}`)
      );
  });
  window.scoob = scoob;
  return scoob;
}