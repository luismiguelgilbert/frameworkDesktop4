<template>
<div style="margin: -16px;">
   <q-table
    ref="mainTable"
    :data="lines"
    :table-style="editMode==true?'min-height: calc(100vh - 193px); max-height: calc(100vh - 193px);' : 'min-height: calc(100vh - 193px); max-height: calc(100vh - 193px);'"
    row-key="stockID"
    :separator="userTableLines"
    :rows-per-page-options="[0]"
    hide-bottom dense flat
    selection="multiple" :selected.sync="selected"
    virtual-scroll
    :class="tableLastLine"
    :columns="columnas"
    :filter="filterString"
    >
    <template v-slot:top >
      <q-btn v-if="editMode" :label="$q.screen.gt.sm?'Entregar Todo':''" title="Entregar todas líneas seleccionadas" color="primary" no-caps  
        icon="fas fa-people-carry" @click="receiveAll"
        :disable="selected.length<=0" />
      <q-btn v-if="editMode" :label="$q.screen.gt.sm?'Limpiar Todo':''" title="Limpiar todas líneas seleccionadas" color="primary" no-caps  class="q-ml-sm" 
        icon="fas fa-broom" @click="clearAll"
        :disable="selected.length<=0" />
      <q-space />
      <q-input borderless dense v-model="filterString" placeholder="Buscar...">
        <template v-slot:append>
          <q-icon :name="filterString?'fas fa-times':'fas fa-search'" @click="filterString?filterString='':undefined" />
        </template>
      </q-input>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="sm" dense :title="props.row.stockID" />
        </q-td>

        <q-td key="hasError" :props="props" class="no-padding">
            <q-icon 
                size="xs" name="fas fa-exclamation-triangle" color="red" flat dense
                v-if="rowValidation(props.row, true)"
                :title="rowValidation(props.row, false)"
                />
        </q-td>
        
        <q-td key="mktTypeName" :props="props" :tabindex="(props.key*10)+1" >
          {{props.row.mktTypeName}}
        </q-td>

        <q-td key="invName" :props="props" :tabindex="(props.key*10)+1" :title="rowTitleInventory(props.row)">
          {{props.row.invName}}
        </q-td>

        <q-td key="quantity" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantity" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              readonly />
        </q-td>

        <q-td key="quantityRcvd" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityRcvd" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              readonly />
        </q-td>

        <q-td key="quantityCancel" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityCancel" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              readonly />
        </q-td>
        

        <q-td key="quantityOpen" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityOpen" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              readonly />
        </q-td>

        <q-td key="quantityAvailable" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityAvailable" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              readonly />
        </q-td>
       
        <q-td key="newQuantity" :props="props" :tabindex="(props.key*10)+2"
          :class="props.row.newQuantity>0?'bg-primary':(userColor=='blackDark'?'bg-primary':'bg-primary')">
          <q-input  class="no-padding" style="height: 20px !important;"
              :value="props.row.newQuantity" type="number" :min="0" :max="props.row.quantityOpen"
              dense item-aligned borderless :input-class="props.row.newQuantity>0?'text-right text-white':'text-right text-white'"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'newQuantity',props.row)}"
              :readonly="!editMode"
              @focus="$event.target.select()"
              />
        </q-td>

        <q-td key="headerDate" :props="props" :title="dateName(props.row.headerDate)">
          <q-input
            ref="headerDate" mask="date" 
            dense borderless class="no-padding" style="height: 20px !important;" debounce="1000"
            :value="props.row.headerDate"  readonly
            >
            <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" size="xs">
                <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
                <q-date :locale="myQDateLocale" minimal 
                    :value="props.row.headerDate"
                    >
                    
                </q-date>
                </q-popup-proxy>
            </q-icon>
            </template>
          </q-input>
        </q-td>

        <q-td key="expectedDate" :props="props" :title="dateName(props.row.expectedDate)">
          <q-input
            ref="expectedDate" mask="date" 
            dense borderless class="no-padding" style="height: 20px !important;" debounce="1000"
            :value="props.row.expectedDate"  readonly
            >
            <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" size="xs">
                <q-popup-proxy ref="qDateProxy_expectedDate" transition-show="scale" transition-hide="scale">
                <q-date :locale="myQDateLocale" minimal 
                    :value="props.row.expectedDate"
                    >
                    
                </q-date>
                </q-popup-proxy>
            </q-icon>
            </template>
          </q-input>
        </q-td>

        <q-td key="moveDate" :props="props" :title="dateName(props.row.moveDate)">
          <q-input
            ref="moveDate" mask="date" 
            dense borderless class="no-padding" style="height: 20px !important;" debounce="1000"
            :value="props.row.moveDate"  readonly
            >
            <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" size="xs">
                <q-popup-proxy ref="qDateProxy_moveDate" transition-show="scale" transition-hide="scale">
                <q-date :locale="myQDateLocale" minimal 
                    :value="props.row.moveDate"
                    >
                    
                </q-date>
                </q-popup-proxy>
            </q-icon>
            </template>
          </q-input>
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

