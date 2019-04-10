const schema = {
  title: 'User profile schema',
  description: 'Database schema for the profile of a user',
  version: 0,
  type: 'object',
  properties: {
    peerID: {
      type: 'string',
      primary: true
    },
    handle: {
      type: 'string',
      encrypted: true,
      default: ''
    },
    name: {
      type: 'string',
      encrypted: true,
      default: ''
    },
    location: {
      type: 'string',
      encrypted: true,
      default: ''
    },
    about: {
      type: 'string',
      encrypted: true,
      default: ''
    },
    shortDescription: {
      type: 'string',
      encrypted: true,
      default: ''
    },
    nsfw: {
      type: 'boolean',
      encrypted: true,
      default: false
    },
    vendor: {
      type: 'boolean',
      encrypted: true,
      default: false
    },
    moderator: {
      type: 'boolean',
      encrypted: true,
      default: false
    },
    moderatorInfo: {
      type: ['object', 'null'],
      encrypted: true
    },
    contactInfo: {
      type: ['object', 'null'],
      encrypted: true,
      properties: {
        website: {
          type: 'string'
        },
        email: {
          type: 'string'
        },
        phoneNumber: {
          type: 'string'
        },
        social: {
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string'
              },
              username: {
                type: 'string'
              },
              proof: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    colors: {
      type: ['object', 'null'],
      encrypted: true,
      properties: {
        primary: {
          type: 'string'
        },
        secondary: {
          type: 'string'
        },
        text: {
          type: 'string'
        },
        highlight: {
          type: 'string'
        },
        highlightText: {
          type: 'string'
        }
      }
    },
    avatarHashes: {
      type: ['object', 'null'],
      encrypted: true,
      properties: {
        tiny: {
          type: 'string'
        },
        small: {
          type: 'string'
        },
        medium: {
          type: 'string'
        },
        large: {
          type: 'string'
        },
        original: {
          type: 'string'
        }
      }
    }
  },
  required: ['peerID', 'name']
};

export default schema;
