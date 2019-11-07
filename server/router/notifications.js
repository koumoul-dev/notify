const express = require('express')
const shortid = require('shortid')
const config = require('config')
const ajv = require('ajv')()
const schema = require('../../contract/notification')
const validate = ajv.compile(schema)
const asyncWrap = require('../utils/async-wrap')
const findUtils = require('../utils/find')
const auth = require('../utils/auth')

const router = express.Router()

// Get the list of notifications
router.get('', auth(), asyncWrap(async (req, res, next) => {
  const sort = { date: -1 }
  const [skip, size] = findUtils.pagination(req.query)
  const query = { 'recipient.id': req.user.id }
  const notifications = req.app.get('db').collection('notifications')
  const [results, count] = await Promise.all([
    size > 0 ? notifications.find(query).limit(size).skip(skip).sort(sort).toArray() : Promise.resolve([]),
    notifications.countDocuments(query)
  ])
  res.json({ results, count })
}))

// push a notification
router.post('', asyncWrap(async (req, res, next) => {
  if (req.query.key) {
    if (req.query.key !== config.secretKeys.notifications) return res.status(401).send()
  } else {
    await auth(false)(req, res, () => {})
    if (!req.user) return res.status(401).send()
    req.body.sender = req.activeAccount
  }
  const db = req.app.get('db')
  const valid = validate(req.body)
  if (!valid) return res.status(400).send(validate.errors)

  const topicParts = req.body.topic.key.split(':')
  const topicKeys = topicParts.map((part, i) => topicParts.slice(0, i + 1).join(':'))
  const date = new Date()

  const subscriptionsCursor = db.collection('subscriptions')
    .find({ 'sender.type': req.body.sender.type, 'sender.id': req.body.sender.id, 'topic.key': { $in: topicKeys } })

  while (await subscriptionsCursor.hasNext()) {
    const subscription = await subscriptionsCursor.next()
    // TODO, send to other channels: email, etc.
    const notification = {
      ...req.body,
      _id: shortid.generate(),
      recipient: subscription.recipient,
      date
    }
    await db.collection('notifications').insertOne(notification)
    req.app.get('publishWS')([`${subscription.recipient.type}:${subscription.recipient.id}`], notification)
  }

  res.status(200).json(req.body)
}))

module.exports = router
