// todo: doc me up
export function swallowException(fn) {
  if (typeof fn !== 'function') {
    throw new Error('Please provide a function to execute.');
  }

  try {
    fn();
  } catch (e) {
    // pass
  }
}
