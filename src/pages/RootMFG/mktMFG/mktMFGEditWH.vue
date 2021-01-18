<template>
<div style="margin: -16px;">
  <q-table
        ref="mainTable"
        :data="lines"
        table-style="min-height: calc(100vh - 189px); max-height: calc(100vh - 189px);"
        row-key="lineID"
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        hide-bottom dense
        selection="multiple" :selected.sync="selected"
        :filter="filterString"
        :virtual-scroll="true"
        :class="tableLastLine"
        :columns="[
          //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
          { name: 'hasError', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
          { name: 'invID', required: true, label: 'Materia Prima', align: 'left', field: row => row.invID, sortable: true, style: 'min-width: 300px;' },
          { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'max-width: 100px;', },
          { name: 'quantityRcvd', required: true, label: 'Recibido', align: 'right', field: row => row.quantityRcvd, sortable: true, style: 'max-width: 100px;',  },
          { name: 'quantityCancel', required: true, label: 'Cancelado', align: 'right', field: row => row.quantityCancel, sortable: true, style: 'max-width: 100px;',headerStyle: 'padding-right: 20px;'  },
          { name: 'quantityCancelNew', required: true, label: 'Cancelar', align: 'right', field: row => row.quantityCancelNew, sortable: true, style: 'max-width: 100px;',headerStyle: 'padding-right: 20px;'  },
          { name: 'quantityOpen', required: true, label: 'Por Recibir', align: 'right', field: row => row.quantityOpen, sortable: true, style: 'max-width: 100px;',  },
          //{ name: 'whID', required: true, label: 'Bodega', align: 'left', field: row => row.whID, sortable: true, style: 'min-width: 250px;' },
          //{ name: 'expectedDate', required: true, label: 'Esperado el', align: 'left', field: row => row.expectedDate, sortable: true, style: 'min-width: 130px;' },
          //{ name: 'transportTypeID', required: true, label: 'Entrega?', align: 'left', field: row => row.transportTypeID, sortable: true, style: 'min-width: 300px;' },
          //{ name: 'prjID', required: true, label: 'Centro de Costo?', align: 'left', field: row => row.prjID, sortable: true, },
          
        ]"
    >
    <template v-slot:top >
        <q-btn v-if="editMode==false" :label="$q.screen.gt.sm?'Cancelar':''" title="Cancelar líneas seleccionadas" @click="cancelRows" icon="fas fa-ban" color="primary" no-caps   :disable="selected.length<=0" />
        <q-space />
    </template>

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="sm" dense :title="props.row.lineID" />
        </q-td>

        <q-td key="hasError" :props="props" class="no-padding">
            <q-icon 
                size="xs" name="fas fa-exclamation-triangle" color="red" flat dense
                v-if="rowValidation(props.row, true)"
                :title="rowValidation(props.row, false)"
                />
        </q-td>
        <q-td key="invID" :props="props">
          <selectSearchable
              labelText="Materia Prima" 
              labelSearchText="Buscar Materia Prima"
              :optionsList="lookup_items.filter(x=>x.systemType!=3/*3=Kit*/)"
              rowValueField="value" optionLabelField="label" optionsListCaption="internal_code" optionsListLabel="label" optionDisableField="estado"
              :isRequired="true" :isDisable="false" :isReadonly="true"
              :isInline="true" :isDense="true"
              appendIcon="f"
              :tableSearchColumns="[
                    { name: 'label', label: 'Línea de Producción', field: 'label', align: 'left'}
                  ,{ name: 'internal_code', label: 'Código', field: 'internal_code', align: 'left'}
                  ,{ name: 'uomName', label: 'Unidad', field: 'uomName', align: 'left'}
                  ,{ name: 'lastPrice', label: 'Precio P. Actual', field: 'lastPrice', align: 'left'}
                  ,{ name: 'systemTypeName', label: 'Tipo', field: 'systemTypeName', align: 'left'}
              ]"
              :initialValue="props.row.invID"
              />
        </q-td>
        <q-td key="quantity" :props="props">{{ props.row.quantity }}</q-td>
        <q-td key="quantityRcvd" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityRcvd }}</q-td>
        <q-td key="quantityCancel" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityCancel }}</q-td>
        <q-td key="quantityCancelNew" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityCancelNew" type="number" :min="0" :readonly="(editMode==true)" :max="props.row.quantityOpen"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              @input="(value)=>{updateRow(value,'quantityCancelNew',props.row)}" />
        </q-td>
        <q-td key="quantityOpen" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityOpen }}</q-td>
        <q-td key="whID" :props="props">
          <selectSearchable
              labelText="Bodega" 
              labelSearchText="Buscar Bodega"
              :optionsList="lookup_wh"
              rowValueField="value" optionLabelField="label" optionsListCaption="internal_code" optionsListLabel="label" optionDisableField="estado"
              :isRequired="true" :isDisable="false" :isReadonly="true"
              :isInline="true" :isDense="true"
              appendIcon="f"
              :tableSearchColumns="[
                    { name: 'label', label: 'Línea de Producción', field: 'label', align: 'left'}
              ]"
              :initialValue="props.row.whID"
              />
        </q-td>
      </q-tr>
    </template>
    
    <template v-slot:bottom-row >
      <q-tr></q-tr>
    </template>
  </q-table>

