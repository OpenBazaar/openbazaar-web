/**
 * Returns a random number between min (inclusive) and max (exclusive).
 * https://stackoverflow.com/a/1527820/632806
 */
export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Similar to getRandomArbitrary, except this will return an integer between
 * the provided range.
 */
export function getRandomInt(min, max) {
  const minimum = Math.ceil(min);
  const maximum = Math.floor(max);
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}
