<template>
<q-table
      :data="phones"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="sys_user_code"
      virtual-scroll
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
        { name: 'phoneNumber', required: true, label: 'Número Telefónico', align: 'left', field: row => row.phoneNumber, sortable: true },
        { name: 'tipo', required: true, label: 'Tipo', align: 'left', field: row => row.tipo, sortable: true },
        { name: 'estado', required: true, label: 'Activo?', align: 'left', field: row => row.estado, sortable: true },
      ]"

>
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="phoneID" :props="props">{{ props.row.phoneID }}</q-td>
          <q-td key="phoneNumber" :props="props">
            {{ props.row.phoneNumber }}
            <q-popup-edit :value="props.row.phoneNumber" >
              <q-input :value="props.row.phoneNumber" dense autofocus counter @input="(value)=>{updateRow(value,'phoneNumber',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="tipo" :props="props">
            {{ lookup_phoneTypes.find(x=>x.value==props.row.tipo).label }}
            <q-popup-edit :value="props.row.tipo">
              <q-select :value="props.row.tipo" dense map-options :options="lookup_phoneTypes" @input="(value)=>{updateRow(value.value,'tipo',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="estado" :props="props">
            <q-toggle :value="props.row.estado" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
          </q-td>
        </q-tr>
  </template>
    <template v-slot:top>
        <q-btn label="Agregar Teléfono" @click="addPhone" icon="fas fa-plus" color="primary" no-caps />
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
            moduleName: "SCHPersona", filterString: ''
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
        let newRows = JSON.parse(JSON.stringify(this.phones))
        newRows.find(x=>x.phoneID==row.phoneID)[colName] = newVal
        this.phones = newRows
      },
      addPhone(){
        let max_id = 1
        if(this.phones.length > 0){
            let temp = this.getMax(this.phones, "phoneID");
            max_id = parseInt(temp.phoneID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.phones))
        newRows.push({
           phoneID: max_id
          ,phoneNumber: '041111111'
          ,tipo: this.lookup_phoneTypes[0].value
          ,estado: true
        })
        this.phones = newRows
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
        phones: {
            get () { return this.$store.state[this.moduleName].editData.phones },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPhones', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_phoneTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_phoneTypes },
        },
    }
})
</script>
