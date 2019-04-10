import Polyglot from 'node-polyglot';

let polyglot = null;

export const loadLang = lang => {
  if (typeof lang !== 'string' || !lang) {
    throw new Error('Please provide a language as a non-empty string.');
  }

  return new Promise((resolve, reject) => {
    import(`../languages/${lang}.json`)
      .then(module => {
        polyglot = polyglot || new Polyglot();
        polyglot.extend(module);
        resolve(polyglot);
      })
      .catch(e => reject(e));
  });
};

export const getPoly = () => polyglot;
