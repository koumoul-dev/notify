module.exports = {
  type: 'object',
  required: ['id'],
  readOnly: true,
  properties: {
    id: {
      type: 'string',
      description: 'The unique id of the user'
    },
    name: {
      type: 'string',
      description: 'The display name of the user'
    }
  }
}
