/*
 * Will execute the given function and ignore any exceptions. This is useful if you're
 * relying on external data that may not conform to the format you are expecting and
 * you want to gracefully handle that scenario (i.e. not bomb on an excption onr have to
 * write a bunch of code to validate the data). For example:
 *
 * const userName = swallowException(
 *   () => (externalData.user.first + externalData.user.last)
 * );
 *
 * If the data has no 'user' object, rather than an exception halting a part of the app,
 * an empty string (by default) will be displayed. You could have also passed in your
 * own fallback as the second argument, e.g. 'Name Unknown'.
 *
 * @param {string} fn - A function to be executed.
 * @param {string} [fallbackReturnVal = ''] - If the provided fn results in an exception,
 *   then this value will be returned.
 *
 * @returns {string} - If fn executes without an exception, then it's return value will
 *   be returned, otherwise fallbackReturnVal will be returned.
 */
export function swallowException(fn, fallbackReturnVal = '') {
  if (typeof fn !== 'function') {
    throw new Error('Please provide a function to execute.');
  }

  let returnVal;

  try {
    returnVal = fn();
  } catch (e) {
    returnVal = fallbackReturnVal;
  }

  return returnVal;
}

// todo: doc me up
export function setAsyncTimeout(fn, ms) {
  return new Promise(resolve => setTimeout(() => resolve(fn()), ms));
}

// todo: doc me up
// validate args
export function animationFrameInterval(
  process,
  shouldContinue,
  options = {}
) {
  const opts = {
    maxOpsPerFrame: 25,
  }

  return new Promise((resolve, reject) => {
    const executeProcess = () => {
      let opsThisFrame = 0;

      if (shouldContinue()) {
        requestAnimationFrame(() => {
          while (
            opsThisFrame < opts.maxOpsPerFrame &&
            shouldContinue()
          ) {
            process();
            opsThisFrame++;
          }

          executeProcess();
        });
      } else {
        resolve();
      }
    }

    executeProcess();
  });
}