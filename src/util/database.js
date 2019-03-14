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

let curDb = null;

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

  // create collections
  await Promise.all(collections.map(data => db.collection(data)));

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
  if (
    name !== undefined ||
    password !== undefined
  ) {
    ['name', 'password'].forEach(arg => {
      if (typeof arg !== 'string' || !arg) {
        throw new Error('If providing the name or password, both must be provided ' +
          'as non-empty strings.');
      }
    });    
  }

  if (curDb && !name) return curDb.promise;

  if (curDb) {
    if (
      !name ||
      (
        curDb.name === name &&
        curDb.password === password
      )
    ) {
      return curDb.promise;
    }
  } else {
    if (!name) {
      return Promise.reject('There is no current db connection. You can create one ' +
        'by passing in a name and password.');
    }
  }

  curDb = {
    name,
    password,
    promise: _create(name, password), 
  };

  return curDb.promise;
}

export const destroy = name => {
  if (typeof name !== 'string' || !name) {
    throw new Error('Please provide a database name as a non-empty string.');
  }

  // What happens if you try to reconnect to a database that is
  // being destroyed?
  // What happens if you try and destroy a database that is being created?
  if (curDb && curDb.name === name) {
    return curDb.promise
      .then(db => db.destroy());
  }

  return Promise.reject(
    new Error('Not connected to a database with that name.')
  );
}