export default ({
  props: {
      moduleName: { type: String , required: true },
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
        },
        selected: [] ,filterString: ''
      }
  },
    methods:{
      rowTitleInventory(fila){
        let resultado = 'Seleccionar...'
        let target = null
        if(fila&&fila.invID&&fila.invID>0){
          try{
            target = this.lines.find(x=>x.invID == fila.invID)
            resultado = 'Código: ' + target.internal_code + ' || Tipo: ' + target.groupName + ' || Unidad: ' + target.uomName + ' || Marca: ' + target.brandName
          }catch(ex){}
        }
        return resultado
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
      receiveAll(){
        let newRows = JSON.parse(JSON.stringify(this.lines))
        this.selected.map(x=>{
          if(newRows.some(y=>y.stockID==x.stockID)){ //para aplicar solamente a los items seleccionados
            newRows.find(y=>y.stockID==x.stockID)['newQuantity']=x.quantityOpen
          }
          return x
        })
        this.lines = newRows
        this.$emit('onAccMoveCompute')
      },
      clearAll(){
        let newRows = JSON.parse(JSON.stringify(this.lines))
        this.selected.map(x=>{
          if(newRows.some(y=>y.stockID==x.stockID)){ //para aplicar solamente a los items seleccionados
            newRows.find(y=>y.stockID==x.stockID)['newQuantity']=0
          }
          return x
        })
        this.lines = newRows
      },
      updateRow(newVal, colName, row){
        try{
          //Actualiza las líneas
          let newRows = JSON.parse(JSON.stringify(this.lines))
          newRows.find(x=>x.stockID==row.stockID)[colName] = newVal;
          this.lines = newRows
          this.$emit('onAccMoveCompute')
        }catch(ex){
          console.error(ex)
        }
      },
      rowValidation(currentRow, returnType){
        if(currentRow.invID==null||currentRow.invID==undefined||currentRow.invID<=0){
            return (returnType?true:'Debe corregir la celda: Item')
        }
        if(currentRow.quantity==null||currentRow.quantity==undefined||currentRow.quantity<0){
            return (returnType?true:'Debe corregir la celda: Cantidad')
        }
        if(this.editMode){
          if(currentRow.newQuantity==null||currentRow.newQuantity==undefined||currentRow.newQuantity<0 || currentRow.newQuantity > currentRow.quantityOpen || currentRow.newQuantity > currentRow.quantityAvailable){
            return (returnType?true:'Debe corregir la celda: Recibir')
          }
        }
        
        if(currentRow.debit_account_id==null||currentRow.debit_account_id==undefined||currentRow.debit_account_id<=0||currentRow.credit_account_id==null||currentRow.credit_account_id==undefined||currentRow.credit_account_id<=0){
            return (returnType?true:'Debe corregir la configuración contable')
        }
        return false
      },
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        userTimeFormat: { get () { return this.$store.state.main.userTimeFormat }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
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
        lines: {
          get () { return this.$store.state[this.moduleName].editData.lines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_sexo: {
            get () { return this.$store.state[this.moduleName].editData.lookup_sexo },
        },
        columnas: {
          get() {
            let columnas = []
            if(this.editMode){
              columnas = [
                { name: 'hasError', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
                { name: 'mktTypeName', required: true, label: 'Motivo', align: 'left', field: row => row.mktTypeName, sortable: true, style: 'min-width: 85px;' },
                { name: 'invName', required: true, label: 'Item', align: 'left', field: row => row.invName, sortable: true, style: 'min-width: 200px;' },
                { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'max-width: 70px;', headerStyle: 'padding-right: 20px;' },
                { name: 'quantityRcvd', required: true, label: 'Entregado', align: 'right', field: row => row.quantityRcvd, sortable: true , style: 'max-width: 70px;' , headerStyle: 'padding-right: 20px;' },
                { name: 'quantityCancel', required: true, label: 'Cancelado', align: 'right', field: row => row.quantityCancel, sortable: true , style: 'max-width: 70px;' },
                { name: 'quantityOpen', required: true, label: 'Por Entregar', align: 'right', field: row => row.quantityOpen, sortable: true , style: 'max-width: 70px;' , headerStyle: 'padding-right: 20px;' },
                { name: 'quantityAvailable', required: true, label: 'Disponible', align: 'right', field: row => row.quantityAvailable, sortable: true , style: 'max-width: 70px;' , headerStyle: 'padding-right: 20px;' },
                { name: 'newQuantity', required: true, label: 'Entregar', align: 'right', field: row => row.newQuantity, sortable: true , style: 'min-width: 100px;' , headerStyle: 'padding-right: 20px;' },
                { name: 'headerDate', required: true, label: 'Fecha Pedido (aaaa/mm/dd)', align: 'left', field: row => row.headerDate, sortable: true, style: 'min-width: 130px;' },
                { name: 'expectedDate', required: true, label: 'Fecha Estimada (aaaa/mm/dd)', align: 'left', field: row => row.expectedDate, sortable: true, style: 'mi-width: 130px;' },
                //{ name: 'expectedDate', required: true, label: 'Esperado', align: 'left', field: row => row.expectedDate, sortable: true, style: 'max-width: 90px;' },
              ]
            }else{
              columnas = [
                { name: 'hasError', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
                { name: 'mktTypeName', required: true, label: 'Motivo', align: 'left', field: row => row.mktTypeName, sortable: true, style: 'min-width: 85px;' },
                { name: 'invName', required: true, label: 'Item', align: 'left', field: row => row.invName, sortable: true, style: 'min-width: 200px;' },
                { name: 'newQuantity', required: true, label: 'Entregado', align: 'right', field: row => row.newQuantity, sortable: true , style: 'min-width: 100px;' , headerStyle: 'padding-right: 20px;' },
                { name: 'headerDate', required: true, label: 'Fecha Pedido (aaaa/mm/dd)', align: 'left', field: row => row.headerDate, sortable: true, style: 'min-width: 130px;' },
                { name: 'moveDate', required: true, label: 'Fecha Egreso (aaaa/mm/dd)', align: 'right', field: row => row.moveDate, sortable: true , style: 'min-width: 130px;' , headerStyle: 'padding-right: 20px;' },
              ]
            }
            return columnas
          }
        }
    }
})
</script>
