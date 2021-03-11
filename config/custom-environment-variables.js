module.exports = {
  port: 'PORT',
  publicUrl: 'PUBLIC_URL',
  wsPublicUrl: 'WS_PUBLIC_URL',
  directoryUrl: 'DIRECTORY_URL',
  sessionDomain: 'SESSION_DOMAIN',
  mongoUrl: 'MONGO_URL',
  secretKeys: {
    identities: 'SECRET_IDENTITIES',
    notifications: 'SECRET_NOTIFICATIONS',
    sendMails: 'SECRET_SENDMAILS'
  },
  gcmAPIKey: 'GCM_API_KEY',
  apn: {
    token: {
      key: 'APN_TOKEN_KEY',
      keyId: 'APN_TOKEN_KEY_ID',
      teamId: 'APN_TOKEN_TEAM_ID'
    },
    production: {
      __name: 'APN_PRODUCTION',
      __format: 'json'
    }
  },
  theme: {
    logo: 'THEME_LOGO',
    notificationIcon: 'THEME_NOTIFICATION_ICON',
    notificationBadge: 'THEME_NOTIFICATION_BADGE',
    colors: {
      primary: 'THEME_PRIMARY',
      secondary: 'THEME_SECONDARY',
      accent: 'THEME_ACCENT',
      error: 'THEME_ERROR',
      info: 'THEME_INFO',
      success: 'THEME_SUCCESS',
      warning: 'THEME_WARNING'
    }
  }
}
