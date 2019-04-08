"use strict";

const axios = require('axios');

Object.defineProperty(exports, '__esModule', {
  value: true
});

for (let key in axios) {
  if (axios.hasOwnProperty(key) && key !== 'default') {
    exports[key] = axios[key];
  }
}

/*
 * The main purpose of the wrapper is to add a cancel function
 * to the fetch promise, so the request can be canceled in an
 * arguably easier way than having to go through the standard
 * axios cancel flow.
 *
 * ES6 breaks this.
 *
 * TODO: maybe monkey patching in App.js would be better?
 */
exports.default = (...args) => {
  console.log('you axios me');
  const source = axios.CancelToken.source();
  const axiosArgs = args.slice();
  const appendCancel =
    args[1] && (
      args[1] === undefined || !!args[1]
    );
  
  axiosArgs[1] = Object.assign({
    cancelToken: source.token,
  }, axiosArgs[1]);
  
  const fetch = axios.apply(this, axiosArgs);
  
  if (appendCancel) {
    fetch.cancel = msg => source.cancel(msg);  
  }  

  return fetch;
};