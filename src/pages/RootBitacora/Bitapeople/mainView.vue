<template>
<div>
    <q-layout v-if="(whLoaded)?true:false" container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px);  overflow-y: hidden !important;">
        
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
                :display-value="`${(placeID&&placeID>0&&lookup_places.length>0)? lookup_places.find(x=>x.value==placeID).label : 'Selecciona Punto de Control'}`"
                />
            <q-btn flat stretch label="Registrar Ingreso" color="positive" icon="fas fa-plus" no-caps @click="openNewForm" />
            <q-space />
            <div class="text-primary text-subtitle2">Visitantes: {{gridData.length}}</div>
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
                
                
                <DxColumn name="record_id" data-field="record_id" data-type="number" caption="Código" :width="100" alignment="left" :allowFiltering="false" :allowSorting="true" :visible="false" />
                <DxColumn name="upload_file_name" data-field="upload_file_name" data-type="string" caption="Imagen" :width="65" alignment="center" :allowFiltering="false" :allowSorting="false" :visible="true" cell-template="imageCellTemplate" />
                <DxColumn name="visitor_name" data-field="visitor_name" data-type="string" caption="Visitante" :minWidth="250" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true"  />
                <DxColumn name="visitor_number" data-field="visitor_number" data-type="string" caption="# Identificación" :minWidth="140" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true"  />
                <DxColumn name="start_date" data-field="start_date" data-type="date" caption="Fecha Ingreso"  :minWidth="150" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true" format="dd-MMM-yyyy HH:mm" />
                <DxColumn name="reason_name" data-field="reason_name" data-type="string" caption="Motivo" :minWidth="120" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true"  />
                <DxColumn name="hasVehiculo" data-field="hasVehiculo" data-type="bool" caption="Vehículo?" :minWidth="100" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true" cell-template="hasVehiculoCellTemplate" />
                <DxColumn name="comments" data-field="comments" data-type="string" caption="Comentario" :minWidth="400" alignment="left" :allowFiltering="true" :allowSorting="true" :visible="true"  />
                
                <!--<DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> --> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
                <DxPaging :page-size="50" />
                <!--<DxPager :visible="true" :show-page-size-selector="false" :allowed-page-sizes="allowedPageSizes" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="true" :showPageSizeSelector="false" />-->
                    
                <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
                
                <DxSelection select-all-mode="page" show-check-boxes-mode="always" mode="single" :deferred="false"/>
                <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
                <DxStateStoring :enabled="true" type="sessionStorage" storage-key="BitapeopleMain" :savingTimeout="200" />

                    
                <template #hasVehiculoCellTemplate="{ data }">
                    <div style="display: inline-block;">
                        <q-icon color="primary" name="fas fa-car" v-if="data.value"  style="display: inline-block;" />
                        <div class="q-pl-md" style="display: inline-block;" >{{data.row.data.vehiculo_placa}}</div>
                    </div>
                </template>

                <template #imageCellTemplate="{ data }">
                    <q-avatar size="20px">
                        <q-icon v-if="data.value == null" name="fas fa-camera" :color="userColor=='blackDark'?'white':'grey-7'" />
                        <q-img v-if="data.value != null" :src="$q.sessionStorage.getItem('serverFilesPath') + data.value">
                            <q-tooltip anchor="top left" self="top left" :content-class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'">
                                <q-img  style="width: 250px" :src="$q.sessionStorage.getItem('serverFilesPath') + data.value" />
                            </q-tooltip>
                        </q-img>
                    </q-avatar>
                </template>

                

        </DxDataGrid>

    </q-layout>
    <div v-if="!(whLoaded)" style="height: calc(100vh - 80px)"  >
        <q-inner-loading :showing="!(whLoaded)">
            <q-spinner-facebook size="10%" color="primary" />
        </q-inner-loading>
    </div>
</div>
</template>

<style >
.q-layout-container .q-layout{
    overflow-y: hidden !important;
}
</style>

