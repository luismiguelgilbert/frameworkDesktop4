<template>
<div>
    <q-table
          :data="owners"
          :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
          table-style="min-height: 150px; max-height: calc(100vh - 225px)"
          row-key="sys_user_code"
          virtual-scroll
          :rows-per-page-options="[0]"
          hide-bottom dense
          :filter="filterString"
          :columns="[
            //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
            { name: 'sys_user_code', required: true, label: 'Nombre del Vendedor', align: 'left', field: row => row.sys_user_code, sortable: true },
            { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
          ]"


    >
      <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="sys_user_code" :props="props">
                {{ props.row.sys_user_fullname }}
              </q-td>
              <q-td key="estado" :props="props">
                <q-toggle :value="props.row.estado" color="positive" icon="fas fa-check" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
              </q-td>
            </q-tr>
      </template>
        <template v-slot:top>
            <q-btn label="Agregar Contacto" @click="showPrompt" icon="fas fa-plus" color="primary" no-caps />
            <q-space />
            <q-input borderless dense v-model="filterString" placeholder="Buscar...">
              <template v-slot:append>
                <q-icon name="fas fa-search" />
              </template>
            </q-input>
        </template>
        <!--<template v-slot:body-cell-is_profile="props">
            <q-td :props="props">
                <q-toggle size="sm" dense color="positive" :value="props.value" @input="changeProfileforUser(props)" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" />
            </q-td>
        </template>
        -->
    </q-table>

    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6 text-primary">Seleccionar Vendedor</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select :options="lookup_users" v-model="newRecord" dense autofocus emit-value map-options />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn no-caps flat label="Cancelar" v-close-popup />
          <q-btn no-caps flat label="Agregar" v-close-popup @click="addRow" />
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
            moduleName: "Partners", filterString: '', prompt: false, newRecord: null
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
        let newRows = JSON.parse(JSON.stringify(this.owners))
        newRows.find(x=>x.sys_user_code==row.sys_user_code)[colName] = newVal
        this.owners = newRows
      },
      showPrompt(){
        this.prompt=true
      },
      addRow(){
        if(this.newRecord && !(this.owners.find(x=>x.sys_user_code==this.newRecord)) ){
          let newRows = JSON.parse(JSON.stringify(this.owners))
          newRows.push({
            sys_user_code: this.newRecord
            ,sys_user_fullname: this.lookup_users.find(t=>t.value==this.newRecord).label
            ,estado: true
          })
          this.owners = newRows
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
        owners: {
            get () { return this.$store.state[this.moduleName].editData.owners },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataOwners', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },
    }
})
</script>
