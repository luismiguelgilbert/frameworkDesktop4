<template>
<div>
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
      :class="userColor=='blackDark'?'my-sticky-header-table-dark bg-grey-10 ':'my-sticky-header-table '"
      :table-style="userTableDense?'min-height: calc(100vh - 135px); max-height: calc(100vh - 135px)':'min-height: calc(100vh - 153px); max-height: calc(100vh - 153px)'"
      :selected.sync="selectedRows"
      :loading="loadingData"
      :pagination.sync="pagination"
      @request="requestData"
      binary-state-sort
      :virtual-scroll="pagination.rowsPerPage==0||pagination.rowsPerPage>100?true:false"
      >
      <template v-slot:body-cell="props" >
        <q-td :props="props" class="text-weight-medium ellipsis no-padding" :title="props.value" >
          <div v-if="props.col.cellComponent=='estado'" class="q-pl-xs">
            <q-item dense class="no-padding" style="min-height: 20px !important;">
              <q-item-section side class="q-pl-none q-pr-xs" ><q-icon :color="cellAttribute(props.col,'color', props.value)" name="fas fa-circle" size="0.8rem" /></q-item-section>
              <q-item-section><q-item-label>{{props.value}}</q-item-label></q-item-section>
            </q-item>
          </div>
          <div v-if="props.col.cellComponent=='image'" >
            <q-avatar size="20px">
                <q-icon v-if="props.value == null" name="fas fa-camera" :color="userColor=='blackDark'?'white':'grey-7'" />
                <q-img v-if="props.value != null" :src="$q.sessionStorage.getItem('serverFilesPath') + props.value">
                  <q-tooltip anchor="top left" self="top left">
                    <q-img  style="width: 250px" :src="$q.sessionStorage.getItem('serverFilesPath') + props.value" />
                  </q-tooltip>
                </q-img>
            </q-avatar>
          </div>
          <!--<div v-if="!props.col.is_key && props.col.cellComponent=='div'">{{props.value}}</div>-->
          <div v-if="props.col.cellComponent=='div'" class="q-pl-xs q-pr-sm">{{props.value}}</div>
          <div v-if="props.col.cellComponent=='bool'" ><q-toggle class="no-padding" style="min-height: 20px !important;" color="primary" size="xs"  :value="props.value" /></div>
          <div v-if="props.col.ux_type=='open'"  >
            <!--{{columnsSystem.find(x=>x.is_key).field}}-->
            <!--<q-btn flat size="xs" icon="fas fa-external-link-alt" class="cursor-pointer" color="primary" @click="()=>{ let newProps = JSON.parse(JSON.stringify(props)); newProps['value']= props.row[columnsSystem.find(x=>x.is_key).field]; openEditForm(newProps, false)}" />-->
            <q-btn flat size="xs" icon="fas fa-external-link-alt" class="cursor-pointer" color="primary" @click="()=>{ let newProps = JSON.parse(JSON.stringify(props)); newProps['value']= props.row[columnsSystem.find(x=>x.is_required).field]; openEditForm(newProps, false)}" title="Abrir" />
            <q-btn v-if="allow_insert" flat size="xs" icon="fas fa-copy" class="cursor-pointer" color="primary" @click="()=>{ let newProps = JSON.parse(JSON.stringify(props)); newProps['value']= props.row[columnsSystem.find(x=>x.is_required).field]; openEditForm(newProps, true)}" title="Copiar" />
          </div>
        </q-td>
      </template>
    </q-table>
</div>
</template>
<style lang="sass">
.q-table__bottom
    padding: 0px
.my-sticky-header-table
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: white

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2
    padding-left: 5px
    font-weight: bolder
    color: $grey-7

  td:last-child
    /* bg color is important for td; just specify one */
    background-color: white !important
  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #fff
    font-color: red

  td:last-child, th:last-child
    position: sticky
    right: 0


.my-sticky-header-table-dark
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: $grey-10

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2
    padding-left: 5px
    font-weight: bolder
    color: $grey-6
</style>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
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
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    userCode: { get () { return this.$store.state.main.userCode } },
    userCompany: { get () { return this.$store.state.main.userCompany } },
    userTableLines: { get () { return this.$store.state.main.userTableLines } },
    userTableDense: { get () { return this.$store.state.main.userTableDense } },
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
        //console.dir('newResult')
        //console.dir(newResult)
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
                this.loadingData = false
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
      /*console.dir(props.value)
      console.dir(props.row)*/
      let selectedRow = {
         value: props.value
        ,row: props.row
      }
      this.editRecord = selectedRow
      this.editMode = editMode //false = edit || true  = new
      this.router.push(this.moduleEditName);
    }
  }
})
</script>
