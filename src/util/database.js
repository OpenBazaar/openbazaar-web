import * as RxDB from 'rxdb';
import pouchDbAdapterIdb from 'pouchdb-adapter-idb';
import pouchDbAdapterHttp from 'pouchdb-adapter-http';
import profileSchema from 'schema/profile';

const collections = [
  {
    name: 'profile',
    schema: profileSchema,
    sync: true,
  },
];

RxDB.QueryChangeDetector.enableDebugging();

RxDB.plugin(pouchDbAdapterIdb);
RxDB.plugin(pouchDbAdapterHttp); //enable syncing over http

// todo: this should be driven from a config file
const syncUrl = `http://${window.location.hostname}:5984/`;

let dbPromises = {};

const _create = async (name, password) => {
  const db = await RxDB.create({
    name,
    adapter: 'idb',
    password
  });

  
  if (process.env.NODE_ENV === 'development') {
    // write to window for debugging
    window.db = db;
  }

  // show leadership in title
  // db.waitForLeadership().then(() => {
  //     console.log('isLeader now');
  //     document.title = '♛ ' + document.title;
  // });

  // create collections
  await Promise.all(collections.map(data => db.collection(data)));

  // hooks
  // db.collections.heroes.preInsert(docObj => {
  //     const { color } = docObj;
  //     return db.collections.heroes.findOne({color}).exec().then(has => {
  //         if (has != null) {
  //             alert('another hero already has the color ' + color);
  //             throw new Error('color already there');
  //         }
  //         return db;
  //     });
  // });

  // sync
  // console.log('DatabaseService: sync');
  collections
    .filter(col => col.sync)
    .map(col => col.name)
    .map(colName => db[colName].sync({
      remote: syncUrl + colName + '/'
    }));

  return db;
};

export const get = (name, password) => {
  ['name', 'password'].forEach(arg => {
    if (typeof arg !== 'string' || !arg) {
      throw new Error(`Please provide the ${arg} argument as a non-empty string.`);
    }
  });

  if (!dbPromises[name])
    dbPromises[name] = _create(name, password);
  return dbPromises[name];
}