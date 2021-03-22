<template>
<div>
    <q-layout v-if="(whLoaded)?true:false" container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px);">
        <q-toolbar :class="toolbarComponentClass">
            <q-icon name="fas fa-map-marked-alt" color="primary" class="q-ml-md q-mr-md" />
            <q-select
                v-model="placeID"
                :options="lookup_places"
                plac
                emit-value map-options
                borderless
                placeholder="Seleccione Punto de Control"
                @input="loadData"
                :display-value="`${(placeID&&placeID>0)? lookup_places.find(x=>x.value==placeID).label : 'Selecciona Punto de Control'}`"
                />
            <q-btn flat stretch label="Registrar Evento" color="positive" icon="fas fa-plus" no-caps />
            <q-space />
                
            <q-input 
                v-model="toolbarSearchString" class="q-ml-md"
                debounce="1000" maxlength="50" style="max-width: 200px;"
                dense clearable
                placeholder="Buscar" 
                :input-class="userColor!=='blackDark'?'text-primary':'text-white'"
                :autofocus="$q.screen.gt.sm?true:false">
                <template v-slot:prepend >
                    <q-icon name="fas fa-search" :color="userColor!=='blackDark'?'primary':'white'" />
                </template>
                <template v-if="toolbarSearchString" v-slot:append>
                    <q-btn @click="()=>{toolbarSearchString=''}" flat round icon="fas fa-times" size="xs" color="white" />
                </template>
            </q-input>

            <q-btn class="q-ml-md q-mr-md"
                flat no-caps no-wrap round
                :color="userColor=='blackDark'?'white':'primary'"
                @click="exportData(false)"
                icon="fas fa-file-excel">
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>EXPORTAR</b><br>Exporte rápidamente los datos actuales del grid
                </q-tooltip>
            </q-btn>

            
        </q-toolbar>
        <q-separator />
        
        <DxDataGrid
            ref="mainviewtableDxDataGrid"
            height="calc(100vh - 110px)"
            width="calc(100vw)"
            column-resizing-mode="widget"
            :data-source="gridData"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="false"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            :cache-enabled="false"
            keyExpr="record_id"
            @context-menu-preparing="showOptions"
            >
                
                
                <DxColumn name="record_id" data-field="record_id" data-type="number" caption="Código" :width="150" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="false" />
                <DxColumn name="upload_file_name" data-field="upload_file_name" data-type="string" caption="Imagen" :width="150" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true" cell-template="imageCellTemplate" />
                <DxColumn name="fullname" data-field="fullname" data-type="string" caption="Usuario" :minWidth="150" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true"  />
                <DxColumn name="is_critical" data-field="is_critical" data-type="boolean" caption="Crítico?" :width="100" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true" cell-template="criticalCellTemplate" />
                <DxColumn name="start_date" data-field="start_date" data-type="date" caption="Fecha"  :minWidth="150" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true" format="dd-MMM-yyyy HH:MM" />
                <DxColumn name="comments" data-field="comments" data-type="string" caption="Comentario" :minWidth="400" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true"  />
                
                <!--<DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> --> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
                <DxPaging :page-size="50" />
                <!--<DxPager :visible="true" :show-page-size-selector="false" :allowed-page-sizes="allowedPageSizes" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="true" :showPageSizeSelector="false" />-->
                    
                <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
                
                <DxSelection select-all-mode="page" show-check-boxes-mode="always" mode="single" :deferred="false"/>
                <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
                <DxStateStoring :enabled="true" type="sessionStorage" storage-key="BitaeventsMain" :savingTimeout="200" />

                    
                <template #criticalCellTemplate="{ data }">
                    <q-icon color="red" name="fas fa-exclamation-triangle" v-if="data.value" class="q-ml-lg" />
                </template>

                <template #imageCellTemplate="{ data }">
                    <q-avatar size="20px">
                        <q-icon v-if="data.value == null" name="fas fa-camera" :color="userColor=='blackDark'?'white':'grey-7'" />
                        <q-img v-if="data.value != null" :src="$q.sessionStorage.getItem('serverFilesPath') + data.value">
                            <q-tooltip anchor="top left" self="top left" content-class="bg-primary text-white">
                                <q-img  style="width: 250px" :src="$q.sessionStorage.getItem('serverFilesPath') + data.value" />
                            </q-tooltip>
                        </q-img>
                    </q-avatar>
                </template>

                

        </DxDataGrid>

        <!--Kardex-->
        <DxPopup
            v-if="kardexVisible"
            :visible.sync="kardexVisible"
            :drag-enabled="true"
            :resizeEnabled="true"
            :close-on-outside-click="true"
            :show-title="true"
            width="calc(85vw)"
            height="calc(75vh)"
            :title="'Kardex del Item: ' + selectedItem.invName"
            >
                <DxToolbarItem widget="dxButton" location="after" :options="exportKardexButton" />
                 <q-separator />

                <div style="margin: -15px;">
                    <DxDataGrid
                        ref="kardexGrid"
                        width="100%"
                        height="calc(75vh - 55px)"
                        column-resizing-mode="widget"
                        :data-source="selectedItemKardex"
                        :allow-column-resizing="true" 
                        :allow-column-reordering="true"
                        :show-borders="false"
                        :show-column-lines="userTableLinesDXcols"
                        :show-row-lines="userTableLinesDXrows"
                        :cache-enabled="false"
                        keyExpr="kardexID"
                        >
                        <DxScrolling mode="virtual" :useNative="false" showScrollbar="always" /> <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
                        <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
                        <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
                        <DxStateStoring :enabled="true" type="sessionStorage" storage-key="invQueryKardex" :savingTimeout="200" />
                        
                        <DxColumn name="moveDate" data-field="moveDate" data-type="date" caption="Fecha" :width="100" alignment="left" :allowSorting="false" format="dd-MMM-yyy" />
                        <DxColumn name="directionName" data-field="directionName" data-type="string" caption="Movimiento" :width="90" alignment="left" :allowSorting="false" cell-template="moveTemplate" />
                        
                        <template #moveTemplate="{ data }">
                            <div :class="data.row.data.direction?'text-positive':'text-red'">{{data.value}}</div>
                        </template>
                        <DxColumn name="quantity" data-field="quantity" data-type="number" caption="Cantidad" :width="85" alignment="right" :allowSorting="false" />
                        <DxColumn name="price" data-field="price" data-type="number" caption="Precio U." :width="85" alignment="right" :allowSorting="false" />
                        <DxColumn name="RunningQTY" data-field="RunningQTY" data-type="number" caption="Stock" :width="95" alignment="right" :allowSorting="false" />
                        <DxColumn name="mktTypeName" data-field="mktTypeName" data-type="string" caption="Tipo Orden" :width="170" alignment="left" :allowSorting="false" />
                        <DxColumn name="mktHeaderID" data-field="mktHeaderID" data-type="number" caption="# Orden" :width="80" alignment="right" :allowSorting="false" />
                        <DxColumn name="partnerName" data-field="partnerName" data-type="string" caption="Proveedor" :width="150" alignment="left" :allowSorting="false" />
                        <DxColumn name="invDocName" data-field="invDocName" data-type="string" caption="Dcoumento" :width="130" alignment="left" :allowSorting="false" />
                        <DxColumn name="invDocNumber" data-field="invDocNumber" data-type="string" caption="# Documento" :width="100" alignment="left" :allowSorting="false" />


                    </DxDataGrid>
                </div>
        </DxPopup>

    </q-layout>
    <div v-if="!(whLoaded)" style="height: calc(100vh - 80px)"  >
        <q-inner-loading :showing="!(whLoaded)">
            <q-spinner-facebook size="10%" color="primary" />
        </q-inner-loading>
    </div>
