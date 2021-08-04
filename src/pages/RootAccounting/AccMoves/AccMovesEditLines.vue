<template>
<div style="margin: -16px;">
  <q-toolbar class="no-padding">
    <q-btn label="Agregar Líneas" no-caps icon="far fa-plus-square" color="primary" flat stretch :disable="journalID!=1" @click="addRows" /> 
    <q-space />
    <q-btn title="Ayuda" color="primary" icon="fas fa-info-circle" flat stretch>
        <q-tooltip>
                Al crear o copiar un asiento, solamente podrá usar el diario "Contabilidad".
          <br />No podrá editar el detalle del asiento cuando corresponda a un diario diferente a "Contabilidad".
          <br />Si necesitar realizar cambios en asientos de diarios distintos a "Contabilidad", modifique directamente en el módulo correspondiente.
          <br />Al guardar el documento se valida que el balance del asiento sea cero.
        </q-tooltip>
      </q-btn>
 </q-toolbar>

 <DxDataGrid
    ref="dxgrid"
    key="maindatagrid"
    height="calc(100vh - 208px)"
    column-resizing-mode="widget"
    :data-source="internalLines"
    :allow-column-resizing="true" 
    :allow-column-reordering="true"
    :show-borders="true"
    :show-column-lines="userTableLinesDXcols"
    :show-row-lines="userTableLinesDXrows"
    key-expr="lineID"
    >
      <DxGrouping :auto-expand-all="journalID==1?true:false"/>
      <DxColumnChooser  mode="select" />
      <DxColumnFixing :enabled="true" :texts="{fix:'Fijar', unfix: 'Soltar'}" />
      <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
      <DxEditing :allow-updating="journalID==1" mode="cell" :useIcons="false" :select-text-on-edit-start="true" start-edit-action="click" /> <!-- me gustan: cell, row, popup, batch mejora rendimiento pero NO calcula en línea y muestra un toolbar extra -->
      <DxScrolling mode="standard" :useNative="true" showScrollbar="always" /> <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
      <DxPaging :enabled="false" /> 

      <DxColumn caption="# Posición" data-field="lineID" name="lineID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="50" :visible="false" />
      <!--:group-index="0"-->
      <DxColumn caption="Cuenta Contable" data-field="account_id" name="account_id" data-type="number" :allow-editing="true" alignment="left" :minWidth="200" calculate-display-value="account_name"
            :group-index="editStatus.editMode=='edit'&&journalID!=1?0:undefined"
            :editor-options="{ opened: true }"
            :set-cell-value="setAccountValue"> <!--calculate-display-value hace que DxLookup NO se use mientras no se esté editando la celda, y eso mejora rendimiento según devexpress-->
            <DxLookup value-expr="value" display-expr="label" :data-source="lookup_accounts_paginated" />
        </DxColumn><!--Si NO tiene pagos, entonces es editable-->
      <!--calculate-display-value="account_name"-->
      <DxColumn caption="Socio" data-field="partnerID" name="partnerID" data-type="number" :allow-editing="true" alignment="left" :minWidth="200" 
            :editor-options="{ opened: true }"
            > <!--calculate-display-value hace que DxLookup NO se use mientras no se esté editando la celda, y eso mejora rendimiento según devexpress-->
            <DxLookup value-expr="value" display-expr="label" :data-source="lookup_partners" />
        </DxColumn><!--Si NO tiene pagos, entonces es editable-->
      <DxColumn caption="Comentario" data-field="comments" name="comments" data-type="string" :allow-editing="true" alignment="left" :minWidth="200" />
      <DxColumn caption="Debe" data-field="debit" name="debit" data-type="number" :allow-editing="journalID==1" alignment="right" :width="120" :minWidth="120" :format="userMoneyFormat" />
      <DxColumn caption="Haber" data-field="credit" name="credit" data-type="number" :allow-editing="journalID==1" alignment="right" :width="120" :minWidth="120" :format="userMoneyFormat" />
      <DxColumn caption="Balance" data-field="calculated" name="calculated" data-type="number" :allow-editing="false" alignment="right" :width="110" :minWidth="110" :format="userMoneyFormat" :calculate-cell-value="calculateBalanceAmount" :visible="false" />
      <DxColumn caption=" " name="voidButton" :allow-editing="false" alignment="left" :visible="true" cell-template="voidEditor" :width="57" />
            <template #voidEditor="{ data: cellInfo }">
                <q-btn v-if="journalID==1" icon="fas fa-trash-alt" color="red" flat stretch :title="'Anular Conciliación # ' + cellInfo.data.lineID" @click="eliminarLinea(cellInfo)"
                    style="margin: -10px;"/>
            </template>

      <DxSummary >
        <DxTotalItem column="account_id" summary-type="count"/>
        <DxTotalItem column="debit" summary-type="sum" cssClass="q-mr-none" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxTotalItem column="credit" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxTotalItem showInColumn="comments" column="calculated" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>

        <DxGroupItem name="totalDebit" :show-in-group-footer="false" :align-by-column="true" column="debit" summary-type="sum"> <DxValueFormat type="#.00" /> </DxGroupItem>
        <DxGroupItem name="totalCredit" :show-in-group-footer="false" :align-by-column="true" column="credit" summary-type="sum"> <DxValueFormat type="#.00" /> </DxGroupItem>
      </DxSummary>
      <DxSortByGroupSummaryInfo  summary-item="totalCredit" sort-order="desc" />
      <DxSortByGroupSummaryInfo  summary-item="totalDebit" sort-order="desc" />

 </DxDataGrid>
 
