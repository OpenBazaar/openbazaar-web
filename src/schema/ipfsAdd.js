const schema = {
  title: 'IPFS add schema',
  description: 'Database schema for ipfs add records',
  version: 0,
  type: 'object',
  properties: {
    type: {
      type: 'string',
    },
  },
  required: ['type']
};

export default schema;
