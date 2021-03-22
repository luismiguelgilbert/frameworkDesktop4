<template>
  <div style="margin: -16px;">
    <q-toolbar class="no-padding">
      <q-btn v-if="(allow_payterms)" flat stretch label="Nuevo Compromiso" color="primary" icon="fas fa-plus" @click="dialogOpen=true" />
      <q-space />
      <q-select dense borderless v-model="mostrarFacturas" :options="[{value: 0, label: 'Todas'},{value: 1, label: 'Activas'},{value: 2, label: 'Anuladas'}]" emit-value map-options @input="cambiarFacturasVisibles" />
    </q-toolbar>
    <q-separator />
    <DxDataGrid
      ref="mainviewtableDxDataGrid"
      height="calc(100vh - 170px)"
      width="100%"
      column-resizing-mode="widget"
      :data-source="payterms"
      :allow-column-resizing="true" 
      :allow-column-reordering="true"
      :show-borders="false"
      :show-column-lines="userTableLinesDXcols"
      :show-row-lines="userTableLinesDXrows"
      key-expr="paytermID"
      :selected-row-keys="selectedRowKeys" @selection-changed="onSelectionChanged"
      @row-updating="onRowUpdating"
      >
      <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
      <DxPaging :enabled="true" :page-size="userRowsPerPage" />
      <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
      <DxPager :visible="true" :show-page-size-selector="false" :allowed-page-sizes="allowedPageSizes" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="false" :showPageSizeSelector="false" />
      <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
      <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />
      <DxColumn caption="Tipo" data-field="typeID" data-type="number" :visible="true" :allow-editing="false" alignment="left" width="100" >
        <DxLookup value-expr="value" display-expr="label" :data-source="[ {value: 1, label: 'Contrato'} , {value: 2, label: 'Factura'} ]" />
      </DxColumn>
      <DxColumn caption="Contrato" data-field="contractID" data-type="number" :visible="true" :allow-editing="false" width="200" >
        <DxLookup value-expr="value" display-expr="label" :data-source="lookup_contracts" />
      </DxColumn>
      <DxColumn caption="Fecha" data-field="docDate" data-type="date" :visible="true" :allow-editing="true" format="dd-MMM-yyyy" width="150" />
      <DxColumn caption="Monto" data-field="amount" data-type="number" :visible="true" :allow-editing="false" format="currency" />
      <DxColumn caption="Observaciones" data-field="comments" data-type="string" :visible="true" :allow-editing="true" />
      <DxColumn caption="Anulado" data-field="voided" data-type="boolean" :visible="true" :allow-editing="true" />

      <DxEditing :allow-updating="true" mode="cell" :select-text-on-edit-start="true" start-edit-action="click" /> <!-- me gustan: cell, row, popup -->
      <DxSummary>
        <DxTotalItem
          column="amount"
          summary-type="sum"
          value-format="currency"
        />
      </DxSummary>
  
    </DxDataGrid>

  <q-dialog v-model="dialogOpen" @show="clearFormData">
    <q-card class="q-pa-md">
      <q-form >
        <div class="row">
          <q-toggle v-model="newRecord.voided" color="red" label="Anulado?" left-label icon="fas fa-disable" class="col-md-4 offset-md-8" />
        </div>
        
        

        <q-select class="q-pb-md"
          placeholder="Seleccione el Tipo de Compromiso (*)" label="Forma de Pago (*)" filled
          filled v-model="newRecord.typeID" map-options emit-value 
          :options="[{value: 1, label: 'Contrato'},{value: 2, label: 'Factura'}]"  />
        
        
        <q-select class="q-pb-md" v-if="newRecord.typeID==1"
          placeholder="Seleccione el Contrato que cubre este caso (*)" label="Contrato (*)" filled
          filled v-model="newRecord.contractID" map-options emit-value 
          :options="lookup_contracts.filter(x=>x.customerID==customerID)"  />

        
        <q-input v-if="newRecord.typeID==2"
          ref="docDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          mask="date" :rules="['date']"
          placeholder="Ingrese la Fecha de Factura" label="Fecha de Factura" filled
          v-model="newRecord.docDate"
          >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="qDateProxy_docDate" transition-show="scale" transition-hide="scale">
                <q-date v-model="newRecord.docDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
        </q-input>
        
        

        <q-input class="q-pb-md" v-if="newRecord.typeID==2"
          placeholder="Escriba el Monto de esta Factura" label="Monto de Factura" filled
          v-model="newRecord.amount" type="number" :min="0"
          >
          <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
        </q-input>
        
        
        <q-input class="q-pb-md"
          placeholder="Observaciones" label="Observaciones" filled
          v-model="newRecord.comments" type="textarea"
          >
          <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
        </q-input>

        <q-btn color="positive" label="Agregar" icon="fas fa-plus" class="full-width" @click="addRow" />
        
      </q-form>
    </q-card>
  </q-dialog>

</div>
</template>



<script>
/*
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
*/
  
