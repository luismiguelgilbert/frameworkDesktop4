<template>
<div>
    <q-table
          :data="lots"
          :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 225px); max-height: calc(100vh - 225px)"
          row-key="partnerID"
          virtual-scroll
          :rows-per-page-options="[0]"
          hide-bottom dense
          :filter="filterString"
          :columns="[
            //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
            { name: 'uploaded', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
            { name: 'name_es', required: true, label: 'Lote', align: 'left', field: row => row.name_es, sortable: true },
            { name: 'expirationDate', required: true, label: 'Fecha Expiración', align: 'left', field: row => row.expirationDate, sortable: true },
            { name: 'warrantyDate', required: true, label: 'Fecha Garantía', align: 'left', field: row => row.warrantyDate, sortable: true },
            { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
          ]"


      >
      <template v-slot:body="props">
            <q-tr :props="props">
                <q-td key="uploaded" :props="props">
                    <q-btn dense flat size="xs" v-if="!props.row.uploaded" color="red" icon="fas fa-trash-alt" @click="lots=lots.filter(x=>x.lotID!=props.row.lotID)" />
                </q-td>
                <q-td key="name_es" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.name_es"
                        dense item-aligned borderless input-class="text-left"
                        :rules="[
                            val => !!val || '* Requerido',
                            val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
                        ]"
                        debounce="1000" @input="(value)=>{updateRow(value,'name_es',props.row)}" />
                </q-td>
                <q-td key="expirationDate" :props="props">
                    {{ props.row.expirationDate }}
                    <q-popup-edit :value="props.row.expirationDate" content-class="no-padding">
                        <q-date :locale="myQDateLocale" minimal emit-immediately :value="props.row.expirationDate" @input="(value)=>{updateRow(value,'expirationDate',props.row)}" />
                    </q-popup-edit>
                </q-td>
                <q-td key="warrantyDate" :props="props">
                    {{ props.row.warrantyDate }}
                    <q-popup-edit :value="props.row.warrantyDate" content-class="no-padding">
                        <q-date :locale="myQDateLocale" minimal emit-immediately :value="props.row.warrantyDate" @input="(value)=>{updateRow(value,'warrantyDate',props.row)}" />
                    </q-popup-edit>
                </q-td>
                <q-td key="estado" :props="props">
                    <q-toggle :value="props.row.estado" color="positive" icon="fas fa-check" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
                </q-td>
            </q-tr>
      </template>
        <template v-slot:top>
            <q-btn label="Agregar Lote" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
            <q-space />
            <q-input borderless dense v-model="filterString" placeholder="Buscar...">
              <template v-slot:append>
                <q-icon :name="filterString?'fas fa-times':'fas fa-search'" @click="filterString=''" />
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
            moduleName: "Items", filterString: '', newRecord: null, 
            myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            }
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
        let newRows = JSON.parse(JSON.stringify(this.lots))
        newRows.find(x=>x.lotID==row.lotID)[colName] = newVal
        this.lots = newRows
      },
      showPrompt(){
        this.prompt=true
      },
      addRow(){
        let max_id = 1
        let temp = null
        console.dir('addRow')
        if(this.lots.length > 0){
          temp = this.getMax(this.lots, "lotID");
          max_id = parseInt(temp.lotID) + parseInt(1);
        }
        console.dir('max_id: ' + max_id)

        let newRows = JSON.parse(JSON.stringify(this.lots))
        newRows.push({
             lotID: max_id
            ,name_es: ''
            ,expirationDate: ''
            ,warrantyDate: ''
            ,estado: true
        })
        this.lots = newRows
        this.prompt = false
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
        lots: {
            get () { return this.$store.state[this.moduleName].editData.lots },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLots', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_lots: {
            get () { return this.$store.state[this.moduleName].editData.lookup_lots },
        },
    }
})
</script>
