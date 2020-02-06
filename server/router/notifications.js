const express = require('express')
const shortid = require('shortid')
const config = require('config')
const axios = require('axios')
const ajv = require('ajv')()
const schema = require('../../contract/notification')
const validate = ajv.compile(schema)
const asyncWrap = require('../utils/async-wrap')
const findUtils = require('../utils/find')
const auth = require('../utils/auth')
const debug = require('debug')('notifications')
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
  const date = new Date().toISOString()

  const filter = { 'topic.key': { $in: topicKeys } }
  if (req.body.sender) {
    filter['sender.type'] = req.body.sender.type
    filter['sender.id'] = req.body.sender.id
  } else {
    filter.sender = { $exists: false }
  }
  const subscriptionsCursor = db.collection('subscriptions')
    .find(filter)

  while (await subscriptionsCursor.hasNext()) {
    const subscription = await subscriptionsCursor.next()
    const notification = {
      icon: config.theme.notificationIcon || config.theme.logo || (config.publicUrl + '/logo-192x192.png'),
      ...req.body,
      _id: shortid.generate(),
      recipient: subscription.recipient,
      date
    }
    if (!req.body.topic.title && subscription.topic.title) notification.topic.title = subscription.topic.title
    await db.collection('notifications').insertOne(notification)
    if (subscription.outputs.includes('web')) {
      debug('Send WS notif', subscription.recipient, notification)
      req.app.get('publishWS')([`user:${subscription.recipient.id}:notifications`], notification)
      const pushSub = await db.collection('pushSubscriptions').findOne({ 'owner.type': 'user', 'owner.id': subscription.recipient.id })
      if (pushSub) {
        const pushNotif = { ...notification, badge: config.theme.notificationBadge || (config.publicUrl + '/badge-72x72.png') }
        debug('Send push notif', subscription.recipient, pushSub.registrations, pushNotif)
        req.app.get('push').send(pushSub.registrations.map(r => r.id), JSON.stringify(pushNotif)).catch(err => {
          console.error('Failed to send push notification', err)
        })
      }
    }
    if (subscription.outputs.includes('email')) {
      const mail = {
        to: [{ type: 'user', ...subscription.recipient }],
        subject: notification.title,
        text: notification.body
      }
      debug('Send mail notif', subscription.recipient, mail, notification)
      axios.post(config.directoryUrl + '/api/mails', mail, { params: { key: config.secretKeys.sendMails } }).catch(err => {
        console.error('Failed to send mail', err)
      })
    }
  }

  res.status(200).json(req.body)
}))

module.exports = router
