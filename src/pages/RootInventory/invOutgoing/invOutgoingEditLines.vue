<template>
<div style="margin: -16px;">
  
  <q-toolbar class="no-padding">
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
                <q-item clickable v-ripple v-close-popup :disable="maingridSelectedRowKeys.length<=0 || editStatus.editMode=='edit'" @click="receiveAll">
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-people-carry" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Entregar Todo</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-ripple v-close-popup :disable="maingridSelectedRowKeys.length<=0 || editStatus.editMode=='edit'" @click="clearAll" >
                  <q-item-section avatar>
                      <q-icon :color="userColor=='blackDark'?'white':'grey-7'" name="fas fa-broom" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label>Limpiar Todo</q-item-label>
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
    width="100%"
    column-resizing-mode="widget"
    :data-source="internalLines"
    :allow-column-resizing="true" 
    :allow-column-reordering="true"
    :show-borders="true"
    :show-column-lines="userTableLinesDXcols"
    :show-row-lines="userTableLinesDXrows"
    :stateStoring="{ ignoreColumnOptionNames: [] }"
    key-expr="stockID"
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
      <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
      <DxScrolling mode="virtual" :useNative="false" showScrollbar="always" />
      
      <DxColumn caption="stockID" data-field="stockID" name="stockID" data-type="number" :allow-editing="false" alignment="left" :visible="false" />
      <DxColumn caption="Origen" data-field="mktTypeID" name="mktTypeID" data-type="number" :allow-editing="false" alignment="left" :width="70">
        <DxLookup value-expr="value" display-expr="label" :data-source="lookup_mktTypes" />
      </DxColumn>
      <DxColumn caption="# Origen" data-field="headerID" name="headerID" data-type="number" :allow-editing="false" alignment="left" :visible="true" :width="80" />
      <DxColumn caption="# Origen Línea" data-field="lineID" name="lineID" data-type="number" :allow-editing="false" alignment="left" :visible="false" :width="70" />
      <DxColumn caption="# Item" data-field="invID" name="invID" data-type="number" :allow-editing="false" alignment="left" :visible="false"  />
      <DxColumn caption="Item" data-field="invName" name="invName" data-type="string" :allow-editing="false" alignment="left" :visible="true" :width="200" />
      <DxColumn caption="Código" data-field="internal_code" name="internal_code" data-type="string" :allow-editing="false" alignment="left" :visible="false" />
      <DxColumn caption="Grupo" data-field="groupName" name="groupName" data-type="string" :allow-editing="false" alignment="left" :visible="false" />
      <DxColumn caption="Unidad" data-field="uomName" name="uomName" data-type="string" :allow-editing="false" alignment="left" :visible="false" />
      <DxColumn caption="Marca" data-field="brandName" name="brandName" data-type="string" :allow-editing="false" alignment="left" :visible="false" />
      
      <DxColumn caption="Pedido" data-field="quantity" name="quantity" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="80" />
      <DxColumn caption="Entregado" data-field="quantityRcvd" name="quantityRcvd" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="80" />
      <DxColumn caption="Entregado Esta Orden" data-field="quantityRcvdThisMove" name="quantityRcvdThisMove" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="150" />
      <DxColumn caption="Cancelado" data-field="quantityCancel" name="quantityCancel" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="90"   />
      <DxColumn caption="Pendiente" data-field="quantityOpen" name="quantityOpen" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="90"   />
      <DxColumn caption="Disponible" data-field="quantityAvailable" name="quantityAvailable" data-type="number" :allow-editing="false" alignment="right" :visible="true" :width="90"   />
      <DxColumn caption="Entregar" data-field="newQuantity" name="newQuantity" data-type="number" :allow-editing="true" alignment="center" :visible="true" :cssClass="userColor=='default'?'bg-grey-2':'bg-grey-9'" :minWidth="125" :editor-options="{ min:0 }" />
      />
  </DxDataGrid>

</div>

</template>

