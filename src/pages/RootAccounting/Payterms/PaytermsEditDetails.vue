<template>
<div>
  <q-table
        :data="details"
        :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
        table-style="min-height: 150px; max-height: calc(100vh - 225px)"
        row-key="longitud"
        virtual-scroll
        :rows-per-page-options="[0]"
        hide-bottom dense
        :filter="filterString"
        :columns="[
          //{ name: 'lineID', required: true, label: 'lineID', align: 'left', field: row => row.lineID, sortable: true },
          { name: 'name_es', required: true, label: 'Descripción', align: 'left', field: row => row.name_es, sortable: true },
          { name: 'days', required: true, label: 'Días Plazo', align: 'right', field: row => row.days, sortable: true },
          { name: 'factor', required: true, label: 'Porcentaje %', align: 'right', field: row => row.factor, sortable: true },
          { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
        ]"


  >
    <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name_es" :props="props" :title="props.row.lineID">
              <q-input borderless
                :value="props.row.name_es" dense input-class="text-left" :min="0"
                @input="(value)=>{updateRow(value,'name_es',props.row)}"
                />
            </q-td>
            <q-td key="days" :props="props">
              <q-input borderless
                :value="props.row.days" type="number" dense input-class="text-right" :min="0"
                @input="(value)=>{updateRow(value,'days',props.row)}"
                />
            </q-td>
            <q-td key="factor" :props="props">
              <q-input borderless
                :value="props.row.factor" type="number" dense input-class="text-right" :min="0"
                @input="(value)=>{updateRow(value,'factor',props.row)}"
                />
            </q-td>
            
            <q-td key="estado" :props="props">
              <q-toggle :value="props.row.estado" color="positive" icon="fas fa-check" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
            </q-td>
          </q-tr>
    </template>
      <template v-slot:top>
          <q-btn label="Agregar Cuota" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
          <q-space />
          <q-input borderless dense v-model="filterString" placeholder="Buscar...">
            <template v-slot:append>
              <q-icon name="fas fa-search" />
            </template>
          </q-input>
      </template>
  </q-table>
  
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
            moduleName: "Payterms", filterString: '',  prompt: false, newRUC: null
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
        let newRows = JSON.parse(JSON.stringify(this.details))
        newRows.find(x=>x.lineID==row.lineID)[colName] = newVal
        this.details = newRows
      },
      addRow(){
          let max_id = 1
            if(this.details.length > 0){
                let temp = this.getMax(this.details, "lineID");
                max_id = parseInt(temp.lineID) + parseInt(1);
            }
          let newRows = JSON.parse(JSON.stringify(this.details))
          newRows.push({
              lineID: max_id
            ,days: 1
            ,factor: 1
            ,name_es: 'Cuota #' + max_id
            ,estado: true
          })
          this.details = newRows
      },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        details: {
            get () { return this.$store.state[this.moduleName].editData.details },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataDetails', val) }
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
