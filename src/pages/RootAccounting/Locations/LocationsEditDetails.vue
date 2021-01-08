<template>
<div>
  <q-table
        :data="details"
        :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
        table-style="min-height: 150px; max-height: calc(100vh - 225px)"
        row-key="longitud"
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        hide-bottom dense
        :filter="filterString"
        :columns="[
          //{ name: 'lineID', required: true, label: 'lineID', align: 'left', field: row => row.lineID, sortable: true },
          { name: 'pos_code', required: true, label: 'Número de Serie del Punto de Emisión', align: 'left', field: row => row.pos_code, sortable: true },
          { name: 'esElectronica', required: true, label: 'Emisión Electrónica?', align: 'center', field: row => row.esElectronica, sortable: true },
          { name: 'firstNumberAR', required: true, label: 'Facturas', align: 'right', field: row => row.firstNumberAR, sortable: true },
          { name: 'firstNumberDelivery', required: true, label: 'Guías', align: 'right', field: row => row.firstNumberDelivery, sortable: true },
          { name: 'firstNumberNC', required: true, label: 'Notas de Crédito', align: 'right', field: row => row.firstNumberNC, sortable: true },
          { name: 'firstNumberRetencion', required: true, label: 'Retenciones', align: 'right', field: row => row.firstNumberRetencion, sortable: true },
          { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
        ]"


  >
    <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="pos_code" :props="props" :title="props.row.sys_location_pos_id">
              <q-input borderless class="no-padding" style="height: 20px !important;"
                :value="props.row.pos_code" dense input-class="text-left" :min="0"
                @input="(value)=>{updateRow(value,'pos_code',props.row)}"
                />
            </q-td>
            
            <q-td key="esElectronica" :props="props">
              <q-toggle :value="props.row.esElectronica" color="primary" dense size="sm" icon="fas fa-plug" dense @input="updateRow(!props.row.esElectronica,'esElectronica',props.row)" />
            </q-td>

            <q-td key="firstNumberAR" :props="props" title="Secuencia Inicial de Facturas" >
              <q-input borderless class="no-padding" style="height: 20px !important;"
                :value="props.row.firstNumberAR" dense input-class="text-right" :min="0" type="number"
                @focus="$event.target.select()"
                @input="(value)=>{updateRow(value,'firstNumberAR',props.row)}"
                />
            </q-td>
            
            <q-td key="firstNumberDelivery" :props="props" title="Secuencia Inicial de Guias de Remisión" >
              <q-input borderless class="no-padding" style="height: 20px !important;"
                :value="props.row.firstNumberDelivery" dense input-class="text-right" :min="0" type="number"
                @input="(value)=>{updateRow(value,'firstNumberDelivery',props.row)}"
                @focus="$event.target.select()"
                />
            </q-td>

            <q-td key="firstNumberNC" :props="props" title="Secuencia Inicial de Notas de Crédito" >
              <q-input borderless class="no-padding" style="height: 20px !important;"
                :value="props.row.firstNumberNC" dense input-class="text-right" :min="0" type="number"
                @input="(value)=>{updateRow(value,'firstNumberNC',props.row)}"
                @focus="$event.target.select()"
                />
            </q-td>

            <q-td key="firstNumberRetencion" :props="props" title="Secuencia Inicial de Retenciones" >
              <q-input borderless class="no-padding" style="height: 20px !important;"
                :value="props.row.firstNumberRetencion" dense input-class="text-right" :min="0" type="number"
                @input="(value)=>{updateRow(value,'firstNumberRetencion',props.row)}"
                @focus="$event.target.select()"
                />
            </q-td>
            
            <q-td key="estado" :props="props">
              <q-toggle :value="props.row.estado" color="positive" icon="fas fa-check" size="sm" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
            </q-td>
            
          </q-tr>
    </template>
    <template v-slot:top>
        <q-btn label="Agregar Punto de Emisión" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
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
            moduleName: "Locations", filterString: '',  prompt: false, newRUC: null
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
        newRows.find(x=>x.sys_location_pos_id==row.sys_location_pos_id)[colName] = newVal
        this.details = newRows
      },
      addRow(){
          let max_id = 1
            if(this.details.length > 0){
                let temp = this.getMax(this.details, "sys_location_pos_id");
                max_id = parseInt(temp.sys_location_pos_id) + parseInt(1);
            }
          let newRows = JSON.parse(JSON.stringify(this.details))
          let nuevoCodigo = '000' + max_id
          newRows.push({
              sys_location_pos_id: max_id
            ,pos_code: nuevoCodigo.substr(nuevoCodigo.length - 3)
            ,esElectronica: true
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
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
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
