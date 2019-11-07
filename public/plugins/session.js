export default ({ store, app, env }) => {
  store.dispatch('session/loop', app.$cookies)
}
