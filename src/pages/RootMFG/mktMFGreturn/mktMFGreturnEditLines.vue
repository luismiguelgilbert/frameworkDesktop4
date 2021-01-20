<template>
<div style="margin: -16px;">
  <q-table
    ref="mainTable"
    :data="lines"
    :table-style="editMode==true?'min-height: calc(100vh - 189px); max-height: calc(100vh - 189px);' : 'min-height: calc(100vh - 140px); max-height: calc(100vh - 140px);'"
    row-key="lineID"
    :separator="userTableLines"
    :rows-per-page-options="[0]"
    hide-bottom dense flat
    selection="multiple" :selected.sync="selected"
    virtual-scroll
    :class="tableLastLine"
    :columns="[
      //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
      { name: 'hasError', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
      { name: 'invID', required: true, label: 'Item', align: 'left', field: row => row.invID, sortable: true, style: 'min-width: 300px;' },
      { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'max-width: 100px;', headerStyle: 'padding-right: 20px;' },
      { name: 'price', required: true, label: 'Precio', align: 'right', field: row => row.price, sortable: true , style: 'max-width: 100px;' , headerStyle: 'padding-right: 20px;' },
      { name: 'lineSubtotal', required: true, label: 'Suman', align: 'right', field: row => row.lineSubtotal, sortable: true , style: 'max-width: 100px;' },
      { name: 'lineDiscntPrcnt', required: true, label: 'Descuento %', align: 'right', field: row => row.lineDiscntPrcnt, sortable: true , style: 'max-width: 60px;' , headerStyle: 'padding-right: 20px;' },
      { name: 'lineUntaxed', required: true, label: 'Total', align: 'right', field: row => row.lineUntaxed, sortable: true , style: 'max-width: 100px;' },
      //{ name: 'whID', required: true, label: 'Bodega', align: 'right', field: row => row.whID, sortable: true },
      //{ name: 'prjID', required: true, label: 'Centro de Costo?', align: 'right', field: row => row.prjID, sortable: true },
      //{ name: 'transportTypeID', required: true, label: 'Entrega?', align: 'right', field: row => row.transportTypeID, sortable: true },
    ]"
    >
    <template v-slot:top v-if="editMode==true">
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Consumos':''" title="Agregar Ítems de Pedidos de Insumos" @click="isRequisicionDialog = true;" icon="far fa-file-alt" color="primary" no-caps  />
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Quitar':''" title="Eliminar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0" />
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
        <q-td key="quantity" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantity" type="number" :min="0" :readonly="(editMode==false)"
              dense item-aligned borderless input-class="text-right"
              :max="props.row.maxQuantity" 
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              debounce="1000"  @input="(value)=>{updateRow(value,'quantity',props.row)}" />
        </q-td>
        <q-td key="price" :props="props" :tabindex="(props.key*10)+3">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.price" type="number" :min="0" readonly
              :title="(props.row.quantityRcvd>0)?'No se permite editar porque ya existe ingreso a bodega':undefined"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              debounce="1000" @input="(value)=>{updateRow(value,'price',props.row)}" />
        </q-td>
        <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" key="lineSubtotal" :props="props">
          {{ props.row.lineSubtotal.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="lineDiscntPrcnt" :props="props" :tabindex="(props.key*10)+4">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.lineDiscntPrcnt" type="number" :min="0" :max="100" readonly
              :title="(props.row.quantityRcvd>0)?'No se permite editar porque ya existe ingreso a bodega':undefined"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              @input="(value)=>{updateRow(value,'lineDiscntPrcnt',props.row)}" />
        </q-td>
        <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" key="lineUntaxed" :props="props">
          {{ props.row.lineUntaxed.toFixed(userMoneyFormat) }}
        </q-td>
      </q-tr>
    </template>
    
    <template v-slot:bottom-row >
      <q-tr></q-tr>
    </template>
  </q-table>

  <q-dialog v-model="isRequisicionDialog" @show="loadRequisicionesPendientes">
    <q-card style="min-width: 95%;">
      <q-bar class="bg-primary text-white">
        Insumos Consumidos
        <q-space />
        <q-input input-class="text-white" borderless dense debounce="300" v-model="requisicionesFilterString" placeholder="Buscar">
          <template v-slot:append>
            <q-icon v-if="!requisicionesFilterString" name="fas fa-search" flat round size="xs" color="white" />
            <q-btn v-if="requisicionesFilterString" @click="requisicionesFilterString=''" flat round icon="fas fa-times" size="xs" color="white" />
          </template>
        </q-input>
      </q-bar>
      <q-card-section class="no-padding">
        <q-table
          ref="requisicionesSearchTable" flat square
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
          :data="requisiciones"
          :columns="[
            { name: 'mfg_orderID', required: true, label: 'OP #', align: 'left', field: row => row.mfg_orderID, sortable: true, style: 'min-width: 30px;', },
            { name: 'mfg_orderName', required: true, label: 'OP', align: 'left', field: row => row.mfg_orderName, sortable: true, style: 'min-width: 30px;', },
            { name: 'headerID', required: true, label: 'Pedido #', align: 'left', field: row => row.headerID, sortable: true,  },
            { name: 'lineID', required: true, label: 'Pedido Línea #', align: 'left', field: row => row.lineID, sortable: true,  },
            { name: 'invName', required: true, label: 'Item', align: 'left', field: row => row.invName, sortable: true, style: 'min-width: 250px;', },
            { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'min-width: 50px;', },
            { name: 'quantityReturned', required: true, label: 'Devolución', align: 'right', field: row => row.quantityReturned, sortable: true, style: 'min-width: 50px;', },
            { name: 'whName', required: true, label: 'Bodega', align: 'left', field: row => row.whName, sortable: true, style: 'min-width: 50px;'},
            { name: 'moveDate', required: true, label: 'Fecha Ingreso', align: 'left', field: row => row.moveDate, sortable: true, style: 'min-width: 50px;'},
            { name: 'kardexID', required: true, label: 'Ingreso #', align: 'left', field: row => row.kardexID, sortable: true, style: 'min-width: 50px;'},
            { name: 'moveID', required: true, label: 'ID', align: 'left', field: row => row.moveID, sortable: true, style: 'min-width: 50px;'},
          ]"
          row-key="moveID"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="multiple" :selected.sync="requisicionesDialogSelected"
          :class="tableLastLine"
          :separator="userTableLines"
          :filter="requisicionesFilterString"
          />
          <q-separator />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar" no-caps color="primary" 
        :disable="requisicionesDialogSelected.length<=0" @click="addRows(requisicionesDialogSelected)" ></q-btn>
      </q-card-actions>
      <q-inner-loading :showing="isRequisicionDialogLoading" style="z-index: 10" >
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog >

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
        ,isItemsDialog: false, itemsDialogFilter: '', itemsDialogSelected: [], itemsDialogRowToUpdate: null, itemsDialogTableBusy: false
        ,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: [], itemsBatchDialogRowToUpdate: null, itemsBatchDialogTableBusy: false
        ,isRequisicionDialog: false, requisicionesDialogSelected: [], requisicionesFilterString: '', isRequisicionDialogLoading: false
        ,isStatsDialog: false
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
        return false
      },
      loadRequisicionesPendientes(){
        this.isRequisicionDialogLoading = true;
        this.requisicionesDialogSelected = [];
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spmktMFGRetSelectPending',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
            }
        }).then((response) => {
            this.requisiciones = response.data
            this.isRequisicionDialogLoading = false;
        }).catch((error) => {
            console.dir(error)
            let mensaje = ''
            if(error.message){ mensaje = error.message }
            if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
            if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
            this.$q.notify({ html: true, multiLine: false, color: 'red'
                ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
            })
            this.isRequisicionDialogLoading = false;
        })
      },
      addRows(){
        if(this.requisicionesDialogSelected.length>0){
          try{
            this.$q.loading.show()
            //GetMaxId
            let max_id = 0
            let temp = null
            if(this.lines.length > 0){
              temp = this.getMax(this.lines, "lineID");
              max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
            }

            //get Current Data
            let newRows = JSON.parse(JSON.stringify(this.lines))
            //let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))

            //Iterate Selected Rows
            this.requisicionesDialogSelected.map(invRow => {
              max_id++;

              //Append Line
              newRows.push({
                  lineID: max_id
                ,invID: invRow.invID
                ,debit_account_id: invRow.debit_account_id
                ,credit_account_id: invRow.credit_account_id
                ,quantity: invRow.quantityReturnedNew
                ,maxQuantity: invRow.maxQuantity
                ,price: invRow.price
                ,lineSubtotal: invRow.quantityReturnedNew * invRow.price
                ,lineDiscntPrcnt: 0
                ,lineDiscntAmount: 0
                ,lineUntaxed: invRow.quantityReturnedNew * invRow.price
                ,whID: invRow.whID
                ,prjID: invRow.prjID
                ,transportTypeID: invRow.transportTypeID
                ,kardexID: invRow.kardexID
                ,stockID: invRow.stockID
                ,moveID: invRow.moveID
              })

              //No se agrega impuestos..?
            })
            
            //Update Data
            this.lines = newRows;
            this.isRequisicionDialog = false;
            this.$q.loading.hide()
          }catch(ex){
            console.dir(ex)
            this.$q.loading.hide()  
          }
        }
      },
      removeRows(){
        if(this.selected.length > 0){
          this.$q.dialog({ 
            title: 'Confirmación'
            ,message: 'Desea quitar las líneas seleccionadas?'
            ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true }
            ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
          }
          ).onOk(() => {
            //Líneas
            try{
              this.$q.loading.show();
              let newRows = JSON.parse(JSON.stringify(this.lines))
              this.selected.map(row=>{
                newRows = newRows.filter(x=>x.lineID!=row.lineID);
              })
              this.lines = newRows
              this.selected = []//limpia selección para evitar problema de referencia a filas que no existan
              this.$q.loading.hide()
            }catch(ex){
              console.error(ex)
              this.$q.loading.hide()
            }
            
          })
        }
      },
      updateRow(newVal, colName, row){
        try{
          this.$q.loading.show()
          //Actualiza las líneas
          let newRows = JSON.parse(JSON.stringify(this.lines))
          newRows.filter(x=>x.lineID==row.lineID).map(result=>{
            if(colName=="quantity"||colName=="price"||colName=="lineDiscntPrcnt"){
                result[colName] = parseFloat(newVal);
            }else{
                result[colName] = newVal;
            }
            result.lineSubtotal = result.price * result.quantity;
            result.lineDiscntAmount = (result.price * result.quantity) * (result.lineDiscntPrcnt / 100);
            result.lineUntaxed = (result.price * result.quantity) - (result.price * result.quantity) * (result.lineDiscntPrcnt / 100);
            return result;
          })

          //Actualiza Datos
          this.lines = newRows;
          this.$q.loading.hide();

        }catch(ex){
          console.error(ex)
          this.$q.loading.hide();
        }
      },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        allow_view: { get () { return true }, },
        allow_edit: { get () { return true }, },
        allow_insert: { get () { return true }, },
        allow_report: { get () { return true }, },
        allow_disable: { get () { return true }, },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
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
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
        },
        requisiciones: {
            get () { return this.$store.state[this.moduleName].editData.requisiciones },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'requisiciones', value: val}) }
        },
        /*linesTaxes: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLinesTaxes', val) }
        },*/
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
        lookup_items_taxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items_taxes },
        },
        /*lookup_taxesByGroup: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxesByGroup },
        },*/
        calculated_paytermsDetails: {
            get () {
              let resultado = []
              let grandTotal = this.lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0)
              if(this.paytermID&&this.paytermID>0){
                if(this.lookup_paytermsDetails.filter(x=>x.paytermID==this.paytermID)){
                  let linea = {}
                  this.lookup_paytermsDetails.filter(x=>x.paytermID==this.paytermID).map(row=>{
                    linea = {
                      value: row.value
                      ,label: row.label
                      ,factor: row.factor
                      ,days: row.days
                      ,amount: (grandTotal * (row.factor/100)).toFixed(this.userMoneyFormat)
                    }
                    resultado.push(linea)
                  })
                  
                }
              }
              return resultado
            },
        },
        calculatedSumOfTaxes: {
          get () {
            //Sección Subtotales
            //acc = acumulador  ||  it = fila
            const resultadoSubtotales = this.linesTaxes.reduce((acc, it) => {
              //crea en el acumulador el atributo con el nombre del impuesto, ej: acc[IVA 12%]
              //luego, suma el valor del acumulador cuando coincida el nombre (ej: acc[IVA 12%] debe ser igual a it.taxName que sería 'IVA 12%')
              //y luego toma el valor y le suma el campo taxAmount
              acc[it.taxName] = ((acc[it.taxName]?acc[it.taxName]:0) + it.lineUntaxed);
              return acc;
            }, {});
            //sección Impuestos
            const resultado = this.linesTaxes.reduce((acc, it) => {
              //crea en el acumulador el atributo con el nombre del impuesto, ej: acc[IVA 12%]
              //luego, suma el valor del acumulador cuando coincida el nombre (ej: acc[IVA 12%] debe ser igual a it.taxName que sería 'IVA 12%')
              //y luego toma el valor y le suma el campo taxAmount
              acc[it.taxName] = ((acc[it.taxName]?acc[it.taxName]:0) + it.taxAmount);
              return acc;
            }, {});
            //resultado es un objeto, entonces se convierte a Array object a Array
            var result = [];
            for(var i in resultadoSubtotales){
              result.push({
                 label: 'Subtotal ' + i
                ,value: resultadoSubtotales[i]
                }
              )
            }
            for(var i in resultado){
              result.push({
                 label: i
                ,value: resultado[i]
                }
              )
            }
            return result
          }
        }
    }
})
</script>
