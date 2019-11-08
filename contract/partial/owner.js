module.exports = {
  type: 'object',
  title: 'Propriétaire',
  additionalProperties: false,
  required: ['type', 'id'],
  readOnly: true,
  properties: {
    type: {
      type: 'string',
      enum: ['user', 'organization'],
      title: 'Type'
    },
    id: {
      type: 'string',
      description: 'The unique id of the user or organization'
    },
    name: {
      type: 'string',
      description: 'The display name of the user or organization'
    }
  }

}
