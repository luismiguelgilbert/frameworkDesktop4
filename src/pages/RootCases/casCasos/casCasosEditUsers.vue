<template>
<div>
    <q-table
          :data="users"
          :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 265px); max-height: calc(100vh - 265px)"
          row-key="sys_user_code"
          :rows-per-page-options="[0]"
          dense
          :virtual-scroll="users.length>25"
          :filter="filterString"
          :columns="[
            { name: 'sys_user_code', required: true, label: 'Nombre del Usuario', align: 'left', field: row => row.sys_user_code, sortable: true },
            { name: 'isDefault', required: true, label: 'Principal?', align: 'center', field: row => row.isDefault, sortable: true },
            { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
          ]"
    >
      <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="sys_user_code" :props="props">
                {{ props.row.sys_user_fullname }}
              </q-td>
              <q-td key="isDefault" :props="props">
                <q-checkbox :value="props.row.isDefault" color="primary" icon="fas fa-check" class="no-padding" dense size="30px" @input="updateRow(!props.row.isDefault,'isDefault',props.row)" />
              </q-td>
              <q-td key="estado" :props="props">
                <q-checkbox :value="props.row.estado" color="positive" icon="fas fa-check" class="no-padding" dense size="30px" @input="updateRow(!props.row.estado,'estado',props.row)" />
              </q-td>
            </q-tr>
      </template>
      <template v-slot:top>
        <q-btn label="Agregar Consultor" @click="showPrompt" icon="fas fa-plus" color="primary" no-caps />
        <q-space />
      </template>
      <template v-slot:bottom-row >
        <q-tr></q-tr>
      </template>
    </q-table>

    <q-dialog v-model="prompt">
        <mainLookup 
            titleBar="Buscar Consultor"
            :data="this.lookup_users"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :columns="[
                    //{ name: 'value', required: true, label: 'Código', align: 'left', field: row => row.short_name_es , sortable: true }
                    { name: 'label', required: true, label: 'Usuario', align: 'left', field: row => row.label, sortable: false,    }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            @onCancel="prompt=false"
            @onSelect="(selectedRows)=>{addRow(selectedRows)}"
        />
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
import mainLookup from '../../../components/mainLookup/mainLookup.vue'

export default ({
    components: {
        mainLookup: mainLookup
    },
    data () {
        return {
            moduleName: "casCasos", filterString: '', prompt: false, //newRecord: null
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
        let newRows = JSON.parse(JSON.stringify(this.users))
        newRows.find(x=>x.sys_user_code==row.sys_user_code)[colName] = newVal
        this.users = newRows
      },
      showPrompt(){
        this.prompt=true
      },
      addRow(newRecord){
        if(newRecord && newRecord.length>0 && !(this.users.find(x=>x.sys_user_code==newRecord[0].value)) ){
          let newRows = JSON.parse(JSON.stringify(this.users))
          newRows.push({
             sys_user_code: newRecord[0].value
            ,sys_user_fullname: this.lookup_users.find(t=>t.value==newRecord[0].value).label
            ,isDefault: true
            ,estado: true
          })
          this.users = newRows
          this.prompt = false
        }else{
          this.$q.notify({ message: 'Ya existe ese usuario', color: 'primary', progress: true, })
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
        users: {
            get () { return this.$store.state[this.moduleName].editData.users },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataUsers', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },
    }
})
</script>
