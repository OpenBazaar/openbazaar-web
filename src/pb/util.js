import protobuf from 'protobufjs';
import { isObjectLike } from 'lodash';
import { RFC3339_REGEX } from 'core/constants';

console.log('proto');
window.proto = protobuf;

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

        // TODO: probably better to leave the zeros in here and strip them in
        // convertFields.
        if (newObj[key].seconds === 0) delete newObj[key].seconds;
        if (newObj[key].nanos === 0) delete newObj[key].nanos;
      }
    });

  return newObj;
}

function convertFields(obj, PB) {
  const converted = Object
    .keys(obj)
    .reduce((converted, field) => {
      const fieldType = PB.fields[field];

      if (fieldType) {
        const FieldPB = PB[fieldType.type];

        if (fieldType.resolvedType instanceof protobuf.Enum) {
          // If the field is an Enum and it's set to the first item (default item)
          // return the nothing so the field is not included in the resulting object.
          if (FieldPB && (obj[field] === 0)) {
            return converted;
          }
        } else if (fieldType.repeated) {
          converted[field] = obj[field]
            .map(fieldObj => (
              FieldPB ?
                convertFields(fieldObj, FieldPB) : fieldObj
            ));
        } else if (FieldPB) {
          converted[field] = convertFields(obj[field], FieldPB);
          return converted;
        }
      }

      converted[field] = obj[field];
      return converted;
    }, {});

  return converted;  
}

/*
 * Will encode a protobuf in a way that matches how GO does it.
 *
 * @param {object} message - A plain javascript object or protobuf instance.
 * @param {object} PB - The protobuf class that corresponds to the provided message.
 *
 * @returns {Uint8Array} - The encoded message.
 */
export function goEncode(message, PB) {
  let messageObj = message;

  if (message instanceof protobuf.Message) {
    messageObj = PB.toObject(message, {
      defaults: false,
      arrays: false,
      objects: false,
    });
  }

  const converted = convertFields(messageObj, PB);

  return PB.encode(converted).finish();
}