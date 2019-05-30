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

// todo: doc me up and validate args
export function setAsyncTimeout(fn, ms) {
  return new Promise(resolve => setTimeout(() => resolve(fn()), ms));
}
