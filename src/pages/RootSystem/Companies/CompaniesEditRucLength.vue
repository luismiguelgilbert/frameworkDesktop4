<template>
<div>
  <q-table
        :data="rucLengths"
        :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
        table-style="min-height: 150px; max-height: calc(100vh - 225px)"
        row-key="longitud"
        virtual-scroll
        :rows-per-page-options="[0]"
        hide-bottom dense
        :filter="filterString"
        :columns="[
          { name: 'longitud', required: true, label: 'Longitud', align: 'left', field: row => row.longitud, sortable: true },
          { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
        ]"


  >
    <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="longitud" :props="props">
              {{ props.row.longitud }} Caracteres
            </q-td>
            <q-td key="estado" :props="props">
              <q-toggle :value="props.row.estado" color="positive" icon="fas fa-check" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
            </q-td>
          </q-tr>
    </template>
      <template v-slot:top>
          <q-btn label="Agregar RUC" @click="showPrompt" icon="fas fa-plus" color="primary" no-caps />
          <q-space />
          <q-input borderless dense v-model="filterString" placeholder="Buscar...">
            <template v-slot:append>
              <q-icon name="fas fa-search" />
            </template>
          </q-input>
      </template>
  </q-table>
  <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Nueva Longitud</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="newRUC" autofocus />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn no-caps flat label="Cancelar" v-close-popup />
          <q-btn no-caps flat label="Agregar Longitud" v-close-popup @click="addRow" />
        </q-card-actions>

      </q-card>
    </q-dialog>
</div>
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
            moduleName: "Companies", filterString: '',  prompt: false, newRUC: null
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
        let newRows = JSON.parse(JSON.stringify(this.rucLengths))
        newRows.find(x=>x.longitud==row.longitud)[colName] = newVal
        this.rucLengths = newRows
      },
      showPrompt(){
        this.prompt=true
      },
      addRow(){
        if(this.newRUC && !(this.rucLengths.find(x=>x.longitud==this.newRUC)) ){
          let newRows = JSON.parse(JSON.stringify(this.rucLengths))
          newRows.push({
            longitud: this.newRUC
            ,estado: true
          })
          this.rucLengths = newRows
        }
      },
      getAge(fecha){
        return date.getDateDiff(new Date(), fecha, 'years')
      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        rucLengths: {
            get () { return this.$store.state[this.moduleName].editData.rucLengths },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataRucLengths', val) }
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
