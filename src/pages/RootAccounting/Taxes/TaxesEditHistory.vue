<template>

  <q-table
    :data="history"
    :class="userColor=='blackDark'?'my-sticky-header-history-dark bg-grey-10 ':'my-sticky-header-history'"
    table-style="min-height: 150px; max-height: calc(100vh - 175px)"
    row-key="record_id"
    :columns="[
        { name: 'icon', label: 'Acción', field: 'icon', sortable: true, align: 'left', style: 'width: 30px', },
        { name: 'fecha', label: 'Fecha', field: 'fecha', sortable: true, align: 'left' },
        { name: 'title', label: 'Evento', field: 'title', sortable: true, align: 'left' },
        { name: 'usuario', label: 'Usuario', field: 'usuario', sortable: true, align: 'left' },
        { name: 'body', label: 'Ver log', field: 'body', sortable: true, align: 'center' },
      ]"
    virtual-scroll
    :pagination.sync="pagination"
    :rows-per-page-options="[0]"
    hide-bottom
    >
    <template v-slot:body-cell-icon="props">
      <q-td :props="props">
        <q-icon :name="props.value" :color="userColor=='blackDark'?'white':'primary'" />
      </q-td>
    </template>
    <template v-slot:body-cell-fecha="props">
      <q-td :props="props" :title="props.row.fechaTitle">
        {{props.value}}
      </q-td>
    </template>
    <template v-slot:body-cell-body="props" >
      <q-td :props="props">
        <q-btn icon="fas fa-search" color="primary" v-if="props.value">
          <q-tooltip>
            <div v-if="Array.isArray(JSON.parse(props.value))">
              <q-table dense
                :data="JSON.parse(props.value)"
                virtual-scroll
                :pagination.sync="pagination"
                :rows-per-page-options="[0]"
                />
            </div>
            <div v-if="!Array.isArray(JSON.parse(props.value))">
              <q-markup-table dense>
                <tbody v-for="(columna, index) in JSON.parse(props.value)" :key="index">
                  <tr>
                    <td class="text-subtitle2">{{index}}</td>
                    <td class="text-caption">{{columna}}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>

</template>

<style lang="sass">
.q-table__bottom
    padding: 0px
.my-sticky-header-history
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: white

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2

.my-sticky-header-history-dark
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: $grey-10

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2
</style>


<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default ({
    data () {
        return {
            moduleName: "Taxes", pagination: { rowsPerPage: 0 },
        }
    },
    methods:{
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        history: {
          get () { return this.$store.state[this.moduleName].editData.history },
        },
    }
})

</script>
