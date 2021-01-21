<template>
<div>
  <!--:virtual-scroll="pagination.rowsPerPage==0||pagination.rowsPerPage>100?true:false"-->
    <q-table
      ref="mainTable"
      square
      :data="dataRows"
      :columns="columnsUser"
      :dense="userTableDense"
      :color="userColor=='blackDark'?undefined:'primary'"
      :separator="userTableLines"
      selection="multiple"
      :row-key="columnsSystem.find(x=>x.is_key).field"
      rows-per-page-label= "Registros"
      no-data-label= "No hay registros"
      no-results-label= "No se encontraron registros"
      loading-label= "Cargando datos"
      :rows-per-page-options="[17,27,50,100,250,1000, 0]"
      :class="tableLastLine"
      :table-style="userTableDense?'min-height: calc(100vh - 135px); max-height: calc(100vh - 135px)':'min-height: calc(100vh - 153px); max-height: calc(100vh - 153px)'"
      :selected.sync="selectedRows"
      :loading="loadingData"
      :pagination.sync="pagination"
      @request="requestData"
      binary-state-sort
      :virtual-scroll="true"
      >
      <template v-slot:body-cell="props" >
        <q-td :props="props" class="text-weight-medium ellipsis no-padding" :title="props.value" >
          
          <q-menu touch-position context-menu :content-class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'">
            <q-list separator style="min-width: 100px">
              <q-item clickable v-close-popup  v-ripple @click="()=>{ let newProps = JSON.parse(JSON.stringify(props)); newProps['value']= props.row[columnsSystem.find(x=>x.is_required).field]; openEditForm(newProps, false)}" title="Abrir">
                <q-item-section avatar>
                  <q-icon color="primary" name="fas fa-external-link-alt" />
                </q-item-section>
                <q-item-section>Abrir Registro {{props.row[columnsSystem.find(x=>x.is_required).field]}}</q-item-section>
              </q-item>
              <q-item v-if="allow_insert" clickable v-close-popup  v-ripple @click="()=>{ let newProps = JSON.parse(JSON.stringify(props)); newProps['value']= props.row[columnsSystem.find(x=>x.is_required).field]; openEditForm(newProps, true)}" title="Copiar">
                <q-item-section avatar>
                  <q-icon color="primary" name="fas fa-copy" />
                </q-item-section>
                <q-item-section>Copiar Registro {{props.row[columnsSystem.find(x=>x.is_required).field]}}</q-item-section>
              </q-item>
              <!--Addition Modules Options-->
              <q-item v-if="tableContextMenu" 
                clickable v-close-popup v-ripple
                @click="()=>{ 
                    let newProps = JSON.parse(JSON.stringify(props)); 
                    newProps['value']= props.row[columnsSystem.find(x=>x.is_required).field]; 
                    runContextCommand(menu.menuAction, newProps)
                  }"
                :title="menu.menuTitle"
                v-for="menu in tableContextMenu" :key="menu.id">
                <q-item-section avatar>
                  <q-icon color="primary" :name="menu.menuIcon" />
                </q-item-section>
                <q-item-section>{{menu.menuText}} {{props.row[columnsSystem.find(x=>x.is_required).field]}}</q-item-section>
              </q-item>
              
            </q-list>
          </q-menu>
          <q-btn v-if="props.col.is_key" flat color="primary" dense size="sm" 
            @click="()=>{ let newProps = JSON.parse(JSON.stringify(props)); newProps['value']= props.row[columnsSystem.find(x=>x.is_required).field]; openEditForm(newProps, false)}"
            >
            <u>{{props.value}}</u>
          </q-btn>
          <div v-if="!props.col.is_key&&props.col.cellComponent=='estado'" class="q-pl-xs">
            <q-item dense class="no-padding" style="min-height: 20px !important;">
              <q-item-section side class="q-pl-none q-pr-xs" ><q-icon :color="cellAttribute(props.col,'color', props.value)" name="fas fa-circle" size="0.8rem" /></q-item-section>
              <q-item-section><q-item-label>{{props.value}}</q-item-label></q-item-section>
            </q-item>
          </div>
          <div v-if="!props.col.is_key&&props.col.cellComponent=='image'" >
            <q-avatar size="20px">
                <q-icon v-if="props.value == null" name="fas fa-camera" :color="userColor=='blackDark'?'white':'grey-7'" />
                <q-img v-if="props.value != null" :src="$q.sessionStorage.getItem('serverFilesPath') + props.value">
                  <q-tooltip anchor="top left" self="top left">
                    <q-img  style="width: 250px" :src="$q.sessionStorage.getItem('serverFilesPath') + props.value" />
                  </q-tooltip>
                </q-img>
            </q-avatar>
          </div>
          <div v-if="!props.col.is_key&&props.col.cellComponent=='div'" :style="shouldWrapCellText?'white-space: normal':undefined" class="q-pl-xs q-pr-sm">
            <span v-html="props.value"></span>
          </div>
          <div v-if="!props.col.is_key&&props.col.cellComponent=='bool'" >
            <q-icon :color="cellAttribute(props.col,'color', props.value)" name="fas fa-circle" size="0.8rem" />
          </div>
          <div v-if="!props.col.is_key&&props.col.ux_type=='open'&&shouldHideTableButtons==false" style="max-width: 60px;">
            <q-btn flat size="xs" round icon="fas fa-external-link-alt"  color="primary" @click="()=>{ let newProps = JSON.parse(JSON.stringify(props)); newProps['value']= props.row[columnsSystem.find(x=>x.is_required).field]; openEditForm(newProps, false)}" title="Abrir" />
            <q-btn v-if="allow_insert" flat round size="xs" icon="fas fa-copy" class="cursor-pointer" color="primary" @click="()=>{ let newProps = JSON.parse(JSON.stringify(props)); newProps['value']= props.row[columnsSystem.find(x=>x.is_required).field]; openEditForm(newProps, true)}" title="Copiar" />
          </div>
        </q-td>
      </template>
      <template v-slot:bottom-row >
        <q-tr>
        </q-tr>
      </template>
    </q-table>
    
