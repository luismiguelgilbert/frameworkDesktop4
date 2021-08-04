<template>
<div style="margin: -16px;">
  <q-toolbar class="no-padding">
    <q-btn label="Pedidos de Insumos" icon="fas fa-file-alt" color="primary" flat stretch @click="isRequisicionesDialog=true" :disable="!allow_row_insert" />
    <q-btn label="Eliminar" icon="fas fa-trash-alt" color="red" flat stretch :disable="maingridSelectedRowKeys.length<=0" @click="removeRows" />
    <q-btn color="primary" flat stretch label="Opciones" icon-right="fas fa-chevron-down" no-caps>
      <q-menu>
        <q-list style="min-width: 100px">
          <q-item clickable>
            <q-item-section side>
              <q-icon name="fas fa-tasks" />
            </q-item-section>
            <q-item-section>Aplicación por Lotes</q-item-section>
            <q-item-section side>
              <q-icon name="keyboard_arrow_right" />
            </q-item-section>

            <q-menu anchor="top right" self="top left" >
              <q-list>
               
                <!--
                  deshabilitado porque la devolución debe ser a la misma bodega de donde salió
                <q-item clickable v-ripple v-close-popup :disable="maingridSelectedRowKeys.length<=0" @click="dialogWH=true" >
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-warehouse" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Aplicar Bodega</q-item-label>
                  </q-item-section>
                </q-item>
                -->
                <q-item clickable v-ripple v-close-popup :disable="maingridSelectedRowKeys.length<=0" @click="dialogExpected=true" >
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-calendar" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Aplicar Fecha Entrega</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-separator />
                <q-item clickable v-ripple v-close-popup :disable="maingridSelectedRowKeys.length<=0" @click="cancelRows" class="text-red" >
                  <q-item-section avatar>
                      <q-icon color="red" name="fas fa-ban" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Cancelar Cantidades Pendientes</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>

          </q-item>

          <q-separator />

          <q-item clickable>
            <q-item-section side>
              <q-icon name="fas fa-columns" />
            </q-item-section>
            <q-item-section>Configurar Columnas</q-item-section>
            <q-item-section side>
              <q-icon name="keyboard_arrow_right" />
            </q-item-section>

            <q-menu anchor="top right" self="top left" >
              <q-list>
                <q-item clickable v-ripple v-close-popup @click="openColumnSelector">
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-columns" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Abrir Selector de Columnas</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-ripple v-close-popup @click="saveGridUserState">
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-save" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Guardar Configuración</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-ripple v-close-popup @click="deleteGridUserState">
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-trash-alt" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Eliminar Configuración</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>

          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

 </q-toolbar>

  <q-separator />

  <DxDataGrid
    ref="dxgrid"
    height="calc(100vh - 170px)"
    column-resizing-mode="widget"
    :data-source="internalLines"
    :allow-column-resizing="true" 
    :allow-column-reordering="true"
    :show-borders="true"
    :show-column-lines="userTableLinesDXcols"
    :show-row-lines="userTableLinesDXrows"
    :stateStoring="{ ignoreColumnOptionNames: [] }"
    key-expr="lineID"
    :selected-row-keys.sync="maingridSelectedRowKeys"
    @row-updating="roundInputToSixDigits"
    @row-updated="onRowUpdated"
    @editor-preparing="checkIfCellEditable"
    >
      <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />
      <DxColumnChooser  mode="select" />
      <DxColumnFixing :enabled="true" :texts="{fix:'Fijar', unfix: 'Soltar'}" />
      <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
      <DxEditing :allow-updating="true" mode="cell" :select-text-on-edit-start="true"  /> <!-- me gustan: cell, row, popup -->
      <DxScrolling mode="virtual" :useNative="false" showScrollbar="always" /> <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
      
      <DxColumn caption="lineID" data-field="lineID" name="lineID" data-type="number" :allow-editing="false" alignment="left" :visible="false" />
      <DxColumn caption="Item" data-field="invID" name="invID" data-type="number" :allow-editing="false" alignment="left" :minWidth="200">
        <DxLookup value-expr="value" display-expr="label" :data-source="lookup_items" />
      </DxColumn>
      <DxColumn caption="# Pedido" data-field="mktMFG_headerID" name="mktMFG_headerID" data-type="number" :allow-editing="false" alignment="right" :width="80" :visible="true" cssClass="text-primary" />
      <DxColumn caption="# Pedido Línea" data-field="mktMFG_lineID" name="mktMFG_lineID" data-type="number" :allow-editing="false" alignment="right" :width="110" :visible="true" cssClass="text-primary" />
      <DxColumn caption="Cantidad" data-field="quantity" name="quantity" data-type="number" :allow-editing="true" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0 }" :cssClass="userColor=='default'?'bg-grey-2':'bg-grey-9'" />
      <!--
      <DxColumn caption="Precio" data-field="price" name="price" data-type="number" :allow-editing="true" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0 }" />
      <DxColumn caption="Suman" data-field="lineSubtotal" name="lineSubtotal" data-type="number" :allow-editing="false" alignment="right" :width="120" :format="userMoneyFormat" />
      <DxColumn caption="Descuento %" data-field="lineDiscntPrcnt" name="lineDiscntPrcnt" data-type="number" :allow-editing="true" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0, max:100 }"  />
      <DxColumn caption="Descuento $" data-field="lineDiscntAmount" name="lineDiscntAmount" data-type="number" :allow-editing="false" alignment="right" :width="100" :format="userMoneyFormat" :visible="false" />
      <DxColumn caption="Subtotal" data-field="lineUntaxed" name="lineUntaxed" data-type="number" :allow-editing="false" alignment="right" :width="120" :format="userMoneyFormat"
         />
      <DxColumn caption="Impuestos" data-field="taxes" name="taxes" :allow-editing="true" alignment="left" :width="100" edit-cell-template="tagBoxEditor" 
        :cell-template="(container, options)=>{ container.textContent = lookup_taxes.filter(x=>options.value.some(y=>x.taxID==y)).map(z=>z.short_name_es).join(', ') }"
        />
        <template #tagBoxEditor="{ data: cellInfo }">
          <div>
            <mktPREditLinesTaxSelector v-if="!cellInfo.row.data.quantityCancelNew_isEditDisabled"
              :moduleName="moduleName"
              :selectedRowKeys="cellInfo.value"
              :lookupData="lookup_taxes.filter(x=>x.es_retencion==false)"
              :currentLine="cellInfo"
              @onSelection="(selectedKeys)=>{
                  cellInfo.data.taxes = selectedKeys;
                  updateTaxes(cellInfo.data); //update row data and vuex
                  cellInfo.component.closeEditCell(); //remove focus from editor 
                }"
              />
              <div v-if="cellInfo.row.data.quantityCancelNew_isEditDisabled" class="text-red">Bloqueado
              </div>
          </div>
        </template>

      <DxColumn caption="Impuestos $" data-field="taxAmount" name="taxAmount" data-type="number" :allow-editing="false" alignment="right" :width="120" :format="userMoneyFormat" :visible="false" />
      <DxColumn caption="Total" data-field="lineTotal" name="lineTotal" data-type="number" :allow-editing="false" alignment="right" :width="120" :format="userMoneyFormat" />
      -->
      <DxColumn caption="Cancelado" data-field="quantityCancel" name="quantityCancel" data-type="number" :allow-editing="false" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0 }" :visible="true" cssClass="text-red" />
      <DxColumn caption="Cancelar" data-field="quantityCancelNew" name="quantityCancelNew" data-type="number" :allow-editing="true" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0 }" :visible="true" cssClass="text-red" />
      <DxColumn caption="Cant. Ingresos" data-field="quantityRcvd" name="quantityRcvd" data-type="number" :allow-editing="false" alignment="right" :width="120" :visible="true" cssClass="text-positive" />
      <DxColumn caption="Bodega" data-field="whID" name="whID" data-type="number" :allow-editing="false" alignment="left" :width="200" :visible="true">
        <DxLookup value-expr="value" display-expr="label" :data-source="lookup_wh" />
      </DxColumn>
      <DxColumn caption="Observaciones" data-field="comments" name="comments" data-type="string" :allow-editing="true" alignment="left" :width="120" :visible="true" />
      <DxColumn caption="Fecha Entrega" data-field="expectedDate" name="expectedDate" data-type="date" :allow-editing="true" alignment="left" :width="120" format="dd-MMM-yyyy" :visible="true" />
      <DxColumn caption="Tipo Entrega" data-field="transportTypeID" name="transportTypeID" data-type="number" :allow-editing="true" alignment="left" :width="200" :visible="false" >
        <DxLookup value-expr="value" display-expr="label" :data-source="lookup_transports" />
      </DxColumn>
      <DxColumn caption="# Egreso" data-field="moveID" name="moveID" data-type="number" :allow-editing="false" alignment="right" :width="120" :visible="false" cssClass="text-primary" />
      <DxColumn caption="Orden Egreso #" data-field="kardexID" name="kardexID" data-type="number" :allow-editing="false" alignment="right" :width="120" :visible="false" cssClass="text-primary" />
      <DxColumn caption="# Movimiento" data-field="stockID" name="stockID" data-type="number" :allow-editing="false" alignment="right" :width="120" :visible="false" cssClass="text-primary" />
      
      
      <DxSummary >
        <DxTotalItem column="invID" summary-type="count"/>
        <DxTotalItem column="lineSubtotal" summary-type="sum" cssClass="q-mr-none" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxTotalItem column="lineUntaxed" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxTotalItem column="lineTotal" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>
      </DxSummary>
      
      />
  </DxDataGrid>

  <DxPopup
    :visible.sync="isRequisicionesDialog"
    :drag-enabled="true"
    :close-on-outside-click="true"
    :show-title="true"
    width="calc(85vw)"
    height="calc(75vh)"
    @shown="loadRequisiciones"
    >
        <DxToolbarItem text="Seleccionar registros" location="before" :options="{ class: 'text-primary' }"></DxToolbarItem>

        <q-separator />

        <div style="margin: -15px;">
          

          <DxDataGrid
            ref="dxGridRequisiciones"
            height="calc(75vh - 115px)"
            column-resizing-mode="widget"
            :data-source="requisiciones"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="false"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            key-expr="moveID"
            :selected-row-keys.sync="requisicionesSelectedRowKeys"
            >
            <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />
            <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" />
            <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
            
            <DxColumn caption="# Pedido" data-field="mktMFG_headerID" data-type="number" :allow-editing="false" alignment="left" :visible="true" :minWidth="70" />
            <DxColumn caption="# Pedido Línea" data-field="mktMFG_lineID" data-type="number" :allow-editing="false" alignment="left" :visible="true" :minWidth="70" />
            <DxColumn caption="Item" data-field="invName" data-type="string" :allow-editing="false" alignment="left" :visible="true" :minWidth="200" />
            <DxColumn caption="Cantidad Despachada" data-field="quantity" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="120"  />
            <DxColumn caption="Cant. Devuelta" data-field="quantityReturned" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="120"  />
            <DxColumn caption="Devoluciones Pendientes" data-field="quantityReturnOpen" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="120"  />
            <DxColumn caption="Bodega" data-field="whName" data-type="string" :allow-editing="false" alignment="left" :visible="true" :minWidth="100"  />
            <DxColumn caption="Ingreso a Bodega" data-field="moveDate" data-type="date" :allow-editing="false" alignment="center" :visible="true" :minWidth="120" format="dd-MMM-yyyy" />
            <DxColumn caption="# Ingreso" data-field="kardexID" data-type="number" :allow-editing="false" alignment="left" :visible="true" :width="120"  />
            <DxColumn caption="ID" data-field="moveID" data-type="number" :allow-editing="false" alignment="left" :visible="true" :width="70"  />
            <DxColumn caption="Documento" data-field="invDocTypeName" data-type="string" :allow-editing="false" alignment="left" :visible="true" :minWidth="200"  />
            <DxColumn caption="# Doc." data-field="invDocNumber" data-type="string" :allow-editing="false" alignment="left" :visible="true" :minWidth="80"  />

          </DxDataGrid>

          <q-separator />
          
          <q-card-actions align="around">
              <q-btn icon="fas fa-save" flat color="primary" label="Agregar" @click="addRequisiciones" :disable="!requisicionesSelectedRowKeys.length>0" />
          </q-card-actions>
        
        </div>
  </DxPopup>

  <q-dialog v-model="dialogWH">
    <q-card style="min-width: 500px">
      <q-card-section> <div class="text-primary">Seleccione la Bodega para aplicar en lote a los registros seleccionados</div> </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select :options="lookup_wh" v-model="dialogWHValue" emit-value map-options />
      </q-card-section>

      <q-card-actions align="around" class="text-primary">
        <q-btn flat label="Aplicar" v-close-popup @click="changeWH" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogExpected">
    <q-card style="min-width: 500px">
      <q-card-section> <div class="text-primary">Seleccione la Fecha Entrega para aplicar en lote a los registros seleccionados</div> </q-card-section>

      <q-card-section class="q-pt-none">
        <q-date v-model="dialogExpectedValue" landscape />
      </q-card-section>

      <q-card-actions align="around" class="text-primary">
        <q-btn flat label="Aplicar" v-close-popup @click="changeExpectedDate" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogTransport">
    <q-card style="min-width: 500px">
      <q-card-section> <div class="text-primary">Seleccione el Tipo Entrega para aplicar en lote a los registros seleccionados</div> </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select :options="lookup_transports" v-model="dialogTransportValue" emit-value map-options />
      </q-card-section>

      <q-card-actions align="around" class="text-primary">
        <q-btn flat label="Aplicar" v-close-popup @click="changeTransport" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogDiscount">
    <q-card style="min-width: 500px">
      <q-card-section> <div class="text-primary">Ingrese el Descuento para aplicar en lote a los registros seleccionados</div> </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model="dialogDiscountValue" type="number" :min="0" :max="100" />
      </q-card-section>

      <q-card-actions align="around" class="text-primary">
        <q-btn flat label="Aplicar" v-close-popup @click="changeDiscount" />
      </q-card-actions>
    </q-card>
  </q-dialog>
 
