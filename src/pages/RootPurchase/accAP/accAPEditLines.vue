<template>
<div style="margin: -16px;">
  <q-toolbar class="no-padding">
    <q-btn label="Agregar Servicios" no-caps icon="far fa-plus-square" color="primary" flat stretch @click="isListDialog=true" :disable="( (!allow_row_insert) || !(partnerID>0) )" />
    <q-btn label="Agregar Inventario" no-caps icon="fas fa-plus-square" color="primary" flat stretch @click="isRequisicionesDialog=true" :disable="( (!allow_row_insert) || !(partnerID>0) )" />
    <q-btn  label="Eliminar" no-caps icon="fas fa-trash-alt" color="red" flat stretch @click="removeRows" /> <!--:disable="maingridSelectedRowKeys.length<=0" quitado, porque defered=true para mejorar rendimiento, según Devexpress-->
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
                <q-item clickable v-ripple v-close-popup @click="dialogDiscount=true"> <!--:disable="maingridSelectedRowKeys.length<=0" quitado, porque defered=true para mejorar rendimiento, según Devexpress-->
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-tag" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Aplicar Descuento</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-ripple v-close-popup @click="dialogSustento=true" > <!--:disable="maingridSelectedRowKeys.length<=0" quitado, porque defered=true para mejorar rendimiento, según Devexpress-->
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-balance-scale" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Aplicar Sustento Tributario</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-ripple v-close-popup @click="dialogExpected=true" > <!--:disable="maingridSelectedRowKeys.length<=0" quitado, porque defered=true para mejorar rendimiento, según Devexpress-->
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-book" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Aplicar Cuenta Contable</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>

          </q-item>

          <!--Configurar Columnas-->
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


          </q-item>


          
        </q-list>
      </q-menu>
    </q-btn>

 </q-toolbar>

  <q-separator />
  <!--height="calc(100vh - 170px)"-->
  <!--height="calc(100vh - 298px)"-->
  
    
  <DxDataGrid
    ref="dxgrid"
    key="maindatagrid"
    height="calc(100vh - 298px)"
    width="100%"
    column-resizing-mode="widget"
    :data-source="internalLines"
    :allow-column-resizing="true" 
    :allow-column-reordering="true"
    :show-borders="true"
    :show-column-lines="userTableLinesDXcols"
    :show-row-lines="userTableLinesDXrows"
    :stateStoring="{ ignoreColumnOptionNames: [] }"
    key-expr="lineID"
    @row-updated="onRowUpdated"
    @editor-preparing="checkIfCellEditable"
    >
      <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="true" /><!--:deferred="true"-->
      <DxColumnChooser  mode="select" />
      <DxColumnFixing :enabled="true" :texts="{fix:'Fijar', unfix: 'Soltar'}" />
      <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
      <DxEditing :allow-updating="true" mode="cell" :useIcons="false" :select-text-on-edit-start="true" start-edit-action="click" /> <!-- me gustan: cell, row, popup, batch mejora rendimiento pero NO calcula en línea y muestra un toolbar extra -->
      <DxScrolling mode="standard" :useNative="true" showScrollbar="always" /> <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
      <DxPaging :enabled="false" /> 


        <DxColumn caption="# Posición" data-field="lineID" name="lineID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :visible="false" />
        <DxColumn caption="Tipo" data-field="systemTypeName" name="systemTypeName" data-type="string" :allow-editing="false" alignment="left" :minWidth="80" />
        <DxColumn caption="Item" data-field="invName" name="invName" data-type="string" :allow-editing="false" alignment="left" :minWidth="100" :width="300" />
        <DxColumn caption="Código" data-field="internal_code" name="internal_code" data-type="string" :allow-editing="false" alignment="left" :minWidth="100" :visible="false" />
        <DxColumn caption="Cantidad" data-field="quantity" name="quantity" data-type="number" :allow-editing="true" alignment="right" :minWidth="75" :width="75" :format="userMoneyFormat" :editor-options="{ min: 0 }" /> <!--:cssClass="userColor=='default'?'bg-grey-2':'bg-grey-9'"-->
        <DxColumn caption="Precio" data-field="price" name="price" data-type="number" :allow-editing="true" alignment="right" :minWidth="75" :width="75" :format="userMoneyFormat" :editor-options="{ min: 0 }" />
        <DxColumn caption="Suman" data-field="lineSubtotal" name="lineSubtotal" data-type="number" :allow-editing="false" alignment="right" :minWidth="80" :width="80" :format="userMoneyFormat" />
        <DxColumn caption="Dcto %" data-field="lineDiscntPrcnt" name="lineDiscntPrcnt" data-type="number" :allow-editing="true" alignment="right" :minWidth="65" :width="65" :format="userMoneyFormat" :editor-options="{ min: 0, max: 100 }"  />
        <DxColumn caption="Dcto $" data-field="lineDiscntAmount" name="lineDiscntAmount" data-type="number" :allow-editing="false" alignment="right" :minWidth="60" :width="60" :format="userMoneyFormat" :visible="false"  />
        <DxColumn caption="Subtotal" data-field="lineUntaxed" name="lineUntaxed" data-type="number" :allow-editing="false" alignment="right" :minWidth="80" :width="80" :format="userMoneyFormat" />
        <DxColumn caption="Impuestos" data-field="taxes" name="taxes" :allow-editing="true" alignment="left" :width="100" edit-cell-template="tagBoxEditor" calculate-display-value="taxesNames" />
        <template #tagBoxEditor="{ data: cellInfo }">
          <div class="text-weight-bolder">
            <DxTagBox
              :dataSource="lookup_taxes.filter(x=>x.es_retencion==false)"
              :value="cellInfo.data.taxes.map(z=>z.taxID)"
              :show-selection-controls="true"
              display-expr="short_name_es"
              value-expr="taxID"
              :opened="true"
              :wrapItemText="true"
              :multiline="false"
              :dropDownOptions="{ resizeEnabled: true, minWidth: 200  }" 
              @disposing="(e)=>{
                  cellInfo.data.taxes = []
                  e.component.option('value').map(taxID =>{
                    const impuestoData = lookup_taxes.find(x=>x.taxID==taxID)
                    cellInfo.data.taxes.push({
                      taxID: impuestoData.taxID
                      ,account_id: impuestoData.accPurchase
                      ,taxName: impuestoData.short_name_es
                    })
                  })
                  cellInfo.data.taxesNames = cellInfo.data.taxes.map(z=>z.taxName).join(', ')
                }"
              >
            </DxTagBox>
            
          </div>
        </template>
        <DxColumn caption="Sustento Tributario" data-field="sustentoID" name="sustentoID" data-type="string" :allow-editing="true" alignment="left" :minWidth="200" calculate-display-value="sustentoName" :editor-options="{ opened: true }"> <!--calculate-display-value hace que DxLookup NO se use mientras no se esté editando la celda, y eso mejora rendimiento según devexpress-->
            <DxLookup value-expr="value" display-expr="short_name_es" :data-source="lookup_SRI_Tabla_Tipo_Sustento" :opened="true" />
        </DxColumn>
        <DxColumn caption="Cuenta Contable" data-field="account_id" name="account_id" data-type="number" :allow-editing="true" alignment="left" :minWidth="200" calculate-display-value="account_name"
            :editor-options="{ opened: true }"
            :set-cell-value="setAccountValue"> <!--calculate-display-value hace que DxLookup NO se use mientras no se esté editando la celda, y eso mejora rendimiento según devexpress-->
            <DxLookup value-expr="value" display-expr="label" :data-source="lookup_accounts_paginated" />
        </DxColumn>
        <DxColumn caption="# OC" data-field="mktPOHeader" name="mktPOHeader" data-type="number" :allow-editing="true" alignment="right" :minWidth="75" :width="75" :format="userMoneyFormat" :editor-options="{ min: 0 }" /> <!--:cssClass="userColor=='default'?'bg-grey-2':'bg-grey-9'"-->
        <DxColumn caption="# Línea OC" data-field="mktPOlineID" name="mktPOlineID" data-type="number" :allow-editing="true" alignment="right" :minWidth="75" :width="75" :format="userMoneyFormat" :editor-options="{ min: 0 }" /> <!--:cssClass="userColor=='default'?'bg-grey-2':'bg-grey-9'"-->
      />
  </DxDataGrid>

  <q-list dense class="text-right" style="height: 128px; max-height: 128px; overflow-y: scroll;">
    <q-item v-for="linea in totalLines" :key="linea.indice" clickable>
      <q-item-section side :class="linea.clase">{{linea.label}}</q-item-section>
      <q-item-section :class="linea.claseValor">{{linea.valor}}</q-item-section>
    </q-item>
  </q-list>

  <DxPopup
      :visible.sync="isListDialog"
      :drag-enabled="true"
      :close-on-outside-click="true"
      :show-title="true"
      width="calc(85vw)"
      height="calc(75vh)"
      @shown="listGridShown"
      >
        <DxToolbarItem text="Seleccionar registros" location="before" :options="{ class: 'text-primary' }"></DxToolbarItem>
        <DxToolbarItem location="after" widget="dxTextBox" :options="dxdialogSearchBoxOptions"></DxToolbarItem>
        
        <q-separator />

        <div style="margin: -15px;">

          <DxDataGrid
            ref="dxGridSearchList"
            height="calc(75vh - 115px)"
            width="100%"
            column-resizing-mode="widget"
            :data-source="lookup_items.filter(x=>x.systemType==1)"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="false"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            key-expr="value"
            :selected-row-keys="listSelectedRowKeys" 
            ><!--@selection-changed="onListSelectionChanged"-->
            <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="true" />
            <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" />
            <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
            
            <DxColumn caption="value" data-field="value" data-type="number" :allow-editing="false" alignment="left" :visible="false" />
            <DxColumn caption="Item" data-field="label" data-type="string" :allow-editing="false" alignment="left" :visible="true" :minWidth="350" />
            <DxColumn caption="Tipo" data-field="systemTypeName" data-type="string" :allow-editing="false" alignment="left" :visible="true" :width="100" />
            <DxColumn caption="Código" data-field="internal_code" data-type="string" :allow-editing="false" alignment="left" :visible="true" :width="100" />
            <DxColumn caption="Unidad" data-field="uomName" data-type="string" :allow-editing="false" alignment="left" :visible="true" :width="120"  />
            <DxColumn caption="Marca" data-field="brandName" data-type="string" :allow-editing="false" alignment="left" :visible="true" :width="100"  />
            <DxColumn caption="Grupo Contable" data-field="groupName" data-type="string" :allow-editing="false" alignment="left" :visible="true" :width="120"  />
            <DxColumn caption="Precio Actual" data-field="lastPrice" data-type="number" :allow-editing="false" alignment="right" :visible="true" :format="userMoneyFormat" :width="130"  />

          </DxDataGrid>

          <q-separator />
          
          <q-card-actions align="around">
              <q-btn icon="fas fa-save" flat color="primary" label="Agregar" @click="addRows" />
          </q-card-actions>
        
        </div>
  </DxPopup>

  <DxPopup
    :visible.sync="isRequisicionesDialog"
    :drag-enabled="true"
    :close-on-outside-click="true"
    :show-title="true"
    width="calc(95vw)"
    height="calc(75vh)"
    @shown="loadRequisiciones"
    >
        <DxToolbarItem text="Seleccionar registros para facturar inventario de: " location="before" :options="{ class: 'text-primary' }"></DxToolbarItem>
        <DxToolbarItem location="before" widget="dxSelectBox" :options="dxdialogRequisicionesSelectBoxOptions"></DxToolbarItem>
        <DxToolbarItem location="before" widget="dxTextBox" :options="dxdialogRequisicionesSearchBoxOptions"></DxToolbarItem>
        <DxToolbarItem location="after" widget="dxButton" :options="dxdialogRequisicionesColumnsButton"></DxToolbarItem>
            
        <div style="margin: -15px;">
          <q-separator />
          <DxDataGrid
            ref="dxGridRequisiciones"
            height="calc(75vh - 115px)"
            width="100%"
            column-resizing-mode="widget"
            :data-source="requisiciones"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="false"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            key-expr="value"
            >
            <!--
              :selected-row-keys.sync="requisicionesSelectedRowKeys"
              @selection-changed="onRequisicionesSelectionChanged"
              -->
            <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="true" />
            <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" />
            <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
            <DxColumnChooser  mode="select" />
            	
            <DxColumn caption="value" data-field="value" data-type="string" :allow-editing="false" alignment="left" :visible="false" />
            <DxColumn caption="# OC" data-field="mktPOHeader" data-type="number" :allow-editing="false" alignment="left" :visible="true" :minWidth="65" :width="70" />
            <DxColumn caption="# Línea" data-field="mktPOlineID" data-type="number" :allow-editing="false" alignment="left" :visible="true" :minWidth="65" :width="70" />
            <DxColumn caption="Item" data-field="invName" data-type="string" :allow-editing="false" alignment="left" :visible="true" :minWidth="200" />
            		
            <DxColumn caption="Cant Pedida" data-field="quantity" data-type="number" :allow-editing="false" alignment="right" :visible="false" :minWidth="65" :width="65" :format="userMoneyFormat" />
            <DxColumn caption="Cancelado" data-field="quantityCancel" data-type="number" :allow-editing="false" alignment="right" :visible="false" :width="100" :format="userMoneyFormat" cssClass="text-red"   />
            <DxColumn caption="Cant" data-field="quantityReal" data-type="number" :allow-editing="false" alignment="right" :visible="true" :minWidth="65" :width="70" :format="userMoneyFormat" cssClass="text-positive"  />
            <DxColumn caption="Recibido" data-field="quantityRcvd" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="90" :format="userMoneyFormat"  />
            <DxColumn caption="PorRecibir" data-field="quantityOpen" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="90" :format="userMoneyFormat" />
            <DxColumn caption="Facturado" data-field="quantityInvoiced" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="90" :format="userMoneyFormat"  cssClass="text-positive" />
            <DxColumn caption="PorFacturar" data-field="quantityInvoiceOpen" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="110" :format="userMoneyFormat"  cssClass="text-positive" />
            
            <DxColumn caption="Persona que pide" data-field="sys_user_fullname" data-type="string" :allow-editing="false" alignment="left" :visible="true" :minWidth="180" />
            <DxColumn caption="Pedido" data-field="headerDate" data-type="date" :allow-editing="false" alignment="center" :visible="true" :minWidth="120"  format="dd/MMM/yyyy" />
            <DxColumn caption="Recibido/Esperado" data-field="expectedDate" data-type="date" :allow-editing="false" alignment="center" :visible="true" :minWidth="120"  format="dd/MMM/yyyy"/>
            <DxColumn caption="# Ingreso Bodega" data-field="kardexMoveID" data-type="string" :allow-editing="false" alignment="left" :visible="true" :minWidth="180" />
            <DxColumn caption="# Orden Ingreso Bodega" data-field="kardexHeaderID" data-type="string" :allow-editing="false" alignment="left" :visible="true" :minWidth="180" />
            <DxColumn caption="Bodega" data-field="whName" data-type="string" :allow-editing="false" alignment="left" :visible="false" :minWidth="100"  />
            <DxColumn caption="Comentarios" data-field="comments" data-type="string" :allow-editing="false" alignment="right" :visible="false" :minWidth="130"  />
            <!--lineSubtotal-->
            <DxColumn caption="Precio" data-field="price" data-type="number" :allow-editing="false" alignment="right" :visible="false" :width="90" :format="userMoneyFormat" cssClass="text-primary" />
            <DxColumn caption="Suman" data-field="lineSubtotalOpen" data-type="number" :allow-editing="false" alignment="right" :visible="false" :width="100" :format="userMoneyFormat" cssClass="text-primary" />
            <DxColumn caption="Dcto %" data-field="lineDiscntPrcnt" data-type="number" :allow-editing="false" alignment="right" :visible="false" :width="90" :format="userMoneyFormat" cssClass="text-primary" />
            <DxColumn caption="Dcto $" data-field="lineDiscntAmountOpen" data-type="number" :allow-editing="false" alignment="right" :visible="false" :width="100" :format="userMoneyFormat" cssClass="text-primary" />
            <DxColumn caption="Subtotal" data-field="lineUntaxedOpen" data-type="number" :allow-editing="false" alignment="right" :visible="false" :width="110" :format="userMoneyFormat" cssClass="text-primary" />
            
            
            
            <!--<DxSummary :calculate-custom-summary="calculateSelectedRow">
              <DxTotalItem
                name="SelectedRowsSummary"
                summary-type="custom"
                value-format="currency"
                display-format="Sum: {0}"
                show-in-column="Subtotal"
              />
            </DxSummary>-->

          </DxDataGrid>

          <q-separator />
          
          <q-card-actions align="around">
              <q-btn icon="fas fa-save" flat color="primary" label="Agregar" @click="addRequisiciones" />
          </q-card-actions>
        
        </div>
  </DxPopup>

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

  <q-dialog v-model="dialogSustento">
      <q-card style="min-width: 500px">
      <q-card-section> <div class="text-primary">Seleccione el Sustento Tributario para aplicar en lote a los registros seleccionados</div> </q-card-section>

      <q-card-section class="q-pt-none">
          <q-select :options="lookup_SRI_Tabla_Tipo_Sustento" v-model="dialogSustentoValue" emit-value map-options />
      </q-card-section>

      <q-card-actions align="around" class="text-primary">
          <q-btn flat label="Aplicar" v-close-popup @click="changeSustento" />
      </q-card-actions>
      </q-card>
  </q-dialog>

  <q-dialog v-model="dialogExpected">
    <q-card style="min-width: 500px">
      <q-card-section> <div class="text-primary">Seleccione la Cuenta Contable para aplicar en lote a los registros seleccionados</div> </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select :options="lookup_accounts.filter(x=>x.account_has_children==false).map(y=> { return { value: y.value , label: y.code_es + ' - ' + y.label } })" v-model="dialogExpectedValue" emit-value map-options />
      </q-card-section>

      <q-card-actions align="around" class="text-primary">
        <q-btn flat label="Aplicar" v-close-popup @click="changeAccount" />
      </q-card-actions>
    </q-card>
  </q-dialog>