</div>

</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';

import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser, DxGrouping, DxSortByGroupSummaryInfo, DxGroupItem } from 'devextreme-vue/data-grid';
import { date } from 'quasar';

export default ({
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
      DxLookup,
      DxSummary,
      DxGroupItem, 
      DxSortByGroupSummaryInfo,
      DxTotalItem,
      DxValueFormat,
      DxColumnChooser,
      DxGrouping
    },

    data () {
      return {
        moduleName: "AccMoves",
        internalLines: [],
        lookup_accounts_paginated: null,
      }
    },
    created(){
      this.internalLines = JSON.parse(JSON.stringify(this.lines));
      this.lookup_accounts_paginated = { store: { type: 'array', data: this.lookup_accounts.filter(x=>x.account_has_children==false).map(y=> { return { value: y.value , label: y.code_es + ' - ' + y.label } }), key: 'value' }, pageSize: 10, paginate: true    }
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
      setAccountValue(newData, value, currentRowData){
        const accountSelected = this.lookup_accounts.find(x=>x.value==value)
        newData.account_id = value;
        newData.account_name =  accountSelected.code_es + ' - ' + accountSelected.label;
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
          /*
          account_id: this.account_id_advance,
          account_name: accountSelected.code_es + ' - ' + accountSelected.label,
          */
          account_id: 0,
          account_name: 'Seleccionar Cuenta',
          debit: 0,
          credit: 0,
          comments: '',
          prjName: 0
        }
        newGridData.push(newRow)
        this.internalLines = newGridData;
        this.$q.loading.hide()
      },
      calculateBalanceAmount(rowData){
        return rowData.debit - rowData.credit;
      },
      updateVuex(){
        //this.updateAccountMove();//actualiza asiento contable antes de guardar y/o al cambiar de tab
        //esto realmente lo usa editForm.vue para actualizar los datos reales de este componente, antes de enviarlos al servidor en el POST
        this.lines = JSON.parse(JSON.stringify(this.internalLines))
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
      journalID: {
            get () { return this.$store.state[this.moduleName].editData.basic.journalID },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
      lines: {
          get () { return this.$store.state[this.moduleName].editData.lines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
      },
      lookup_accounts: {
          get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
      },
      lookup_partners: {
          get () { return this.$store.state[this.moduleName].editData.lookup_partners },
      },

    }
})
</script>
