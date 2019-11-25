import uuid from 'uuid/v1';
import { getRandomInt } from 'util/number';
import * as RxDB from 'rxdb';
import RxDBWatchForChangesModule from 'rxdb/plugins/watch-for-changes';
import pouchDbAdapterIdb from 'pouchdb-adapter-idb';
import pouchDbAdapterHttp from 'pouchdb-adapter-http';
import PouchAdapterMemory from 'pouchdb-adapter-memory';
import profileSchema from 'schema/profile';
import chatMessageSchema from 'schema/chatMessage';

const collections = [
  {
    name: 'profile',
    schema: profileSchema,
    sync: true
  },
  {
    name: 'chatmessage',
    schema: chatMessageSchema,
    sync: true
  },
  {
    name: 'unsentchatmessages',
    schema: chatMessageSchema,
    sync: false
  }
];

// RxDB.QueryChangeDetector.enableDebugging();

RxDB.plugin(pouchDbAdapterIdb);
RxDB.plugin(pouchDbAdapterHttp); //enable syncing over http
RxDB.plugin(PouchAdapterMemory);
RxDB.plugin(RxDBWatchForChangesModule);

// const syncUrl = process.env.REACT_APP_DB_SYNC_URL;

let curDb = null;

const _create = async (name, password) => {
  const db = await RxDB.create({
    name: name.slice(0, 10),
    adapter: 'idb',
    password,
  });

  if (process.env.NODE_ENV === 'development') {
    // write to window for debugging
    window.db = db;
  }

  // create collections
  await Promise.all(collections.map(data => db.collection({ ...data })));

  const colNames = collections.filter(col => col.sync).map(col => col.name);

  // colNames.forEach(colName => db[colName].watchForChanges());

  // sync
  // colNames
  //   .map(colName => {
  //     return db[colName].sync({
  //       remote: `${syncUrl}/${name}_${colName}`
  //     });
  //   });

  const peerIDs = [
    'Qmbr7QtmKCVZ5g5mePNZHaetCKF9gryXxiLcyrdBPbMbnd',
    'QmYTXDyMNjdUSvqNc88T2VeVF3KdG7PMefnGQKrp9NZ5Tp',
    'QmQGpXWj6y4Sgmc4F8hvFFo3srhaPrv4oY3QsJ2FyGUh9K',
    'QmU5ZSKVz2GhsqE6EmBGVCtrui4YhUXny6rbvsSf5h2xvH',
    'QmT16YssMhbDT8MjS7UrFV8BKjvbALA8R4kLMJywma3aDu',
    'QmVpB6diQwCq3r7KV7BzVwgkVLLGtyLErN36So3yg5Z5aZ',
    'QmTiyLne8hCzAJVJzADposCQs8w7UqosvC9sK1wqtgmD5d',
    'QmQ8g6HkawoosFrKNcjLhykRmvj3ra4QTSmeDcNTHrXWAJ',
    'QmQinqZKXsLzzjTyTyNpZ8eNUUZNaRqtJ43cGa7hV7MscV',
    'QmYUBFiztxr35LUnAksFiZdzdGEJBNuzcXutmeeZAazFB6'
  ];

  const getRandomPeer = () => peerIDs[getRandomInt(0, peerIDs.length - 1)];

  const messages = [
    'the chikun is on the barbie, aint is so Joe?',
    "don't pee on my leg and tell me its raining",
    "that's for sure!",
    'Well I come from Alabami with a banji on me knee. I come from ' +
      "west end Talee Hoo with a moop moop peek-a-boo. Ole Susani, oh don't " +
      'you cry yo ass for me, for I come from Alabami with a banji on me knee.'
  ];

  const getRandomMessage = () => messages[getRandomInt(0, messages.length - 1)];

  console.log(`inboundChatMessage() is ready to go.`);
  window.inboundChatMessage = async (
    message = getRandomMessage(),
    peerID = getRandomPeer()
  ) => {
    const theGoods = {
      peerID,
      messageID: uuid(),
      message,
      outgoing: false,
      read: false,
      timestamp: new Date().toISOString()
    };

    await db.chatmessage.insert(theGoods);
  };

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