import { DxDataGrid, DxColumn, DxScrolling, DxPaging, DxPager, DxLookup, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxSummary, DxTotalItem } from 'devextreme-vue/data-grid';

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxDataGrid,
        DxColumn,
        DxScrolling,
        DxPager,
        DxLookup,
        DxSorting,
        DxPaging,
        DxHeaderFilter,
        DxSelection,
        DxEditing,
        DxSummary, 
        DxTotalItem
    },
    data () {
        return {
          selectedRowKeys: []
          ,filterString: ''
          ,dialogOpen: false
          ,newRecord: {
              typeID: 1
            ,contractID: null
            ,docDate: ''
            ,amount: 0
            ,comments: ''
            ,voided: false
            ,estado: false
          },
          mostrarFacturas: 1,
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
      onSelectionChanged({ selectedRowKeys, selectedRowsData }) {
          this.selectedRowKeys = selectedRowKeys;
      },
      deleteSelectedRows(){
        if(this.selectedRowKeys.length > 0){
          this.$q.dialog({ 
              title: 'Confirmación'
              ,persistent: false
              ,message: 'Desea eliminar las líneas seleccionadas?'
              ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true, color: 'red', flat: true }
              ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
          }
          ).onOk(() => {
              let newRows = JSON.parse(JSON.stringify(this.payterms.filter(x=>!this.selectedRowKeys.some(y=>y==x.paytermID))))
              this.payterms = newRows;
              this.selectedRowKeys = []//limpia selección para evitar problema de referencia a filas que no existan
          })
        }
      },
      onRowUpdating(e){
          try{
              e.cancel = true; //evita cambios
              e.component.cancelEditData(); //cancela cambios para que no quede ícono de revertir del dxdatagrid
              let newRows = JSON.parse(JSON.stringify(this.payterms)) //copia
              //toma nueva data y la "sobrepone" sobre la fila (assign sirve para "sobreponer" la data)

              /*
              console.dir('estoy aquí')
              console.dir(e)
              console.dir(newRows)
              */
              newRows.filter(x=>x.paytermID==e.key).map(fila=>{
                  fila = Object.assign(fila, e.newData)
                  return fila
              })
              /*newRows.filter(x=>x[this.tabRecord.tabConfig.keyColumn]==e.key).map(fila=>{
                  fila = Object.assign(fila, e.newData)
                  return fila
              })*/
              this.payterms = newRows;
          }catch(ex){
              console.error(ex.message)
          }
      },

      updateRow(newVal, colName, row){
        if(this.editMode || (!this.editMode&&this.allow_payterms)){
          let newRows = JSON.parse(JSON.stringify(this.payterms))
          newRows.find(x=>x.paytermID==row.paytermID)[colName] = newVal
          this.payterms = newRows
        }
      },
      addRow(){
        //Validaciones
        if(this.newRecord.typeID==1){//if contract, check if value if contract exists
          if(!(this.newRecord.contractID>0)){
            this.$q.notify({message: 'No ha seleccionado un contrato',color: 'red', timeout: 1000})
            return
          }
          if(!(this.newRecord.contractID>0&&this.lookup_contracts.some(x=>x.value==this.newRecord.contractID&&x.customerID==this.customerID))){
            this.$q.notify({message: 'No ha seleccionado un contrato correspondiente al cliente',color: 'red', timeout: 1000})
            return
          }
        }
        if(this.newRecord.typeID==2){//if invoice
          if(!(this.newRecord.docDate)){
            this.$q.notify({message: 'No ha seleccionado una fecha',color: 'red', timeout: 1000})
            return
          }
          if(!(this.newRecord.amount>0)){
            this.$q.notify({message: 'No ha registrado el monto',color: 'red', timeout: 1000})
            return
          }
        }
        
        let max_id = 1
        if(this.payterms.length > 0){
          let temp = this.getMax(this.payterms, "paytermID");
          max_id = parseInt(temp.paytermID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.payterms))
        newRows.push({
           paytermID: max_id
          ,typeID: this.newRecord.typeID
          ,contractID: this.newRecord.typeID=1?this.newRecord.contractID:null
          ,docDate: this.newRecord.typeID=2?this.newRecord.docDate:null
          ,amount: this.newRecord.typeID=2?this.newRecord.amount:null
          ,comments: this.newRecord.comments
          ,voided: this.newRecord.voided
          ,estado: this.newRecord.estado
        })
        this.payterms = newRows
        this.dialogOpen = false
      },
      clearFormData(){
        this.newRecord.voided = false;
        this.newRecord.typeID = 2;
        this.newRecord.contractID = null;
        this.newRecord.docDate = null;
        this.newRecord.amount = 0;
        this.newRecord.comments = null;
      },
      cambiarFacturasVisibles(){
        if (this.mostrarFacturas == 0) {
          this.$refs.mainviewtableDxDataGrid.instance.clearFilter();
        }
        if (this.mostrarFacturas == 1) {
          this.$refs.mainviewtableDxDataGrid.instance.filter(['voided', '=', false]);
        }
        if (this.mostrarFacturas == 2) {
          this.$refs.mainviewtableDxDataGrid.instance.filter(['voided', '=', true]);
        }
      }
    },
    mounted(){
      this.cambiarFacturasVisibles();
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
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
        allow_payterms: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_payterms').map(y=>{
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
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        //custom security
        allow_payterms: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_payterms').value }, },
        //custom security end
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        payterms: {
            get () { return this.$store.state[this.moduleName].editData.payterms },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPayterms', val) }
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'payterms', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_contracts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_contracts },
        },
        customerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.customerID },
        },
    }
})
</script>
