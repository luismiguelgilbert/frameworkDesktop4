<template>
<q-layout v-if="maindataLoaded && userCode" container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px);">
    <q-header>
        <q-toolbar :class="userMainToolbarComponentClass">
            <q-input
                filled hide-bottom-space round
                :bg-color="userColor=='blackDark'?'grey-10':'primary'"
                :label-color="userColor=='blackDark'?'grey-9':'white'"
                input-class="text-white"
                :color="userColor=='blackDark'?'black':'primary'"
                debounce="1000" v-model="currentFilterSearch" dense  placeholder="Buscar"
                autofocus style="min-width: 120px;"
                maxlength="100" @input="loadData()" class="q-ml-sm" 
                >
                <template v-slot:prepend style="min-width: 120px; max-height: 20px;">
                    <q-icon name="fas fa-search" color="white" />
                </template>
                <template v-if="currentFilterSearch" v-slot:append>
                    <q-btn @click="()=>{currentFilterSearch=''; loadData()}" flat round icon="fas fa-times" size="xs" color="white" />
                </template>
            </q-input>
            
            <q-btn
                v-if="selectedRows.length>0"
                flat no-caps no-wrap stretch
                :color="userColor=='blackDark'?'white':'primary'"
                :title="'Limpiar ' + selectedRows.length + ' seleccionados'"
                @click="()=>{selectedRows = []}"
                icon-right="far fa-square"  >
                <div class="q-pr-xs gt-sm">Limpiar Selección</div>
            </q-btn>
            
            <q-space />

            <q-input
                filled hide-bottom-space round
                :bg-color="userColor=='blackDark'?'grey-10':'primary'"
                :label-color="userColor=='blackDark'?'grey-9':'white'"
                input-class="text-white"
                :color="userColor=='blackDark'?'black':'primary'"
                debounce="1000" :value="whName" dense  placeholder="Seleccionar Bodega" label="Bodega"
                maxlength="100" @input="openSearchWH('whID','whName',whID)" class="q-mr-sm" 
                @keyup.keyCodes.113="openSearchWH('whID','whName',whID)" >
                <template v-slot:prepend><q-icon name="fas fa-warehouse" flat round size="xs" color="white" /></template>
                <template v-slot:append><q-icon name="fas fa-search" flat round size="xs" color="white" @click="openSearchWH('whID','whName',whID)"/></template>
            </q-input>
        </q-toolbar>

        <q-separator color="grey-4" />
    </q-header>

    <q-page-container>
        <q-table
            ref="mainTable"
            square
            :data="dataRows"
            :columns="columnsUser"
            :dense="userTableDense"
            :color="userColor=='blackDark'?undefined:'primary'"
            :separator="userTableLines"
            selection="multiple"
            row-key="invID"
            rows-per-page-label= "Registros"

            no-data-label= "No hay registros"
            no-results-label= "No se encontraron registros"
            loading-label= "Cargando datos"
            :rows-per-page-options="[17,27,50,100,250,1000, 0]"
            :class="userColor=='blackDark'?'my-sticky-header-table-dark bg-grey-10 ':'my-sticky-header-table '"
            :table-style="userTableDense?'min-height: calc(100vh - 136px); max-height: calc(100vh - 136px)':'min-height: calc(100vh - 153px); max-height: calc(100vh - 153px)'"
            :selected.sync="selectedRows"
            :loading="loadingData"
            :pagination.sync="pagination"
            @request="loadData"
            binary-state-sort
            :virtual-scroll="pagination.rowsPerPage==0||pagination.rowsPerPage>100?true:false"
            >
            <template v-slot:body-cell="props" >
                <q-td :props="props" :class="props.col.name=='quantityOnHand'?'bg-primary text-white text-weight-medium':'text-weight-medium'" >
                    <div v-if="props.col.name=='invID'" >{{props.value}}</div>
                    <div v-if="props.col.name=='invName'" >{{props.value}}</div>
                    <div v-if="props.col.name=='internal_code'" >{{props.value}}</div>
                    <div v-if="props.col.name=='quantityOnHand'" >{{props.value?parseFloat(props.value).toFixed(userMoneyFormat):props.value}}</div>
                    <div v-if="props.col.name=='uomName'" >{{props.value}}</div>
                    <div v-if="props.col.name=='estado'" >
                        <q-item dense class="no-padding" style="min-height: 20px !important;">
                            <q-item-section side class="q-pl-none q-pr-xs" >
                                <q-icon :color="props.value?'positive':'red'" name="fas fa-circle" size="0.8rem" />
                            </q-item-section>
                            <q-item-section><q-item-label>{{props.value?'Activo':'Inactivo'}}</q-item-label></q-item-section>
                        </q-item>
                    </div>
                    <div v-if="props.col.name=='open'" >
                        <q-btn flat dense round size="xs" icon="fas fa-external-link-alt" color="primary" @click="openKardex(props)" title="Ver Kardex" />
                        <q-btn flat dense round size="xs" v-if="props.row.systemType==4" icon="fas fa-barcode" class="q-ml-md" color="primary" @click="openLots(props)" title="Ver Stock por Lote" />
                    </div>
                </q-td>
            </template>
        </q-table>
        
    </q-page-container>

    <q-dialog v-model="isWHDialog">
        <mainLookup 
            titleBar="Buscar Bodega"
            :data="this.lookup_wh"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :predefinedValue="mainLookupPredefinedValue"
            :columns="[
                     { name: 'label', required: true, label: 'Bodega', align: 'left', field: row => row.label , sortable: false, style: 'min-width: 300px;' }
                    //,{ name: 'partner_ruc', required: true, label: 'Número de Identificación', align: 'left', field: row => row.partner_ruc , sortable: false, style: 'min-width: 100px;' }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            
            @onCancel="isWHDialog=false"
            @onSelect="(selectedRows)=>{updateWH(selectedRows)}"
        /><!--boldIfChildrenFielname="account_has_children"-->
    </q-dialog>

    <q-dialog v-model="isKardexDialog" v-if="kardexItemRow">
        <q-card style="min-width: 95%;">
            <q-bar class="bg-primary text-white">
                Kardex de: {{kardexItemRow.invName}} ({{kardexItemRow.internal_code}})
                <q-space />
                <q-btn icon="fas fa-times" dense flat round color="white" sixe="xs" @click="isKardexDialog=false" class="no-padding" />
            </q-bar>
            <q-card-section class="no-padding">
                <q-table
                    :data="kardexDataRows"
                    table-style="min-height: calc(100vh - 193px); max-height: calc(100vh - 193px);"
                    row-key="stockID"
                    :separator="userTableLines"
                    :rows-per-page-options="[0]"
                    hide-bottom dense flat
                    virtual-scroll
                    :class="tableLastLine"
                    loading-label="Cargando datos"
                     no-data-label="No hay registros"
                    no-results-label="No se encontraron registros"
                    :columns="kardexColumns"
                    >
                    <template v-slot:body-cell="props" >
                               
                        <q-td :props="props" :class="props.col.name=='RunningQTY'?'bg-blue-4 text-white text-weight-medium':'text-weight-medium'" >
                            <div v-if="props.col.name=='moveDate'" >{{props.value}}</div>
                            <div v-if="props.col.name=='directionName'" >
                                <q-item dense class="no-padding" style="min-height: 20px !important;">
                                    <q-item-section side class="q-pl-none q-pr-xs" >
                                        <q-icon :color="props.row.direction?'positive':'red'" 
                                                :name="props.row.direction?'fas fa-sign-in-alt':'fas fa-sign-out-alt fa-rotate-180'" size="0.8rem" />
                                    </q-item-section>
                                    <q-item-section><q-item-label :class="props.row.direction?'text-positive':'text-red'" >{{props.row.directionName}}</q-item-label></q-item-section>
                                </q-item>
                            </div>
                            <div v-if="props.col.name=='quantity'" >{{props.value}}</div>
                            <div v-if="props.col.name=='price'" >{{props.value}}</div>
                            <div v-if="props.col.name=='RunningQTY'" >{{props.value}}</div>
                            <div v-if="props.col.name=='mktTypeName'" >{{props.value}}</div>
                            <div v-if="props.col.name=='mktHeaderID'" >{{props.value}}</div>
                            <div v-if="props.col.name=='partnerName'" >{{props.value}}</div>
                            <div v-if="props.col.name=='invDocName'" >{{props.value}}</div>
                            <div v-if="props.col.name=='invDocNumber'" >{{props.value}}</div>
                        </q-td>
                    </template>
                    <template v-slot:bottom-row >
                        <q-tr></q-tr>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>
        <q-inner-loading :showing="loadingKardexData" style="z-index: 999;">
            <q-spinner-ios size="50px" color="primary" />
        </q-inner-loading>
    </q-dialog>

    <q-dialog v-model="isLotsDialog" v-if="kardexItemRow">
        <q-card style="min-width: 550px;">
            <q-bar class="bg-primary text-white">
                Lotes de: {{kardexItemRow.invName}} ({{kardexItemRow.internal_code}})
                <q-space />
                <q-btn icon="fas fa-times" dense flat round color="white" sixe="xs" @click="isLotsDialog=false" class="no-padding" />
            </q-bar>
            <q-card-section class="no-padding">
                <q-table
                    :dense="userTableDense"
                    :data="kardexDataRows"
                    table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
                    no-data-label="No hay registros"
                    no-results-label="No se encontraron registros"
                    loading-label="Cargando datos"
                    virtual-scroll :rows-per-page-options="[0]" :pagination.sync="kardexPagination"
                    :columns="lotsColumns"
                    >
                    <template v-slot:body-cell="props" >
                        <q-td :props="props" >
                            <div v-if="props.col.name=='quantity'" >{{props.value}}</div>
                            <div v-if="props.col.name=='lotName'" >{{props.value}}</div>
                            <div v-if="props.col.name=='RunningQTY'" >{{props.value}}</div>
                        </q-td>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>
        <q-inner-loading :showing="loadingKardexData" style="z-index: 999;">
            <q-spinner-ios size="50px" color="primary" />
        </q-inner-loading>
    </q-dialog>

    <q-inner-loading :showing="loadingData" style="z-index: 999;">
        <q-spinner-ios size="50px" color="primary" />
    </q-inner-loading>

