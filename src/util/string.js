// todo: doc me up
// todo: smart enough to not truncate on whitespace?
export function ellipsifyAfter(str, pos = 9999) {
  if (typeof str !== 'string') {
    throw new Error('str must be provided as a string.');
  }

  if (typeof pos !== 'number') {
    throw new Error('pos must be provided as a number.');
  }

  return str.length > pos ? `${str.slice(0, pos)}…` : str;
}
