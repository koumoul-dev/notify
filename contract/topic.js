const owner = require('./partial/owner')
const modifier = require('./partial/modifier')

module.exports = () => ({
  type: 'object',
  additionalProperties: false,
  required: ['title', 'owner', 'key'],
  properties: {
    key: {
      type: 'string',
      title: 'Clé'
    },
    title: {
      oneOf: [{
        type: 'string',
        title: 'Libellé'
      }, {
        type: 'object',
        title: 'Libellé internationalisé',
        patternProperties: { '.*': { type: 'string' } }
      }]
    },
    owner,
    created: modifier,
    updated: modifier
  }
})