</q-layout>
</template>
<style lang="scss">
  .q-table__bottom{ padding: 0px; padding-left: 10px; padding-right: 10px; }
  .q-virtual-scroll__padding{ visibility: hidden;}
  .q-table thead tr:first-child th{ position: sticky; top: 0; opacity: 1; z-index: 1; padding-left: 5px; font-weight: bolder; color: $primary; }
  .my-sticky-header-table{
    .q-table thead tr:first-child th{ background-color: white }
  }
  .my-sticky-header-table-LastLine{
    .q-table thead tr:first-child th{ background-color: white }
    .q-table .q-virtual-scroll__content td{ border-bottom-width: 1px }
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
import { date } from 'quasar';
import mainLookup from '../../../components/mainLookup/mainLookup.vue'
//import columnsLayoutComponent from '../../../components/mainTable/columnsLayoutComponent.vue'
//import tableComponent from '../../../components/mainTable/tableComponent.vue'
//import filtersLayoutComponent from '../../../components/mainTable/filtersLayoutComponent.vue'
/*Specific*/
//import headerBar from './barComponent.vue'

export default ({
  components: {
     mainLookup: mainLookup
    //,tableComponent: tableComponent
    /* columnsLayoutComponent: columnsLayoutComponent
    ,filtersLayoutComponent: filtersLayoutComponent
    ,headerBar: headerBar*/
  },
  mounted(){
    if(!this.columnsUserLoaded){//es primera carga?
        //this.pagination = JSON.parse({descending:false,page:1,rowsNumber:0,rowsPerPage:50,sortBy:"invName"})//ahora está aquí
        let initialPagination = {descending:false,page:1,rowsNumber:0,rowsPerPage:50,sortBy:"invName"}//clona
        initialPagination.rowsPerPage = this.userRowsPerPage//asigna rowsPerPage
        this.pagination = initialPagination;//save to vuex
        this.columnsSystem = [
             {name:"invID",db_column:"invID",label:"# Item",field:"invID",ux_type:"string",is_key:true,isOpenButton:true,is_filterable:true,is_required:true,is_searchable:true,is_visible:true,align:"left",sortIndex:1,sortable:true,cellComponent:"div",cellAttributes:""}
            ,{name:"invName",db_column:"invName",label:"Item",field:"invName",ux_type:"string",is_key:false,isOpenButton:false,is_filterable:true,is_required:true,is_searchable:true,is_visible:true,align:"left",sortIndex:2,sortable:true,cellComponent:"div",cellAttributes:""}
            ,{name:"internal_code",db_column:"internal_code",label:"Código",field:"internal_code",ux_type:"string",is_key:false,isOpenButton:false,is_filterable:true,is_required:true,is_searchable:true,is_visible:true,align:"left",sortIndex:3,sortable:true,cellComponent:"div",cellAttributes:""}
            ,{name:"quantityOnHand",db_column:"quantityOnHand",label:"Cantidad",field:"quantityOnHand",ux_type:"string",is_key:false,isOpenButton:false,is_filterable:true,is_required:true,is_searchable:true,is_visible:true,align:"right",sortIndex:4,sortable:false,cellComponent:"div",cellAttributes:""}
            ,{name:"uomName",db_column:"uomName",label:"Unidad de Medida",field:"uomName",ux_type:"string",is_key:false,isOpenButton:false,is_filterable:true,is_required:true,is_searchable:true,is_visible:true,align:"left",sortIndex:5,sortable:true,cellComponent:"div",cellAttributes:""}
            ,{name:"estado",db_column:"estado",label:"Estado",field:"estado",ux_type:"string",is_key:false,isOpenButton:false,is_filterable:true,is_required:true,is_searchable:true,is_visible:true,align:"left",sortIndex:6,sortable:true,cellComponent:"div",cellAttributes:""}
            ,{name:"open",db_column:"open",label:"",field:"open",ux_type:"string",is_key:false,isOpenButton:false,is_filterable:true,is_required:true,is_searchable:true,is_visible:true,align:"left",sortIndex:7,sortable:false,cellComponent:"div",cellAttributes:""}
        ]
        this.columnsUser = this.columnsSystem;
        this.currentFilter = []//filtroPredeterminado viene desde la base de datos
        this.moduleReports = []//filtroPredeterminado viene desde la base de datos
    }
    //si userCode existe, entonces carga datos básicos del módulo (eg. page refresh puede hacer que userCode se cargue luego, y ese dato es indispensable para la lectura)
    if(this.userCode){
        this.loadUserWarehouses();
    }
  },
  data () {
    return {
        moduleName: "invQuery", //this should match the module Name (same as table sys_links.link_name) AND should match Vuex Store Name
        //moduleEditName: "invQueryEdit",
        maindataLoaded: true,
        router: this.$router,
        mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null,
        isWHDialog: false,
        dataRows: [],
        isKardexDialog: false, kardexItemRow: null, loadingKardexData: false, kardexDataRows: [], kardexPagination: { rowsPerPage: 0 },
        isLotsDialog: false,
        kardexColumns:[
                 {name:"moveDate",db_column:"moveDate",label:"Fecha",field:"moveDate",is_required:true,align:"left"}
                ,{name:"directionName",db_column:"directionName",label:"Movimiento",field:"directionName",is_required:true,align:"left"}
                ,{name:"quantity",db_column:"quantity",label:"Cantidad",field:"quantity",is_required:true,align:"right"}
                ,{name:"price",db_column:"price",label:"Precio Unitario",field:"price",is_required:true,align:"right"}
                ,{name:"RunningQTY",db_column:"RunningQTY",label:"Stock",field:"RunningQTY",is_required:true,align:"right"}
                ,{name:"mktTypeName",db_column:"mktTypeName",label:"Tipo Orden",field:"mktTypeName",is_required:true,align:"left"}
                ,{name:"mktHeaderID",db_column:"mktHeaderID",label:"# Orden",field:"mktHeaderID",is_required:true,align:"right"}
                ,{name:"partnerName",db_column:"partnerName",label:"Proveedor",field:"partnerName",is_required:true,align:"left"}
                ,{name:"invDocName",db_column:"invDocName",label:"Documento",field:"invDocName",is_required:true,align:"left"}
                ,{name:"invDocNumber",db_column:"invDocNumber",label:"# Documento",field:"invDocNumber",is_required:true,align:"left"}
            ]
        ,
        lotsColumns:[
                 /*{name:"moveDate",db_column:"moveDate",label:"Fecha",field:"moveDate",is_required:true,align:"left"}
                ,{name:"directionName",db_column:"directionName",label:"Movimiento",field:"directionName",is_required:true,align:"left"}
                ,{name:"quantity",db_column:"quantity",label:"Cantidad",field:"quantity",is_required:true,align:"right"}*/
                ,{name:"lotName",db_column:"lotName",label:"# Lote",field:"lotName",is_required:true,align:"left"}
                ,{name:"RunningQTY",db_column:"RunningQTY",label:"Stock",field:"RunningQTY",is_required:true,align:"right"}
                /*,{name:"partnerName",db_column:"partnerName",label:"Proveedor",field:"partnerName",is_required:true,align:"left"}
                ,{name:"invDocName",db_column:"invDocName",label:"Documento",field:"invDocName",is_required:true,align:"left"}
                ,{name:"invDocNumber",db_column:"invDocNumber",label:"# Documento",field:"invDocNumber",is_required:true,align:"left"}*/
            ]
    }
  },
  methods:{
    loadUserWarehouses(){
        this.loadingData = true
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spInvQueryUserWHSelect',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
            }
        }).then((response) => {
            this.lookup_wh = response.data
            this.dataRows = []
            this.whID = null
            this.whName = ''
            if(response.data.length>0){
                this.whID = this.lookup_wh[0].value
                this.whName = this.lookup_wh[0].label
                this.loadData();
            }
            this.loadingData = false
        }).catch((error) => {
            console.dir(error)
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
            this.loadingData = false
        })
    },
    updateWH(selectedWH){
        if(selectedWH.length>0){
            this.whID = selectedWH[0].value;
            this.whName = selectedWH[0].label;
            this.isWHDialog = false;
            this.loadData();
        }
    },
    loadData(requestProp){
        if(this.whID>0){
            if(requestProp){
                let newPagination = JSON.parse(JSON.stringify(this.pagination))
                newPagination.descending = requestProp.pagination.descending;
                newPagination.page = requestProp.pagination.page;
                newPagination.rowsNumber = requestProp.pagination.rowsNumber;
                newPagination.rowsPerPage = requestProp.pagination.rowsPerPage;
                newPagination.sortBy = requestProp.pagination.sortBy;
                this.pagination = newPagination;
            }
            this.loadingData = true
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spInvQueryGetData',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    whID: this.whID,
                    gridDataSkip: (this.pagination.page-1) * this.pagination.rowsPerPage,
                    gridNumberOfRows: this.pagination.rowsPerPage,
                    filterSearch: this.currentFilterSearch,
                    sortBy: this.pagination.sortBy,
                    orderBy: this.pagination.descending?'desc':'asc',
                }
            }).then((response) => {
                this.dataRows = []
                if(response.data && response.data.length > 0){
                    this.dataRows = response.data;
                    let newPagination = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].pagination)) //clona
                    newPagination.rowsNumber = response.data[0].gridDataMaxRows
                    this.pagination = newPagination
                }
                this.loadingData = false
            }).catch((error) => {
                console.dir(error)
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
                this.loadingData = false
            })
        }
    },
    openSearchWH(UpdateFieldValueName, UpdateFieldLabelName, predefinedValue){
        this.mainLookupUpdateFieldValueName = UpdateFieldValueName
        this.mainLookupUpdateFieldLabelName = UpdateFieldLabelName
        this.mainLookupPredefinedValue = predefinedValue
        this.isWHDialog = true
    },    
    openKardex(props){
        this.kardexItemRow = props.row;
        this.isKardexDialog = true;
        this.loadingKardexData = true;
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spInvQueryWhIDInvIDGetData',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
                whID: this.whID,
                invID: this.kardexItemRow.invID,
            }
        }).then((response) => {
            this.kardexDataRows = []
            this.kardexDataRows = response.data
            this.loadingKardexData = false
        }).catch((error) => {
            console.dir(error)
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
            this.loadingKardexData = false
        })
        
    },
    openLots(props){
        this.kardexItemRow = props.row;
        this.isLotsDialog = true;
        this.loadingKardexData = true;
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spInvQueryWhIDInvIDGetLotData',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
                whID: this.whID,
                invID: this.kardexItemRow.invID,
            }
        }).then((response) => {
            this.kardexDataRows = []
            this.kardexDataRows = response.data
            this.loadingKardexData = false
        }).catch((error) => {
            console.dir(error)
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
            this.loadingKardexData = false
        })
        
    },
    showDateTimeName(value){
        let resultado = '...'
        try{
            resultado = date.formatDate(value, this.userDateFormat + ' ' + this.userTimeFormat,
            {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                daysShort: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            }
            )
        }catch(ex){console.dir(ex)}
        return resultado;
    }
  },
  computed:{
    loadingData: {
        get () { return this.$store.state[this.moduleName].loadingData },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'loadingData', value: val}) }
    },
    isDrawerVisible: {
        get () {
            let result = false
            if(this.$store.state[this.moduleName].isFiltersDrawerVisible  || this.$store.state[this.moduleName].isColumnsDrawerVisible){
                result = true
            }
            return result
        },
    },
    isFiltersDrawerVisible: {
      get () { return this.$store.state[this.moduleName].isFiltersDrawerVisible },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFiltersDrawerVisible', value: val}) }
    },
    isColumnsDrawerVisible: {
      get () { return this.$store.state[this.moduleName].isColumnsDrawerVisible },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isColumnsDrawerVisible', value: val}) }
    },
    userTableLines: { get () { return this.$store.state.main.userTableLines } },
    userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage } },
    userTableDense: { get () { return this.$store.state.main.userTableDense } },
    userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
    userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
    userTimeFormat: { get () { return this.$store.state.main.userTimeFormat }  },
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
    columnsUserLoaded: {
        get () { return this.$store.state[this.moduleName].columnsUser.length>0?true:false },
    },
    selectedRows: {
      get () { return this.$store.state[this.moduleName].selectedRows },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'selectedRows', value: val}) }
    },
    userMainToolbarComponentClass: { get () {
        let result = 'no-padding '
        if(this.$store.state.main.userColor=='default'){
            result=result + 'bg-white text-white'
        }
        if(this.$store.state.main.userColor=='blackDark'){
            result=result + 'bg-grey-10 text-white'
        }
        return result
    }},
    userColor: { get () { return this.$store.state.main.userColor }  },
    whID: {
        get () { return this.$store.state[this.moduleName].whID },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'whID', value: val}) }
    },
    whName: {
        get () { return this.$store.state[this.moduleName].whName },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'whName', value: val}) }
    },
    lookup_wh: {
        get () { return this.$store.state[this.moduleName].lookup_wh },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'lookup_wh', value: val}) }
    },
    columnsSystem: {
        get () { return this.$store.state[this.moduleName].columnsSystem },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsSystem', value: val}) }
    },
    columnsUser: {
        get () { return this.$store.state[this.moduleName].columnsUser },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsUser', value: val}) }
    },
    filters: {
        get () { return this.$store.state[this.moduleName].filters },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filters', value: val}) }
    },
    filtersDetails: {
        get () { return this.$store.state[this.moduleName].filtersDetails },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filtersDetails', value: val}) }
    },
    currentFilter: {
        get () { return this.$store.state[this.moduleName].currentFilter },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'currentFilter', value: val}) }
    },
    currentFilterSearch: {
        get () { return this.$store.state[this.moduleName].currentFilterSearch },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'currentFilterSearch', value: val}) }
    },
    isCurrentFilter: {
        get () { return this.$store.state[this.moduleName].currentFilter.filter(x => x.valueA != null || x.valueB != null || (x.valueC != null && x.valueC.length > 0)).length>0; },
    },
    moduleReports: {
        get () { return this.$store.state[this.moduleName].moduleReports },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'moduleReports', value: val}) }
    },
    security: {
        get () { return this.$store.state[this.moduleName].security },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'security', value: val}) }
    },
    userCode: { get () { return this.$store.state.main.userCode } },
    userCompany: { get () { return this.$store.state.main.userCompany } },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
  },
  watch: {
    userCode: function (val) {
      if(val){
        //this.loadModouleData();
        this.loadUserWarehouses();
      }
    },
    userCompany: function (val) {
      //this.$refs.mainTableComponent.loadData();
      this.selectedRows=[];
      this.loadUserWarehouses();
    },

  }
})
</script>
