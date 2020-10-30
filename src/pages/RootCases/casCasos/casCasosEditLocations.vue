<template>
<div>
    <q-table
          :data="locations"
          :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 265px); max-height: calc(100vh - 265px)"
          row-key="value"
          dense
          :virtual-scroll="locations.length>25"
          :rows-per-page-options="[0]"
          :filter="filterString"
          :columns="[
            { name: 'label', required: true, label: 'Nombre de Localidad', align: 'left', field: row => row.label, sortable: true },
            { name: 'isDefault', required: true, label: 'Principal?', align: 'center', field: row => row.isDefault, sortable: true },
            { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
          ]"


    >
      <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="label" :props="props">
                {{ props.row.label }}
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
            <q-btn label="Agregar Localidad" @click="showPrompt" icon="fas fa-plus" color="primary" no-caps />
            <q-space />
        </template>
    </q-table>

    <q-dialog v-model="prompt">
        <mainLookup 
            titleBar="Buscar Localidad"
            :data="this.lookup_locations"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :columns="[
                    //{ name: 'value', required: true, label: 'Código', align: 'left', field: row => row.short_name_es , sortable: true }
                    { name: 'label', required: true, label: 'Localidad', align: 'left', field: row => row.label, sortable: false,    }
                    //,{ name: 'short_name_es', required: true, label: 'Abreviatura', align: 'left', field: row => row.short_name_es, sortable: false, style: 'max-width: 75px;', }
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
        let newRows = JSON.parse(JSON.stringify(this.locations))
        newRows.find(x=>x.value==row.value)[colName] = newVal
        this.locations = newRows
      },
      showPrompt(){
        this.prompt=true
      },
      addRow(newRecord){
        if(newRecord && newRecord.length>0 && !(this.locations.find(x=>x.value==newRecord[0].value)) ){
          let newRows = JSON.parse(JSON.stringify(this.locations))
          newRows.push({
             value: newRecord[0].value
            ,label: this.lookup_locations.find(t=>t.value==newRecord[0].value).label
            ,isDefault: true
            ,estado: true
          })
          this.locations = newRows
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
        locations: {
            get () { return this.$store.state[this.moduleName].editData.locations },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLocations', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        lookup_locations: {
            get () { return this.$store.state[this.moduleName].editData.lookup_locations },
        },
    }
})
</script>