// TODO: write a test ensuring a 1:1 mapping of each enumerated type
// and a corresponding entry in the typesData object. Also validate the contents
// of each typesData object.
const types = {
  CHAT: 1,
}

export default types;

export const typesData = {
  [types.CHAT]: {
    value: 1,
    name: 'Chat',
  },
}
