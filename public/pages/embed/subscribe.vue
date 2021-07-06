<template>
  <v-container fluid data-iframe-height>
    <div style="display:flex">
      <register-device />
    </div>
    <v-row v-for="topic in topics" :key="topic.key" class="ma-0">
      <subscribe :topic="topic" :no-sender="!!$route.query.noSender" />
    </v-row>
  </v-container>
</template>

<script>
import Subscribe from '~/components/subscribe.vue'
import RegisterDevice from '~/components/register-device.vue'

export default {
  layout: 'embed',
  components: { Subscribe, RegisterDevice },
  computed: {
    topics () {
      const keys = this.$route.query.key.split(',')
      const titles = this.$route.query.title.split(',')
      return keys.map((key, i) => ({ key, title: titles[i] }))
    }
  }
}
</script>

<style lang="css" scoped>
</style>
