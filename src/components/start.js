import 'babel-polyfill'; // only needed when you dont have polyfills
import RxDB from 'rxdb';

const schema = {
  title: 'User profile schema',
  description: 'Database schema for the profile of a user',
  version: 0,
  type: 'object',
  properties: {
    name: {
      type: 'string',
      primary: true,
    },
    description: {
      type: 'string',
      encrypted: true,
    },
  }
}

console.log('cheeck those facks son');

