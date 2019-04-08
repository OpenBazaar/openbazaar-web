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
  {
    name: 'slippy',
    schema:   {
      title: 'User profile schema',
      description: 'Database schema for the profile of a user',
      version: 0,
      type: 'object',
      properties: {
        hi: {
          type: 'string',
          primary: true
        },
      },
    },
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
    name: name.slice(0, 10),
    adapter: 'idb',
    password
  });

  if (process.env.NODE_ENV === 'development') {
    // write to window for debugging
    window.db = db;
  }

  // create collections
  await Promise.all(collections.map(
    data => db.collection({ ...data })
  ));

  // sync
  collections
    .filter(col => col.sync)
    .map(col => col.name)
    .map(colName => {
      return db[colName].sync({
        remote: `${syncUrl}/${name}/`,
      })
    });

  await db.slippy.upsert({ hi: 'bye' });

  return db;
};

export const get = (name, password) => {
  if (name !== undefined || password !== undefined) {
    ['name', 'password'].forEach(arg => {
      if (typeof arg !== 'string' || !arg) {
        throw new Error(
          'If providing the name or password, both must be provided ' +
            'as non-empty strings.'
        );
      }
    });
  }

  if (name) {
    if (curDb && curDb.name === name && curDb.password === password) {
      return curDb.promise;
    } else {
      if (curDb) destroy(name);
      curDb = {
        name,
        password,
        promise: _create(name, password).catch(e => {
          if (curDb && curDb.name === name && curDb.password === password) {
            curDb = null;
          }

          throw e;
        })
      };

      return curDb.promise;
    }
  } else {
    return curDb
      ? curDb.promise
      : Promise.reject(
          new Error(
            'There is no current db connection. You can create one ' +
              'by passing in a name and password.'
          )
        );
  }
};

export const destroy = name => {
  if (typeof name !== 'string' || !name) {
    throw new Error('Please provide a database name as a non-empty string.');
  }

  // What happens if you try to reconnect to a database that is
  // being destroyed?
  if (curDb && curDb.name === name) {
    return curDb.promise.then(db => {
      curDb = null;
      db.destroy();
    });
  }

  return Promise.resolve();
};
