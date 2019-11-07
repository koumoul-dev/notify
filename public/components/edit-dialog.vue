<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    scrollable
    persistent
    max-width="700px"
  >
    <template v-slot:activator="{on}">
      <v-btn v-if="!item" color="primary" fab dark v-on="on">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn v-else color="primary" icon text v-on="on">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="title">
        {{ !item ? `Ajout d'un élément` : `Édition d'un élément` }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <slot name="form" :valid="valid" :model="editItem">
            <v-jsonschema-form v-if="editItem" :schema="schema" :model="editItem" :options="{context: {}, requiredMessage: 'Information obligatoire', noDataMessage: 'Aucune valeur correspondante', 'searchMessage': 'Recherchez...'}" @error="error => eventBus.$emit('notification', {error})" />
          </slot>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click.native="dialog = false">
          Annuler
        </v-btn>
        <v-btn color="primary" @click.native="confirm">
          Enregistrer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import VJsonschemaForm from '@koumoul/vuetify-jsonschema-form/lib/index.vue'
import eventBus from '~/assets/event-bus'
import { Sketch } from 'vue-color'
import Vue from 'vue'
Vue.component('color-picker', Sketch)

export default {
  components: { VJsonschemaForm },
  props: {
    schema: { type: Object, default: null },
    item: { type: Object, default: null }
  },
  data: () => ({
    dialog: false,
    valid: false,
    delayed: false,
    editItem: null,
    eventBus
  }),
  created () {
    this.editItem = JSON.parse(JSON.stringify(this.item || {}))
  },
  methods: {
    confirm () {
      if (this.$refs.form.validate()) {
        this.$emit('saved', this.editItem)
        this.dialog = false
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
