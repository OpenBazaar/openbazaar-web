const schema = {
  title: 'User profile schema',
  description: 'Database schema for the profile of a user',
  version: 0,
  type: 'object',
  properties: {
    peerID: {
      type: 'string',
      primary: true,
    },
    handle: {
      type: 'string',
      encrypted: true
    },    
    name: {
      type: 'string',
      encrypted: true
    },
    location: {
      type: 'string',
      encrypted: true
    },
    about: {
      type: 'string',
      encrypted: true
    },
    shortDescription: {
      type: 'string',
      encrypted: true      
    },
    nsfw: {
      type: 'boolean',
      encrypted: true,
      default: false,
    },
    vendor: {
      type: 'boolean',
      encrypted: true,
      default: false,
    },
    moderator: {
      type: 'boolean',
      encrypted: true,
      default: false,
    },
    // Will work this in later
    moderatorInfo: {
      type: 'object',
      encrypted: true,
      default: {}
    },
    contactInfo: {
      type: 'object',
      encrypted: true,
      properties: {
        website: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        phoneNumber: {
          type: 'string',
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
              },
            }
          }
        }
      }
    },
    colors: {
      type: 'object',
      encrypted: true,
      properties: {
        primary: {
          type: 'string',
        },
        secondary: {
          type: 'string',
        },
        text: {
          type: 'string',
        },
        highlight: {
          type: 'string',
        },
        highlightText: {
          type: 'string',
        },
      }
    },
  },
  avatarHashes: {
    type: 'array',
    uniqueItems: true,
    items: {
      type: 'object',
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
        },
      }
    }
  },
  // todo: more should almost certainly be required
  required: ['peerID', 'name']
};

export default schema;
