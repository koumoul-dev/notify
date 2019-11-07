<template>
  <v-container>
    {{ notifications }}
  </v-container>
</template>

<script>
export default {
  data: () => ({ notifications: null }),
  async mounted () {
    this.notifications = (await this.$axios.$get('api/v1/notifications')).results
  }
}
</script>

<style lang="css" scoped>
</style>
