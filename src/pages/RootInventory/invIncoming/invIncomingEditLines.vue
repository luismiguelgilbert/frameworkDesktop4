<template>
<div>
   <q-table
        ref="mainTable"
        :data="lines"
        :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
        table-style="min-height: calc(100vh - 225px); max-height: calc(100vh - 225px)"
        row-key="stockID"
        virtual-scroll
        :rows-per-page-options="[0]"
        hide-bottom dense
        selection="multiple" :selected.sync="selected"
        :filter="filterString"
        :columns="columnas"
    >

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="sm" dense :title="props.row.stockID" />
        </q-td>
        
        <q-td key="mktTypeName" :props="props" class="no-padding" :tabindex="(props.key*10)+1" >
          {{props.row.mktTypeName}} #{{props.row.headerID}}
        </q-td>
        
        <q-td key="headerDate" :props="props" >
          {{showDateName(props.row.headerDate)}}
        </q-td>

        
        <q-td key="invName" :props="props" class="no-padding" :tabindex="(props.key*10)+1" :title="rowTitleInventory(props.row)">
          {{props.row.invName}}
        </q-td>
        <!--<q-td key="invID" :props="props" class="no-padding" :tabindex="(props.key*10)+1" >
          <q-input class="no-padding" style="height: 20px !important;" :ref="'lineItem'+(props.key*10)+1"
              :value="props.row.invName" dense item-aligned borderless
              :rules="[val => !!val || 'Requerido']" readonly
              
              >
          </q-input>
        -->

        <q-td key="quantity" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantity" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              readonly />
        </q-td>
        <q-td key="quantityRcvd" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityRcvd" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              readonly />
        </q-td>
        <q-td key="quantityCancel" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityCancel" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              readonly />
        </q-td>
        <q-td key="quantityOpen" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityOpen" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
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
              />
        </q-td>

        <q-td key="expectedDate" :props="props">
          {{showDateName(props.row.expectedDate)}}
        </q-td>

        <q-td key="moveDate" :props="props">
          {{showDateTimeName(props.row.moveDate)}}
        </q-td>
        
        
      </q-tr>
    </template>
    <template v-slot:top >
      <q-btn v-if="editMode" :label="$q.screen.gt.sm?'Recibir Todo':''" title="Recibir todas líneas seleccionadas" color="primary" no-caps  
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
            moduleName: "invIncoming"
            ,selected: []
            ,filterString: '', dialogVisible: false
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
      receiveAll(){
        let newRows = JSON.parse(JSON.stringify(this.lines))
        this.selected.map(x=>{
          if(newRows.some(y=>y.stockID==x.stockID)){ //para aplicar solamente a los items seleccionados
            newRows.find(y=>y.stockID==x.stockID).['newQuantity']=x.quantityOpen
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
            newRows.find(y=>y.stockID==x.stockID).['newQuantity']=0
          }
          return x
        })
        this.lines = newRows
        this.$emit('onAccMoveCompute')
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
      },
      showDateTimeName(value){
        let resultado = '...'
        try{
          resultado = date.formatDate(value, this.userDateFormat + ' ' + this.userTimeFormat,
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
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userColor: { get () { return this.$store.state.main.userColor }  },
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
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
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
                { name: 'mktTypeName', required: true, label: 'Motivo', align: 'left', field: row => row.mktTypeName, sortable: true, style: 'min-width: 85px; max-width: 85px;' },
                { name: 'headerDate', required: true, label: 'Pedido El', align: 'left', field: row => row.headerDate, sortable: true, style: 'min-width: 100px;' },
                { name: 'invName', required: true, label: 'Item', align: 'left', field: row => row.invName, sortable: true, style: 'min-width: 200px;' },
                { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'max-width: 70px;', headerStyle: 'padding-right: 20px;' },
                { name: 'quantityRcvd', required: true, label: 'Recibido', align: 'right', field: row => row.quantityRcvd, sortable: true , style: 'max-width: 70px;' , headerStyle: 'padding-right: 20px;' },
                { name: 'quantityCancel', required: true, label: 'Cancelada', align: 'right', field: row => row.quantityCancel, sortable: true , style: 'max-width: 70px;' },
                { name: 'quantityOpen', required: true, label: 'Por Recibir', align: 'right', field: row => row.quantityOpen, sortable: true , style: 'max-width: 70px;' , headerStyle: 'padding-right: 20px;' },
                { name: 'newQuantity', required: true, label: 'Recibir', align: 'right', field: row => row.newQuantity, sortable: true , style: 'min-width: 100px;' , headerStyle: 'padding-right: 20px;' },
                { name: 'expectedDate', required: true, label: 'Esperado', align: 'left', field: row => row.expectedDate, sortable: true, style: 'max-width: 90px;' },
              ]
            }else{
              columnas = [
                { name: 'mktTypeName', required: true, label: 'Motivo', align: 'left', field: row => row.mktTypeName, sortable: true, style: 'min-width: 85px; max-width: 85px;' },
                { name: 'headerDate', required: true, label: 'Pedido El', align: 'left', field: row => row.headerDate, sortable: true, style: 'min-width: 100px;' },
                { name: 'invName', required: true, label: 'Item', align: 'left', field: row => row.invName, sortable: true, style: 'min-width: 200px;' },
                { name: 'newQuantity', required: true, label: 'Recibido', align: 'right', field: row => row.newQuantity, sortable: true , style: 'min-width: 100px;' , headerStyle: 'padding-right: 20px;' },
                { name: 'moveDate', required: true, label: 'Fecha de Ingreso ', align: 'right', field: row => row.moveDate, sortable: true , style: 'min-width: 100px;' , headerStyle: 'padding-right: 20px;' },
              ]
            }
            return columnas
          }
        }
    }
})
</script>
