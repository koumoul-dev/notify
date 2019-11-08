const owner = require('./partial/owner')
const recipient = require('./partial/recipient')
const modifier = require('./partial/modifier')
const topicRef = require('./partial/topic-ref')

module.exports = {
  type: 'object',
  additionalProperties: false,
  required: ['sender', 'topic', 'recipient', 'outputs'],
  properties: {
    _id: {
      type: 'string',
      title: 'Identifiant',
      readOnly: true
    },
    title: {
      type: 'string',
      title: 'Libellé de la souscription'
    },
    // the sender is the owner of the topic
    sender: owner,
    topic: topicRef,
    recipient,
    outputs: {
      type: 'array',
      title: 'Sorties',
      default: ['web'],
      items: {
        type: 'string',
        oneOf: [{
          const: 'web',
          title: 'Notification Web'
        }, {
          const: 'email',
          title: 'Envoi de mail'
        }]
      }
    },
    created: modifier,
    updated: modifier
  }
}