<script>
/*
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
*/
import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser } from 'devextreme-vue/data-grid';

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
    DxLookup,
    DxSummary,
    DxTotalItem,
    DxValueFormat,
    DxColumnChooser,
  },
  data () {
      return {
        maingridSelectedRowKeys: [],
        internalLines: [],
        internalAccountLines: [],
        /*myQDateLocale: {
          days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
          daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
          months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
          monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
          firstDayOfWeek: 1
        },*/
        filterString: ''
      }
  },
  mounted(){
    this.internalLines = JSON.parse(JSON.stringify(this.lines));
    this.internalAccountLines = JSON.parse(JSON.stringify(this.accountLines));
    this.$refs['dxgrid'].instance.option("stateStoring.ignoreColumnOptionNames", []);
    let savedState = this.gridState.find(x=>x.gridName==[this.moduleName+'_lines']);
    if(savedState&&savedState.gridState){
      let estado = JSON.parse(savedState.gridState)
      this.$refs['dxgrid'].instance.state(estado);
    }
  },
  methods:{
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
      this.updateAccountMove();
    },
    openColumnSelector(){
      this.$refs['dxgrid'].instance.showColumnChooser();
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
      if (e.parentType === 'dataRow' && e.dataField === 'newQuantity') {
        e.editorOptions.disabled = e.row.data.newQuantity_isEditDisabled
        e.editorOptions.max = e.row.data.quantityOpen
      }
    },
    updateAccountMove(){
        let newRowsAccount = []
        let newAccLineID = 0
        //#region DEBE
        this.internalLines.filter(x=>x.newQuantity>0).map(row=>{
          newAccLineID++;
          newRowsAccount.push({
              accLineID: newAccLineID
              ,lineID: row.lineID
              ,taxLineID: 0
              ,account_id: row.debit_account_id
              ,partnerID: row.partnerID
              ,debit: parseFloat(parseFloat(row.newQuantity * row.price).toFixed(6))
              ,credit: 0
              ,invID: row.invID
              ,prjID: row.prjID
              ,stockID: row.stockID
              ,mktLineID: row.lineID
              ,comments: row.invName
              ,mktTypeID: row.mktTypeID
              ,headerID: row.headerID
              ,lineID: row.lineID
          })
        })
        //#endregion DEBE
        //#region HABER
        this.internalLines.filter(x=>x.newQuantity>0).map(row=>{
          newAccLineID++;
          newRowsAccount.push({
              accLineID: newAccLineID
              ,lineID: row.lineID
              ,taxLineID: 0
              ,account_id: row.credit_account_id
              ,partnerID: row.partnerID
              ,debit: 0
              ,credit: parseFloat(parseFloat(row.newQuantity * row.price).toFixed(6))
              ,invID: row.invID
              ,prjID: row.prjID
              ,stockID: row.stockID
              ,mktLineID: row.lineID
              ,comments: row.invName
              ,mktTypeID: row.mktTypeID
              ,headerID: row.headerID
              ,lineID: row.lineID
          })
        })
        //#endregion HABER
        this.internalAccountLines = newRowsAccount
    },
    updateVuex(){
      //esto realmente lo usa editForm.vue para actualizar los datos reales de este componente, antes de enviarlos al servidor en el POST
      this.lines = JSON.parse(JSON.stringify(this.internalLines))
      this.accountLines = JSON.parse(JSON.stringify(this.internalAccountLines))
    },
    receiveAll(){
      this.internalLines.filter(x=>this.maingridSelectedRowKeys.some(y=>y==x.stockID)).map(row=>{
        if(row.quantityOpen <= row.quantityAvailable){
          row.newQuantity = row.quantityOpen
        }else{
          row.newQuantity = row.quantityAvailable
        }
      })
      this.updateAccountMove();
    },
    clearAll(){
      this.internalLines.filter(x=>this.maingridSelectedRowKeys.some(y=>y==x.stockID)).map(row=>{
        row.newQuantity = 0
      })
      this.updateAccountMove();
    },
  },
  computed:{
      userCode: { get () { return this.$store.state.main.userCode } },
      userCompany: { get () { return this.$store.state.main.userCompany } },
      userColor: { get () { return this.$store.state.main.userColor }  },
      userTableLines: { get () { return this.$store.state.main.userTableLines } },
      userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
      userTimeFormat: { get () { return this.$store.state.main.userTimeFormat }  },
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
      gridState: {
          get () { 
            return this.$store.state[this.moduleName].editData.gridState
          },
      },
      editStatus: {
          get () { return this.$store.state[this.moduleName].editStatus },
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
      lookup_mktTypes: {
          get () { return this.$store.state[this.moduleName].editData.lookup_mktTypes },
      },

      editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
      apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
      lines: {
        get () { return this.$store.state[this.moduleName].editData.lines },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
      },
      accountLines: {
        get () { return this.$store.state[this.moduleName].editData.accountLines },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'accountLines', value: val}) }
      },
      sys_user_color: {
          get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
      },
      lookup_sexo: {
          get () { return this.$store.state[this.moduleName].editData.lookup_sexo },
      },
  },
  watch: {
      lines: function (val) {
        this.internalLines = JSON.parse(JSON.stringify(this.lines))
        this.updateAccountMove();
      },
    }
})
</script>
