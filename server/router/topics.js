const express = require('express')
const shortid = require('shortid')
const ajv = require('ajv')()
const schema = require('../../contract/topic')
const validate = ajv.compile(schema)
const asyncWrap = require('../utils/async-wrap')

const router = express.Router()

// Get the list of topics
router.get('', asyncWrap(async (req, res, next) => {
  // not sort, project or filter here
  // we need to build a tree with results, simpler to always return everything for now
  const topics = req.app.get('db').collection('topics')
  const results = topics
    .find({ 'owner.type': req.activeAccount.type, 'owner.id': req.activeAccount.id }).limit(10000).toArray()
  res.json({ results, count: results.length })
}))

// Create a topic
router.post('', asyncWrap(async (req, res, next) => {
  const db = req.app.get('db')
  if (req.activeAccountRole !== 'admin') return res.status(403).send()
  req.body.owner = req.activeAccount
  const valid = validate(req.body)
  if (!valid) return res.status(400).send(validate.errors)
  const idFilter = { 'owner.type': req.activeAccount.type, 'owner.id': req.activeAccount.id, key: req.body.key }
  const existingTopic = await db.findOne(idFilter)
  req.body.updated = { id: req.user.id, name: req.user.name, date: new Date() }
  req.body.created = existingTopic ? existingTopic.created : req.body.updated
  req.body._id = existingTopic ? existingTopic._id : shortid.generate()
  await db.collection('topics').replaceOne(idFilter, req.body, { upsert: true })
  res.status(200).json(req.body)
}))

router.delete('/:id', asyncWrap(async (req, res, next) => {
  if (req.activeAccountRole !== 'admin') return res.status(403).send()
  await req.app.get('db').collection('topics')
    .deleteOne({ 'owner.type': req.activeAccount.type, 'owner.id': req.activeAccount.id, _id: req.params.id })
  res.status(204).send()
}))

module.exports = router
