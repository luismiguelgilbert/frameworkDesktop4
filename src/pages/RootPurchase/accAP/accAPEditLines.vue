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
          //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
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

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="sm" dense :title="props.row.lineID" />
        </q-td>
        <q-td key="invID" :props="props" class="no-padding" :tabindex="(props.key*10)+1" >
          <q-input class="no-padding" style="height: 20px !important;" :ref="'lineItem'+(props.key*10)+1"
              :value="props.row.invName" dense item-aligned borderless
              :rules="[val => !!val || 'Requerido']" 
              readonly
              :title="rowTitleInventory(props.row)"
              >
          </q-input>
        </q-td>
        <q-td key="quantity" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantity" type="number" :min="0" :readonly="(editMode==false)"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'quantity',props.row)}" />
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
        <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" key="lineUntaxed" :props="props">
          {{ props.row.lineUntaxed.toFixed(userMoneyFormat) }}
        </q-td>

        <!--<q-td key="whID" :props="props">{{ props.row.whName }}</q-td>-->
        <q-td key="prjID" :props="props">{{ props.row.prjName }}</q-td>
        <!--<q-td key="transportTypeID" :props="props">{{ props.row.transportTypeName }}</q-td>-->

      </q-tr>
    </template>
    <template v-slot:top >
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Agregar':''" title="Agregar Servicio" @click="()=>{itemsBatchDialogSelected=[];isItemsBatchDialog=true}" icon="fas fa-plus" color="primary"  no-caps />
        <!--<q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Buscar':''" title="Agregar Varios Servicios" @click="addBatch" icon="fas fa-search-plus" color="primary" no-caps  class="q-ml-sm"/>-->
        <q-btn v-if="editMode==true" :disable="!(partnerID>0)" :label="$q.screen.gt.sm?'Productos':''" title="Agregar Ítems de Ingresos a Bodega y Órdenes de Compra" @click="isRequisicionDialog=true" icon="fas fa-boxes" color="primary" no-caps  class="q-ml-sm"/>
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Quitar':''" title="Eliminar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0" />
        <q-space />
        <q-btn size="sm" icon="fas fa-calculator" color="primary" flat no-caps class="q-mr-sm" :disable="selected.length<=0" @click="isStatsDialog=!isStatsDialog" />
        <q-btn v-if="editMode==true" :label="$q.screen.gt.lg?'Descuento':''" size="sm" title="Aplicar un mismo descuento a filas seleccionadas" @click="batchUpdateDiscount" icon="fas fa-percent" color="primary" flat no-caps   :disable="selected.length<=0" />
    </template>
  </q-table>

  <div class="row col-12 q-pt-sm ">
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
          <!--Sección Impuestos, que están en [calculatedSumOfTaxes] :key="fila.value"-->
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
            <!--<b>{{lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0).toFixed(userMoneyFormat)}}</b>-->
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

  <q-dialog v-model="isRequisicionDialog" @show="loadmktPOPendientes">
    <q-card style="min-width: 950px;">
      <q-bar class="bg-primary text-white">
        Órdenes de Compra del Proveedor
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
          ref="requisicionesSearchTable"
          :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
          :data="requisiciones"
          :columns="[
            { name: 'mktPOHeader', required: true, label: 'OC #', align: 'left', field: row => row.mktPOHeader, sortable: true, style: 'max-width: 50px;', },
            { name: 'invName', required: true, label: 'Item', align: 'left', field: row => row.invName, sortable: true, style: 'min-width: 250px;', },
            { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'min-width: 50px;', },
            { name: 'quantityRcvd', required: true, label: 'Recibido', align: 'right', field: row => row.quantityRcvd, sortable: true, style: 'min-width: 50px;', classes:'bg-grey-6' },
            { name: 'quantityCancel', required: true, label: 'Cancelado', align: 'right', field: row => row.quantityCancel, sortable: true, style: 'min-width: 50px;', },
            { name: 'quantityOpen', required: true, label: 'Por Recibir', align: 'right', field: row => row.quantityOpen, sortable: true, style: 'min-width: 50px;', },
            { name: 'quantityInvoiced', required: true, label: 'Facturado', align: 'right', field: row => row.quantityInvoiced, sortable: true, style: 'min-width: 50px;'},
            { name: 'quantityInvoiceOpen', required: true, label: 'Por Facturar', align: 'right', field: row => row.quantityInvoiceOpen, sortable: true, style: 'min-width: 50px;', classes:'bg-grey-6' },
            { name: 'whName', required: true, label: 'Bodega', align: 'left', field: row => row.whName, sortable: true, style: 'min-width: 50px;'},
            { name: 'comments', required: true, label: 'Comentarios', align: 'left', field: row => row.comments, sortable: true, style: 'min-width: 50px;'},
            
          ]"
          row-key="value"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="multiple" :selected.sync="requisicionesDialogSelected"
          :filter="requisicionesFilterString"
          />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar (F4)" no-caps color="primary" 
        :disable="requisicionesDialogSelected.length<=0" @click="addRows(requisicionesDialogSelected)" ></q-btn>
      </q-card-actions>
      <q-inner-loading :showing="isRequisicionDialogLoading" style="z-index: 10" >
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog >

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
          moduleName: "accAP", filterString: '', selected: []
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
          let newTaxLineID = 0
          if(this.linesTaxes.length > 0){
            let taxTemp = this.getMax(this.linesTaxes, "taxLineID");
            newTaxLineID = parseInt(taxTemp.taxLineID);
          }
          //#endregion NextIDs

          //#region BackupData
          let newRows = JSON.parse(JSON.stringify(this.lines))
          let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))
          //#endregion BackupData
          
          //#region RowAndTaxes
          rows.map(row=>{
            //addLine
            newLineID++;
            let nuevaFila = {
              lineID: newLineID
              ,sri_sustento: row.sri_sustento
              ,sri_sustentoName: this.lookup_SRI_Tabla_Tipo_Sustento.find(t=>t.value==row.sri_sustento).label
              ,systemType: row.systemType
              ,invID: row.value&&row.value>0?row.value:row.invID
              ,invName: row.invName&&row.invName.length>0?row.invName:this.lookup_items.find(x=>x.value==row.value).label
              ,account_id: row.account_id
              ,account_name: this.lookup_accounts.find(t=>t.value==row.account_id).fullLabel
              ,quantity: row.quantityInvoiceOpen&&row.quantityInvoiceOpen>=0?row.quantityInvoiceOpen:1
              ,price: row.price&&row.price>=0?row.price:0
              ,lineSubtotal: row.lineSubtotal&&row.lineSubtotal>=0?row.lineSubtotal:0
              ,lineDiscntPrcnt: row.lineDiscntPrcnt&&row.lineDiscntPrcnt>=0?row.lineDiscntPrcnt:0
              ,lineDiscntAmount: row.lineDiscntAmount&&row.lineDiscntAmount>=0?row.lineDiscntAmount:0
              ,lineUntaxed: row.lineUntaxed&&row.lineUntaxed>=0?row.lineUntaxed:0
              ,prjID: row.prjID&&row.prjID>0?row.prjID:0
              ,prjName: row.prjName&&row.prjName.length>0?row.prjName:''
              ,comments: row.comments&&row.comments.length>0?row.comments:''
              ,mktPOHeader: row.mktPOHeader&&row.mktPOHeader>0?row.mktPOHeader:0
              ,mktPOlineID: row.mktPOlineID&&row.mktPOlineID>0?row.mktPOlineID:0
          }
            newRows.push(nuevaFila)
            //addTaxes
            this.lookup_items_taxes.filter(x=>x.invID==nuevaFila.invID).forEach(impuesto=>{
              newTaxLineID++;
              newRowsTaxes.push({
                  lineID: newLineID
                ,taxLineID: newTaxLineID
                ,account_id: impuesto.account_id
                ,invID: nuevaFila.invID
                ,comments: impuesto.taxName
                ,taxID: impuesto.taxID
                ,taxName: impuesto.shortLabel
                ,taxAmount: impuesto.isPercent?( parseFloat( (nuevaFila.lineUntaxed) * impuesto.factor_base) * parseFloat(impuesto.factor) )  :  parseFloat(impuesto.factor)
                ,isPercent: impuesto.isPercent
                ,factor: impuesto.factor
                ,factor_base: impuesto.factor_base
                ,lineUntaxed: nuevaFila.lineUntaxed
              })
            })
          })
          //#endregion RowAndTaxes
          
          //#region Finalize
          this.lines = newRows
          this.linesTaxes = newRowsTaxes
          this.isItemsBatchDialog=false;
          this.isRequisicionDialog=false;
          this.$q.loading.hide()
          this.calculateAccMove();
          //#endregion Finalize
        }catch(ex){
          console.dir(ex)
          this.$q.loading.hide()  
        }
      },
      calculateAccMove(){
        this.$q.loading.show()
        let newRowsAccount = [] //no necesito guardarlo, xq recalculo siempre JSON.parse(JSON.stringify(this.accountLines))
        let partnerCredit = 0
        let newAccLineID = 0
        //#region ITEM_LINES_debit
        this.lines.map(row=>{
          newAccLineID++;
          partnerCredit += row.lineUntaxed
          newRowsAccount.push({
             accLineID: newAccLineID
            ,lineID: row.lineID
            ,taxLineID: 0
            ,accountID: row.account_id
            ,partnerID: 0
            ,debit: row.lineUntaxed
            ,credit: 0
            ,invID: row.invID
            ,prjID: row.prjID
            ,mktLineID: row.lineID
            ,comments: row.invName
          })
        })
        //#endregion ITEM_LINES_debit
        //#region TAX_LINES_debit
        this.linesTaxes.map(row=>{
          newAccLineID++;
          partnerCredit += row.taxAmount
          newRowsAccount.push({
             accLineID: newAccLineID
            ,lineID: row.lineID
            ,taxLineID: row.taxLineID
            ,accountID: row.account_id
            ,partnerID: 0
            ,debit: row.taxAmount
            ,credit: 0
            ,invID: row.invID
            ,prjID: this.lines.find(x=>x.lineID==row.lineID).prjID
            ,mktLineID: row.lineID
            ,comments: row.taxName + ' (' + this.lines.find(x=>x.lineID==row.lineID).invName + ')'
          })
        })
        //#endregion ITEM_LINES_debit
        
        //#region PARTNER_Credit
        newAccLineID++;
        newRowsAccount.push({
             accLineID: newAccLineID
            ,lineID: 0
            ,taxLineID: 0
            ,accountID: this.partner_account_id
            ,partnerID: this.partnerID
            ,debit: 0
            ,credit: partnerCredit
            ,invID: 0
            ,prjID: 0
            ,mktLineID: 0
            ,comments: this.partnerName
          })
        //#endregion PARTNER_Credit
        
        //#region Finalize
        this.accountLines = newRowsAccount
        this.$q.loading.hide()
        //#endregion Finalize
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
            this.calculateAccMove();
          })
        }
      },
      updateRow(newVal, colName, row){
        try{
          this.$q.loading.show()
          //Actualiza las líneas
          let newRows = JSON.parse(JSON.stringify(this.lines))
          if(colName=="quantity"||colName=="price"||colName=="lineDiscntPrcnt"){
            newRows.find(x=>x.lineID==row.lineID)[colName] = parseFloat(newVal);
          }else{//comentario, CódigoCentroCosto, CódigoCuentaContable, CódigoSustento
            newRows.find(x=>x.lineID==row.lineID)[colName] = newVal
            //si es campo de tipo Lookup, entonces para mejorar rendimiento SOLO busca nuevo campo si es necesario
            if(colName=="sri_sustento"){
              newRows.find(x=>x.lineID==row.lineID).sri_sustentoName = this.lookup_SRI_Tabla_Tipo_Sustento.find(t=>t.value==newVal).label
            }
            if(colName=="account_id"){
              newRows.find(x=>x.lineID==row.lineID).account_name = this.lookup_SRI_Tabla_Tipo_Sustento.find(t=>t.value==newVal).label
            }
            /*if(colName=="prjID"){
              console.dir('actualiza Sustento')
              console.dir(this.lookup_accounts.find(t=>t.value==newVal).label)
              newRows.find(x=>x.lineID==row.lineID).sri_sustentoName = this.lookup_accounts.find(t=>t.value==newVal).label
            }*/
          }
          //let invID = newRows.find(x=>x.lineID==row.lineID).invID
          //let itemFound = this.lookup_items.find(x => x.value == invID)
          
          //Actualiza Campos de Dinero
          let lineSubtotal = newRows.find(x=>x.lineID==row.lineID).price * newRows.find(x=>x.lineID==row.lineID).quantity;
          let lineDiscntAmount = lineSubtotal * (  (newRows.find(x=>x.lineID==row.lineID).lineDiscntPrcnt) / 100  );
          let lineUntaxed = lineSubtotal - lineDiscntAmount
          newRows.find(x=>x.lineID==row.lineID).lineSubtotal = lineSubtotal
          newRows.find(x=>x.lineID==row.lineID).lineDiscntAmount = lineDiscntAmount
          newRows.find(x=>x.lineID==row.lineID).lineUntaxed = lineUntaxed

          //newRows.find(x=>x.lineID==row.lineID).invName = itemFound.label
          //newRows.find(x=>x.lineID==row.lineID).systemType = itemFound.systemType
          //newRows.find(x=>x.lineID==row.lineID).sri_sustento = itemFound.sri_sustento
          //newRows.find(x=>x.lineID==row.lineID).account_id = itemFound.account_id
          //newRows.find(x=>x.lineID==row.lineID).account_name = this.lookup_accounts.find(t=>t.value==itemFound.account_id).fullLabel
          

          //Actualiza todas las taxLines correspondientes a la línea modificada
          let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))
          newRowsTaxes.filter(x=>x.lineID==row.lineID).map(lineaImpuesto=>{
            lineaImpuesto.lineUntaxed = lineUntaxed;
            lineaImpuesto.taxAmount = lineaImpuesto.isPercent?( parseFloat(lineUntaxed * lineaImpuesto.factor_base) * parseFloat(lineaImpuesto.factor) )  :  parseFloat(lineaImpuesto.factor);
            return lineaImpuesto
          })
          this.lines = newRows;
          this.linesTaxes = newRowsTaxes;
          this.$q.loading.hide()
          this.calculateAccMove();
        }catch(ex){
          console.error(ex)
          this.$q.loading.hide()
        }
      },
      mktPOBatchDialogSelectAction(){
        let max_id = 0
        let temp = null
        if(this.lines.length > 0){
          temp = this.getMax(this.lines, "lineID");
          //max_id = parseInt(temp.lineID) + parseInt(1);
          max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
        }
        let newRows = JSON.parse(JSON.stringify(this.lines))            //Líneas
        let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))  //Impuestos
        if(this.requisicionesDialogSelected.length>0){
          this.requisicionesDialogSelected.map(row => {
            max_id = parseInt(max_id) + parseInt(1);
            //líneas
            newRows.push({
               lineID: max_id
              ,invID: row.invID
              ,invName: row.invName
              ,sri_sustento: row.sri_sustento
              ,sri_sustentoName: row.sri_sustentoName
              ,systemType: row.systemType
              ,account_id: row.account_id
              ,account_name: this.lookup_accounts.find(t=>t.value==row.account_id).fullLabel
              ,quantity: row.quantityInvoiceOpen//porque no deberían poder facturar más allá de lo pendiente de facturar
              ,price: row.price
              ,lineSubtotal: row.lineSubtotal
              ,lineDiscntPrcnt: row.lineDiscntPrcnt
              ,lineDiscntAmount: row.lineDiscntAmount
              ,lineUntaxed: row.lineUntaxed
              //,whID: row.whID
              //,whName: row.whName//this.lookup_wh.find(x => x.value == this.defaultWhID).label
              ,prjID: row.prjID
              ,prjName: row.prjName
              //,transportTypeID: this.defaultTransportID
              //,transportTypeName: this.lookup_transports.find(x => x.value == this.defaultTransportID).label
              ,mktPOHeader: row.mktPOHeader
              ,mktPOlineID: row.mktPOlineID
            })

            //Impuestos de la línea
            this.lookup_items_taxes.filter(x=>x.invID==row.invID).forEach(impuesto=>{
                newRowsTaxes.push({
                   lineID: max_id
                  ,taxID: impuesto.taxID
                  ,taxName: impuesto.shortLabel
                  ,taxAmount: impuesto.isPercent?( parseFloat( (row.lineUntaxed) * impuesto.factor_base) * parseFloat(impuesto.factor) )  :  parseFloat(impuesto.factor)
                  ,isPercent: impuesto.isPercent
                  ,factor: impuesto.factor
                  ,factor_base: impuesto.factor_base
                  ,lineUntaxed: row.lineUntaxed
                })
              })
          })
          this.lines = newRows
          this.linesTaxes = newRowsTaxes
          this.isItemsBatchDialog = false
        }

        this.isRequisicionDialog = false;
      },
      loadmktPOPendientes(){
        this.isRequisicionDialogLoading = true;
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spAccAPSelectmktPO',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
                partnerID: this.partnerID
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

      /*openSearchItems(currentRow){
        if(this.editMode==true){
          this.itemsDialogRowToUpdate = currentRow
          this.isItemsDialog = true
          if(currentRow&&currentRow.invID&&currentRow.invID>0){
            this.itemsDialogTableBusy = true
            try{
              this.itemsDialogSelected = []
              this.itemsDialogSelected.push(this.lookup_items.find(x => x.value == currentRow.invID))
              this.itemsDialogTableBusy = false
            }catch(ex){
              this.itemsDialogTableBusy = false
            }
          }
        }
        
        
      },*/
      
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
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
        },
        partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
        },
        partner_account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.partner_account_id },
        },
        paytermID: {
            get () { return this.$store.state[this.moduleName].editData.basic.paytermID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'paytermID', value: val}) }
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        requisiciones: {
            get () { return this.$store.state[this.moduleName].editData.requisiciones },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataRequisiciones', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        linesTaxes: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLinesTaxes', val) }
        },
        accountLines: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAccountLines', val) }
        },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
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
        lookup_items_taxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items_taxes },
        },
        lookup_SRI_Tabla_Tipo_Sustento: {
            get () { return this.$store.state[this.moduleName].editData.lookup_SRI_Tabla_Tipo_Sustento },
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
