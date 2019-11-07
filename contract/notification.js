const owner = require('./partial/owner')
const recipient = require('./partial/recipient')
const topicRef = require('./partial/topic-ref')

module.exports = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'sender', 'topic'],
  properties: {
    _id: {
      type: 'string',
      title: 'Identifiant',
      readOnly: true
    },
    title: {
      type: 'string',
      title: 'Libellé'
    },
    body: {
      type: 'string',
      title: 'Contenu'
    },
    // sender is the owner of the topic
    sender: owner,
    topic: topicRef,
    // it will be the recipient of the matched subscription
    recipient,
    date: {
      readOnly: true,
      type: 'string',
      description: 'reception date',
      format: 'date-time'
    }
  }
}
