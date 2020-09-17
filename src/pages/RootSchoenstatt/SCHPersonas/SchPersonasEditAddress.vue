<template>
<q-table
      :data="address"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="sys_user_code"
      virtual-scroll
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        //{ name: 'addressID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
        { name: 'countryID', required: true, label: 'País', align: 'left', field: row => row.countryID, sortable: true },
        { name: 'cityID', required: true, label: 'Ciudad', align: 'left', field: row => row.cityID, sortable: true },
        { name: 'addressName', required: true, label: 'Dirección', align: 'left', field: row => row.addressName, sortable: true },
        { name: 'tipo', required: true, label: 'Tipo', align: 'left', field: row => row.tipo, sortable: true },
        { name: 'estado', required: true, label: 'Activo?', align: 'left', field: row => row.estado, sortable: true },
      ]"

>
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="countryID" :props="props">
            {{ lookup_countries.find(x=>x.value==props.row.countryID).label }}
            <q-popup-edit :value="props.row.countryID">
              <q-select :value="props.row.countryID" dense map-options :options="lookup_countries" @input="(value)=>{updateRow(value.value,'countryID',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="cityID" :props="props">
            {{ lookup_cities.find(x=>x.value==props.row.cityID).label }}
            <q-popup-edit :value="props.row.cityID">
              <q-select :value="props.row.cityID" dense map-options :options="lookup_cities" @input="(value)=>{updateRow(value.value,'cityID',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="addressName" :props="props">
            {{ props.row.addressName }}
            <q-popup-edit :value="props.row.addressName" >
              <q-input :value="props.row.addressName" dense autofocus counter @input="(value)=>{updateRow(value,'addressName',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="tipo" :props="props">
            {{ lookup_addressTypes.find(x=>x.value==props.row.tipo).label }}
            <q-popup-edit :value="props.row.tipo">
              <q-select :value="props.row.tipo" dense map-options :options="lookup_addressTypes" @input="(value)=>{updateRow(value.value,'tipo',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="estado" :props="props">
            <q-toggle :value="props.row.estado" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
          </q-td>
        </q-tr>
  </template>
    <template v-slot:top>
        <q-btn label="Agregar Dirección" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
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
            moduleName: "SCHPersonas", filterString: ''
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
        let newRows = JSON.parse(JSON.stringify(this.address))
        newRows.find(x=>x.addressID==row.addressID)[colName] = newVal
        this.address = newRows
      },
      addRow(){
        let max_id = 1
        if(this.address.length > 0){
            let temp = this.getMax(this.address, "addressID");
            max_id = parseInt(temp.addressID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.address))
        newRows.push({
           addressID: max_id
          ,countryID: 52 //52=Ecuador
          ,cityID: 88//
          ,addressName: 'dirección'
          ,tipo: this.lookup_addressTypes[0].value
          ,estado: true
        })
        this.address = newRows
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
        address: {
            get () { return this.$store.state[this.moduleName].editData.address },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAddress', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_addressTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_addressTypes },
        },
        lookup_countries: {
            get () { return this.$store.state[this.moduleName].editData.lookup_countries },
        },
        lookup_cities: {
            get () { return this.$store.state[this.moduleName].editData.lookup_cities },
        },
    }
})
</script>
