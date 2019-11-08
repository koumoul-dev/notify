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
    notifications: null,
    sendMails: null
  },
  theme: {
    logo: null,
    colors: {
      // standard vuetify colors
      primary: '#1E88E5', // blue.darken1
      secondary: '#42A5F5', // blue.lighten1,
      accent: '#FF9800', // orange.base
      error: 'FF5252', // red.accent2
      info: '#2196F3', // blue.base
      success: '#4CAF50', // green.base
      warning: '#E91E63', // pink.base
      admin: '#E53935' // red.darken1
    }
  }
}
