<template>
<div style="margin: -16px;">
  <q-toolbar class="no-padding">
    <q-btn label="Agregar Líneas" no-caps icon="far fa-plus-square" color="primary" flat stretch @click="addRows" :disable="editStatus.editMode=='edit'||partnerID==null||partnerID<=0" />
    <q-space />
    <q-btn title="Ayuda" color="primary" icon="fas fa-info-circle" flat stretch>
        <q-tooltip>
                Una vez que el documento ha sigo guardado, usted no puede agregar ni eliminar líneas.
          <br />Una vez que el documento ha sigo guardado, usted no puede modificar los montos.
          <br />La cuenta contable puede ser modificada en cualquier momento;
          <br />No podrá guardar el documento si usted cambió la cuenta contable y existe un pago aplicado.
        </q-tooltip>
      </q-btn>
 </q-toolbar>

  <q-separator />
  <!--height="calc(100vh - 170px)"-->
  <!--height="calc(100vh - 298px)"-->
  <DxDataGrid
    ref="dxgrid"
    key="maindatagrid"
    height="calc(100vh - 208px)"
    width="100%"
    column-resizing-mode="widget"
    :data-source="internalLines"
    :allow-column-resizing="true" 
    :allow-column-reordering="true"
    :show-borders="true"
    :show-column-lines="userTableLinesDXcols"
    :show-row-lines="userTableLinesDXrows"
    key-expr="lineID"
    >
        <!--
        :stateStoring="{ ignoreColumnOptionNames: [] }"
        @row-updated="onRowUpdated"
        @editor-preparing="checkIfCellEditable"
        -->

      <!--<DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="true" />--><!--:deferred="true"-->
      <DxColumnChooser  mode="select" />
      <DxColumnFixing :enabled="true" :texts="{fix:'Fijar', unfix: 'Soltar'}" />
      <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
      <DxEditing :allow-updating="true" mode="cell" :useIcons="false" :select-text-on-edit-start="true" start-edit-action="click" /> <!-- me gustan: cell, row, popup, batch mejora rendimiento pero NO calcula en línea y muestra un toolbar extra -->
      <DxScrolling mode="standard" :useNative="true" showScrollbar="always" /> <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
      <DxPaging :enabled="false" /> 

        <DxColumn caption="# Posición" data-field="lineID" name="lineID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="50" :visible="true" />
        <DxColumn caption="Cuenta Contable" data-field="line_account_id" name="line_account_id" data-type="number" :allow-editing="true" alignment="left" :minWidth="200" calculate-display-value="line_account_name"
            :editor-options="{ opened: true }"
            :set-cell-value="setAccountValue"> <!--calculate-display-value hace que DxLookup NO se use mientras no se esté editando la celda, y eso mejora rendimiento según devexpress-->
            <DxLookup value-expr="value" display-expr="label" :data-source="lookup_accounts_paginated" />
        </DxColumn><!--Si NO tiene pagos, entonces es editable-->
        <DxColumn caption="Comentario" data-field="comments" name="comments" data-type="string" :allow-editing="true" alignment="left" :width="300" />
        <DxColumn caption="Monto" data-field="amount" name="amount" data-type="number" :allow-editing="editStatus.editMode=='create'" alignment="right" :minWidth="80" :width="80" 
            :format="userMoneyFormat" /><!--Si NO tiene pagos, entonces es editable-->
        <DxColumn caption=" " name="voidButton" :allow-editing="false" alignment="left" :visible="true" cell-template="voidEditor" :width="57" />
            <template #voidEditor="{ data: cellInfo }">
                <q-btn v-if="editStatus.editMode=='create'" icon="fas fa-trash-alt" color="red" flat stretch :title="'Anular Conciliación # ' + cellInfo.data.lineID" @click="eliminarLinea(cellInfo)"
                    style="margin: -10px;"/>
            </template>
      />
  </DxDataGrid>

  <q-list dense class="text-right" style="height: 35px; max-height: 35px; overflow-y: auto;">
    <q-item v-for="linea in totalLines" :key="linea.indice" clickable>
      <q-item-section side :class="linea.clase">{{linea.label}}</q-item-section>
      <q-item-section :class="linea.claseValor">{{linea.valor}}</q-item-section>
    </q-item>
  </q-list>

</div>
</template>

<script>

