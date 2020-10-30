<template>
<q-table
      :data="cases"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: calc(100vh - 265px); max-height: calc(100vh - 265px)"
      row-key="caseID"
      :rows-per-page-options="[0]"
      dense
      :virtual-scroll="cases.length>25"
      :filter="filterString"
      :columns="[
        //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
        { name: 'label', required: true, label: 'Caso', align: 'left', field: row => row.label, sortable: true },
        { name: 'caseTypeName', required: true, label: 'Tipo Caso', align: 'left', field: row => row.caseTypeName, sortable: true },
        { name: 'startDate', required: true, label: 'Fecha Inicio', align: 'left', field: row => row.startDate, sortable: true },
        { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
      ]"


  >
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="label" :props="props">
            {{ props.row.label }}
          </q-td>
          <q-td key="caseTypeName" :props="props">
            {{ props.row.caseTypeName }}
          </q-td>
          <q-td key="startDate" :props="props">
            {{ props.row.startDate }}
        </q-td>
          <q-td key="estado" :props="props">
            <q-checkbox :value="props.row.estado" color="positive" icon="fas fa-check" class="no-padding" dense size="30px"  />
          </q-td>
        </q-tr>
  </template>
  <template v-slot:top>
      <!--<q-btn label="Agregar Contacto" @click="addRow" icon="fas fa-plus" color="primary" no-caps />-->
      <q-space />
      <q-input borderless dense v-model="filterString" placeholder="Buscar...">
        <template v-slot:append>
          <q-icon name="fas fa-search" />
        </template>
      </q-input>
  </template>
  <template v-slot:bottom-row >
    <q-tr></q-tr>
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
            moduleName: "casClientes", filterString: ''
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
        let newRows = JSON.parse(JSON.stringify(this.cases))
        newRows.find(x=>x.caseID==row.caseID)[colName] = newVal
        this.cases = newRows
      },
      addRow(){
        console.dir('addRow')
        let max_id = 1
        if(this.cases.length > 0){
            let temp = this.getMax(this.cases, "caseID");
            max_id = parseInt(temp.caseID) + parseInt(1);
        }
        console.dir('addRow 1')
        let newRows = JSON.parse(JSON.stringify(this.cases))
        console.dir('addRow 2')
        console.dir(newRows)
        newRows.push({
           caseID: max_id
          ,contactName: 'Nombre Completo'
          ,mobile: ''
          ,mail: ''
          ,estado: true
        })
        console.dir(newRows)
        this.cases = newRows
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
        cases: {
            get () { return this.$store.state[this.moduleName].editData.cases },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataCases', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
    }
})
</script>
