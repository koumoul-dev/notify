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

function equalReg (reg1, reg2) {
  const val1 = typeof reg1 === 'object' ? reg1.endpoint : reg1
  const val2 = typeof reg2 === 'object' ? reg2.endpoint : reg2
  return val1 === val2
}

exports.init = async (db) => {
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
  if (config.apn.token.key) {
    settings.apn = config.apn
  }
  const pushNotifications = new PushNotifications(settings)
  return async (notification) => {
    const ownerFilter = { 'owner.type': 'user', 'owner.id': notification.recipient.id }
    const pushSub = await db.collection('pushSubscriptions').findOne(ownerFilter)
    if (!pushSub) return []
    const pushNotif = { ...notification, badge: config.theme.notificationBadge || (config.publicUrl + '/badge-72x72.png') }
    debug('Send push notif', notification.recipient, pushSub.registrations, pushNotif)
    const regIds = pushSub.registrations.map(r => r.id)
    const res = await pushNotifications.send(regIds, JSON.stringify(pushNotif))
    const errors = res[0].message.filter(m => !!m.error)
    if (errors.length) {
      errors.forEach(error => {
        const errorRegistration = pushSub.registrations.find(r => equalReg(r.id, error.regId))
        if (!errorRegistration) {
          console.error('Push notification error does not match known registration', pushSub.registrations, error.regId)
          return
        }
        if (error.error && error.error.statusCode === 410) {
          console.log('registration has unsubscribed or expired, remove it', error.error.body || error.error.response || error.error.statusCode, JSON.stringify(errorRegistration))
          pushSub.registrations = pushSub.registrations.filter(r => !equalReg(r.id, error.regId))
        } else if (error.error && error.error.statusCode === 500 && error.error.body && error.error.body.includes('transient internal error')) {
          // TODO we should implement exponential backoff retry in this case
          console.log('push failed with transient error, ignore it', error.error.body, JSON.stringify(errorRegistration))
        } else {
          console.warn('Unmanaged error, remove potentially broken registration to prevent spamming', error.regId)
          pushSub.registrations = pushSub.registrations.filter(r => !equalReg(r.id, error.regId))
        }
      })
      await db.collection('pushSubscriptions').updateOne(ownerFilter, { $set: { registrations: pushSub.registrations } })
    }
    return errors
  }
}

const router = exports.router = require('express').Router()

router.get('/vapidkey', (req, res) => {
  res.send({ publicKey: vapidKeys.publicKey })
})

router.get('/registrations', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const db = await req.app.get('db')
  const ownerFilter = { 'owner.type': 'user', 'owner.id': req.user.id }
  const sub = await db.collection('pushSubscriptions').findOne(ownerFilter)
  const registrations = (sub && sub.registrations) || []
  registrations.forEach(r => { r.type = r.type || 'webpush' })
  res.send(registrations)
}))

router.put('/registrations', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const db = await req.app.get('db')
  const ownerFilter = { 'owner.type': 'user', 'owner.id': req.user.id }
  await db.collection('pushSubscriptions').findOneAndUpdate(ownerFilter, { $set: { registrations: req.body } })
  res.send(req.body)
}))

// a shortcut to register current device
router.post('/registrations', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  if (!req.body.id) return res.status(400).send('id is required')
  const db = await req.app.get('db')
  const agent = useragent.parse(req.headers['user-agent'])
  const date = new Date().toISOString()
  const registration = { ...req.body, date }
  if (!registration.type) registration.type = 'webpush'
  if (!registration.deviceName) registration.deviceName = agent.toString()

  const ownerFilter = { 'owner.type': 'user', 'owner.id': req.user.id }
  let sub = await db.collection('pushSubscriptions').findOne(ownerFilter)
  if (!sub) {
    sub = {
      owner: { type: 'user', id: req.user.id, name: req.user.name },
      registrations: []
    }
  }
  if (!sub.registrations.find(r => equalReg(r.id, req.body.id))) {
    sub.registrations.push(registration)
    await db.collection('pushSubscriptions').replaceOne(ownerFilter, sub, { upsert: true })
    const errors = await req.app.get('push')({
      recipient: req.user,
      title: `Un nouvel appareil recevra vos notifications`,
      body: `L'appareil ${registration.deviceName} est confirmé comme destinataire des notifications de l'utilisateur ${req.user.name}.`,
      date
    })
    if (errors.length) return res.status(500).send(errors)
  }
  res.send()
}))