</div>
</template>

<style lang="scss">
  .q-table__bottom{ padding: 0px; padding-left: 10px; padding-right: 10px; }
  .q-virtual-scroll__padding{ visibility: hidden;}
  .q-table thead tr:first-child th{ position: sticky; top: 0; opacity: 1; z-index: 1; padding-left: 5px; font-weight: bolder; color: $primary; margin-bottom: 5px; }
  .my-sticky-header-table{
    .q-table thead tr:first-child th{ background-color: white }
  }
  .my-sticky-header-table-LastLine{
    .q-table thead tr:first-child th{ background-color: white }
    .q-table td{ border-bottom-width: 1px }
  }
  .my-sticky-header-table-dark{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
  }
  .my-sticky-header-table-dark-LastLine{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
    .q-table td{ border-bottom-width: 1px }
  }
</style>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
//import { debounce } from 'quasar';

export default({
  name: 'tableComponent',
  props: {
      moduleName: { type: String , required: true },
      moduleEditName: { type: String , required: true },
  },
  data () {
    return {
      dataRows: [], router: this.$router,
      //selectedRows: [],
    }
  },
  computed:{
    loadingData: {
        get () { return this.$store.state[this.moduleName].loadingData },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'loadingData', value: val}) }
    },
    allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
    allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
    allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
    allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
    allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
    userColor: { get () { return this.$store.state.main.userColor }  },
    //computedTableHeaderBG{ get () { return this.$store.state.main.userColor }  },
    computedTableHeaderBG: { get () { if(this.$store.state.main.userColor=='default'){return 'white'} else{return '$grey-10'} } },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    userCode: { get () { return this.$store.state.main.userCode } },
    userCompany: { get () { return this.$store.state.main.userCompany } },
    userTableLines: { get () { return this.$store.state.main.userTableLines } },
    userTableDense: { get () { return this.$store.state.main.userTableDense } },
    shouldHideTableButtons: { get () { return this.$store.state.main.shouldHideTableButtons } },
    shouldWrapCellText: { get () { return this.$store.state.main.shouldWrapCellText } },
    tableLastLine: {
      get () { 
        let resultado = ''
        if(this.userColor=='blackDark'){
          if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
          {
            resultado = 'my-sticky-header-table-dark-LastLine bg-grey-10 '
          }else{
            resultado = 'my-sticky-header-table-dark bg-grey-10 '
          }
        }
        if(this.userColor!='blackDark'){
          if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
          {
            resultado = 'my-sticky-header-table-LastLine '
          }else{
            resultado = 'my-sticky-header-table '
          }
        }
        return resultado
      }
    },
    pagination: {
      get () { return this.$store.state[this.moduleName].pagination },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'pagination', value: val}) }
    },
    columnsUser: {
      //get () { return this.$store.state[this.moduleName].columnsUser.filter(x=>x.is_visible) },
      get () {
        let newResult = this.$store.state[this.moduleName].columnsUser.filter(x=>x.is_visible)
        newResult.push({
          align: 'right'
          ,cellComponent: 'open'
          ,db_column: 'open'
          ,field: 'open'
          ,isOpenButton: false
          ,is_filterable: false
          ,is_key: false
          ,is_required: false
          ,is_searchable: false
          ,is_visible: false//debe ser false
          ,label: ''
          ,name: 'open'
          //,sortIndex: (...)
          //,sortable: (...)
          ,ux_type: 'open'
        })

        

        return newResult
      },
    },
    columnsSystem: {
      //get () { return this.$store.state[this.moduleName].columnsUser },
      get () { return this.$store.state[this.moduleName].columnsSystem },
    },
    currentFilter: {
      get () {  return this.$store.state[this.moduleName].currentFilter; }
    },
    currentFilterSearch: {
        get () { return this.$store.state[this.moduleName].currentFilterSearch },
    },
    selectedRows: {
      get () { return this.$store.state[this.moduleName].selectedRows },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'selectedRows', value: val}) }
    },
    editRecord: {
      get () { return this.$store.state[this.moduleName].editRecord },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editRecord', value: val}) }
    },
    editMode: {
      get () { return this.$store.state[this.moduleName].editMode },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editMode', value: val}) }
    },
    tableContextMenu: {
      get () { return this.$store.state[this.moduleName].tableContextMenu },
    },
    lastRecord:{
      get () { return this.$store.state[this.moduleName].lastRecord },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'lastRecord', value: val}) }
    },
    
  },
  mounted(){
    this.loadData();
  },
  methods:{
    requestData(requestProp){
      this.dataRows = []

      this.pagination = requestProp.pagination;

      if(this.loadingData == false){
        try{
          this.loadingData = true
          let filterByReduced = [];
          this.currentFilter.filter(x => x.valueA != null || x.valueB != null || (x.valueC != null && x.valueC.length > 0)).map(y=> {
            filterByReduced.push({
               db_column: y.db_column
              ,valueC: y.valueC
            })
          })
          this.$axios.post( this.apiURL + 'getData',
              {
                  sys_user_code: this.userCode,
                  sys_company_id: this.userCompany,
                  link_name: this.moduleName,
                  gridDataSkip: (this.pagination.page-1) * this.pagination.rowsPerPage,
                  gridNumberOfRows: this.pagination.rowsPerPage,//agregado al manejarlo por página
                  gridColumns: JSON.stringify(this.columnsUser),
                  //filterBy: JSON.stringify(this.currentFilter.filter(x => x.valueA != null || x.valueB != null || (x.valueC != null && x.valueC.length > 0))),
                  //filterBy: JSON.stringify(this.currentFilter.filter(x => x.valueA != null || x.valueB != null || (x.valueC != null && x.valueC.length > 0)).map(y=>y.valueC)),
                  filterBy: JSON.stringify(filterByReduced),
                  filterSearch: this.currentFilterSearch,
                  sortBy: this.pagination.sortBy,
                  orderBy: this.pagination.descending?'desc':'asc'
              }
              , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
          ).then((response) => {
              if(response.data && response.data.length > 0){
                this.dataRows = response.data;
                let newPagination = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].pagination)) //clona
                newPagination.rowsNumber = response.data[0].gridDataMaxRows
                this.pagination = newPagination
                this.loadingData = false;
                this.callScroll();
              }else{
                  //pendiente corregir número de registros
                  //this.gridDataMaxRows = 0
                  //this.moduleData.mainGridPagination.rowsNumber = 0
                  this.loadingData = false
              }
          }).catch((error) => {
              console.error(error)
              let mensaje = ''
              if(error.message){ mensaje = error.message }
              if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
              if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
              this.$q.notify({ html: true, multiLine: false, color: 'red'
                  ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                  ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                  ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
              })
              this.loadingData = false
          })
        }catch(exception){
            console.error(exception)
            this.loadingData = false
        }
      }
      //this.loadingData = false;
    },
    loadData(){
      this.$refs.mainTable.requestServerInteraction()//carga inicial
    },
    changePagination(val){
      let newPagination = JSON.parse(JSON.stringify(this.pagination))
      newPagination.rowsPerPage = val
      newPagination.page = 1
      this.pagination = newPagination
      this.loadData()
    },
    cellAttribute(columna, attribute, cellValue){
      let resultado = undefined
      try{
        resultado = JSON.parse(columna.cellAttributes)[attribute].find(x=>x.value==cellValue).result
      }catch(ex){}
      return resultado
    },
    openEditForm(props, editMode){
      //select Openning row, helps user to find out wich record he was working with
      try{
        let newSelectedRow = [];
        newSelectedRow.push(props.row)
        this.selectedRows = newSelectedRow;
        let selectedRow = {
          value: props.value
          ,row: props.row
        }
        this.editRecord = selectedRow
      }catch(ex){}
      this.editMode = editMode //false = edit || true  = new
      this.lastRecord = props.value//agregado para que funcione el AutoScroll en cada módulo
      this.router.push(this.moduleEditName);
    },
    callScroll(){
      setTimeout(this.tryScroll, 650)
    },
    async tryScroll(){
      try{
        let index = this.dataRows.findIndex(x=>x[this.columnsSystem.find(x=>x.is_key).field]==this.lastRecord)
        if(this.$refs.mainTable.hasVirtScroll){
          index=parseInt(index)+parseInt(14)
          this.$refs.mainTable.scrollTo(index)
        }else{
          index=parseInt(index)-parseInt(1)
          this.$refs.mainTable.scrollTo(index)
        }
      }catch(ex){}
    },
    runContextCommand(menuAction, data){
      let action = {
         name: menuAction
        ,dataProp: data
      }
      this.$emit('onContextMenuClicked', action)
    },
    
  }
})
</script>
