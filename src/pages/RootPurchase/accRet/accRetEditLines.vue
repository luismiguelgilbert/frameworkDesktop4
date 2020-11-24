<template>
<div class="row ">
  <q-table
        ref="mainTable"
        :data="lines"
        :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
        table-style="min-height: calc(100vh - 400px); max-height: calc(100vh - 400px)"
        row-key="lineID"
        virtual-scroll
        :rows-per-page-options="[0]"
        hide-bottom dense
        selection="multiple" :selected.sync="selected"
        :filter="filterString"
        :columns="[
           { name: 'tipoComprobanteName', required: true, label: 'Documento', align: 'left', field: row => row.tipoComprobanteName, sortable: true, style: 'min-width: 50px;' },
          ,{ name: 'accAPnumeroDoc', required: true, label: '# Documento', align: 'left', field: row => row.accAPnumeroDoc, sortable: true, style: 'min-width: 100px;' },
          ,{ name: 'sustentoName', required: true, label: 'Sustento', align: 'left', field: row => row.sustentoName, sortable: true, style: 'min-width: 150px;' },
          ,{ name: 'lineSubtotal', required: true, label: 'Subtotal', align: 'right', field: row => row.lineSubtotal, sortable: true , style: 'max-width: 100px;' },
          //,{ name: 'accAP_account_id', required: true, label: 'accAP_account_id', align: 'right', field: row => row.accAP_account_id, sortable: true , style: 'max-width: 100px;' },
          //,{ name: 'tax_account_id', required: true, label: 'tax_account_id', align: 'right', field: row => row.tax_account_id, sortable: true , style: 'max-width: 100px;' },
          ,{ name: 'taxID', required: true, label: 'Retención', align: 'left', field: row => row.taxID, sortable: true },
          ,{ name: 'baseImponible', required: true, label: 'Base Imponible', align: 'right', field: row => row.baseImponible, sortable: true , style: 'max-width: 100px;' },
          ,{ name: 'valorRetenido', required: true, label: 'Valor Retenido', align: 'right', field: row => row.valorRetenido, sortable: true , style: 'max-width: 100px;' },
        ]"
    >

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="sm" dense :title="props.row.lineID" />
        </q-td>
        <q-td key="tipoComprobanteName" :props="props">
          {{ props.row.tipoComprobanteName }}
        </q-td>
        <q-td key="accAPnumeroDoc" :props="props">
          {{ props.row.accAPnumeroDoc }}
        </q-td>
        <q-td key="sustentoName" :props="props">
          {{ props.row.sustentoName }}
        </q-td>
        <q-td key="lineSubtotal" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.lineSubtotal" type="number" :min="0" :readonly="(editMode==false)"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'lineSubtotal',props.row)}" />
        </q-td>
        <q-td key="taxID" :props="props" :tabindex="(props.key*10)+3">
          <inlineSelectSearchable 
            labelSearchText="Buscar Retención"
            :optionsList="lookup_taxes"
            short_name_es
            rowValueField="taxID" 
            optionsListLabel="short_name_es" optionsListCaption="name_es"
            optionLabelField="short_name_es"
            :isClearable="false"
            :isDense="true"
            :isDisable="false" 
            :isReadonly="false"
            :initialValue="props.row.taxID"
            :tableSearchColumns="[
                    { name: 'name_es', label: 'Retención', field: 'name_es', align: 'left'}
                    //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
                ]"
            @onItemSelected="(row)=>{
                    //updateRow(row.taxID,'taxID',props.row)
                    let impuesto = lookup_taxes.find(x=>x.taxID==row)
                    updateRow(row,'taxID',props.row)
                    updateRow(parseFloat(props.row.lineSubtotal)*(impuesto.factor_base),'baseImponible',props.row)
                    updateRow(parseFloat(props.row.lineSubtotal)*(impuesto.factor_base)*(impuesto.factor),'valorRetenido',props.row)
                    
                    /*this.partnerID=row.taxID;
                    this.partnerName=row.label;
                    this.lines = [];
                    this.$emit('onAccMoveCompute')
                    this.loadPendingInvoices();*/
                }"
            />
        </q-td>
        <q-td key="baseImponible" :props="props" :tabindex="(props.key*10)+4">
          {{ props.row.baseImponible }}
        </q-td>
        <q-td key="valorRetenido" :props="props" :tabindex="(props.key*10)+5">
          {{ props.row.valorRetenido }}
        </q-td>
        <!--{{ props.row.tipoComprobanteName.toFixed(userMoneyFormat) }}-->

        <!--
        <q-td key="invID" :props="props" class="no-padding" :tabindex="(props.key*10)+1" >
          <q-input class="no-padding" style="height: 20px !important;" :ref="'lineItem'+(props.key*10)+1"
              :value="props.row.invName" dense item-aligned borderless
              :rules="[val => !!val || 'Requerido']" 
              readonly
              :title="rowTitleInventory(props.row)"
              >
          </q-input>
        </q-td>
        
        <q-td key="price" :props="props" :tabindex="(props.key*10)+3">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.price" type="number" :min="0" :readonly="(props.row.quantityRcvd>0)"
              :title="(props.row.quantityRcvd>0)?'No se permite editar porque ya existe ingreso a bodega':undefined"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'price',props.row)}" />
        </q-td>
        <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" key="lineSubtotal" :props="props">
          {{ props.row.lineSubtotal.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="lineDiscntPrcnt" :props="props" :tabindex="(props.key*10)+4">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.lineDiscntPrcnt" type="number" :min="0" :max="100" :readonly="(props.row.quantityRcvd>0)"
              :title="(props.row.quantityRcvd>0)?'No se permite editar porque ya existe ingreso a bodega':undefined"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'lineDiscntPrcnt',props.row)}" />
        </q-td>
        -->
        

        

      </q-tr>
    </template>
    
    <template v-slot:top >
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Agregar':''" title="Agregar Facturas" @click="()=>{itemsDialogSelected=[];isDialogOpen=true}" icon="fas fa-shopping-cart" color="primary"  no-caps />
        <!--<q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Buscar':''" title="Agregar Varios Servicios" @click="addBatch" icon="fas fa-search-plus" color="primary" no-caps  class="q-ml-sm"/>-->
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Quitar':''" title="Eliminar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0" />
        <q-space />
        <q-btn size="sm" icon="fas fa-calculator" color="primary" flat no-caps class="q-mr-sm" :disable="selected.length<=0" @click="isStatsDialog=!isStatsDialog" />
        <q-btn v-if="editMode==true" :label="$q.screen.gt.lg?'Descuento':''" size="sm" title="Aplicar un mismo descuento a filas seleccionadas" @click="batchUpdateDiscount" icon="fas fa-percent" color="primary" flat no-caps   :disable="selected.length<=0" />
    </template>
  </q-table>

  <q-dialog v-model="isDialogOpen" >
    <q-card style="min-width: 950px;">
      <q-bar class="bg-primary text-white">
        Facturas del Proveedor
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
          :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
          :data="lookup_invoices"
          :columns="[
            //{ name: 'headerID', required: true, label: 'ID', align: 'left', field: row => row.headerID, sortable: true, style: 'max-width: 50px;', },
            { name: 'tipoComprobanteName', required: true, label: 'Documento', align: 'left', field: row => row.tipoComprobanteName, sortable: true, style: 'min-width: 100px;', },
            { name: 'numeroDoc', required: true, label: '# Documento', align: 'left', field: row => row.numeroDoc, sortable: true, style: 'min-width: 150px;', },
            { name: 'headerDate', required: true, label: 'Fecha', align: 'left', field: row => row.headerDate, sortable: true, style: 'min-width: 50px;'},
            { name: 'sustentoName', required: true, label: 'Sustento Tributario', align: 'left', field: row => row.sustentoName, sortable: true, style: 'min-width: 50px;'},
            //{ name: 'amountTotal', required: true, label: 'TOTAL', align: 'right', field: row => row.amountTotal.toFixed(userMoneyFormat), sortable: true, style: 'min-width: 50px;', },
            //{ name: 'amountUnpaid', required: true, label: 'Pendiente', align: 'right', field: row => row.amountUnpaid.toFixed(userMoneyFormat), sortable: true, style: 'min-width: 50px;', },
            { name: 'subtotalBySustento', required: true, label: 'Subtotal del Sustento', align: 'right', field: row => row.subtotalBySustento.toFixed(userMoneyFormat), sortable: true, style: 'min-width: 50px;', },
          ]"
          row-key="ux_id"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="multiple" :selected.sync="itemsDialogSelected"
          :filter="requisicionesFilterString"
          />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar (F4)" no-caps color="primary" 
        :disable="itemsDialogSelected.length<=0" @click="addRows(itemsDialogSelected)" ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog >
  <!--<div class="row col-12 q-pt-sm ">
    <q-card class="col-md-6">
      <q-bar class="bg-primary text-white">
        <div v-if="$q.screen.gt.sm" class="text-subtitle2">Forma de Pago:</div>
        <div v-else class="text-subtitle2">Resumen</div>
        <q-space />
        <q-select
            emit-value map-options item-aligned dense borderless dark color="orange"
            :options="lookup_payterms" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
            :option-disable="opt => !opt.estado"
            v-model="paytermID"
            ref="paytermID"
            :rules="[
                    val => val!= null || '* Requerido',
            ]"
            >
        </q-select>
        <q-icon name="fas fa-money-check" color="white" />
      </q-bar>
      <q-card-section class="no-padding">
        <q-list class="scroll" style="height: 135px;">
      
          <q-item clickable dense v-for="fila in calculated_paytermsDetails" :key="fila.value">
            <q-item-section>
                <q-item-label class="text-grey-7">{{fila.label}}</q-item-label>
            </q-item-section>
            <q-item-section>
                <q-item-label class="text-grey-7">Días Plazo: {{fila.days}}</q-item-label>
            </q-item-section>
            <q-item-section>
                <q-item-label class="text-grey-7">Porcentaje: {{fila.factor}}%</q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-item-label class="text-grey-7">$: {{fila.amount}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <q-card class="col-md-5 offset-md-1" >
      <q-bar class="bg-primary text-white">
        <q-icon name="fas fa-dollar-sign" color="white" />
        <q-space />
        <div v-if="$q.screen.gt.sm" class="text-subtitle2">Resumen del Documento</div>
        <div v-else class="text-subtitle2">Resumen</div>
      </q-bar>
      <q-card-section class="no-padding">
        <q-list class="scroll" style="height: 100px;">
          <q-item clickable dense>
            <q-item-section >
                <q-item-label class="text-grey-7">Suman:</q-item-label>
            </q-item-section>
            <q-item-section side>
              {{lines.reduce(function(sum, d) { return sum + d.lineSubtotal; }, 0).toFixed(userMoneyFormat)}}
            </q-item-section>
          </q-item>
          <q-item clickable dense>
            <q-item-section >
                <q-item-label class="text-grey-7">Descuento:</q-item-label>
            </q-item-section>
            <q-item-section side>
              {{(lines.reduce(function(sum, d) { return sum + d.lineDiscntAmount; }, 0) * -1).toFixed(userMoneyFormat)}}
            </q-item-section>
          </q-item>
          <q-item clickable dense>
            <q-item-section>
              <b class="text-subtitle2 text-grey-7" >Subtotal:</b>
            </q-item-section>
            <q-item-section side>
              <b>{{lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0).toFixed(userMoneyFormat)}}</b>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable dense v-for="lines in calculatedSumOfTaxes" :key="lines.index">
              <q-item-section >
                  <q-item-label class="text-grey-7">{{lines.label}}:</q-item-label>
              </q-item-section>
              <q-item-section side>
                {{lines.value.toFixed(userMoneyFormat)}}
              </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator />
      <q-card-actions class="no-padding">
        <q-item clickable dense class="full-width">
          <q-item-section >
              <q-item-label class="text-subtitle2 text-primary"><b>TOTAL:</b></q-item-label>
          </q-item-section>
          <q-item-section side class="text-subtitle2 text-primary q-mr-md">
            {{
              (
                lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0)
                +
                linesTaxes.reduce(function(sum, d) { return sum + d.taxAmount; }, 0)
              ).toFixed(userMoneyFormat)
            }}
          </q-item-section>
        </q-item>
      </q-card-actions>

    </q-card>
  </div>

  <q-dialog v-model="isItemsBatchDialog">
    <q-card style="min-width: 800px;" > 
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
          ref="itemsSearchTable"
          :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
          @keydown.native.keyCodes.115="addRows(itemsDialogSelected)"
          :data="lookup_items.filter(x=>x.estado==true&&x.systemType==1/*1=Servicios porque Productos SOLO vinculados a mktPO*/)"
          :columns="[
            { name: 'value', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
            { name: 'label', required: true, label: 'Item', align: 'left', field: row => row.label, sortable: true, style: 'min-width: 250px;', },
            { name: 'systemTypeName', required: true, label: 'Tipo', align: 'left', field: row => row.systemTypeName, sortable: true, style: 'min-width: 50px;', },
            { name: 'internal_code', required: true, label: 'Código', align: 'left', field: row => row.internal_code, sortable: true, style: 'min-width: 50px;'},
            { name: 'uomName', required: true, label: 'Unidad de Medida', align: 'left', field: row => row.uomName, sortable: true, style: 'min-width: 50px;'},
            //{ name: 'groupName', required: true, label: 'Grupo Contable', align: 'left', field: row => row.groupName, sortable: true, style: 'min-width: 50px;'},
            { name: 'brandName', required: true, label: 'Marca', align: 'left', field: row => row.brandName, sortable: true, style: 'min-width: 50px;'},
          ]"
          row-key="value"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="multiple" :selected.sync="itemsBatchDialogSelected"
          :filter="itemsBatchDialogFilter"
          >
        </q-table>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar (F4)" no-caps color="primary" 
          :disable="itemsBatchDialogSelected.length<=0" 
          @click="addRows(itemsBatchDialogSelected)" ></q-btn>
      </q-card-actions>
      <q-inner-loading :showing="itemsBatchDialogTableBusy" style="z-index: 10" >
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>



  <q-dialog v-model="isStatsDialog" >
    <q-card style="min-width: 500px;">
      <q-markup-table dense v-if="selected.length>0">
        <thead >
          <tr>
            <th class="text-left">Seleccionadas</th>
            <th class="text-right">Cantidad</th>
            <th class="text-right">Suma</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-left">{{lines.filter(x=>selected.some(y=>y.lineID==x.lineID)).length}}</td>
            <td class="text-right">{{lines.filter(x=>selected.some(y=>y.lineID==x.lineID)).reduce(function(sum, d) { return parseFloat(sum) + parseFloat(d.quantity); }, 0).toFixed(userMoneyFormat)}}</td>
            <td class="text-right">{{lines.filter(x=>selected.some(y=>y.lineID==x.lineID)).reduce(function(sum, d) { return parseFloat(sum) + parseFloat(d.lineSubtotal); }, 0).toFixed(userMoneyFormat)}}</td>
            <td class="text-right">{{lines.filter(x=>selected.some(y=>y.lineID==x.lineID)).reduce(function(sum, d) { return parseFloat(sum) + parseFloat(d.lineUntaxed); }, 0).toFixed(userMoneyFormat)}}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </q-dialog>
  -->

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
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import inlineSelectSearchable from '../../../components/selectSearchable/inlineSelectSearchable.vue'