</div>
</template>

<script>

import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser } from 'devextreme-vue/data-grid';
import DxPopup, { DxToolbarItem  } from 'devextreme-vue/popup';

export default ({
  props: {
    moduleName: { type: String , required: true },
  },
  components: {
    DxDataGrid,
    DxColumn,
    DxColumnFixing,
    DxScrolling,
    DxStateStoring,
    DxSorting,
    DxPaging,
    DxHeaderFilter,
    DxSelection,
    DxEditing,
    DxPopup,
    DxLookup,
    DxToolbarItem,
    DxSummary,
    DxTotalItem,
    DxValueFormat,
    DxColumnChooser,
  },
  data () {
    return {
      isListDialog: false,
      listSelectedRowKeys: [],
      dxdialogSearchBoxOptions:{
          placeholder: "Buscar...",
          showClearButton: true,
          onContentReady: (e)=>{
              this.searchTextBox = e;
              setTimeout(()=>{ 
                  this.searchTextBox.component.focus();
              }, 500);
          },
          onInput: (e)=>{
              this.$refs['dxGridSearchList'].instance.searchByText(e.component.option('text'));
          }
      },
      maingridSelectedRowKeys: [],
      maingridDeleteBtnDisabled: true,
      internalLines: [],
      isRequisicionesDialog: false,
      dialogWH: false, dialogWHValue: null,
      dialogExpected: false, dialogExpectedValue: null,
      dialogTransport: false, dialogTransportValue: null,
      dialogDiscount: false, dialogDiscountValue: null,
      requisicionesSelectedRowKeys: [],
    }
  },
  created(){
    this.internalLines = JSON.parse(JSON.stringify(this.lines));
  },
  mounted(){
    this.$refs['dxgrid'].instance.option("stateStoring.ignoreColumnOptionNames", []);
    let savedState = this.gridState.find(x=>x.gridName==[this.moduleName+'_lines']);
    if(savedState&&savedState.gridState){
      let estado = JSON.parse(savedState.gridState)
      this.$refs['dxgrid'].instance.state(estado);
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
    roundInputToSixDigits(e){
      const columnas = e.component.getVisibleColumns();
      Object.keys(e.newData).map(x=>{
        const datatype = columnas.find(c=>c.dataField==x).dataType
        //cambia números a un máximo de 6 decimales (redondeado a 6 decimales)
        if(datatype=='number'){
          if(e.newData[x]==null||e.newData[x]==NaN||e.newData[x]==undefined){
            e.newData[x] = 0
          }else{
            e.newData[x] = parseFloat(parseFloat(e.newData[x]).toFixed(6))
          }
        }
      })
    },
    onRowUpdated(e){
      e.data.lineSubtotal = parseFloat(parseFloat(e.data.quantity * e.data.price).toFixed(6))
      e.data.lineDiscntAmount = parseFloat(parseFloat(e.data.lineSubtotal * (e.data.lineDiscntPrcnt/100)).toFixed(6))
      e.data.lineUntaxed = parseFloat(parseFloat(e.data.lineSubtotal - e.data.lineDiscntAmount).toFixed(6))
      e.data.lineTotal = parseFloat(parseFloat(e.data.lineSubtotal - e.data.lineDiscntAmount).toFixed(6))
      
      this.$refs['dxgrid'].instance.refresh();//agrega ~4 milisegundos, pero actualiza summaries de format correcta; NOTA: Opción en dxsummary :recalculate-while-editing="true" no actualiza correctamente
    },
    removeRows(){
      if(this.maingridSelectedRowKeys.length > 0){
        this.$q.dialog({ 
            title: 'Confirmación'
            ,persistent: false
            ,message: 'Desea eliminar las líneas seleccionadas?'
            ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true, color: 'red', flat: true }
            ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
        }
        ).onOk(() => {
          this.internalLines = this.internalLines.filter(x=> (x.uploaded) || (!x.uploaded&&!(this.maingridSelectedRowKeys.some(y=>y==x.lineID)))  );//Devuelve [TODO lo uploaded]  + [TODO lo nuevo - NO seleccionado]
          this.maingridSelectedRowKeys = []//limpia selección para evitar problema de referencia a filas que no existan
        })
      }
    },
    updateVuex(){
      //esto realmente lo usa editForm.vue para actualizar los datos reales de este componente, antes de enviarlos al servidor en el POST
      this.lines = JSON.parse(JSON.stringify(this.internalLines))
    },
    openColumnSelector(){
      this.$refs['dxgrid'].instance.showColumnChooser();
    },
    changeWH(){
      if(this.dialogWHValue&&this.dialogWHValue>0){
        this.internalLines.map(x=> this.maingridSelectedRowKeys.filter(xx=> x.lineID == xx).map(xxx=>{
          if(x.whID_isEditDisabled==false){//solamente si está permitido
            x['whID'] = this.dialogWHValue
          }
          
        }) )
      }
    },
    changeExpectedDate(){
      if(this.dialogExpectedValue){
        this.internalLines.map(x=> this.maingridSelectedRowKeys.filter(xx=> x.lineID == xx).map(xxx=>{
          if(x.expectedDate_isEditDisabled==false){//solamente si está permitido
            x['expectedDate'] = this.dialogExpectedValue
          }
        }) )
      }
    },
    changeTransport(){
      if(this.dialogTransportValue&&this.dialogTransportValue>0){
        this.internalLines.map(x=> this.maingridSelectedRowKeys.filter(xx=> x.lineID == xx).map(xxx=>{
          if(x.transportTypeID_isEditDisabled==false){//solamente si está permitido
            x['transportTypeID'] = this.dialogTransportValue
          }
        }) )
      }
    },
    changeDiscount(){
      if(this.dialogDiscountValue&&this.dialogDiscountValue>=0&&this.dialogDiscountValue<=100){
        this.internalLines.map(x=> this.maingridSelectedRowKeys.filter(xx=> x.lineID == xx).map(xxx=>{
          if(x.lineDiscntPrcnt_isEditDisabled==false){//solamente si está permitido
            x['lineDiscntPrcnt'] = this.dialogDiscountValue
            //e.data.lineSubtotal = parseFloat(parseFloat(e.data.quantity * e.data.price).toFixed(6))
            x.lineDiscntAmount = parseFloat(parseFloat(x.lineSubtotal * (this.dialogDiscountValue/100)).toFixed(6))
            x.lineUntaxed = parseFloat(parseFloat(x.lineSubtotal - x.lineDiscntAmount).toFixed(6))
            x.lineTotal = parseFloat(parseFloat(x.lineSubtotal - x.lineDiscntAmount).toFixed(6))
          }
        }) )
        this.$refs['dxgrid'].instance.refresh();//refresh, recalculates summaries
      }
      
    },
    cancelRows(){
      this.internalLines.filter(y=>this.maingridSelectedRowKeys.some(z=>z==y.lineID)).map(row=>{
        row.quantityCancelNew = (row.quantity?row.quantity:0) - (row.quantityRcvd?row.quantityRcvd:0) - (row.quantityCancel?row.quantityCancel:0)
        return row
      })
    },
    saveGridUserState(){
      let gridState = this.$refs['dxgrid'].instance.state();
      this.$axios.post( this.apiURL + 'saveGridUserState', {
              userCode: this.userCode,
              userCompany: this.userCompany,
              moduleName: this.moduleName,
              gridName: this.moduleName+'_lines',
              gridState: JSON.stringify(gridState),
          }
      , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
      ).then(() => {//).then((response) => {
          this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
      }).catch((error) => {
          console.dir(error.message)
          let mensaje = ''
          if(error.message){ mensaje = error.message }
          if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
          if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
          mensaje = mensaje.replace('Request failed with status code 400<br/>','')
          this.$q.notify({ html: true, multiLine: false, color: 'red'
              ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
              ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
              ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
          })
          this.dataLoaded = true;
      })
            
    },
    deleteGridUserState(){
      this.$refs['dxgrid'].instance.state(null);//resets to default
      this.$axios.post( this.apiURL + 'saveGridUserState', {
              userCode: this.userCode,
              userCompany: this.userCompany,
              moduleName: this.moduleName,
              gridName: this.moduleName+'_lines',
              gridState: null,
          }
      , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
      ).then(() => {//).then((response) => {
          this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
      }).catch((error) => {
          console.dir(error.message)
          let mensaje = ''
          if(error.message){ mensaje = error.message }
          if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
          if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
          mensaje = mensaje.replace('Request failed with status code 400<br/>','')
          this.$q.notify({ html: true, multiLine: false, color: 'red'
              ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
              ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
              ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
          })
          this.dataLoaded = true;
      })
            
    },
    checkIfCellEditable(e){
      if (e.parentType === 'dataRow' && e.dataField === 'quantity' && e.row.data.quantity_isEditDisabled) {
        e.editorOptions.disabled = true
      }
      if (e.parentType === 'dataRow' && e.dataField === 'price' && e.row.data.price_isEditDisabled) {
        e.editorOptions.disabled = true
      }
      if (e.parentType === 'dataRow' && e.dataField === 'lineDiscntPrcnt' && e.row.data.lineDiscntPrcnt_isEditDisabled) {
        e.editorOptions.disabled = true
      }
      if (e.parentType === 'dataRow' && e.dataField === 'whID' && e.row.data.whID_isEditDisabled) {
        e.editorOptions.disabled = true
      }
      if (e.parentType === 'dataRow' && e.dataField === 'expectedDate' && e.row.data.expectedDate_isEditDisabled) {
        e.editorOptions.disabled = true
      }
      if (e.parentType === 'dataRow' && e.dataField === 'transportTypeID' && e.row.data.transportTypeID_isEditDisabled) {
        e.editorOptions.disabled = true
      }
      if (e.parentType === 'dataRow' && e.dataField === 'quantityCancelNew' && e.row.data.quantityCancelNew_isEditDisabled) {
        e.editorOptions.disabled = true
      }
      if(e.editorOptions.disabled){
        this.$q.notify({color: 'red', message: 'No está permitido editar este campo', timeout: 500, icon: "fas fa-ban" });
      }
      
      
    },
    loadRequisiciones(){
      this.requisiciones = [];
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
      }).catch((error) => {
          console.dir(error)
          let mensaje = ''
          if(error.message){ mensaje = error.message }
          if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
          if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
          mensaje = mensaje.replace('Request failed with status code 400<br/>','')
          this.$q.notify({ html: true, multiLine: false, color: 'red'
              ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
              ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
              ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
          })
      })
    },
    addRequisiciones(){
      //GetMaxId
      let max_id = 0
      let temp = null
      if(this.internalLines.length > 0){
        temp = this.getMax(this.internalLines, "lineID");
        max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
      }

      let existentes = []

      let newGridData = JSON.parse(JSON.stringify(this.internalLines));
      this.requisiciones.filter(x=>this.requisicionesSelectedRowKeys.some(y=>y==x.moveID)).map(row=>{
        if( newGridData.some(t=>t.moveID==row.moveID) && newGridData.some(t=>t.kardexID==row.kardexID) ){
          existentes.push({kardexID: row.kardexID, moveID: row.moveID})
        }else{
          max_id++;
          //ADD ITEM
          const newRow = {
            lineID: max_id,
            uploaded: false,
            invID: row.invID,
            quantity: row.quantityReturnedNew,
            quantityCancel: 0,
            quantityCancelNew: 0,
            quantityRcvd: 0,
            maxQuantity: row.quantityReturnedNew,
            price: row.price,
            lineSubtotal: parseFloat(parseFloat(row.quantityReturnedNew * row.price).toFixed(6)),
            lineDiscntPrcnt: 0,
            lineDiscntAmount: 0,
            lineUntaxed: parseFloat(parseFloat(row.quantityReturnedNew * row.price).toFixed(6)),
            whID: row.whID,
            estado: true,
            creation_date: null,
            debit_account_id: row.debit_account_id,
            credit_account_id: row.credit_account_id,
            taxes: [],
            taxAmount: 0,
            lineTotal: parseFloat(parseFloat(row.quantityReturnedNew * row.price).toFixed(6)),
            quantityOpen: 0,
            quantityReturned: 0,
            prjID: 0,
            transportTypeID: this.defaultTransportID,
            expectedDate: null,
            quantity_isEditDisabled: false,
            price_isEditDisabled: false,
            lineDiscntPrcnt_isEditDisabled: false,
            whID_isEditDisabled: false,
            expectedDate_isEditDisabled: false,
            transportTypeID_isEditDisabled: false,
            quantityCancelNew_isEditDisabled: false,
            kardexID: row.kardexID,
            stockID: row.stockID,
            moveID: row.moveID,
            mktMFG_headerID: row.mktMFG_headerID,
            mktMFG_lineID: row.mktMFG_lineID
          }
          newGridData.push(newRow)
        }
      })
      this.internalLines = newGridData;
      this.isRequisicionesDialog = false
      if(existentes.length>0){
        this.$q.notify({ html: true, multiLine: false, color: 'red'
            ,message: "No se agregaron algunos registros previamente existente"
            ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
            ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
        })
      }
    }
  },
  computed:{
      console: () => console,
      userColor: { get () { return this.$store.state.main.userColor }  },
      userCode: { get () { return this.$store.state.main.userCode } },
      userCompany: { get () { return this.$store.state.main.userCompany }  },
      apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
      userMoneyFormat: { get () { 
        let resultado ="#0.000000";
        if(this.$store.state.main.userMoneyFormat==0){ resultado = "#0" }
        if(this.$store.state.main.userMoneyFormat==1){ resultado = "#0.0" }
        if(this.$store.state.main.userMoneyFormat==2){ resultado = "#0.00" }
        if(this.$store.state.main.userMoneyFormat==3){ resultado = "#0.000" }
        if(this.$store.state.main.userMoneyFormat==4){ resultado = "#0.0000" }
        if(this.$store.state.main.userMoneyFormat==5){ resultado = "#0.00000" }
        if(this.$store.state.main.userMoneyFormat==6){ resultado = "#0.000000" }
        return resultado }
      },
      allow_view: { get () { 
          let resultado = false;
          this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_view').map(y=>{
            resultado = y.value;  
          }).value; 
          return resultado }, 
      },
      allow_edit: { get () { 
          let resultado = false;
          this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_edit').map(y=>{
            resultado = y.value;  
          }).value; 
          return resultado }, 
      },
      allow_insert: { get () { 
          let resultado = false;
          this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_insert').map(y=>{
            resultado = y.value;  
          }).value; 
          return resultado }, 
      },
      allow_report: { get () { 
          let resultado = false;
          this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_report').map(y=>{
            resultado = y.value;  
          }).value; 
          return resultado }, 
      },
      allow_disable: { get () { 
          let resultado = false;
          this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_disable').map(y=>{
            resultado = y.value;  
          }).value; 
          return resultado }, 
      },
      allow_row_insert: { get () { 
          let resultado = false;
          this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_row_insert').map(y=>{
            resultado = y.value;  
          }).value; 
          return resultado }, 
      },
      userTableLines: { get () { return this.$store.state.main.userTableLines } },
      userTableLinesDXcols: { get () { 
              let result = false;
              if(this.userTableLines=='cell'||this.userTableLines=='vertical'){ result = true }
              return result
          } 
      },
      userTableLinesDXrows: { get () { 
              let result = false;
              if(this.userTableLines=='cell'||this.userTableLines=='horizontal'){ result = true }
              return result
          } 
      },
      userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage }  },
      allowedPageSizes:{
          get () { 
              let resultado = []
              resultado.push(this.userRowsPerPage)
              return resultado
          },
      },

      editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
      partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
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
      requisiciones: {
          get () { return this.$store.state[this.moduleName].editData.requisiciones },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'requisiciones', value: val}) }
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
      gridState: {
          get () { 
            return this.$store.state[this.moduleName].editData.gridState
          },
      }
      /*lookup_payterms: {
          get () { return this.$store.state[this.moduleName].editData.lookup_payterms },
      },
      lookup_paytermsDetails: {
          get () { return this.$store.state[this.moduleName].editData.lookup_paytermsDetails },
      },*/
  }
})
</script>
