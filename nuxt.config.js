const config = require('config')
const webpack = require('webpack')

module.exports = {
  srcDir: 'public/',
  build: {
    publicPath: config.publicUrl + '/_nuxt/',
    transpile: [/@koumoul/],
    babel: {
      sourceType: 'unambiguous'
    },
    extend (config, { isServer, isDev, isClient }) {
      // Ignore all locale files of moment.js, those we want are loaded in plugins/moment.js
      config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
    }
  },
  plugins: [
    { src: '~plugins/iframe-resize', ssr: false },
    { src: '~plugins/session', ssr: false },
    { src: '~plugins/ws', ssr: false },
    { src: '~plugins/moment' }
  ],
  router: {
    base: new URL(config.publicUrl + '/').pathname
  },
  modules: ['@nuxtjs/axios', 'cookie-universal-nuxt'],
  axios: {
    browserBaseURL: config.publicUrl + '/',
    baseURL: `http://localhost:${config.port}/`
  },
  buildModules: ['@nuxtjs/vuetify'],
  vuetify: {
    icons: {
      iconfont: 'mdi'
    },
    theme: {
      themes: {
        light: config.theme.colors
      }
    }
  },
  env: {
    publicUrl: config.publicUrl,
    wsPublicUrl: config.wsPublicUrl,
    directoryUrl: config.directoryUrl,
    theme: config.theme
  },
  head: {
    title: 'Notify',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'application', name: 'application-name', content: 'Notify' },
      { hid: 'description', name: 'description', content: 'Push notifications to your users.' },
      { hid: 'robots', name: 'robots', content: 'noindex' }
    ]
  }
}
