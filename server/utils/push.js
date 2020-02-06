// use push-notifications to send notifications to devices
// by web push for now, using propriétary protocols for mobile devices later on

const fs = require('fs-extra')
const config = require('config')
const webpush = require('web-push')
const PushNotifications = require('node-pushnotifications')
const useragent = require('useragent')
const asyncWrap = require('./async-wrap')
const debug = require('debug')('notifications')

fs.ensureDirSync('./security')
let vapidKeys
if (!fs.existsSync('./security/vapid.json')) {
  vapidKeys = webpush.generateVAPIDKeys()
  fs.writeJsonSync('./security/vapid.json', vapidKeys)
} else {
  vapidKeys = fs.readJsonSync('./security/vapid.json')
}

exports.init = async () => {
  const settings = {
    web: {
      vapidDetails: {
        subject: 'mailto:Koumoul <contact@koumoul.com>',
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey
      },
      gcmAPIKey: config.gcmAPIKey
    }
  }
  return new PushNotifications(settings)
}

const router = exports.router = require('express').Router()

router.get('/vapidkey', (req, res) => {
  res.send({ publicKey: vapidKeys.publicKey })
})

router.get('/subscriptions', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const db = await req.app.get('db')
  const ownerFilter = { 'owner.type': 'user', 'owner.id': req.user.id }
  let sub = await db.collection('pushSubscriptions').findOne(ownerFilter)
  if (!sub) {
    sub = {
      owner: { type: 'user', id: req.user.id, name: req.user.name },
      registrations: []
    }
  }
  res.send(sub)
}))

router.post('/subscriptions', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const db = await req.app.get('db')
  const agent = useragent.parse(req.headers['user-agent'])
  const ownerFilter = { 'owner.type': 'user', 'owner.id': req.user.id }
  let sub = await db.collection('pushSubscriptions').findOne(ownerFilter)
  if (!sub) {
    sub = {
      owner: { type: 'user', id: req.user.id, name: req.user.name },
      registrations: []
    }
  }
  if (!sub.registrations.find(r => JSON.stringify(r.id) === JSON.stringify(req.body))) {
    const date = new Date().toISOString()
    sub.registrations.push({
      id: req.body,
      deviceName: agent.toString(),
      date
    })
    await db.collection('pushSubscriptions').replaceOne(ownerFilter, sub, { upsert: true })
    const payload = JSON.stringify({
      title: `Cet appareil recevra vos notifications`,
      body: `L'appareil ${agent.toString()} est confirmé comme destinataire des notifications de l'utilisateur ${req.user.name}.`,
      icon: config.theme.notificationIcon || config.theme.logo || (config.publicUrl + '/logo-192x192.png'),
      badge: config.theme.notificationBadge || (config.publicUrl + '/badge-72x72.png'),
      date
    })
    debug('Send push subscription confirmation', req.body, payload)
    const pushRes = await req.app.get('push').send(req.body, payload)
    debug('Push notif response', JSON.stringify(pushRes))
    const errors = pushRes[0].message.filter(m => !!m.error)
    if (errors.length) console.error('Failures in push notifications', errors)
  }
  res.send()
}))
