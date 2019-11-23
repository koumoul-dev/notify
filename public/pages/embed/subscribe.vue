<template>
  <v-container fluid data-iframe-height class="py-0">
    <v-row v-for="topic in topics" :key="topic.key">
      <subscribe :topic="topic" :no-sender="!!$route.query.noSender" />
    </v-row>
  </v-container>
</template>

<script>
import Subscribe from '~/components/subscribe.vue'

export default {
  layout: 'embed',
  components: { Subscribe },
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