<script>
import Vue from 'vue';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import cameraComponent from '../../../components/cameraComponent/cameraComponent.vue'
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
        selectSearchable: selectSearchable,
        cameraComponent: cameraComponent,
    },
    data () {
        return {
            moduleName: "Bitapeople",
            lookup_places: [],
            placeID: null,
            //placeName: null,
            gridData: [],
            showInternalCode: false,
            toolbarSearchString: '',
            selectedItem: null,
            selectedItemKardex: null,
            selectedItemLots: null,
            kardexVisible: false,
            lotVisible: false,
            whLoaded: false,
            tab: 'basic',
            splitterModel: 200,
            currentRecord: {
                record_id: -1,
                fullname: '',
                fecha: '',
                hora: '10:56',
                comments: '',
                isCritic: false,
                isDisabled: false,
            },
            currentRecordAttachs: [],
            slide: 1,
            dialogWidth: 100,
            dialogHeight: 100,
            myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            },
        }
    },
    mounted(){
        this.loadUserPlaces();
    },
    methods:{
        loadUserPlaces(){
            this.whLoaded = false;
            //load places
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
                if(!(this.editStatus.placeID)){
                    if(response.data&&response.data.length>0){
                        this.placeID = response.data[0].value;
                        this.loadData();
                        this.whLoaded = true;
                    }
                }else{
                    this.placeID = this.editStatus.placeID;
                    this.loadData();
                    this.whLoaded = true;
                }
                //console.dir('aqui')
                //console.dir(this.placeID)
            }).catch((error) => {
                this.whLoaded = true;
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
                this.maindataLoaded = true;
            })
        },
        loadData(){
            if(this.placeID==0&&this.lookup_places.length>0){
                this.placeID = this.lookup_places[0].value;
                //this.placeName = this.lookup_places[0].label;
            }
            if(this.placeID>0){
                //this.warehouseName = this.lookup_places.find(x=>x.value==this.placeID).label;

                this.$axios({
                    method: 'GET',
                    url: this.apiURL + 'spBitaPeopleByUserByPlace',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        placeID: this.placeID,
                        userLanguage: 'es',
                    }
                }).then((response) => {
                    this.gridData = JSON.parse(response.data[0].details);
                    this.lookup_reasons = JSON.parse(response.data[0].lookup_reasons);
                    this.lookup_visitors = JSON.parse(response.data[0].lookup_visitors);
                    this.lookup_cars = JSON.parse(response.data[0].lookup_cars);
                    this.lookup_visited = JSON.parse(response.data[0].lookup_visited);
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
                    this.loadingData = false
                })
            
            }
        },
        openNewForm(){
            this.editStatus = {
                editMode: 'create'
                ,copyRecord: 0
                ,navigateToRecord: 0
                ,placeID: this.placeID
            }
            this.$router.push(this.$router.currentRoute.path+'/'+this.editStatus.navigateToRecord) //navigate to Record
        },
        showOptions(e){
            if(e.row.rowType=='data'){
                e.component.selectRows(e.row.key);
                e.items = [
                    { text: "Abrir Registro", icon: "fas fa-folder-open", onItemClick: ()=> { 
                        //this.kardexVisible = true 
                        let newStatus = { 
                            editMode: 'edit',
                            copyRecord: 0,
                            navigateToRecord: e.row.data.record_id,
                            placeID: this.placeID
                        }
                        this.editStatus = newStatus;
                        this.$router.push(this.$router.currentRoute.path+'/'+this.editStatus.navigateToRecord) //navigate to Record
                    } }
                ];
            }
        },
        exportData(){
            const context = this;
            const workbook = new ExcelJS.Workbook();
            const workSheet = workbook.addWorksheet('Visitantes');
            const component = this.$refs['mainviewtableDxDataGrid'].instance;
            exportDataGrid({
                worksheet: workSheet,
                component: component,
                topLeftCell: { row: 1, column: 1 },
                //customizeCell: ({ gridCell, excelCell }) => { setAlternatingRowsBackground(gridCell, excelCell); }
            }).then(() => {
                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Visitantes.xlsx');
                })
            })
            
        },
    },
    computed: {
        userCode: { get () { return this.$store.state.main.userCode }  },
        userCompany: { get () { return this.$store.state.main.userCompany }  },
        userName: { get () { return this.$store.state.main.userName }  },
        userLastName: { get () { return this.$store.state.main.userLastName }  },
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
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
        lookup_reasons: {
            get () { return this.$store.state[this.moduleName].lookup_reasons },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'lookup_reasons', value: val})  }
        },
        lookup_visitors: {
            get () { return this.$store.state[this.moduleName].lookup_visitors },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'lookup_visitors', value: val})  }
        },
        lookup_cars: {
            get () { return this.$store.state[this.moduleName].lookup_cars },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'lookup_cars', value: val})  }
        },
        lookup_visited: {
            get () { return this.$store.state[this.moduleName].lookup_visited },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'lookup_visited', value: val})  }
        },
    },
    watch: {
        userCompany: function(val){
            this.gridData = [];
            this.placeID = null;
            //this.placeName = null;
            this.loadUserPlaces();
        },
        toolbarSearchString: function(val){
            this.$refs['mainviewtableDxDataGrid'].instance.searchByText(this.toolbarSearchString);
        }
    }
})
</script>