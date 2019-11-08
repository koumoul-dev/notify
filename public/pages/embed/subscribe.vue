<template>
  <v-container fluid data-iframe-height class="py-0">
    <v-subheader>Recevoir les notifications pour&nbsp;<i>{{ $route.query.title }}</i>.</v-subheader>
    <v-row v-if="subscription">
      <v-col class="py-0">
        <v-switch v-model="subscription.outputs" class="mt-0" label="Notification Web" value="web" @change="patch" />
      </v-col>
      <v-col class="py-0">
        <v-switch v-model="subscription.outputs" class="mt-0" label="Envoi de mail" value="email" @change="patch" />
      </v-col>
    </v-row>
    <v-progress-circular v-else indeterminate size="20" color="primary" />
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  layout: 'void',
  data: () => ({
    subscription: null
  }),
  computed: {
    ...mapState('session', ['user']),
    ...mapGetters('session', ['activeAccount'])
  },
  async mounted () {
    this.refresh()
  },
  methods: {
    async refresh () {
      const params = {
        recipient: this.user.id,
        senderType: this.activeAccount.type,
        senderId: this.activeAccount.id,
        topic: this.$route.query.key
      }
      this.subscription = (await this.$axios.$get('api/v1/subscriptions', { params })).results[0]
      if (!this.subscription) {
        this.subscription = {
          recipient: { id: this.user.id, name: this.user.name },
          sender: this.activeAccount,
          topic: { key: this.$route.query.key, title: this.$route.query.title },
          outputs: []
        }
      }
    },
    async patch () {
      if (this.subscription.outputs.length) {
        await this.$axios.$post('api/v1/subscriptions', this.subscription)
      } else if (this.subscription._id) {
        await this.$axios.$delete('api/v1/subscriptions/' + this.subscription._id)
      }
      this.refresh()
    }
  }
}
</script>

<style lang="css" scoped>
</style>
