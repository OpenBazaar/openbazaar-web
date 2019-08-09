import { isObjectLike } from 'lodash';
import { RFC3339_REGEX } from 'core/constants';

export function generatePbTimestamp(timestamp = new Date()) {
  if (!(timestamp instanceof Date)) {
    throw new Error(
      'If providing a timestamp, it must be provided as a Date instance.'
    );
  }

  return {
    seconds: Math.floor(timestamp / 1000),
    nanos: timestamp % 1000
  };
}


/*
 * Accepts a plain object and will convert any google timestamp (really RFC3339
 * strings) to an object containing seconds/nanos. This will allow it to not error
 * when piped through PB.fromObject().
 *
 * Basically, it's a way to address this issue:
 * https://github.com/protobufjs/protobuf.js/issues/893
 */
export function convertTimestamps(obj) {
  const newObj = { ...obj };

  Object.keys(newObj)
    .forEach(key => {
      const field = newObj[key];

      // Convert any google timestamp fields to objects
      // We're checking whether the field is matches a RFC3339 regex. Not the most
      // ideal way to determine if the field is of the google timestamp type. But, the
      // alternative involves crawling multiple complex PB schema related objects.
      if (isObjectLike(field) && !Array.isArray(field)) {
        newObj[key] = convertTimestamps(field);
      } else if (
        typeof newObj[key] === 'string' &&
        RFC3339_REGEX.test(field)
      ) {
        newObj[key] = generatePbTimestamp(new Date(field));
      }
    });

  return newObj;
}