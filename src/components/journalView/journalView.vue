<template>
<div style="margin: -16px;">
    <div class="row q-col-gutter-xs q-ma-md">
        <q-input class="col-sm-12 col-md-4"
            label="Asiento Contable #"  filled readonly
            :value="accountHeader.accMoveID"
            >
                <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
        </q-input>
        <q-input class="col-sm-12 col-md-4" 
            label="Fecha del Asiento (aaaa/mm/dd)"  filled readonly
            :value="accountHeader.accMoveDateNew" 
            >
                <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
                <template v-slot:append v-if="accountHeader.accMoveDate&&accountHeader.accMoveDateNew!=accountHeader.accMoveDate"><q-icon name="fas fa-edit" color="red" :title="`Modificado \n Fecha Original: ${accountHeader.accMoveDate}`" /></template>
        </q-input>
      <q-input class="col-sm-12 col-md-4"
          label="Tipo de Diario"  filled readonly
          v-model="accountHeader.journalName"
          >
            <template v-slot:prepend><q-icon name="fas fa-book" /></template>
      </q-input>
      
    </div>

    <q-separator />

  <!-- accMoveGrouped?accountLinesGrouped:accountLines -->
  <DxDataGrid
    ref="dxgrid"
    height="calc(100vh - 212px)"
    width="100%"
    column-resizing-mode="widget"
    :data-source="accountLines"
    :allow-column-resizing="true" 
    :allow-column-reordering="true"
    :show-borders="true"
    :show-column-lines="userTableLinesDXcols"
    :show-row-lines="userTableLinesDXrows"
    :stateStoring="{ ignoreColumnOptionNames: [] }"
    key-expr="accLineID"
    >
      <DxGrouping :auto-expand-all="false"/>
      <DxColumnChooser  mode="select" />
      <DxColumnFixing :enabled="true" :texts="{fix:'Fijar', unfix: 'Soltar'}" />
      <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
      <DxScrolling mode="virtual" :useNative="false" showScrollbar="always" /> <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
      
      <DxColumn caption="accLineID" data-field="accLineID" name="accLineID" data-type="number" :allow-editing="false" alignment="left" :visible="false" />
      <DxColumn caption="Cuenta Contable" data-field="account_id" name="account_id" data-type="number" :allow-editing="false" alignment="left" :minWidth="200"
        :group-index="0">
        <DxLookup value-expr="value" :display-expr="(row)=>{return row.code_es + ' - ' + row.label }" :data-source="lookup_accounts" />
      </DxColumn>
      <DxColumn caption="Observaciones" data-field="comments" name="comments" data-type="string" :allow-editing="true" alignment="left" :minWidth="200" :visible="true" />
      <DxColumn caption="Debe" data-field="debit" name="debit" data-type="number" :allow-editing="false" alignment="right" :width="120" :format="userMoneyFormat" />
      <DxColumn caption="Haber" data-field="credit" name="credit" data-type="number" :allow-editing="false" alignment="right" :width="120" :format="userMoneyFormat" />
      
      <!--
      <DxColumn caption="Cantidad" data-field="quantity" name="quantity" data-type="number" :allow-editing="true" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0 }"/>
      <DxColumn caption="Precio" data-field="price" name="price" data-type="number" :allow-editing="true" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0 }" />
      <DxColumn caption="Suman" data-field="lineSubtotal" name="lineSubtotal" data-type="number" :allow-editing="false" alignment="right" :width="120" :format="userMoneyFormat" />
      <DxColumn caption="Descuento %" data-field="lineDiscntPrcnt" name="lineDiscntPrcnt" data-type="number" :allow-editing="true" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0, max:100 }"  />
      <DxColumn caption="Descuento $" data-field="lineDiscntAmount" name="lineDiscntAmount" data-type="number" :allow-editing="false" alignment="right" :width="100" :format="userMoneyFormat" :visible="false" />
      <DxColumn caption="Subtotal" data-field="lineUntaxed" name="lineUntaxed" data-type="number" :allow-editing="false" alignment="right" :width="120" :format="userMoneyFormat"
         />
      
      
      
      <DxColumn caption="Fecha Entrega" data-field="expectedDate" name="expectedDate" data-type="date" :allow-editing="true" alignment="left" :width="120" format="dd-MMM-yyyy" :visible="true" />
      <DxColumn caption="Tipo Entrega" data-field="transportTypeID" name="transportTypeID" data-type="number" :allow-editing="true" alignment="left" :width="200" :visible="false" >
        <DxLookup value-expr="value" display-expr="label" :data-source="lookup_transports" />
      </DxColumn>
      <DxColumn caption="# Requisición" data-field="mktPRHeader" name="mktPRHeader" data-type="number" :allow-editing="false" alignment="right" :width="120" :visible="false" cssClass="text-primary" />
      <DxColumn caption="# Req. Línea" data-field="mktPRlineID" name="mktPRlineID" data-type="number" :allow-editing="false" alignment="right" :width="120" :visible="false" cssClass="text-primary" />
      
      
      
      
         -->
      <DxSummary >
        <DxTotalItem column="invID" summary-type="count"/>
        <DxTotalItem column="debit" summary-type="sum" cssClass="q-mr-none" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxTotalItem column="credit" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxGroupItem :show-in-group-footer="false" :align-by-column="true" column="debit" summary-type="sum"> <DxValueFormat type="#.00" /> </DxGroupItem>
        <DxGroupItem :show-in-group-footer="false" :align-by-column="true" column="credit" summary-type="sum"> <DxValueFormat type="#.00" /> </DxGroupItem>
      </DxSummary>
      
      
      />
  </DxDataGrid>
    
  <!--  <q-table
        ref="mainTable"
        :data="accMoveGrouped?accountLinesGrouped:accountLines"
        table-style="min-height: calc(100vh - 233px); max-height: calc(100vh - 233px)"
        row-key="lineID"
        hide-bottom
        dense flat
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        dense
        :filter="filterString"
        :columns="[
          //{ name: 'stockID', required: true, label: 'ID', align: 'left', field: row => row.stockID, sortable: true },
          //{ name: 'lineID', required: true, label: 'línea', align: 'right', field: row => row.lineID, sortable: false, style: 'min-width: 150px;' },
          { name: 'account_id', required: true, label: 'Cuenta Contable', align: 'left', field: row => row.account_id, sortable: true, style: 'min-width: 100px;' },
          { name: 'debit', required: true, label: 'DEBE', align: 'right', field: row => row.debit, sortable: true, style: 'min-width: 200px;' },
          { name: 'credit', required: true, label: 'HABER', align: 'right', field: row => row.credit, sortable: true, style: 'max-width: 70px;', headerStyle: 'padding-right: 20px;' },
          { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true, headerStyle: 'padding-right: 20px;' },
          
          //{ name: 'whID', required: true, label: 'Bodega', align: 'right', field: row => row.whID, sortable: true },
          //{ name: 'prjID', required: true, label: 'Centro de Costo?', align: 'right', field: row => row.prjID, sortable: true },
          //{ name: 'transportTypeID', required: true, label: 'Entrega?', align: 'right', field: row => row.transportTypeID, sortable: true },
        ]"
    >

    <template v-slot:body="props">
      <q-tr :props="props" v-if="props.row.account_id>0" >
        <q-td key="account_id" :props="props" :tabindex="(props.key*10)+1" >
          {{lookup_accounts.find(x=>x.value==props.row.account_id).code_es}} - {{lookup_accounts.find(x=>x.value==props.row.account_id).label}}
        </q-td>
        <q-td key="debit" :props="props" >
          {{ props.row.debit.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="credit" :props="props" >
          {{ props.row.credit.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="comments" :props="props" >
          {{ props.row.comments }}
        </q-td>
      </q-tr>
    </template>

    <template v-slot:bottom-row>
        <q-tr>
          <q-td class="text-right text-subtitle2 text-primary" >
            Suma:
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            {{accountLines.reduce((total,item)=>{return total + item.debit}, 0).toFixed(userMoneyFormat)}}
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            {{accountLines.reduce((total,item)=>{return total + item.credit}, 0).toFixed(userMoneyFormat)}}
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
          </q-td>
        </q-tr>
        <q-tr></q-tr>
    </template>
  </q-table>
  -->

  
</div>

</template>


<script>
/*
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
*/ 


import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxGroupItem, DxSortByGroupSummaryInfo, DxValueFormat, DxColumnChooser, DxGrouping } from 'devextreme-vue/data-grid';

export default ({
    props: {
        moduleName: { type: String, required: true },
        //accountHeader: { type: Object, required: true },
        //accountLines: { type: Array, required: true },
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
            filterString: '', accMoveGrouped: true
        }
    },
    methods:{
        accountLinesComputed(){
            let resultado = []
            console.dir('calcular accountLinesComputed con ' + this.accMoveGrouped)
            return this.accMoveGrouped?this.accountLines:this.accountLinesGrouped
        }
      /*rowTitleInventory(fila){
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
      },
      clearAll(){
        let newRows = JSON.parse(JSON.stringify(this.lines))
        this.selected.map(x=>{
          newRows.find(y=>y.stockID==x.stockID).['newQuantity']=0
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
        }catch(ex){
          console.error(ex)
        }
      },
      */
    },
    computed:{
        console: () => console,
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
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
        userColor: { get () { return this.$store.state.main.userColor }  },
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
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        accountHeader: {
            get () { return this.$store.state[this.moduleName].editData.accountHeader },
        },
        accountLines: {
            get () { return this.$store.state[this.moduleName].editData.accountLines },
        },
        accountLinesGrouped:{
            get () { 
              let resultado = [];
              this.accountLines.map(x=>{
                if(resultado.some(y=>y.account_id==x.account_id)){
                  resultado.find(y=>y.account_id==x.account_id).debit += x.debit
                  resultado.find(y=>y.account_id==x.account_id).credit += x.credit
                }else{
                  resultado.push({
                     account_id: x.account_id
                    ,debit: x.debit
                    ,credit: x.credit 
                  })
                }
              })
              return resultado;
            }
        },
        /*
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        
        
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        accountLines: {
            get () { return this.$store.state[this.moduleName].editData.accountLines },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        accMoveID: {
            get () { 
              let resultado = 0;
              try{
                resultado = this.$store.state[this.moduleName].editData.accountLines[0].accMoveID
              }catch(ex){}
              return resultado;
            }
        },
        moveDate: {
            get () { 
              let resultado = '';
              try{
                resultado = this.$store.state[this.moduleName].editData.accountLines[0].moveDate
              }catch(ex){}
              return resultado;
            }
        },
        
        journalName: {
            get () { 
              let resultado = '';
              try{
                resultado = this.$store.state[this.moduleName].editData.accountLines[0].journalName
              }catch(ex){}
              return resultado;
            }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
        partner_account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.partner_account_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partner_account_id', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        */
    },
    /*watch: { 
        accountMove: function(newVal, oldVal) { // update component display value when changed happend from outside component (e.g. programatically)
            console.dir('component data has changed')
            this.componentData=newVal
        }
    }*/
})
</script>
