const owner = require('./partial/owner')
const recipient = require('./partial/recipient')
const modifier = require('./partial/modifier')
const topicRef = require('./partial/topic-ref')

module.exports = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'sender', 'topic', 'recipient'],
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
    created: modifier,
    updated: modifier
  }
}
