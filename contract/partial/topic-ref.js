module.exports = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'title'],
  properties: {
    key: {
      type: 'string',
      title: 'Clé du sujet'
    },
    title: {
      type: 'string',
      title: 'Libellé du sujet'
    }
  }
}