</div>
</template>

<script>

import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser, DxGrouping, DxGroupPanel, DxGroupItem } from 'devextreme-vue/data-grid';
import DxTagBox from 'devextreme-vue/tag-box';
import DxPopup, { DxToolbarItem  } from 'devextreme-vue/popup';
import mktPREditLinesTaxSelector from './../mktPR/mktPREditLinesTaxSelector'
import DxToolbar, { DxItem } from 'devextreme-vue/toolbar';

//import DataSource from 'devextreme/data/data_source';
//import ArrayStore from "devextreme/data/array_store";



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
    DxGrouping,
    DxGroupPanel,
    DxGroupItem,
    DxTotalItem,
    DxValueFormat,
    DxColumnChooser,
    mktPREditLinesTaxSelector,
    DxTagBox,
    DxToolbar,
    DxItem
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
      //maingridSelectedRowKeys: [],
      maingridDeleteBtnDisabled: true,
      internalLines: [],
      isRequisicionesDialog: false,
      dialogSustento: false, dialogSustentoValue: null,
      dialogExpected: false, dialogExpectedValue: null,
      dialogDiscount: false, dialogDiscountValue: null,
      requisiciones: null,
      requisicionesSelectedRowKeys: [],
      lookup_items_paginated: null,
      lookup_accounts_paginated: null,
      dxdialogRequisicionesSelectBoxOptionsValue: null,
      currentRequisicionesSelection: 1,
      dxdialogRequisicionesSearchBoxOptions:{
          placeholder: "Buscar...",
          showClearButton: true,
          onContentReady: (e)=>{
              this.searchTextBox = e;
              setTimeout(()=>{ 
                  this.searchTextBox.component.focus();
              }, 500);
          },
          onInput: (e)=>{
              this.$refs['dxGridRequisiciones'].instance.searchByText(e.component.option('text'));
          }
      }, 
      dxdialogRequisicionesSelectBoxOptions:{
          dataSource: [{id: 1, text: 'Todos los Registros'}, {id: 2, text: 'Mercadería Recibida'}, {id: 3, text: 'En Tránsito'}],
          displayExpr: "text",
          valueExpr: "id",
          placeholder: "Filtrar registros",
          /*onInitialized: (e)=>{
            console.dir('dxdialogRequisicionesSelectBoxOptions onInitialized!!!!!!!!!!')
            e.component.option('value',1)//pre-filter data
          },*/
          onSelectionChanged: (e)=>{
            console.dir('dxdialogRequisicionesSelectBoxOptions onSelectionChanged XXXXXXXXXXXX')
            this.applyRequisicionesFilter(e)
          },
      },
      dxdialogRequisicionesColumnsButton: {
          icon: "fas fa-columns",
          hint: "Abrir Selector de Columnas",
          onClick: (e)=>{
            this.openRequisicionesColumnSelector();
          },
      },
      gridScrollingMode: 'virtual', //standard || virtual
      gridEditMode: 'row', //row || cell
    }
  },
  created(){
    this.internalLines = JSON.parse(JSON.stringify(this.lines));
    this.lookup_accounts_paginated = { store: { type: 'array', data: this.lookup_accounts.filter(x=>x.account_has_children==false).map(y=> { return { value: y.value , label: y.code_es + ' - ' + y.label } }), key: 'value' }, pageSize: 10, paginate: true    }
    this.lookup_items_paginated = { store: { type: 'array', data: this.lookup_items.map(y=> { return { value: y.value , label: y.label, codigo: y.internal_code } }), key: 'value' }, pageSize: 10, paginate: true    }
    
  },
  mounted(){
    this.internalLines = JSON.parse(JSON.stringify(this.lines));
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
    addRows(){
      this.$q.loading.show()
      //GetMaxId
      let max_id = 0
      let temp = null
      if(this.internalLines.length > 0){
        temp = this.getMax(this.internalLines, "lineID");
        max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
      }
      
      //Main variables
      let newGridData = JSON.parse(JSON.stringify(this.internalLines));
      //Iterate selected Items
      this.$refs['dxGridSearchList'].instance.getSelectedRowsData().then(rowsData =>{
        rowsData.map(row=>{
          if(row.systemType!=3){ //3=Kit > Cuando es Kit, agrega la lista de materiales
            max_id++;
            const itemTaxes = this.lookup_items_taxes.filter(r=>r.invID==row.value).map(rr=>{return {taxID: rr.taxID, account_id: rr.account_id, taxName: this.lookup_taxes.find(z=>z.taxID==rr.taxID).short_name_es }}) //get array of taxes for current Item
            const newRow = {
              lineID: max_id,
              uploaded: false,
              invID: row.value,
              invName: row.label,
              internal_code: row.internal_code,
              sustentoID: row.sri_sustento,//esto NO se usa en mktPO
              sustentoName: row.sri_sustento_name,
              systemType: row.systemType,//esto NO se usa en mktPO
              systemTypeName: row.systemTypeName,//esto NO se usa en mktPO
              quantity: 0,
              price: row.lastPrice,
              lineSubtotal: 0,//quitadoTemporalmente
              lineDiscntPrcnt: 0,
              lineDiscntAmount: 0,//quitadoTemporalmente
              lineUntaxed: 0,//quitadoTemporalmente
              estado: true,
              creation_date: null,
              account_id: row.debit_account_id,
              account_name: row.debit_account_name,
              //taxes: itemTaxes,
              taxes: itemTaxes,
              taxesNames: itemTaxes.map(z=>z.taxName).join(', '),
              lineTotal: 0,
              prjID: 0,
              quantity_isEditDisabled: false,
              price_isEditDisabled: false,
              lineDiscntPrcnt_isEditDisabled: false,
              taxes_isEditDisabled: false,
              sustentoID_isEditDisabled: false,
              accountID_isEditDisabled: false,
            }
            newGridData.push(newRow)
            //const tempLine = {'data': newRow};
          }else{

          }
        })
      })
      this.internalLines = newGridData;
      this.$q.loading.hide()
      this.isListDialog = false;
      this.$refs['dxGridSearchList'].instance.clearSelection()
      //this.$refs['dxgrid'].instance.clearSelection()
      
    },
    onRowUpdated(row){
      row.data.quantity = row.data.quantity ? parseFloat(parseFloat(row.data.quantity).toFixed(6)) : 0
      row.data.price = row.data.price ? parseFloat(parseFloat(row.data.price).toFixed(6)) : 0
      row.data.lineDiscntPrcnt = row.data.lineDiscntPrcnt ? parseFloat(parseFloat(row.data.lineDiscntPrcnt).toFixed(6)) : 0
      row.data.lineSubtotal = parseFloat(parseFloat(row.data.quantity * row.data.price).toFixed(6))
      row.data.lineDiscntAmount = parseFloat(parseFloat(row.data.lineSubtotal * (row.data.lineDiscntPrcnt/100)).toFixed(6))
      row.data.lineUntaxed = parseFloat(parseFloat(row.data.lineSubtotal - row.data.lineDiscntAmount).toFixed(6))
    },
    
    updateAccountMove(){
      let internalAccountLines = [];
      let newAccLineID = 1 //porque empieza en 2 por la autosuma de cada línea, y la #1 es la del HABER para el proveedor
      let totalCreditAmount = 0

      //#region DEBE (Items)
      this.internalLines.map(row=>{
        newAccLineID++;
        totalCreditAmount = parseFloat(totalCreditAmount) + parseFloat(parseFloat(row.lineUntaxed).toFixed(6))
        internalAccountLines.push({
          accLineID: newAccLineID
          ,lineID: row.lineID
          ,taxLineID: 0
          ,account_id: row.account_id
          ,partnerID: this.partnerID
          ,debit: row.lineUntaxed
          ,credit: 0
          ,invID: row.invID
          ,prjID: row.prjID
          ,stockID: row.stockID
          ,mktLineID: row.lineID
          ,comments: row.invName
          ,mktTypeID: row.mktTypeID
          ,headerID: row.headerID
        })
      })
      //#endregion DEBE (Items)
      
      //#region DEBE (Items Taxes)
      this.totalLines.filter(x=>x.categoria=='Impuestos').map(row=>{
        newAccLineID++;
        totalCreditAmount = parseFloat(totalCreditAmount) + parseFloat(parseFloat(row.valor).toFixed(6))
        internalAccountLines.push({
          accLineID: newAccLineID
          ,lineID: 0
          ,taxLineID: 0
          ,account_id: row.account_id
          ,partnerID: this.partnerID
          ,debit: parseFloat(parseFloat(row.valor).toFixed(6))
          ,credit: 0
          ,invID: 0
          ,prjID: 0
          ,stockID: 0
          ,mktLineID: 0
          ,comments: row.label //nombre del impuesto
          ,mktTypeID: 0
          ,headerID: 0
        })
      })
      //#endregion DEBE (Items Taxes)

      //#region HABER
      internalAccountLines.push({
          accLineID: 1 //porque los registros anteriores empiezan en 2
          ,lineID: 999999
          ,taxLineID: 0
          ,account_id: this.partner_account_id
          ,partnerID: this.partnerID
          ,debit: 0
          ,credit: parseFloat(parseFloat(totalCreditAmount).toFixed(6))
          ,invID: 0
          ,prjID: 0
          ,stockID: 0
          ,mktLineID: 0
          ,comments: this.partnerName
          ,mktTypeID: 0
          ,headerID: 0
          ,lineID: 0
      })
      //#endregion HABER*/
      this.accountLines = internalAccountLines
    },
    setAccountValue(newData, value, currentRowData){
      const accountSelected = this.lookup_accounts.find(x=>x.value==value)
      newData.account_id = value;
      newData.account_name =  accountSelected.code_es + ' - ' + accountSelected.label;
    },
    removeRows(){
      this.$refs['dxgrid'].instance.getSelectedRowsData().then(rowsData => {
        if(rowsData.length>0){//if(this.maingridSelectedRowKeys.length > 0)
          this.$q.dialog({ 
              title: 'Confirmación'
              ,persistent: false
              ,message: 'Desea eliminar las líneas seleccionadas?'
              ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true, color: 'red', flat: true }
              ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
          }
          ).onOk(() => {
            //this.internalLines = this.internalLines.filter(x=> (x.uploaded) || (!x.uploaded&&!(this.maingridSelectedRowKeys.some(y=>y==x.lineID)))  );//Devuelve [TODO lo uploaded]  + [TODO lo nuevo - NO seleccionado]
            this.internalLines = this.internalLines.filter(x=> (x.uploaded) || (!x.uploaded&&!(rowsData.some(y=>y.lineID==x.lineID)))  );//Devuelve [TODO lo uploaded]  + [TODO lo nuevo - NO seleccionado]
            //this.maingridSelectedRowKeys = []//limpia selección para evitar problema de referencia a filas que no existan
            this.$refs['dxgrid'].instance.clearSelection()
          })
        }
      })
    },
    clearRows(){
      this.internalLines = [];
      this.$refs['dxgrid'].instance.clearSelection();
    },
    updateVuex(){
      console.dir('accAPEditLines updateVuex')
      this.updateAccountMove();//actualiza asiento contable antes de guardar y/o al cambiar de tab
      //esto realmente lo usa editForm.vue para actualizar los datos reales de este componente, antes de enviarlos al servidor en el POST
      this.lines = JSON.parse(JSON.stringify(this.internalLines))
    },
    listGridShown(){
      this.$refs['dxGridSearchList'].instance.searchByText('');
    },
    openColumnSelector(){
      this.$refs['dxgrid'].instance.showColumnChooser();
    },
    openRequisicionesColumnSelector(){
      this.$refs['dxGridRequisiciones'].instance.showColumnChooser();
    },
    changeSustento(){
      this.$refs['dxgrid'].instance.getSelectedRowsData().then(rowsData => {
        if(rowsData.length>0){//if(this.maingridSelectedRowKeys.length > 0)
          if(this.dialogSustentoValue&&this.dialogSustentoValue>0){
            const sustentoSeleccionado = this.lookup_SRI_Tabla_Tipo_Sustento.find(sus=>sus.value==this.dialogSustentoValue)
            this.internalLines.map(x=> rowsData.filter(xx=> x.lineID == xx.lineID).map(xxx=>{
              if(x.sustentoID_isEditDisabled==false){//solamente si está permitido
                x['sustentoID'] = this.dialogSustentoValue;
                x['sustentoName'] = sustentoSeleccionado.short_name_es;
              }
            }))
          }
        }
      })
    },
    changeAccount(){
      this.$refs['dxgrid'].instance.getSelectedRowsData().then(rowsData => {
        if(rowsData.length>0){//if(this.maingridSelectedRowKeys.length > 0)
          if(this.dialogExpectedValue){
            const accountSelected = this.lookup_accounts.find(z => z.value==this.dialogExpectedValue)
            this.internalLines.map(x=> rowsData.filter(xx=> x.lineID == xx.lineID).map(xxx=>{
                if(x.accountID_isEditDisabled==false){//solamente si está permitido
                  x['account_id'] = this.dialogExpectedValue
                  x['account_name'] = accountSelected.code_es + ' - ' + accountSelected.label
                }
              }) 
            )
          }
        }
      })
    },
    changeDiscount(){
      this.$refs['dxgrid'].instance.getSelectedRowsData().then(rowsData => {
        if(rowsData.length>0){//if(this.maingridSelectedRowKeys.length > 0)
          if(this.dialogDiscountValue&&this.dialogDiscountValue>=0&&this.dialogDiscountValue<=100){
            this.internalLines.map(x=> rowsData.filter(xx=> x.lineID == xx.lineID).map(xxx=>{
              if(x.lineDiscntPrcnt_isEditDisabled==false){//solamente si está permitido
                x['lineDiscntPrcnt'] = this.dialogDiscountValue
                //e.data.lineSubtotal = parseFloat(parseFloat(e.data.quantity * e.data.price).toFixed(6))
                x.lineDiscntAmount = parseFloat(parseFloat(x.lineSubtotal * (this.dialogDiscountValue/100)).toFixed(6))
                x.lineUntaxed = parseFloat(parseFloat(x.lineSubtotal - x.lineDiscntAmount).toFixed(6))
                let newTaxAmount = 0;
                x.taxes.map(z=>{
                  this.lookup_taxes.filter(xx=>xx.taxID==z).map(xxx=>{
                    const newAmount = (           xxx.isPercent ? (  parseFloat(x.lineUntaxed * xxx.factor_base * xxx.factor)  ) : parseFloat(xxx.factor)             )
                    newTaxAmount = parseFloat(newTaxAmount) + parseFloat(newAmount)
                  })
                })
                x.taxAmount = parseFloat(newTaxAmount.toFixed(6));
                x.lineTotal = parseFloat((x.lineUntaxed + x.taxAmount).toFixed(6));
              }
            }) )
            this.$refs['dxgrid'].instance.refresh();//refresh, recalculates summaries
          }
        }
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
      if (e.parentType === 'dataRow' && e.dataField === 'taxes' && e.row.data.taxes_isEditDisabled) {
        e.editorOptions.disabled = true
      }
      if (e.parentType === 'dataRow' && e.dataField === 'sustentoID' && (e.row.data.sustentoID_isEditDisabled || !this.allow_accounting) ) {
        e.editorOptions.disabled = true
      }
      if (e.parentType === 'dataRow' && e.dataField === 'account_id' && (e.row.data.accountID_isEditDisabled || !this.allow_accounting) ) {
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
      })
    },
    addRequisiciones(){
      this.$q.loading.show()
      //GetMaxId
      let max_id = 0
      let temp = null
      if(this.internalLines.length > 0){
        temp = this.getMax(this.internalLines, "lineID");
        max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
      }
      
      //Main variables
      let newGridData = JSON.parse(JSON.stringify(this.internalLines));
      //Iterate selected Items
      this.$refs['dxGridRequisiciones'].instance.getSelectedRowsData().then(rowsData =>{
        rowsData.map(row=>{
          if(row.systemType!=3){ //3=Kit > Cuando es Kit, agrega la lista de materiales
            max_id++;
            const itemTaxes = this.lookup_items_taxes.filter(r=>r.invID==row.invID).map(rr=>{return {taxID: rr.taxID, account_id: rr.account_id, taxName: this.lookup_taxes.find(z=>z.taxID==rr.taxID).short_name_es }}) //get array of taxes for current Item
            const lineSubtotal = parseFloat(parseFloat(row.quantityInvoiceOpen * row.price).toFixed(6))
            const lineDiscntAmount = parseFloat(parseFloat( (lineSubtotal) * (row.lineDiscntPrcnt/100) ).toFixed(6))
            const newRow = {
              lineID: max_id,
              uploaded: false,
              invID: row.invID,
              invName: row.invName,
              internal_code: row.internal_code,
              sustentoID: row.sri_sustento,//esto NO se usa en mktPO
              sustentoName: row.sri_sustento_name,
              systemType: row.systemType,//esto NO se usa en mktPO
              systemTypeName: row.systemTypeName,//esto NO se usa en mktPO
              quantity: row.quantityInvoiceOpen ? parseFloat(parseFloat(row.quantityInvoiceOpen).toFixed(6)) : 0, //se pone la cantidad disponible x facturar
              price: row.price ? parseFloat(parseFloat(row.price).toFixed(6)) : 0, //se pone el precio de la OC
              lineSubtotal: lineSubtotal, //se calcula subtotal
              lineDiscntPrcnt: row.lineDiscntPrcnt ? parseFloat(parseFloat(row.lineDiscntPrcnt).toFixed(6)) : 0,
              lineDiscntAmount: lineDiscntAmount,
              lineUntaxed: parseFloat(parseFloat(lineSubtotal - lineDiscntAmount).toFixed(6)),
              estado: true,
              creation_date: null,
              account_id: row.account_id,
              account_name: row.account_name,
              mktPOHeader: row.mktPOHeader,
              mktPOlineID: row.mktPOlineID,
              //taxes: itemTaxes,
              taxes: itemTaxes,
              taxesNames: itemTaxes.map(z=>z.taxName).join(', '),
              lineTotal: 0,
              prjID: 0,
              quantity_isEditDisabled: false,
              price_isEditDisabled: false,
              lineDiscntPrcnt_isEditDisabled: false,
              taxes_isEditDisabled: false,
              sustentoID_isEditDisabled: false,
              accountID_isEditDisabled: false,
            }
            newGridData.push(newRow)
            //const tempLine = {'data': newRow};
          }else{

          }
        })
      })
      this.internalLines = newGridData;
      this.$q.loading.hide()
      this.isRequisicionesDialog = false;
      this.$refs['dxGridRequisiciones'].instance.clearSelection()
      //this.$refs['dxgrid'].instance.clearSelection()

      /*//GetMaxId
      let max_id = 0
      let temp = null
      if(this.internalLines.length > 0){
        temp = this.getMax(this.internalLines, "lineID");
        max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
      }

      //Main variables
      let newGridData = JSON.parse(JSON.stringify(this.internalLines));

      this.requisiciones.filter(x=>this.requisicionesSelectedRowKeys.some(y=>y==x.value)).map(row=>{
        console.dir('row')
        console.dir(row)
        max_id++;
        
        //ADD ITEM
        const itemData = this.lookup_items.find(x=>x.value==row.invID)
        console.dir('itemData')
        console.dir(itemData)
        const itemTaxes = this.lookup_items_taxes.filter(r=>r.invID==row.invID).map(rr=>rr.taxID) //get array of taxes for current Item
        console.dir('itemTaxes')
        console.dir(itemTaxes)
        const newRow = {
          lineID: max_id,
          uploaded: false,
          invID: row.invID,
          sustentoID: row.sri_sustento,//esto NO se usa en mktPO
          systemType: row.systemType,//esto NO se usa en mktPO
          quantity: row.quantityInvoiceOpen,
          //quantityCancel: 0,
          //quantityCancelNew: 0,
          //quantityRcvd: 0,
          //quantityInvoiced: 0,
          price: row.price,
          lineSubtotal: row.lineSubtotalOpen,
          lineDiscntPrcnt: row.lineDiscntPrcnt,
          lineDiscntAmount: row.lineSubtotalOpen * (row.lineDiscntPrcnt / 100),
          lineUntaxed: row.lineSubtotalOpen - (row.lineSubtotalOpen * (row.lineDiscntPrcnt / 100)), //[lineSubtotalOpen] meno [fórmula de lineDiscntAmount]
          //whID: this.defaultWhID,
          estado: true,
          creation_date: null,
          account_id: row.account_id,
          //credit_account_id: row.credit_account_id,
          taxes: itemTaxes,
          taxAmount: 0,//PENDIENTE
          lineTotal: 0,//PENDIENTE
          //quantityOpen: 0,
          //quantityReturned: 0,
          prjID: 0,
          //transportTypeID: this.defaultTransportID,
          //expectedDate: null,
          quantity_isEditDisabled: false,
          price_isEditDisabled: false,
          lineDiscntPrcnt_isEditDisabled: false,
          taxes_isEditDisabled: false,
          sustentoID_isEditDisabled: false,
          accountID_isEditDisabled: false,
          //transportTypeID_isEditDisabled: false,
          //quantityCancelNew_isEditDisabled: false,
          mktPOHeader: row.mktPOHeader,
          mktPOlineID: row.mktPOlineID
        }

        itemTaxes.forEach(impuesto => {
          const impuestoData = this.lookup_taxes.find(int => int.taxID == impuesto)
          const newTaxRow = {
            lineID: max_id,
            uploaded: false,
            taxID: impuestoData.taxID,
            account_id: impuestoData.accPurchase,
            taxAmount: 0,
            //Los siguientes campos son para facilitar el cálculo del asiento contable
            invID: row.invID,
            prjID: 0,
            stockID: 0,
            itemName: itemData.label,
            taxName: impuestoData.short_name_es,
          }
          console.dir('newTaxRow')
          console.dir(newTaxRow)
          newLineTaxes.push(newTaxRow)
        });
        newGridData.push(newRow)
      })
      this.internalLines = newGridData;
      this.isRequisicionesDialog = false
      console.dir(this.internalLines)
      */
    },
    applyRequisicionesFilter(e){
      const dataGrid = this.$refs['dxGridRequisiciones'].instance;
      if (e.selectedItem.id == 1) {
        dataGrid.clearFilter();
      }
      else {
        if(e.selectedItem.id == 2){
          dataGrid.filter(['quantityRcvd', '>', 0]);
        }
        if(e.selectedItem.id == 3){
          dataGrid.filter(['quantityRcvd', '=', 0]);
        }
      }
    },
    calculateSelectedRow(options) {
      if (options.name === 'SelectedRowsSummary') {
        console.dir(options)
        if (options.summaryProcess === 'start') {
          options.totalValue = 0;
        } else if (options.summaryProcess === 'calculate') {
          if (options.component.isRowSelected(options.value.value)) { //[options.value] tiene todas las columnas de la fila, y en este caso, la columna con el key_expression se llama coincidencialmente [value]
            options.totalValue = options.totalValue + options.value.lineUntaxedOpen;//entonces, si la fila está seleccionada, a la suma que va acumulando en [totalValue] le adiciona el valor de la columna [lineUntaxedOpen]
          }
        }
      }
    },
    onRequisicionesSelectionChanged(e) {
      e.component.refresh(true);
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
      allow_accounting: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_accounting').map(y=>{
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
      
      totalLines: {
        get () {
          let results = []
          //1.- Subtotal
          results.push({
            indice: 1,
            categoria: 'Suman',
            label: 'Subtotal sin Impuestos',
            clase: 'text-primary text-subtitle2',
            claseValor: 'text-weight-bolder',
            valor: parseFloat(this.internalLines.reduce((acc, linea) => acc + linea.lineUntaxed, 0)).toFixed(2)

          })
          //2.- Subtotales por cada Impuesto Distinto Existente
          let contador = 1;
          let subtotalesByImpuesto = [];
          this.internalLines.forEach(linea=>{
            linea.taxes.forEach(impuesto=>{
              if(subtotalesByImpuesto.filter(x=>x.taxID==impuesto.taxID).length>0){
                subtotalesByImpuesto.filter(x=>x.taxID==impuesto.taxID).map(y=>{
                  y.valor = parseFloat(y.valor) + parseFloat(linea.lineUntaxed)
                })
              }else{
                const impuestoData = this.lookup_taxes.find(z=>z.taxID == impuesto.taxID)
                subtotalesByImpuesto.push({
                  taxID: impuesto.taxID,
                  account_id: impuestoData.accPurchase,
                  isPercent: impuestoData.isPercent,
                  factor_base: impuestoData.factor_base,
                  factor: impuestoData.factor,
                  label: impuestoData.short_name_es,
                  valor: parseFloat(linea.lineUntaxed)
                })
              }
            })
          })
          subtotalesByImpuesto.forEach(lineaSubtotal=>{
            if(lineaSubtotal.valor>0){
              contador++;
              results.push({
                indice: contador,
                categoria: 'Subtotales',
                label: 'Subtotal ' + lineaSubtotal.label,
                clase: 'text-primary text-subtitle2 text-italic',
                claseValor: 'text-italic',
                valor: parseFloat(lineaSubtotal.valor).toFixed(2)
              })
            }
          })
          //3.- Cálculo de valores por cada Impuesto
          subtotalesByImpuesto.forEach(lineaSubtotal=>{
            if(lineaSubtotal.valor>0){
              const taxAmount = (   lineaSubtotal.isPercent ? (  parseFloat(lineaSubtotal.valor * lineaSubtotal.factor_base * lineaSubtotal.factor).toFixed(2)  ) : parseFloat(lineaSubtotal.factor).toFixed(2)   )
              if(taxAmount > 0){
                contador++;
                results.push({
                  indice: contador,
                  label: lineaSubtotal.label,
                  categoria: 'Impuestos',
                  clase: 'text-primary text-subtitle2',
                  claseValor: 'text-weight-bolder',
                  valor: taxAmount,
                  account_id: lineaSubtotal.account_id
                })
              }
            }
          })
          //4.- Suma TOTAL
          contador++;
          //console.dir(subtotalesByImpuesto)
          //console.dir(results)
          results.push({
            indice: contador,
            label: 'TOTAL',
            clase: 'text-primary text-subtitle2 text-weight-bolder',
            claseValor: 'text-primary text-subtitle2 text-weight-bolder',
            valor: parseFloat(results.filter(z=>z.categoria=='Suman'||z.categoria=='Impuestos').reduce((acc, linea) => acc + parseFloat(linea.valor), 0)).toFixed(2)
          })
          //Devuelve resultado Final
          return results
        }
        
      },
      partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
      partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
      partner_account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
      lines: {
          get () { return this.$store.state[this.moduleName].editData.lines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
      },
      linesTaxes: {
          get () { return this.$store.state[this.moduleName].editData.linesTaxes },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'linesTaxes', value: val}) }
      },
      accountLines: {
        get () { return this.$store.state[this.moduleName].editData.accountLines },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'accountLines', value: val}) }
      },
      /*requisiciones: {
          get () { return this.$store.state[this.moduleName].editData.requisiciones },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'requisiciones', value: val}) }
      },*/
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
      },
      lookup_SRI_Tabla_Tipo_Sustento: {
          //get () { return this.$store.state[this.moduleName].editData.lookup_SRI_Tabla_Tipo_Sustento },
            get () { 
                let results = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].editData.lookup_SRI_Tabla_Tipo_Sustento))
                results.map(x=>{
                    x.label = x.value + ' - ' + x.label
                    return x
                })
                return results
            },
      },
      lookup_accounts: {
          get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
      },
      lookup_systemTypes: {
          get () { return this.$store.state[this.moduleName].editData.lookup_systemTypes },
      },
  }
})
</script>
