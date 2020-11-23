<template>
<q-table
      :data="contacts"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: calc(100vh - 265px); max-height: calc(100vh - 265px)"
      row-key="contactID"
      :rows-per-page-options="[0]"
      dense
      :virtual-scroll="contacts.length>25"
      :filter="filterString"
      :columns="[
        //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
        { name: 'contactName', required: true, label: 'Nombre Completo', align: 'left', field: row => row.contactName, sortable: true },
        { name: 'mobile', required: true, label: 'Teléfono', align: 'left', field: row => row.mobile, sortable: true },
        { name: 'mail', required: true, label: 'Correo Electrónico', align: 'left', field: row => row.mail, sortable: true },
        { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
      ]"


  >
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="contactName" :props="props">
            {{ props.row.contactName }}
            <q-popup-edit :value="props.row.contactName" >
              <q-input :value="props.row.contactName" dense autofocus counter @input="(value)=>{updateRow(value,'contactName',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="mobile" :props="props">
            {{ props.row.mobile }}
            <q-popup-edit :value="props.row.mobile" >
              <q-input :value="props.row.mobile" dense autofocus counter @input="(value)=>{updateRow(value,'mobile',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="mail" :props="props">
            {{ props.row.mail }}
            <q-popup-edit :value="props.row.mail" >
              <q-input :value="props.row.mail" dense autofocus counter @input="(value)=>{updateRow(value,'mail',props.row)}" />
            </q-popup-edit>
          </q-td>

          <q-td key="estado" :props="props">
            <q-checkbox :value="props.row.estado" color="positive" icon="fas fa-check" class="no-padding" dense size="30px" @input="updateRow(!props.row.estado,'estado',props.row)" />
          </q-td>
        </q-tr>
  </template>
  <template v-slot:top>
      <q-btn label="Agregar Contacto" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
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
            moduleName: "casCasos", filterString: ''
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
        let newRows = JSON.parse(JSON.stringify(this.contacts))
        newRows.find(x=>x.contactID==row.contactID)[colName] = newVal
        this.contacts = newRows
      },
      addRow(){
        let max_id = 1
        if(this.contacts.length > 0){
            let temp = this.getMax(this.contacts, "contactID");
            max_id = parseInt(temp.contactID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.contacts))
        newRows.push({
           contactID: max_id
          ,contactName: 'Nombre Completo'
          ,mobile: ''
          ,mail: ''
          ,estado: true
        })
        this.contacts = newRows
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
        contacts: {
            get () { return this.$store.state[this.moduleName].editData.contacts },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataContacts', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
    }
})
</script>