</div>
</template>


<script>
import Vue from 'vue';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import { DxDataGrid, DxColumn, DxScrolling, DxLookup, DxExport, DxSorting, DxPaging, DxPager, DxSelection, DxSummary, DxTotalItem, DxStateStoring, DxHeaderFilter, DxRemoteOperations } from 'devextreme-vue/data-grid';
import { DxPopup, DxToolbarItem } from 'devextreme-vue/popup';
import { DxScrollView } from 'devextreme-vue/scroll-view';
import DxButton from 'devextreme-vue/button';
import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

export default ({
    components: {
        DxDataGrid,
        DxScrolling,
        DxSorting,
        DxPaging,
        DxPager,
        DxColumn,
        DxLookup,
        DxSelection,
        DxTotalItem,
        DxSummary,
        DxStateStoring,
        DxHeaderFilter,
        DxRemoteOperations,
        DxExport,
        DxPopup,
        DxToolbarItem,
        DxScrollView,
        DxButton,
        selectSearchable: selectSearchable
    },
    data () {
        return {
            moduleName: "Bitaevents",
            lookup_places: [],
            placeID: null,
            placeName: null,
            gridData: [],
            showInternalCode: false,
            toolbarSearchString: '',
            selectedItem: null,
            selectedItemKardex: null,
            selectedItemLots: null,
            kardexVisible: false,
            lotVisible: false,
            whLoaded: false,
            exportKardexButton: {
                icon:"fas fa-file-excel",
                text:"Exportar",
                type:"default",
                stylingmode:"contained",
                onClick: (e)=> { this.kardexGridExport() }
            }
        }
    },
    mounted(){
        this.loadUserPlaces();
    },
    methods:{
        loadUserPlaces(){
            this.whLoaded = false;
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spBitaPlacesByUser',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                }
            }).then((response) => {
                this.lookup_places = response.data
                console.dir(response.data)
                if(response.data&&response.data.length>0){
                    //this.warehouseID = response.data[0].value;
                    this.placeID = response.data[0].value;
                    this.placeName = response.data[0].label;
                    this.loadData();
                }
                this.whLoaded = true;
            }).catch((error) => {
                this.whLoaded = true;
                console.dir(error.message)
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
                this.maindataLoaded = true;
            })
        },
        loadData(){
            if(this.placeID==0&&this.lookup_places.length>0){
                this.placeID = this.lookup_places[0].value;
                this.placeName = this.lookup_places[0].label;
            }
            if(this.placeID>0){
                this.warehouseName = this.lookup_places.find(x=>x.value==this.placeID).label;

                this.$axios({
                    method: 'GET',
                    url: this.apiURL + 'spBitaEventsByUserByPLace',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        placeID: this.placeID,
                        userLanguage: 'es',
                    }
                }).then((response) => {
                    this.gridData = response.data;
                }).catch((error) => {
                    console.dir(error.message)
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
            
            }
        },
        exportData(){
            const context = this;
            const workbook = new ExcelJS.Workbook();
            const workSheet = workbook.addWorksheet('Datos ' + this.warehouseName);
            const component = this.$refs['mainviewtableDxDataGrid'].instance;
            exportDataGrid({
                worksheet: workSheet,
                component: component,
                topLeftCell: { row: 1, column: 1 },
                //customizeCell: ({ gridCell, excelCell }) => { setAlternatingRowsBackground(gridCell, excelCell); }
            }).then(() => {
                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), this.warehouseName+'.xlsx');
                })
            })
            
        },
        showOptions(e){
            if(e.row.rowType=='data'){
                e.component.selectRows(e.row.key);
                this.selectedItem = e.row.data;
                //this.shouldScrollToRow = true;
                if(e.row.data.systemType==4){
                    e.items = [
                        { text: "Abrir Kardex del Item", icon: "fas fa-history", onItemClick: ()=> { 
                                this.$axios({
                                    method: 'GET',
                                    url: this.apiURL + 'spInvQueryWhIDInvIDGetData',
                                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                                    params: {
                                        userCode: this.userCode,
                                        userCompany: this.userCompany,
                                        userLanguage: 'es',
                                        whID: this.warehouseID,
                                        invID: this.selectedItem.invID,
                                    }
                                }).then((response) => {
                                    this.selectedItemKardex = []
                                    this.selectedItemKardex = response.data
                                    this.kardexVisible = true;
                                }).catch((error) => {
                                    console.dir(error.message)
                                    let mensaje = ''
                                    if(error.message){ mensaje = error.message }
                                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                                    })
                                    this.selectedItemKardex = []
                                })
                            }
                        },
                        { disable: true, text: "Ver Stock por Lote", icon: "fas fa-barcode", onItemClick: ()=> {
                                this.$axios({
                                    method: 'GET',
                                    url: this.apiURL + 'spInvQueryWhIDInvIDGetLotData',
                                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                                    params: {
                                        userCode: this.userCode,
                                        userCompany: this.userCompany,
                                        userLanguage: 'es',
                                        whID: this.warehouseID,
                                        invID: this.selectedItem.invID,
                                    }
                                }).then((response) => {
                                    this.selectedItemLots = []
                                    this.selectedItemLots = response.data
                                    this.lotVisible = true;
                                }).catch((error) => {
                                    console.dir(error.message)
                                    let mensaje = ''
                                    if(error.message){ mensaje = error.message }
                                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                                    })
                                    this.selectedItemKardex = []
                                })
                            }
                        },
                    ];
                }else{
                    e.items = [
                        { text: "Abrir Kardex del Item", icon: "fas fa-history", onItemClick: ()=> { 
                                this.$axios({
                                    method: 'GET',
                                    url: this.apiURL + 'spInvQueryWhIDInvIDGetData',
                                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                                    params: {
                                        userCode: this.userCode,
                                        userCompany: this.userCompany,
                                        userLanguage: 'es',
                                        whID: this.warehouseID,
                                        invID: this.selectedItem.invID,
                                    }
                                }).then((response) => {
                                    this.selectedItemKardex = []
                                    this.selectedItemKardex = response.data
                                    this.kardexVisible = true;
                                }).catch((error) => {
                                    console.dir(error.message)
                                    let mensaje = ''
                                    if(error.message){ mensaje = error.message }
                                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                                    })
                                    this.selectedItemKardex = []
                                })
                            }
                        }
                    ];
                }
                
            }
        },
        kardexGridExport(){
            console.dir(this.selectedItem)
            const context = this;
            const workbook = new ExcelJS.Workbook();
            const workSheet = workbook.addWorksheet('Kardex');
            const component = this.$refs['kardexGrid'].instance;
            exportDataGrid({
                worksheet: workSheet,
                component: component,
                topLeftCell: { row: 1, column: 1 },
                //customizeCell: ({ gridCell, excelCell }) => { setAlternatingRowsBackground(gridCell, excelCell); }
            }).then(() => {
                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Kardex.xlsx');
                })
            })
        }
    },
    computed: {
        userCode: { get () { return this.$store.state.main.userCode }  },
        userCompany: { get () { return this.$store.state.main.userCompany }  },
        userColor: { get () { return this.$store.state.main.userColor }  },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        toolbarComponentClass: { get () {
            let result = 'no-padding '
            if(this.$store.state.main.userColor=='default'){
                result=result + 'bg-white text-white'
            }
            if(this.$store.state.main.userColor=='blackDark'){
                result=result + 'bg-grey-10 text-white'
            }
            return result
        }},
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
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        }
    },
    watch: {
        userCompany: function(val){
            this.gridData = [];
            this.placeID = null;
            this.placeName = null;
            this.loadUserPlaces();
        },
        toolbarSearchString: function(val){
            this.$refs['mainviewtableDxDataGrid'].instance.searchByText(this.toolbarSearchString);
        }
    }
})
</script>