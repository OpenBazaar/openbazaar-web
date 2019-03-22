export const nonEmptyString = (props, propName, componentName) => {
  const val = props[propName];

  if (typeof val !== 'string' || !val) {
    return new Error(`${propName} must be provided as a non-empty string`);
  }
};
