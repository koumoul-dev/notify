module.exports = {
  port: 5994,
  publicUrl: 'http://localhost:5994',
  wsPublicUrl: 'ws://localhost:5994',
  directoryUrl: 'http://localhost:5994/simple-directory',
  sessionDomain: null,
  mongoUrl: 'mongodb://localhost:27017/notify-' + (process.env.NODE_ENV || 'development'),
  // secrets that can be used to configure global webhooks for example to update users and organizations
  secretKeys: {
    identities: null,
    notifications: null
  }
}
