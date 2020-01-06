module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    'standard',
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/recommended'
  ],
  // required to lint *.vue files
  plugins: [
    'vue',
    'vuetify'
  ],
  // add your custom rules here
  rules: {
    'quotes': 'off',
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    // 'vuetify/no-legacy-grid': 'error',
    "vue/max-attributes-per-line": ["error", {
      "singleline": 5,
      "multiline": {
        "max": 5,
        "allowFirstLine": false
      }
    }],
    "vue/no-v-html": 'off'
  },
  globals:{
    H: true,
    sh: true,
    rs: true
  }
}
