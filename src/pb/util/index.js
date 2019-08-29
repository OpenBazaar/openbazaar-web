import protobuf from 'protobufjs';
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

        // TODO: probably better to leave the zeros in here and strip them in
        // convertFields.
        if (newObj[key].seconds === 0) delete newObj[key].seconds;
        if (newObj[key].nanos === 0) delete newObj[key].nanos;
      }
    });

  return newObj;
}

function convertFields(obj, PB) {
  const numericFields = [
    'double',
    'float',
    'int32',
    'int64',
    'uint32',
    'uint64',
    'sint32',
    'sint64',
    'fixed32',
    'fixed64',
    'sfixed32',
    'sfixed64',
  ];

  const converted = Object
    .keys(obj)
    .reduce((converted, field) => {
      const value = obj[field];

      const Field = PB.fields[field];

      if (Field) {
        const resolvedType = Field.resolvedType;

        if (resolvedType) {
          if (resolvedType instanceof protobuf.Enum) {
            // If the field is an Enum and it's set to the first item (default item)
            // return the nothing so the field is not included in the resulting object.
            if (value === 0) {
              return converted;
            }
          } else if (Field.repeated) {
            converted[field] = value
              .map(fieldObj => (
                resolvedType ?
                  convertFields(fieldObj, resolvedType) : fieldObj
              ));
            return converted;
          } else {
            converted[field] = convertFields(value, resolvedType);
            return converted;
          }
        } else {
          // TODO: this will need to be updated to account for the fact that
          // longs will be represented as strings with the default being "0"
          // (I think)
          if (numericFields.includes(Field.type)) {
            if (value !== 0) {
              converted[field] = value;
            }
            return converted;
          } else if (Field.type === 'bool') {
            if (value !== false) {
              converted[field] = value;
            }
            return converted;
          } else if (Field.type === 'string') {
            if (value !== '') {
              converted[field] = value;
            }
            return converted;
          }          
        }
      }

      converted[field] = value;
      return converted;
    }, {});

  return converted;  
}

/*
 * Will encode a protobuf without defaults, which is how GO (and perhaps other pb
 * implementations) does it.
 *
 * @param {object} message - A plain javascript object or protobuf instance.
 * @param {object} PB - The protobuf class that corresponds to the provided message.
 *
 * @returns {Uint8Array} - The encoded message.
 */
export function encodeWithoutDefaults(message, PB) {
  const messagePB =
    message instanceof protobuf.Message ?
      message :
      PB.create(message);

  const pbErr = PB.verify(message);

  if (pbErr) {
    throw new Error(`Unable to verify the provided message protobuf: ${pbErr}`);
  }

  const messageObj = PB.toObject(messagePB, {
    defaults: false,
    arrays: false,
    objects: false,
    oneofs: true,
  });

  const converted = convertFields(messageObj, PB);

  return PB.encode(converted).finish();
}