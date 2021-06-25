<template>
<div style="margin: -16px;">
  <q-toolbar class="no-padding">
    <q-btn label="Nuevo" icon="fas fa-plus" color="primary" flat stretch @click="isListDialog=true" :disable="!allow_row_insert" />
    <q-btn label="Eliminar" icon="fas fa-trash-alt" color="red" flat stretch :disable="maingridSelectedRowKeys.length<=0" @click="removeRows" />
    <q-btn color="primary" flat stretch label="Opciones" icon-right="fas fa-chevron-down" no-caps>
      <q-menu>
        <q-list style="min-width: 100px">

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
    :selected-row-keys.sync="maingridSelectedRowKeys"
    @row-updating="roundInputToSixDigits"
    @row-updated="onRowUpdated"
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
      <DxColumn caption="Cantidad" data-field="quantity" name="quantity" data-type="number" :allow-editing="true" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0 }" :cssClass="userColor=='default'?'bg-grey-2':'bg-grey-9'"/>
      <DxColumn caption="Costo" data-field="price" name="price" data-type="number" :allow-editing="true" alignment="right" :width="100" :format="userMoneyFormat" :editor-options="{ min: 0 }" />
      <DxColumn caption="Subtotal" data-field="lineUntaxed" name="lineUntaxed" data-type="number" :allow-editing="false" alignment="right" :width="120" :format="userMoneyFormat" />
      <DxSummary >
        <DxTotalItem column="invID" summary-type="count"/>
        <DxTotalItem column="lineSubtotal" summary-type="sum" cssClass="q-mr-none" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxTotalItem column="lineUntaxed" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>
        <DxTotalItem column="lineTotal" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>
      </DxSummary>
      
      />
  </DxDataGrid>

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
            :data-source="lookup_items.filter(x=>x.systemType!=3)"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="false"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            key-expr="value"
            :selected-row-keys="listSelectedRowKeys" @selection-changed="onListSelectionChanged"
            >
            <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />
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
              <q-btn icon="fas fa-save" flat color="primary" label="Agregar" @click="addRows" :disable="!listSelectedRowKeys.length>0" />
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
    DxColumnChooser
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
      dialogWH: false, dialogWHValue: null,
      dialogExpected: false, dialogExpectedValue: null,
      dialogTransport: false, dialogTransportValue: null,
      dialogDiscount: false, dialogDiscountValue: null,
      requisicionesSelectedRowKeys: [],
    }
  },
  created(){
    this.internalLines = JSON.parse(JSON.stringify(this.budget));
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
    onListSelectionChanged({ selectedRowKeys, selectedRowsData }) {
      this.listSelectedRowKeys = selectedRowKeys;
    },
    addRows(){
      //GetMaxId
      let max_id = 0
      let temp = null
      if(this.internalLines.length > 0){
        temp = this.getMax(this.internalLines, "lineID");
        max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
      }
      
      //Iterate selected Items
      let newGridData = JSON.parse(JSON.stringify(this.internalLines));
      this.lookup_items.filter(x=>this.listSelectedRowKeys.some(y=>y==x.value)).map(row=>{
        if(row.systemType!=3){ //3=Kit > Cuando es Kit, agrega la lista de materiales
          max_id++;
          //ADD ITEM
          const newRow = {
            lineID: max_id,
            uploaded: false,
            invID: row.value,
            quantity: 0,
            price: row.lastPrice,
            lineSubtotal: 0,
            lineDiscntPrcnt: 0,
            lineDiscntAmount: 0,
            lineUntaxed: 0,
          }
          newGridData.push(newRow)
        }
      })
      this.internalLines = newGridData;
      this.isListDialog = false
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
          //this.internalLines = this.internalLines.filter(x=> (x.uploaded) || (!x.uploaded&&!(this.maingridSelectedRowKeys.some(y=>y==x.lineID)))  );//Devuelve [TODO lo uploaded]  + [TODO lo nuevo - NO seleccionado]
          this.internalLines = this.internalLines.filter(x=> !(this.maingridSelectedRowKeys.some(y=>y==x.lineID))  );//Devuelve [TODO lo uploaded]  + [TODO lo nuevo - NO seleccionado]
          this.maingridSelectedRowKeys = []//limpia selección para evitar problema de referencia a filas que no existan
        })
      }
    },
    updateVuex(){
      //esto realmente lo usa editForm.vue para actualizar los datos reales de este componente, antes de enviarlos al servidor en el POST
      this.budget = JSON.parse(JSON.stringify(this.internalLines))
    },
    listGridShown(){
      this.$refs['dxGridSearchList'].instance.searchByText('');
      this.listSelectedRowKeys=[];
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
            let newTaxAmount = 0;
            x.taxes.map(z=>{
              this.lookup_taxes.filter(xx=>xx.taxID==z).map(xxx=>{
                const newAmount = (           xxx.isPercent ? (  parseFloat(x.lineUntaxed * xxx.factor_base * xxx.factor)  ) : parseFloat(taxConfig.factor)             )
                newTaxAmount = parseFloat(newTaxAmount) + parseFloat(newAmount)
              })
            })
            x.taxAmount = parseFloat(newTaxAmount.toFixed(6));
            x.lineTotal = parseFloat((x.lineUntaxed + x.taxAmount).toFixed(6));
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
      budget: {
          get () { return this.$store.state[this.moduleName].editData.budget },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'budget', value: val}) }
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
