// WARN: do not use underscore in keys, it is used as delimiter when reading
// messages from environment variables

module.exports = {
  root: {
    title: 'Notify'
  },
  common: {},
  pages: {
    subscribe: {
      notifyMe: 'Benachrichtige mich wegen {title}.'
    }
  },
  errors: {},
  mails: {}
}
