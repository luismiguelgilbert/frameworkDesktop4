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
    <template v-slot:top v-if="editMode==true" >
      <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Agregar':''" title="Agregar Varios Ítems" @click="itemsBatchDialogSelected=[];isItemsBatchDialog=true" icon="fas fa-plus" color="primary" no-caps />
      <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Requisiciones':''" title="Agregar Ítems de Requisiciones Pendientes" @click="isRequisicionDialog=true" icon="far fa-file-alt" color="primary" no-caps  class="q-ml-sm"/>
      <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Quitar':''" title="Eliminar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0" />
      <q-space />
      <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Descuento':''" size="sm" title="Aplicar un mismo descuento a filas seleccionadas" @click="batchUpdateDiscount" icon="fas fa-tag" color="primary" flat no-caps   :disable="selected.length<=0" />
    </template>

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" dense :title="props.row.lineID" />
        </q-td>
        <q-td key="hasError" :props="props" class="no-padding">
            <q-icon 
                size="xs" name="fas fa-exclamation-triangle" color="red" flat dense
                v-if="rowValidation(props.row, true)"
                :title="rowValidation(props.row, false)"
                />
        </q-td>
        <q-td key="invID" :props="props"  :tabindex="(props.key*10)+1" >
          <selectSearchable
              labelText="Materia Prima" 
              labelSearchText="Buscar Materia Prima"
              :optionsList="lookup_items"
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
        <q-td key="quantity" class="no-padding" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantity" type="number" :min="0" :readonly="(editMode==false)"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              debounce="1000"  @input="(value)=>{updateRow(value,'quantity',props.row)}" />
        </q-td>
        <q-td key="price" class="no-padding" :props="props" :tabindex="(props.key*10)+3">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.price" type="number" :min="0" :readonly="(props.row.quantityRcvd>0)"
              :title="(props.row.quantityRcvd>0)?'No se permite editar porque ya existe ingreso a bodega':undefined"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              debounce="1000" @input="(value)=>{updateRow(value,'price',props.row)}" />
        </q-td>
        <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" key="lineSubtotal" :props="props">
          {{ props.row.lineSubtotal.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="lineDiscntPrcnt" class="no-padding" :props="props" :tabindex="(props.key*10)+4">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.lineDiscntPrcnt" type="number" :min="0" :max="100" :readonly="(props.row.quantityRcvd>0)"
              :title="(props.row.quantityRcvd>0)?'No se permite editar porque ya existe ingreso a bodega':undefined"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              debounce="1000" @input="(value)=>{updateRow(value,'lineDiscntPrcnt',props.row)}" />
        </q-td>
        <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" key="lineUntaxed" :props="props">
          {{ props.row.lineUntaxed.toFixed(userMoneyFormat) }}
        </q-td>
      </q-tr>
    </template>
    
    <template v-slot:bottom-row >
      <q-tr>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary" >
              Suma:
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
              {{lines.reduce((total,item)=>{return total + item.lineSubtotal}, 0).toFixed(userMoneyFormat)}}
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
              $({{lines.reduce(function(sum, d) { return sum + d.lineDiscntAmount; }, 0).toFixed(userMoneyFormat)}})
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
              <b>{{lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0).toFixed(userMoneyFormat)}}</b>
          </q-td>
      </q-tr>
      <q-tr v-for="lines in calculatedSumOfTaxes" :key="lines.index">
        <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
         <q-td>
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            <i>{{lines.label}}</i>
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            <i>{{lines.value.toFixed(userMoneyFormat)}}</i>
          </q-td>
      </q-tr>
      <q-tr>
        <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td>
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            <b>TOTAL</b>
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            {{
              (
                lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0)
                +
                linesTaxes.reduce(function(sum, d) { return sum + d.taxAmount; }, 0)
              ).toFixed(userMoneyFormat)
            }}
          </q-td>
      </q-tr>
      <q-tr></q-tr>
    </template>
  </q-table>

  <q-dialog v-model="isItemsBatchDialog">
    <q-card style="min-width: 95%;" > 
      <q-bar class="bg-primary text-white">
        Buscar Items
        <q-space />
        <q-input input-class="text-white" borderless dense debounce="300" autofocus v-model="itemsBatchDialogFilter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon v-if="!itemsBatchDialogFilter" name="fas fa-search" flat round size="xs" color="white" />
            <q-btn v-if="itemsBatchDialogFilter" @click="itemsBatchDialogFilter=''" flat round icon="fas fa-times" size="xs" color="white" />
          </template>
        </q-input>
      </q-bar>
      <q-card-section class="no-padding">
        <q-table
          ref="itemsSearchTable" flat square
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
          @keydown.native.keyCodes.115="addRows(itemsDialogSelected)"
          :data="lookup_items"
          :columns="[
            { name: 'value', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
            { name: 'label', required: true, label: 'Item', align: 'left', field: row => row.label, sortable: true, style: 'min-width: 250px;', },
            { name: 'systemTypeName', required: true, label: 'Tipo', align: 'left', field: row => row.systemTypeName, sortable: true, style: 'min-width: 50px;', },
            { name: 'internal_code', required: true, label: 'Código', align: 'left', field: row => row.internal_code, sortable: true, style: 'min-width: 50px;'},
            { name: 'uomName', required: true, label: 'Unidad de Medida', align: 'left', field: row => row.uomName, sortable: true, style: 'min-width: 50px;'},
            //{ name: 'groupName', required: true, label: 'Grupo Contable', align: 'left', field: row => row.groupName, sortable: true, style: 'min-width: 50px;'},
            { name: 'brandName', required: true, label: 'Marca', align: 'left', field: row => row.brandName, sortable: true, style: 'min-width: 50px;'},
            { name: 'lastPrice', required: true, label: 'Precio P. Actual', align: 'right', field: row => row.lastPrice, format: val => `$${val}`, sortable: true, style: 'min-width: 50px;'},
            //{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: true, style: 'min-width: 50px;'},
          ]"
          row-key="value"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="multiple" :selected.sync="itemsBatchDialogSelected"
          :filter="itemsBatchDialogFilter"
          :class="tableLastLine"
          :separator="userTableLines"
          >
          <template v-slot:body-selection="scope">
            <q-checkbox v-if="scope.row.estado" v-model="scope.selected" dense :title="JSON.stringify(scope.row.estado)" :disable="!(scope.row.estado)" />
            <q-icon v-if="!(scope.row.estado)" name="fas fa-ban" color="red" style="margin-left: 2px;" title="Se encuentra Inactivo"/>
          </template>
        </q-table>
        <q-separator />
        
      </q-card-section>
      <q-card-actions align="around">
        <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar (F4)" no-caps color="primary" :disable="itemsBatchDialogSelected.filter(x=>x.estado).length<=0" @click="addRows(itemsBatchDialogSelected)" ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isRequisicionDialog" @show="loadRequisicionesPendientes">
    <q-card style="min-width: 100%;">
      <q-bar class="bg-primary text-white">
        Requisiciones Pendientes
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
          :class="tableLastLine"
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
          :data="requisiciones"
          :columns="[
            { name: 'mktPRHeader', required: true, label: 'Requisición #', align: 'left', field: row => row.mktPRHeader, sortable: true, style: 'min-width: 100px;', },
            { name: 'sys_user_fullname', required: true, label: 'Persona que Pide', align: 'left', field: row => row.sys_user_fullname, sortable: true, style: 'min-width: 100px;', },
            { name: 'invName', required: true, label: 'Item', align: 'left', field: row => row.invName, sortable: true, style: 'min-width: 250px;', },
            { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'min-width: 50px;', },
            { name: 'whName', required: true, label: 'Entregar en Bodega', align: 'left', field: row => row.whName, sortable: true, style: 'min-width: 50px;'},
            { name: 'expectedDate', required: true, label: 'Fecha Esperada', align: 'left', field: row => row.expectedDate, sortable: true, style: 'min-width: 50px;'},
            { name: 'comments', required: true, label: 'Comentarios', align: 'left', field: row => row.comments, sortable: true, style: 'min-width: 50px;'},
            { name: 'prjName', required: true, label: 'Centro de Costo', align: 'left', field: row => row.prjName, sortable: true, style: 'min-width: 50px;'},
          ]"
          row-key="value"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="multiple" :selected.sync="requisicionesDialogSelected"
          :filter="requisicionesFilterString"
          :separator="userTableLines"
          @keydown.native.keyCodes.115="addRequisiciones(requisicionesDialogSelected)"
          />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar" no-caps color="primary" 
        :disable="requisicionesDialogSelected.length<=0" @click="addRequisiciones(requisicionesDialogSelected)" ></q-btn>
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
        selected: []
      ,itemsDialogSelected: []
      ,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: []
      ,isRequisicionDialog: false, requisicionesDialogSelected: [], requisicionesFilterString: '', isRequisicionDialogLoading: false
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
      if(currentRow.debit_account_id==null||currentRow.debit_account_id==undefined||currentRow.debit_account_id<=0||currentRow.credit_account_id==null||currentRow.credit_account_id==undefined||currentRow.credit_account_id<=0){
          return (returnType?true:'Debe corregir la configuración contable')
      }
      if(currentRow.lineUntaxed==null||currentRow.lineUntaxed==undefined||currentRow.lineUntaxed<0){
          return (returnType?true:'Debe verificar todas las celdas por un error en: Total')
      }
      return false
    },
    addRows(){
      if(this.itemsBatchDialogSelected.length>0){
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
          let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))
          
          //Iterate Selected Rows
          this.itemsBatchDialogSelected.map(invRow => {
            
            if(invRow.systemType!=3){ //3=Kit > Cuando es Kit, agrega la lista de materiales
              max_id++; //increase lineID

              //Append Line
              newRows.push({
                  lineID: max_id
                ,invID: invRow.value
                ,debit_account_id: invRow.debit_account_id
                ,credit_account_id: invRow.credit_account_id
                ,quantity: 1
                ,price: invRow.lastPrice
                ,lineSubtotal: 1 * invRow.lastPrice
                ,lineDiscntPrcnt: 0
                ,lineDiscntAmount: 0
                ,lineUntaxed: 1 * invRow.lastPrice
                ,whID: this.defaultWhID
                ,prjID: 0
                ,transportTypeID: this.defaultTransportID
                ,estado: true
              })

              //Append LineTax
              this.lookup_items_taxes.filter(x=>x.invID==invRow.value).map(impuesto=>{
                let taxConfig = this.lookup_taxes.find(t=>t.taxID==impuesto.taxID)
                newRowsTaxes.push({
                  lineID: max_id
                  ,taxID: impuesto.taxID
                  ,taxName: taxConfig.short_name_es
                  ,isPercent: taxConfig.isPercent
                  ,factor: taxConfig.factor
                  ,factor_base: taxConfig.factor_base
                  ,taxAmount: taxConfig.isPercent?( parseFloat(1 * taxConfig.factor_base) * parseFloat(taxConfig.factor) )  :  parseFloat(taxConfig.factor)
                })
              })
            
            }

            if(invRow.systemType==3){ //3=Kit > Entonces busco los materiales y recorro el resulto para irlos agregagando
              this.lookup_items_kits.filter(x=>x.invID==invRow.value).map(material=>{//material es el item que debo agregar
                this.lookup_items.filter(item=>item.value==material.materialID).map(item=>{//busco el código del material en los items
                  
                  max_id++; //increase lineID

                  //Append Line
                  newRows.push({
                      lineID: max_id
                    ,invID: item.value
                    ,debit_account_id: item.debit_account_id
                    ,credit_account_id: item.credit_account_id
                    ,quantity: 1
                    ,price: item.lastPrice
                    ,lineSubtotal: 1 * item.lastPrice
                    ,lineDiscntPrcnt: 0
                    ,lineDiscntAmount: 0
                    ,lineUntaxed: 1 * item.lastPrice
                    ,whID: this.defaultWhID
                    ,prjID: 0
                    ,transportTypeID: this.defaultTransportID
                    ,estado: true
                  })

                  //Append LineTax
                  this.lookup_items_taxes.filter(x=>x.invID==item.value).map(impuesto=>{
                    let taxConfig = this.lookup_taxes.find(t=>t.taxID==impuesto.taxID)
                    newRowsTaxes.push({
                      lineID: max_id
                      ,taxID: impuesto.taxID
                      ,taxName: taxConfig.short_name_es
                      ,isPercent: taxConfig.isPercent
                      ,factor: taxConfig.factor
                      ,factor_base: taxConfig.factor_base
                      ,taxAmount: taxConfig.isPercent?( parseFloat(1 * taxConfig.factor_base) * parseFloat(taxConfig.factor) )  :  parseFloat(taxConfig.factor)
                    })
                  })
                
                })
              })
            }

          })

          //Update Data
          this.lines = newRows
          this.linesTaxes = newRowsTaxes
          this.$q.loading.hide()  
          this.isItemsBatchDialog = false
        }catch(ex){
          console.dir(ex)
          this.$q.loading.hide()  
        }
      }
    },
    addRequisiciones(){
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
          let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))

          //Iterate Selected Rows
          this.requisicionesDialogSelected.map(invRow => {
            max_id++;
            //Append Line
            newRows.push({
                lineID: max_id
              ,invID: invRow.invID
              ,debit_account_id: invRow.debit_account_id
              ,credit_account_id: invRow.credit_account_id
              ,quantity: invRow.quantity
              ,price: invRow.lastPrice
              ,lineSubtotal: invRow.quantity * invRow.lastPrice
              ,lineDiscntPrcnt: 0
              ,lineDiscntAmount: 0
              ,lineUntaxed: invRow.quantity * invRow.lastPrice
              ,whID: this.defaultWhID
              ,prjID: 0
              ,transportTypeID: this.defaultTransportID
              ,mktPRHeader: invRow.mktPRHeader
              ,mktPRlineID: invRow.mktPRlineID
            })

            //Append LineTax
            this.lookup_items_taxes.filter(x=>x.invID==invRow.invID).map(impuesto=>{
              let taxConfig = this.lookup_taxes.find(t=>t.taxID==impuesto.taxID)

              newRowsTaxes.push({
                lineID: max_id
                ,taxID: impuesto.taxID
                ,taxName: taxConfig.short_name_es
                ,isPercent: taxConfig.isPercent
                ,factor: taxConfig.factor
                ,factor_base: taxConfig.factor_base
                ,taxAmount: taxConfig.isPercent?( parseFloat(1 * taxConfig.factor_base) * parseFloat(taxConfig.factor) )  :  parseFloat(taxConfig.factor)
              })
            })
          })
          
          //Update Data
          this.lines = newRows
          this.linesTaxes = newRowsTaxes
          this.$q.loading.hide()  
          this.isRequisicionDialog = false;
        }catch(ex){
          console.dir(ex)
          this.$q.loading.hide()  
        }
        
      }
    },
    updateRow(newVal, colName, row){
      try{
        this.$q.loading.show()
        //Actualiza las líneas
        let newRows = JSON.parse(JSON.stringify(this.lines))
        let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))
        let currentLineUntaxed = 0;
        newRows.filter(x=>x.lineID==row.lineID).map(result=>{
          if(colName=="quantity"||colName=="price"||colName=="lineDiscntPrcnt"){
              result[colName] = parseFloat(newVal);
          }else{
              result[colName] = newVal;
          }
          result.lineSubtotal = result.price * result.quantity;
          result.lineDiscntAmount = (result.price * result.quantity) * (result.lineDiscntPrcnt / 100);
          result.lineUntaxed = (result.price * result.quantity) - (result.price * result.quantity) * (result.lineDiscntPrcnt / 100);
          currentLineUntaxed = result.lineUntaxed
          return result
        })
        //Actualiza los Impuestos
        newRowsTaxes.filter(x=>x.lineID==row.lineID).map(result=>{
          result.taxAmount = result.isPercent?( parseFloat(currentLineUntaxed * result.factor_base) * parseFloat(result.factor) )  :  parseFloat(result.factor)
        })

        //Actualiza Datos
        this.lines = newRows;
        this.linesTaxes = newRowsTaxes;
        this.$q.loading.hide()
      }catch(ex){
        console.error(ex)
        this.$q.loading.hide()
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
          let newRows = JSON.parse(JSON.stringify(this.lines))
          this.selected.map(row=>{
            newRows = newRows.filter(x=>x.lineID!=row.lineID);
          })
          this.lines = newRows

          //Impuestos
          let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))
          newRowsTaxes = newRowsTaxes.filter(x=>newRows.some(y=>y.lineID==x.lineID))
          this.linesTaxes = newRowsTaxes

          this.selected = []//limpia selección para evitar problema de referencia a filas que no existan
        })
      }
    },
    itemsDialogShown(){
      if(this.itemsDialogSelected.length>0){
        try{
          this.$refs.itemsSearchTable.scrollTo(this.lookup_items.findIndex(x=>x.value == this.itemsDialogSelected[0].value))
        }catch(ex){}
      }
    },
    loadRequisicionesPendientes(){
      this.isRequisicionDialogLoading = true;
      this.$axios({
          method: 'GET',
          url: this.apiURL + 'spMktPOSelectmktPR',
          headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
          params: {
              userCode: this.userCode,
              userCompany: this.userCompany,
              userLanguage: 'es'
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
    batchUpdateDiscount(){
      this.$q.dialog({
        title: 'Aplicar el siguiente descuento a líneas seleccionadas',
        //message: 'Des?',
        prompt: {
          model: 0,
          type: 'number',
          //isValid: val => val >= 0, // << here is the magic
          isValid: val => val >=0 && val <= 100
        },
        ok: { label: 'Aplicar', noCaps: true },
        cancel: { label: 'Cancelar', noCaps: true, flat: true },
      }).onOk(data => {
        this.selected.forEach(row => this.updateRow(data.toString() ,'lineDiscntPrcnt', row) );
      })
    }
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
      userTableLines: { get () { return this.$store.state.main.userTableLines } },
      apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
      editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
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
      linesTaxes: {
          get () { return this.$store.state[this.moduleName].editData.linesTaxes },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'linesTaxes', value: val}) }
      },
      requisiciones: {
          get () { return this.$store.state[this.moduleName].editData.requisiciones },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'requisiciones', value: val}) }
      },
      userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
      sys_user_color: {
          get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
      },
      lookup_items: {
          get () { return this.$store.state[this.moduleName].editData.lookup_items },
      },
      lookup_items_kits: {
          get () { return this.$store.state[this.moduleName].editData.lookup_items_kits },
      },
      lookup_items_taxes: {
          get () { return this.$store.state[this.moduleName].editData.lookup_items_taxes },
      },
      lookup_taxes: {
          get () { return this.$store.state[this.moduleName].editData.lookup_taxes },
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
          const resultadoSubtotales = []
          /*//const resultadoSubtotales = this.linesTaxes.reduce((acc, it) => {
            //crea en el acumulador el atributo con el nombre del impuesto, ej: acc[IVA 12%]
            //luego, suma el valor del acumulador cuando coincida el nombre (ej: acc[IVA 12%] debe ser igual a it.taxName que sería 'IVA 12%')
            //y luego toma el valor y le suma el campo taxAmount
            acc[it.taxName] = ((acc[it.taxName]?acc[it.taxName]:0) + it.lineUntaxed);
            return acc;
          }, {});*/
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
