<template>
  <v-alert
    v-if="ready && (!subscription || err)" prominent dark :color="err ? 'error' : 'accent'" dense
    class="mb-0"
  >
    <template v-if="err">
      {{ err }}
    </template>
    <template v-else>
      Ajouter cet appareil comme destinataire permanent de vos notifications ?
      <v-btn text class="mx-2" @click="register">
        confirmer
      </v-btn>
    </template>
  </v-alert>
</template>

<script>

function urlBase64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function equalReg (reg1, reg2) {
  const val1 = typeof reg1 === 'object' ? reg1.endpoint : reg1
  const val2 = typeof reg2 === 'object' ? reg2.endpoint : reg2
  return val1 === val2
}

export default {
  data () {
    return {
      ready: false,
      subscription: null,
      remoteSubscription: null,
      err: null
    }
  },
  async mounted () {
    // see web-push client example
    // https://github.com/alex-friedl/webpush-example/blob/master/client/main.js

    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      return console.log('Notifications are not supported')
    }
    if (Notification.permission === 'denied') {
      return console.log('The user has blocked permissions')
    }
    if (!('serviceWorker' in navigator)) {
      return console.log('Service workers are not supported')
    }

    try {
      await navigator.serviceWorker.register('./push-sw.js')
      const serviceWorkerRegistration = await navigator.serviceWorker.ready
      this.subscription = await serviceWorkerRegistration.pushManager.getSubscription()
      if (this.subscription) {
        const registration = await this.getRegistration()
        if (!registration) {
          console.log('Local subscription is not matched by remote, unsubscribe')
          await this.subscription.unsubscribe()
          this.subscription = null
        }
      }
      this.ready = true
    } catch (err) {
      console.error('Error while preparing for subscription', err)
    }
  },
  methods: {
    async register () {
      try {
        const serviceWorkerRegistration = await navigator.serviceWorker.ready
        const vapidKey = await this.$axios.$get('api/v1/push/vapidkey')
        const registrationId = await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey.publicKey)
        })
        await this.sendBrowserRegistration(registrationId)
        this.$emit('register', registrationId)
        this.subscription = registrationId
      } catch (err) {
        if (Notification.permission === 'denied') {
          this.ready = false
          console.log('The user has blocked permissions')
          this.err = `Les notifications sont bloquées sur cet appareil pour cette application.`
        } else {
          console.error('Error while subscribing', err)
          this.err = `Échec lors de l'envoi d'une notification à cet appareil.`
        }
      }
    },
    async getRegistration () {
      const res = await this.$axios.$get('api/v1/push/registrations')
      return res.find(r => equalReg(r.id, this.subscription))
    },
    async sendBrowserRegistration (id) {
      await this.$axios.$post('api/v1/push/registrations', { id })
    }
  }
}
</script>

<style lang="css" scoped>
</style>