import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser, DxGrouping, DxGroupPanel, DxGroupItem } from 'devextreme-vue/data-grid';
import DxPopup, { DxToolbarItem  } from 'devextreme-vue/popup';
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
      gridScrollingMode: 'virtual', //standard || virtual
      gridEditMode: 'row', //row || cell
    }
  },
  created(){
    this.internalLines = JSON.parse(JSON.stringify(this.lines));
    this.lookup_accounts_paginated = { store: { type: 'array', data: this.lookup_accounts.filter(x=>x.account_has_children==false).map(y=> { return { value: y.value , label: y.code_es + ' - ' + y.label } }), key: 'value' }, pageSize: 10, paginate: true    }
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
      const accountSelected = this.lookup_accounts.find(x=>x.value==this.account_id_advance)
      //Iterate selected Items
      max_id++;
      const newRow = {
        lineID: max_id,
        uploaded: false,
        line_account_id: this.account_id_advance,
        line_account_name: accountSelected.code_es + ' - ' + accountSelected.label,
        amount: 0,
        comments: '',
        prjName: 0
      }
      newGridData.push(newRow)
      this.internalLines = newGridData;
      this.$q.loading.hide()
    },
    updateAccountMove(){
      let internalAccountLines = [];
      let newAccLineID = 1 //porque empieza en 2 por la autosuma de cada línea, y la #1 es la del HABER para el proveedor
      let totalCreditAmount = 0

      //#region DEBE (Items)
      this.internalLines.map(row=>{
        newAccLineID++;
        totalCreditAmount = parseFloat(totalCreditAmount) + parseFloat(parseFloat(row.amount).toFixed(6))
        internalAccountLines.push({
          accLineID: newAccLineID
          ,lineID: row.lineID
          ,taxLineID: 0
          ,account_id: row.line_account_id
          ,partnerID: this.partnerID
          ,debit: row.amount
          ,credit: 0
          ,invID: 0
          ,prjID: 0
          ,stockID: 0
          ,mktLineID: 0
          //,comments: this.partnerName + ' - ' + row.comments
          ,comments: this.lookup_accPaymentMethods.filter(x=>x.value == this.methodID).map(z=>z.label).join(', ') + ' #' +  this.numeroDoc
          ,mktTypeID: 0
          ,headerID: 0
        })
      })
      //#endregion DEBE (Items)
      
      //#region HABER
      internalAccountLines.push({
          accLineID: 1 //porque los registros anteriores empiezan en 2
          ,lineID: 999999
          ,taxLineID: 0
          ,account_id: this.account_id
          ,partnerID: this.partnerID
          ,debit: 0
          ,credit: parseFloat(parseFloat(totalCreditAmount).toFixed(6))
          ,invID: 0
          ,prjID: 0
          ,stockID: 0
          ,mktLineID: 0
          //,comments: this.lookup_accPaymentMethods.filter(x=>x.value == this.methodID).map(z=>z.paymentTypeName).join(', ') + ' #' +  this.numeroDoc
          ,comments: this.lookup_accPaymentMethods.filter(x=>x.value == this.methodID).map(z=>z.label).join(', ') + ' #' +  this.numeroDoc
          ,mktTypeID: 0
          ,headerID: 0
          ,lineID: 0
      })
      //#endregion HABER*/
      this.accountLines = internalAccountLines
    },
    setAccountValue(newData, value, currentRowData){
      const accountSelected = this.lookup_accounts.find(x=>x.value==value)
      newData.line_account_id = value;
      newData.line_account_name =  accountSelected.code_es + ' - ' + accountSelected.label;
    },
    updateVuex(){
      this.updateAccountMove();//actualiza asiento contable antes de guardar y/o al cambiar de tab
      //esto realmente lo usa editForm.vue para actualizar los datos reales de este componente, antes de enviarlos al servidor en el POST
      this.lines = JSON.parse(JSON.stringify(this.internalLines))
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
    eliminarLinea(cellInfo){
      this.internalLines = this.internalLines.filter(x=>x.lineID!=cellInfo.data.lineID)
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
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
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
            label: 'Total del Documento',
            clase: 'text-primary text-subtitle2',
            claseValor: 'text-weight-bolder text-primary',
            valor: parseFloat(this.internalLines.reduce((acc, linea) => acc + linea.amount, 0)).toFixed(2)

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
      methodID: {
            get () { return this.$store.state[this.moduleName].editData.basic.methodID },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'methodID', value: val}) }
        },
      account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_id_advance', value: val}) }
        },
      account_id_advance: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id_advance },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_id_advance', value: val}) }
        },
      numeroDoc: {
            get () { return this.$store.state[this.moduleName].editData.basic.numeroDoc },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'numeroDoc', value: val}) }
        },
      lines: {
          get () { return this.$store.state[this.moduleName].editData.lines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
      },
      accountLines: {
        get () { return this.$store.state[this.moduleName].editData.accountLines },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'accountLines', value: val}) }
      },
      lookup_accPaymentMethods: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accPaymentMethods },
        },
      lookup_prj: {
          get () { return this.$store.state[this.moduleName].editData.lookup_prj },
      },
      gridState: {
          get () { 
            return this.$store.state[this.moduleName].editData.gridState
          },
      },
      lookup_accounts: {
          get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
      },
  }
})
</script>
