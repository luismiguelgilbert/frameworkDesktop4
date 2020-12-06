<template>
<q-table
      :data="bins"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="sys_user_code"
      :separator="userTableLines"
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        { name: 'name_es', required: true, label: 'Identificación de la Percha', align: 'left', field: row => row.name_es, sortable: true },
        { name: 'estado', required: true, label: 'Activo?', align: 'left', field: row => row.estado, sortable: true },
      ]"

>
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name_es" :props="props">
            {{ props.row.name_es }}
            <q-popup-edit :value="props.row.name_es" >
              <q-input :value="props.row.name_es" dense autofocus counter @input="(value)=>{updateRow(value,'name_es',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="estado" :props="props">
            <q-toggle :value="props.row.estado" size="sm" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
          </q-td>
        </q-tr>
  </template>
  <template v-slot:top>
      <q-btn label="Agregar Percha" @click="addPhone" icon="fas fa-plus" color="primary" no-caps />
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

export default ({
    data () {
        return {
            moduleName: "Warehouses", filterString: ''
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
        newRows.find(x=>x.binID==row.binID)[colName] = newVal
        this.bins = newRows
      },
      addPhone(){
        let max_id = 1
        if(this.bins.length > 0){
            let temp = this.getMax(this.bins, "binID");
            max_id = parseInt(temp.binID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.bins))
        newRows.push({
           binID: max_id
          ,name_es: 'Percha ' + max_id
          ,estado: true
        })
        this.bins = newRows
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
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        bins: {
            get () { return this.$store.state[this.moduleName].editData.bins },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataBins', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
    }
})
</script>
