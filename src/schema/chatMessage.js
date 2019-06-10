const schema = {
  title: 'Chat message schema',
  description: 'Database schema for a chat message',
  version: 0,
  type: 'object',
  properties: {
    messageID: {
      type: 'string',
      primary: true
    },
    peerID: {
      type: 'string',
      encrypted: true
    },
    message: {
      type: 'string',
      encrypted: true
    },
    outgoing: {
      type: 'boolean',
      encrypted: true,
      default: true
    },
    timestamp: {
      type: 'string',
      encrypted: true,
      index: true,
    },
    read: {
      type: 'boolean',
      encrypted: true,
      default: false
    },
    subject: {
      type: 'string',
      encrypted: true,
      default: ''
    }
  },
  required: ['messageID', 'peerID', 'message', 'timestamp']
};

export default schema;