</div>
</template>
<style lang="scss">
  .q-table__bottom{ padding: 0px; padding-left: 10px; padding-right: 10px; }
  .q-virtual-scroll__padding{ visibility: hidden;}
  .q-table thead tr:first-child th{ position: sticky; top: 0; opacity: 1; z-index: 1; padding-left: 5px; font-weight: bolder; color: $primary; }
  .my-sticky-header-table{
    .q-table thead tr:first-child th{ background-color: white }
  }
  .my-sticky-header-table-LastLine{
    .q-table thead tr:first-child th{ background-color: white }
    .q-table .q-virtual-scroll__content td{ border-bottom-width: 1px }
  }
  .my-sticky-header-table-dark{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
  }
  .my-sticky-header-table-dark-LastLine{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
    .q-table td{ border-bottom-width: 1px }
  }
</style>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
  props: {
      moduleName: { type: String , required: true },
  },
  components: {
    selectSearchable: selectSearchable
  },
  data () {
    return {
        myQDateLocale: {
            /* starting with Sunday */
            days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
            daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
            months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
            monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
            firstDayOfWeek: 1
        }
      ,filterString: '', selected: []
      //,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: [], itemsBatchDialogRowToUpdate: null, itemsBatchDialogTableBusy: false
    }
  },
  methods:{
    rowValidation(currentRow, returnType){
        if(currentRow.invID==null||currentRow.invID==undefined||currentRow.invID<=0){
            return (returnType?true:'Debe corregir la celda: Materia Prima')
        }
        if(currentRow.quantity==null||currentRow.quantity==undefined||currentRow.quantity<=0){
            return (returnType?true:'Debe corregir la celda: Cantidad')
        }
        if(currentRow.quantity>currentRow.maxQuantity){
            return (returnType?true:'Debe disminuir el valor en la celda: Cantidad')
        }
        if(currentRow.debit_account_id==null||currentRow.debit_account_id==undefined||currentRow.debit_account_id<=0||currentRow.credit_account_id==null||currentRow.credit_account_id==undefined||currentRow.credit_account_id<=0){
            return (returnType?true:'Debe corregir la configuración contable')
        }
        if(currentRow.lineUntaxed==null||currentRow.lineUntaxed==undefined||currentRow.lineUntaxed<0){
            return (returnType?true:'Debe verificar todas las celdas por un error en: Total')
        }
        if(this.editMode==false){
          if(currentRow.quantityCancelNew==null||currentRow.quantityCancelNew==undefined||currentRow.quantityCancelNew<0||currentRow.quantityCancelNew>currentRow.quantityOpen){
            return (returnType?true:'Debe corregir la celda: Cancelar')
          }
        }
        
        return false
      },
    dateName(value){
        let resultado = '...'
        try{
            resultado = date.formatDate(value, this.userDateFormat,
                {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                daysShort: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                }
            )
        }catch(ex){console.dir(ex)}
        return resultado;
    },
    updateRow(newVal, colName, row){
      try{
        this.$q.loading.show()
        //Actualiza las líneas
        let newRows = JSON.parse(JSON.stringify(this.lines))
        newRows.filter(x=>x.lineID==row.lineID).map(result=>{
          if(colName=="quantityCancelNew"){
              result[colName] = parseFloat(newVal);
          }else{
              result[colName] = newVal;
          }
          return result;
        })
        this.lines = newRows
        this.$q.loading.hide()
      }catch(ex){
        console.error(ex)
        this.$q.loading.hide()
      }
    },
    cancelRows(){
      this.selected.forEach(rowToUpdate=>{
        //pone en columna quantityCancel el valor de las cantidades pendientes (open / por recibir)
        this.updateRow(rowToUpdate.quantityOpen, 'quantityCancelNew', rowToUpdate)
      })
    },
  },
  computed:{
      userColor: { get () { return this.$store.state.main.userColor }  },
      userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
      allow_view: { get () { return true }, },
      allow_edit: { get () { return true }, },
      allow_insert: { get () { return true }, },
      allow_report: { get () { return true }, },
      allow_disable: { get () { return true }, },
      editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
      userTableLines: { get () { return this.$store.state.main.userTableLines } },
      tableLastLine: {
          get () { 
              let resultado = ''
              if(this.userColor=='blackDark'){
              if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
              {
                  resultado = 'my-sticky-header-table-dark-LastLine bg-grey-10 '
              }else{
                  resultado = 'my-sticky-header-table-dark bg-grey-10 '
              }
              }
              if(this.userColor!='blackDark'){
                  if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
                  {
                      resultado = 'my-sticky-header-table-LastLine '
                  }else{
                      resultado = 'my-sticky-header-table '
                  }
              }
              return resultado
          }
      },
      defaultWhID: {
          get () { return this.$store.state[this.moduleName].editData.basic.defaultWhID },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'defaultWhID', value: val}) }
      },
      lines: {
          get () { return this.$store.state[this.moduleName].editData.lines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
      },
      userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
      sys_user_color: {
          get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
      },
      lookup_items: {
          get () { return this.$store.state[this.moduleName].editData.lookup_items },
      },
      lookup_wh: {
          get () { return this.$store.state[this.moduleName].editData.lookup_wh },
      },
  }
})
</script>