export default ({
    components: {
        selectSearchable: selectSearchable
        ,inlineSelectSearchable:inlineSelectSearchable
    },
    data () {
      return {
          moduleName: "accRet", filterString: '', selected: []
        ,isDialogOpen: false
        ,isUpdateItemDialog: false
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
      addRows(rows){
        try{
          this.$q.loading.show()
          //#region NextIDs
          let newLineID = 0
          if(this.lines.length > 0){
            let temp = this.getMax(this.lines, "lineID");
            newLineID = parseInt(temp.lineID);
          }
          //#endregion NextIDs

          //#region BackupData
          let newRows = JSON.parse(JSON.stringify(this.lines))
          //#endregion BackupData
          
          //#region Row
          rows.map(row=>{
            //addLine
            newLineID++;
            let nuevaFila = {
               lineID: newLineID
              ,tipoComprobanteName: row.tipoComprobanteName
              ,accAPheaderID: row.headerID
              ,accAPheaderDate: row.headerDate
              ,accAPnumeroDoc: row.numeroDoc
              ,sustentoID: row.sustentoID
              ,sustentoName: row.sustentoName
              ,taxID: 0
              ,accAP_account_id: row.partner_account_id
              ,tax_account_id: 0
              ,lineSubtotal: row.subtotalBySustento
              ,baseImponible: 0
              ,valorRetenido: 0
            }
            newRows.push(nuevaFila)
          })
          //#endregion Row
          
          //#region Finalize
          this.lines = newRows
          this.isDialogOpen=false;
          this.$q.loading.hide()
          this.$emit('onAccMoveCompute')
          //#endregion Finalize
        }catch(ex){
          console.dir(ex)
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

            this.selected = []//limpia selección para evitar problema de referencia a filas que no existan
            this.$emit('onAccMoveCompute')
          })
        }
      },
      updateRow(newVal, colName, row){
        console.dir('updateRow')
        console.dir('newVal')
        console.dir(newVal)
        console.dir('colName')
        console.dir(colName)
        console.dir(row)
        console.dir(this.lookup_taxes)
        
        try{
          this.$q.loading.show()
          //Actualiza las líneas
          let newRows = JSON.parse(JSON.stringify(this.lines))
          if(colName=="taxID"){
            console.dir('taxID selected!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            newRows.find(x=>x.lineID==row.lineID)[colName] = parseFloat(newVal);
            
            console.dir(this.lookup_taxes.find(x=>x.taxID==newVal))
          }
          if(colName=="lineSubtotal"){
            newRows.find(x=>x.lineID==row.lineID)[colName] = parseFloat(newVal);
          }else{//comentario, CódigoCentroCosto, CódigoCuentaContable, CódigoSustento
            newRows.find(x=>x.lineID==row.lineID)[colName] = newVal
          }
          //let invID = newRows.find(x=>x.lineID==row.lineID).invID
          //let itemFound = this.lookup_items.find(x => x.value == invID)
          
          //Actualiza Campos de Dinero

          //newRows.find(x=>x.lineID==row.lineID).invName = itemFound.label
          //newRows.find(x=>x.lineID==row.lineID).systemType = itemFound.systemType
          //newRows.find(x=>x.lineID==row.lineID).sri_sustento = itemFound.sri_sustento
          //newRows.find(x=>x.lineID==row.lineID).account_id = itemFound.account_id
          //newRows.find(x=>x.lineID==row.lineID).account_name = this.lookup_accounts.find(t=>t.value==itemFound.account_id).fullLabel
          

          //Actualiza todas las taxLines correspondientes a la línea modificada
          this.lines = newRows;
          this.$q.loading.hide()
          this.$emit('onAccMoveCompute')
        }catch(ex){
          console.error(ex)
          this.$q.loading.hide()
        }
      },
      
      rowTitleInventory(fila){
        let resultado = 'Seleccionar...'
        let target = null
        if(fila&&fila.invID&&fila.invID>0){
          try{
            target = this.lookup_items.find(x=>x.value == fila.invID)
            resultado = 'Código: ' + target.internal_code + ' || Unidad: ' + target.uomName + ' || Marca: ' + target.brandName
          }catch(ex){}
        }
        return resultado
      },
      batchUpdateDiscount(){
        this.$q.dialog({
          title: 'Aplicar el siguiente descuento a todo el documento',
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
      },
      showStats(){
        this.isStatsDialog = !this.isStatsDialog
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
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        lookup_invoices: {
            get () { return this.$store.state[this.moduleName].editData.lookup_invoices },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLookupInvoices', val) }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
        },
        partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
        },
        lookup_taxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxes },
        },
        /*apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        
        
        partner_account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.partner_account_id },
        },
        
        accountLines: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAccountLines', val) }
        },
        
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
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
        lookup_SRI_Tabla_Tipo_Sustento: {
            get () { return this.$store.state[this.moduleName].editData.lookup_SRI_Tabla_Tipo_Sustento },
        },
        */
    }
})
</script>
