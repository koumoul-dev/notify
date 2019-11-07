import Vue from 'vue'
import Vuex from 'vuex'
import { sessionStoreBuilder } from '@koumoul/sd-vue/src'

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    modules: {
      session: sessionStoreBuilder()
    },
    getters: {},
    mutations: {
      setAny (state, params) {
        Object.assign(state, params)
      }
    },
    actions: {
      nuxtServerInit ({ dispatch }, { req, env, app }) {
        dispatch('session/init', { cookies: this.$cookies, baseUrl: env.publicUrl + '/api/v1/session' })
      }
    }
  })
}
