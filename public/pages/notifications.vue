<template>
  <v-container>
    <edit-dialog :schema="schema" @saved="push" />
    <template v-if="notifications && notifications.results.length">
      <v-row>
        {{ notifications.count }} notifications dont {{ notifications.countNew }} nouvelles
      </v-row>
      <v-row>
        <v-col
          v-for="notification in notifications.results"
          :key="notification._id" class="xs" xl="2" lg="3" md="4"
          sm="6"
        >
          <v-card :elevation="4" :dark="notification.new">
            <template>
              <v-card-title class="title py-2">
                <v-flex text-center pa-0>
                  {{ notification.title }}
                </v-flex>
              </v-card-title>
              <v-divider />
            </template>
            <v-card-text class="px-0 pt-0">
              <v-list>
                <v-list-item dense>
                  <v-list-item-content>
                    <span><strong>Date : </strong> {{ notification.date | moment('lll') }}</span>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item dense>
                  <v-list-item-content>
                    <span><strong>Émetteur : </strong> {{ notification.sender ? notification.sender.name : 'global' }}</span>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item dense>
                  <v-list-item-content>
                    <span><strong>Destinataire : </strong> {{ notification.recipient.name }}</span>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item dense>
                  <v-list-item-content>
                    <span><strong>Sujet : </strong> {{ notification.topic.title }} ({{ notification.topic.key }})</span>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item dense>
                  <v-list-item-content>
                    <span><strong>Contenu : </strong> {{ notification.body }}</span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-divider />
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import eventBus from '~/assets/event-bus'
import EditDialog from '~/components/edit-dialog'
const schema = JSON.parse(JSON.stringify(require('../../contract/notification.js')))
Object.keys(schema.properties).forEach(k => {
  if (schema.properties[k].readOnly) delete schema.properties[k]
})

export default {
  components: { EditDialog },
  data: () => ({
    eventBus,
    schema,
    notifications: null,
    newNotification: {}
  }),
  computed: {
    ...mapState('session', ['user']),
    ...mapGetters('session', ['activeAccount']),
    channel () {
      return `user:${this.user.id}:notifications`
    }
  },
  async mounted () {
    await this.refresh()
    eventBus.$emit('subscribe', this.channel)
    eventBus.$on(this.channel, notification => {
      this.refresh()
      // eslint-disable-next-line no-new
      new Notification(notification.title, { body: notification.body })
    })
    Notification.requestPermission(function (status) {
      if (Notification.permission !== status) {
        Notification.permission = status
      }
    })
  },
  methods: {
    async refresh () {
      this.notifications = await this.$axios.$get('api/v1/notifications')
    },
    async push (notification) {
      if (notification.icon === null) delete notification.icon
      await this.$axios.$post('api/v1/notifications', notification)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
