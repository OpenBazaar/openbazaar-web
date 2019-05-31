const schema = {
  title: 'Chat conversation schema',
  description: 'Database schema for a chat conversation',
  version: 0,
  type: 'object',
  properties: {
    peerID: {
      type: 'string',
      primary: true
    },
    lastMessage: {
      type: 'string',
      encrypted: false
    },
    outgoing: {
      type: 'boolean',
      encrypted: false,
      default: true
    },
    timestamp: {
      type: 'string',
      encrypted: false,
    },
    unread: {
      type: 'number',
      encrypted: false,
      default: 0
    }
  },
  required: ['peerID', 'lastMessage', 'outgoing', 'timestamp', 'unread']
};

export default schema;
