// {
//     "message": "🐙🔗🍶 How do you say? Is it on the ben gay thrust it up the slick donkey blue maria. No doubt he went over there for more than ta and crumpets. Right up her alley, eh?",
//     "messageId": "QmV9TuiCWjBXT9W1bg4zM4jEJDpfUCZoi6q8gB6gViGUgk",
//     "outgoing": false,
//     "peerID": "QmYTXDyMNjdUSvqNc88T2VeVF3KdG7PMefnGQKrp9NZ5Tp",
//     "read": true,
//     "subject": "",
//     "timestamp": "2019-05-24T14:17:28-06:00"
// },

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
      encrypted: true
    },
    unread: {
      type: 'number',
      encrypted: true,
      default: 0
    }
  },
  required: ['peerID', 'lastMessage', 'outgoing', 'timestamp', 'unread']
};

export default schema;
