// A middleware that uses SD session info or creates a pseudo user based on api key
// also prepare req.activeAccount

const createError = require('http-errors')
const asyncWrap = require('./async-wrap')

module.exports = (required = true) => asyncWrap(async (req, res, next) => {
  await req.app.get('session').auth(req, res, () => {})
  if (!req.user) {
    if (required) return res.status(401).send()
    next()
  }

  const organizationId = req.get('x-organizationId') || (req.user.organization && req.user.organization.id)
  if (!organizationId || organizationId === 'user') {
    req.activeAccount = { type: 'user', id: req.user.id, name: req.user.name }
    req.activeAccountRole = 'admin'
  } else {
    const orga = req.user.organizations.find(o => o.id === organizationId)
    if (!orga) {
      throw createError(403, 'You cannot set an organization you do not belong to as owner')
    }
    req.activeAccount = { type: 'organization', id: orga.id, name: orga.name }
    req.activeAccountRole = orga.role
  }
  next()
})
