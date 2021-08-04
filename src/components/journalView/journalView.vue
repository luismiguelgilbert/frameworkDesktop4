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
      <DxColumn caption="Debe" data-field="debit" name="debit" data-type="number" :allow-editing="false" alignment="right" :width="120" :minWidth="120" :format="userMoneyFormat" />
      <DxColumn caption="Haber" data-field="credit" name="credit" data-type="number" :allow-editing="false" alignment="right" :width="120" :minWidth="120" :format="userMoneyFormat" />
      <DxColumn caption="Balance" data-field="calculated" name="calculated" data-type="number" :allow-editing="false" alignment="right" :width="110" :minWidth="110" :format="userMoneyFormat" :calculate-cell-value="calculateBalanceAmount" :visible="false" />
      
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
      
      
      
      accLineID
         -->
          
      <DxSummary >
        <DxTotalItem column="invID" summary-type="count"/>
        <DxTotalItem column="debit" summary-type="sum" cssClass="q-mr-none" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxTotalItem column="credit" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxTotalItem showInColumn="comments" column="calculated" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>

        <DxGroupItem name="totalDebit" :show-in-group-footer="false" :align-by-column="true" column="debit" summary-type="sum"> <DxValueFormat type="#.00" /> </DxGroupItem>
        <DxGroupItem name="totalCredit" :show-in-group-footer="false" :align-by-column="true" column="credit" summary-type="sum"> <DxValueFormat type="#.00" /> </DxGroupItem>
      </DxSummary>
      <DxSortByGroupSummaryInfo  summary-item="totalCredit" sort-order="desc" />
      <DxSortByGroupSummaryInfo  summary-item="totalDebit" sort-order="desc" />
      
      
      />
  </DxDataGrid>

</div>

</template>


<script>



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
        },
        calculateBalanceAmount(rowData){
          return rowData.debit - rowData.credit;
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
        
    },
    
})
</script>
