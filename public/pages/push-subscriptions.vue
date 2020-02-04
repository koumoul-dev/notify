<template>
  <v-container>
    <subscribe-device @subscribe="refresh" />
    <v-row v-if="subscription">
      <v-col
        v-for="(registration, i) in subscription.registrations"
        :key="i" class="xs" xl="2" lg="3" md="4"
        sm="6"
      >
        <v-card :elevation="4">
          <template>
            <v-card-title class="title py-2">
              <v-flex text-center pa-0>
                {{ registration.deviceName }}
              </v-flex>
            </v-card-title>
            <v-divider />
          </template>
          <v-card-text class="px-0 pt-0">
            <v-list>
              <v-list-item dense>
                <v-list-item-content>
                  <span><strong>Date : </strong> {{ registration.date }}</span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-divider />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SubscribeDevice from '~/components/subscribe-device'

export default {
  components: { SubscribeDevice },
  data () {
    return {
      subscription: null
    }
  },
  async created () {
    this.refresh()
  },
  methods: {
    async refresh () {
      this.subscription = await this.$axios.$get('api/v1/push/subscriptions')
    }
  }
}
</script>

<style lang="css" scoped>
</style>
