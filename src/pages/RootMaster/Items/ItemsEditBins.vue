<template>
<q-table
      :data="bins"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: calc(100vh - 225px); max-height: calc(100vh - 225px)"
      row-key="combinedID"
      :separator="userTableLines"
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
        { name: 'whName', required: true, label: 'Nombre de la Bodega', align: 'left', field: row => row.whName, sortable: true },
        { name: 'binName', required: true, label: 'Identificación de la Percha', align: 'left', field: row => row.binName, sortable: true },
        { name: 'estado', required: true, label: 'Activo?', align: 'left', field: row => row.estado, sortable: true },
      ]"


>
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="whName" :props="props">
            {{ props.row.whName }}
          </q-td>
          <q-td key="binName" :props="props">
            {{ props.row.binName }}
          </q-td>
          <q-td key="estado" :props="props">
            <q-toggle :value="props.row.estado" color="positive" icon="fas fa-check" size="sm" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
          </q-td>
        </q-tr>
  </template>
  <template v-slot:top>
    <div class="text-subtitle2 text-primary">Precio del Item según Lista de Precio</div>
      <q-space />
      <q-input borderless dense v-model="filterString" placeholder="Buscar...">
        <template v-slot:append>
          <q-icon name="fas fa-search" />
        </template>
      </q-input>
  </template>
  <template v-slot:bottom-row >
    <q-tr>
    </q-tr>
  </template>
</q-table>

</template>
<style lang="sass">
.q-table__bottom
    padding: 0px
.my-sticky-header-usercompany
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

.my-sticky-header-usercompany-dark
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
import { date } from 'quasar';

export default ({
    data () {
        return {
            moduleName: "Items", filterString: ''
        }
    },
    methods:{
      getMax(arr, prop) {
          var max;
          for (var i=0 ; i<arr.length ; i++) {
              if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                  max = arr[i];
          }
          return max;
      },
      updateRow(newVal, colName, row){
        let newRows = JSON.parse(JSON.stringify(this.bins))
        newRows.find(x=>x.combinedID==row.combinedID)[colName] = newVal
        this.bins = newRows
      },
      getAge(fecha){
        return date.getDateDiff(new Date(), fecha, 'years')
      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return true }, },
        allow_edit: { get () { return true }, },
        allow_insert: { get () { return true }, },
        allow_report: { get () { return true }, },
        allow_disable: { get () { return true }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        bins: {
            get () { return this.$store.state[this.moduleName].editData.bins },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataBins', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_sexo: {
            get () { return this.$store.state[this.moduleName].editData.lookup_sexo },
        },
    }
})
</script>
