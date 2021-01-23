<template>
<div style="margin: -16px;">
  <q-table
    ref="mainTable"
    :data="lines"
    :table-style="editMode==true?'min-height: calc(100vh - 140px); max-height: calc(100vh - 140px);' : 'min-height: calc(100vh - 189px); max-height: calc(100vh - 189px);'"
    row-key="lineID"
    :separator="userTableLines"
    :rows-per-page-options="[0]"
    hide-bottom dense flat
    selection="multiple" :selected.sync="selected"
    virtual-scroll
    :class="tableLastLine"
    :filter="filterString"
    :columns="[
      //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
      { name: 'hasError', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
      { name: 'invID', required: true, label: 'Item', align: 'left', field: row => row.invID, sortable: true, style: 'min-width: 300px;' },
      { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'max-width: 100px;', },
      { name: 'quantityRcvd', required: true, label: 'Entregado', align: 'right', field: row => row.quantityRcvd, sortable: true, style: 'max-width: 100px;',  },
      //{ name: 'quantityInvoiced', required: true, label: 'Facturado', align: 'right', field: row => row.quantityInvoiced, sortable: true, style: 'max-width: 100px;',headerStyle: 'padding-right: 20px;'  },
      { name: 'quantityCancel', required: true, label: 'Cancelado', align: 'right', field: row => row.quantityCancel, sortable: true, style: 'max-width: 100px;',headerStyle: 'padding-right: 20px;'  },
      { name: 'quantityCancelNew', required: true, label: 'Cancelar', align: 'right', field: row => row.quantityCancelNew, sortable: true, style: 'max-width: 100px;',headerStyle: 'padding-right: 20px;'  },
      { name: 'quantityOpen', required: true, label: 'Disponible', align: 'right', field: row => row.quantityOpen, sortable: true, style: 'max-width: 100px;',  },
      //{ name: 'whID', required: true, label: 'Bodega', align: 'left', field: row => row.whID, sortable: true },
      //{ name: 'expectedDate', required: true, label: 'Esperado el', align: 'left', field: row => row.expectedDate, sortable: true, style: 'min-width: 100px;' },
      //{ name: 'transportTypeID', required: true, label: 'Entrega?', align: 'left', field: row => row.transportTypeID, sortable: true },
      //{ name: 'prjID', required: true, label: 'Centro de Costo?', align: 'left', field: row => row.prjID, sortable: true },
      { name: 'mktPO_headerID', required: true, label: 'OC #', align: 'right', field: row => row.mktPO_headerID, sortable: true, style: 'max-width: 100px;',  },
      { name: 'mktPO_lineID', required: true, label: 'OC Línea #', align: 'right', field: row => row.mktPO_lineID, sortable: true, style: 'max-width: 100px;',  },
    ]"
    >

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

        <q-td key="invID" :props="props" :tabindex="(props.key*10)+1" >
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
              :tooltipColumns="[
                   { name: 'label', label: 'Item'}
                  ,{ name: 'internal_code', label: 'Código'}
                  ,{ name: 'uomName', label: 'Unidad'}
                  ,{ name: 'brandName', label: 'Marca'}
              ]"
              :initialValue="props.row.invID"
              />
        </q-td>
        <q-td key="quantity" :props="props">{{ props.row.quantity }}</q-td>
        <q-td key="quantityRcvd" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityRcvd }}</q-td>
        <q-td key="quantityInvoiced" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityInvoiced }}</q-td>
        <q-td key="quantityCancel" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityCancel }}</q-td>
        <q-td key="quantityCancelNew" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityCancelNew" type="number" :min="0" :readonly="(editMode==true)" :max="props.row.quantityOpen"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @input="(value)=>{updateRow(value,'quantityCancelNew',props.row)}" />
        </q-td>
        
        <q-td key="quantityOpen" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityOpen }}</q-td>
        
        <q-td key="mktPO_headerID" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.mktPO_headerID }}</q-td>
        <q-td key="mktPO_lineID" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.mktPO_lineID }}</q-td>

      </q-tr>
    </template>
    <template v-slot:top v-if="editMode==false" >
        <q-btn v-if="editMode==false" :label="$q.screen.gt.sm?'Cancelar':''" title="Cancelar líneas seleccionadas" @click="cancelRows" icon="fas fa-ban" color="primary" no-caps   :disable="selected.length<=0" />
        <q-space />
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
          filterString: '', selected: []
        ,isWHDialog: false, whDialogFilter: '', whDialogSelected: [], whDialogTableBusy: false
        ,isTransportDialog: false, transportDialogFilter: '', transportDialogSelected: [], transportDialogTableBusy: false
        ,isPrjDialog: false, prjDialogFilter: '', prjDialogSelected: [], prjDialogTableBusy: false, rootPrjIDSelected: null, prjIDSelected: null
        ,isExpectedDialog: false, expectedDialogDate: ''
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

      updateRow(newVal, colName, row){
        try{
          //Actualiza las líneas
          let newRows = JSON.parse(JSON.stringify(this.lines))
          if(colName=="quantityCancelNew"){
            newRows.find(x=>x.lineID==row.lineID)[colName] = parseFloat(newVal);
          }else{
            newRows.find(x=>x.lineID==row.lineID)[colName] = newVal
          }
          let whID = newRows.find(x=>x.lineID==row.lineID).whID
          let whName = whID?this.lookup_wh.find(x => x.value == whID).label:''
          let prjID = newRows.find(x=>x.lineID==row.lineID).prjID
          let prjName = prjID?this.lookup_prj.find(x => x.value == prjID).label:''
          let transportTypeID = newRows.find(x=>x.lineID==row.lineID).transportTypeID
          let transportTypeName = transportTypeID?this.lookup_transports.find(x => x.value == transportTypeID).label:''
          newRows.find(x=>x.lineID==row.lineID).whName = whName
          newRows.find(x=>x.lineID==row.lineID).prjName = prjName
          newRows.find(x=>x.lineID==row.lineID).transportTypeName = transportTypeName
          this.lines = newRows
        }catch(ex){
          console.error(ex)
        }
      },
      
      whDialogSelectAction(){
        if(this.whDialogSelected.length>0){
          //Segundo, actualiza la fila por medio del método [updateRow]
          if(this.whDialogSelected[0].estado==true){
            this.selected.forEach(rowToUpdate=>{
                this.updateRow(this.whDialogSelected[0].value, 'whID', rowToUpdate)
            })
            this.isWHDialog = false
          }
        }
      },
      whDialogShown(){
        if(this.whDialogSelected.length>0){
          try{
            this.$refs.whSearchTable.scrollTo(this.lookup_wh.findIndex(x=>x.value == this.whDialogSelected[0].value))
          }catch(ex){}
        }
        
      },
      openExpected(){
        this.isExpectedDialog=true
      },
      updateExpectedDates(){
        this.isExpectedDialog=false
        this.selected.forEach(row => this.updateRow(this.expectedDialogDate, 'expectedDate' , row) );
      },
      rowTitleInventory(fila){
        let resultado = 'Seleccionar...'
        let target = null
        if(fila&&fila.invID&&fila.invID>0){
          try{
            target = this.lookup_items.find(x=>x.value == fila.invID)
            resultado = 'Código: ' + target.internal_code + ' || Tipo: ' + target.groupName + ' || Unidad: ' + target.uomName + ' || Marca: ' + target.brandName
          }catch(ex){}
        }
        return resultado
      },
      //
      openSearchTransport(){
        this.isTransportDialog = true
      },
      transportDialogSelectAction(){
        if(this.transportDialogSelected.length>0){
          //Segundo, actualiza la fila por medio del método [updateRow]
          if(this.transportDialogSelected[0].estado==true){
            this.selected.forEach(rowToUpdate=>{
                this.updateRow(this.transportDialogSelected[0].value, 'transportTypeID', rowToUpdate)
            })
            this.isTransportDialog = false
          }
        }
      },
      transportDialogShown(){
        if(this.transportDialogSelected.length>0){
          try{
            this.$refs.transportSearchTable.scrollTo(this.lookup_transports.findIndex(x=>x.value == this.transportDialogSelected[0].value))
          }catch(ex){}
        }
      },
      //
      openSearchPrj(){
        this.isPrjDialog = true
      },
      cancelRows(){
        this.selected.forEach(rowToUpdate=>{
          //pone en columna quantityCancel el valor de las cantidades pendientes (open / por recibir)
          this.updateRow(rowToUpdate.quantityOpen, 'quantityCancelNew', rowToUpdate)
        })
      },
      prjDialogSelectAction(){
        if(this.prjDialogSelected.length>0){
          //Segundo, actualiza la fila por medio del método [updateRow]
          if(this.prjDialogSelected[0].estado==true){
            this.selected.forEach(rowToUpdate=>{
                this.updateRow(this.prjDialogSelected[0].value, 'prjID', rowToUpdate)
            })
            this.isPrjDialog = false
          }
        }
      },
      showDateName(value){
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
      }
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
        defaultTransportID: {
            get () { return this.$store.state[this.moduleName].editData.basic.defaultTransportID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'defaultTransportID', value: val}) }
        },
        paytermID: {
            get () { return this.$store.state[this.moduleName].editData.basic.paytermID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'paytermID', value: val}) }
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
        lookup_prj: {
            get () { return this.$store.state[this.moduleName].editData.lookup_prj },
        },
        lookup_transports: {
            get () { return this.$store.state[this.moduleName].editData.lookup_transports },
        },
        lookup_payterms: {
            get () { return this.$store.state[this.moduleName].editData.lookup_payterms },
        },
        lookup_paytermsDetails: {
            get () { return this.$store.state[this.moduleName].editData.lookup_paytermsDetails },
        },
        lookup_taxesByGroup: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxesByGroup },
        },
    }
})
</script>
