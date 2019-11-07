const owner = require('./partial/owner')
const modifier = require('./partial/modifier')

module.exports = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'owner', 'key'],
  properties: {
    key: {
      type: 'string',
      title: 'Clé'
    },
    title: {
      type: 'string',
      title: 'Libellé'
    },
    owner,
    created: modifier,
    updated: modifier
  }
}
