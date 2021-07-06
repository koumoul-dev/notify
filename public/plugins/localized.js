import Vue from 'vue'

Vue.filter('localized', function (prop, locale = 'fr') {
  if (typeof prop === 'object') return prop[locale] || prop.fr
  return prop
})
