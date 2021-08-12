<template>
    <div>
        <q-layout v-if="(isModuleDataLoaded&&isLookupDataLoaded)?true:false" container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px); overflow-y: hidden !important;">
            <!--Toolbar-->
            <mainViewToolbar :moduleName="moduleName" @clearFilter="clearFilter" @onOpenEditForm="openEditForm" @onApplyFilter="applyFilter" @onExportData="exportData" @onSaveFilter="saveFilter" ref="mainViewToolbar" />
            <!--Tabla-->
            <mainViewTable :moduleName="moduleName" @onOpenEditForm="openEditForm" @onApplyFilter="applyFilter" @onCompanyChange="companyChange" ref="mainViewTable" />
            <!--Columns-->
            <mainViewColumns :moduleName="moduleName" @onShow="reorganizeUserColumns" />
            <!--Filters-->
            <mainViewFilters :moduleName="moduleName" />
        </q-layout>
        <div v-if="!(isModuleDataLoaded&&isLookupDataLoaded)" style="height: calc(100vh - 80px)"  >
            <q-inner-loading :showing="!(isModuleDataLoaded&&isLookupDataLoaded)">
                <q-spinner-facebook size="10%" color="primary" />
            </q-inner-loading>
        </div>
    </div>
</template>
<script>
import mainViewToolbar from '../mainView/mainViewToolbar'
import mainViewTable from '../mainView/mainViewTable'
import mainViewColumns from '../mainView/mainViewColumns'
import mainViewFilters from '../mainView/mainViewFilters'
import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

export default ({
    name: 'mainView',
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        mainViewToolbar,
        mainViewTable,
        mainViewColumns,
        mainViewFilters
    },
    mounted(){
        this.loadModuleData();
        this.loadModuleLookups();
    },
    data () {
        return {
        }
    },
    methods: {
        loadModuleData(){
            this.$axios(
                {
                    method: 'GET',
                    url: this.apiURL + 'spSysModulesSelect',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        sys_user_code: this.userCode,
                        sys_company_id: this.userCompany,
                        link_name: this.moduleName,
                    }
                }).then((response) => {
                    this.columnsSystem = JSON.parse(response.data[0].columnsSystem)
                    this.filters = JSON.parse(response.data[0].filters)
                    this.security = JSON.parse(response.data[0].security)
                    this.moduleReports = JSON.parse(response.data[0].moduleReports)
                    this.columnsUser = JSON.parse(response.data[0].columnsUser)//asigna columnas de usuarios siempre (porque el gridState lo controla).. si se envía al isFirstOpen se cae proceso
                    if(this.isFirstOpen){//es primera carga?
                        this.defaultSortColumn = JSON.parse(response.data[0].pagination).sortBy
                        this.defaultSortDescending = JSON.parse(response.data[0].pagination).descending
                    }
                    this.isModuleDataLoaded = true;
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
                })
        },
        loadModuleLookups(){
            //this.isMainDataLoaded = false;//oculta interface mientras se recuperan lookups
            this.isModuleDataLoaded= false;//oculta interface mientras se recuperan lookups
            return this.$axios(
                {
                    method: 'GET',
                    url: this.apiURL + 'spSysModulesSelectLookupData',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        sys_user_code: this.userCode,
                        sys_company_id: this.userCompany,
                        link_name: this.moduleName,
                    }
                }).then((response) => {
                    let nuevoResultado = {}
                    if(response.data[0]){
                        Object.keys(response.data[0]).map(fieldName=>{
                            nuevoResultado[fieldName] = JSON.parse(response.data[0][fieldName])
                        })
                        this.columnsLookupData = nuevoResultado
                        //console.dir('this.isFirstOpen de ' + this.moduleName + ' = ' + this.isFirstOpen)
                        if(this.isFirstOpen){
                            setTimeout(()=>{
                                if(this.filters.some(x=>x.is_default)){//Es 1a carga y SI existe un filtro predeterminado
                                    this.$q.notify({color: 'positive', message: 'Estamos aplicando su filtro predeterminado' , timeout: 500, icon: "fas fa-filter" });
                                    this.applyFilter(this.filters.find(x=>x.is_default));
                                    this.isFirstOpen = false;
                                }else{
                                    //console.dir('es primera carga y NO hay un filtro predeterminado debo re-organizar registros basado en this.defaultSortColumn y this.defaultSortDescending')
                                    this.isFirstOpen = false;
                                }
                            }, 2000)
                        }else{
                            this.isFirstOpen = false;
                        }
                    }
                    this.isLookupDataLoaded = true;
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
                    this.$router.go(-1)
                })
        },
        companyChange(){
            this.loadModuleData();
            this.loadModuleLookups();
            this.$refs['mainViewTable'].$refs['mainviewtableDxDataGrid'].instance.refresh();
        },
        clearFilter(){
            this.isFilterApplied = false
            this.$refs['mainViewTable'].$refs['mainviewtableDxDataGrid'].instance.clearFilter();
        },
        openEditForm(){
            this.$router.push(this.$router.currentRoute.path+'/'+this.editStatus.navigateToRecord) //navigate to Record
        },
        applyFilter(filtro){
            try{
                let currentState = JSON.parse(JSON.stringify(this.$refs['mainViewTable'].$refs['mainviewtableDxDataGrid'].instance.state()));//Toma State actual
                let filtroState = JSON.parse(filtro.condition)
                //actualizo filtroState con la configuración actual menos: filterValue; y luego reseteo pageIndex, pageSize
                filtroState.allowedPageSizes = currentState.allowedPageSizes;
                filtroState.columns = currentState.columns;
                filtroState.filterPanel = currentState.filterPanel;
                filtroState.pageIndex = parseInt(0);
                filtroState.pageSize = parseInt(currentState.pageSize);
                //aplico estado ya ajustado
                this.$refs['mainViewTable'].$refs['mainviewtableDxDataGrid'].instance.state(filtroState);
            }catch(ex){
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "No se pudo completar acción. Revise su configuración de columnas visibles, y filtro."
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }
        },
        saveFilter(){
            if(this.isFilterApplied){
                //let filterData = JSON.parse(JSON.stringify(this.dxdatagridState));
                //let filterData = JSON.parse(JSON.stringify(sessionStorage[this.moduleName]));
                let filterData = sessionStorage[this.moduleName];
                /*
                console.dir('filterData:')
                console.dir(filterData)
                filterData.pageIndex = 0;
                filterData.pageSize = parseInt(this.userRowsPerPage);
                */
                this.$q.dialog({
                    message: 'Escriba el nombre de su filtro:',
                    prompt: { model: '', type: 'text'},
                    cancel: 'Cancelar',
                    persistent: true
                }).onOk(data => {
                    this.$axios.post( this.apiURL + 'spSysModulesFiltersUserUpdate',
                            {
                                link_name: this.moduleName,
                                sys_user_code: this.userCode,
                                filter_id: 0,//0=nuevo
                                name: data,
                                //conditions: JSON.stringify(filterData)
                                conditions: filterData
                            }
                            , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                        ).then((response) => {
                            this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                            //los filtros se reciben desde el mismo SP, entonces guardo en Vuex
                            this.filters = JSON.parse(response.data[0].filters)
                        }).catch((error) => {
                            console.error(error)
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
                        })
                })
            }else{
                this.$q.notify({color: 'red', message: 'No tiene filtros activos' , timeout: 500, icon: "fas fa-ban" });
            }
        },
        exportData(){
            const context = this;
            const workbook = new ExcelJS.Workbook();
            const workSheet = workbook.addWorksheet('Datos ' + this.rptName);
            const component = this.$refs['mainViewTable'].$refs['mainviewtableDxDataGrid'].instance;
            exportDataGrid({
                worksheet: workSheet,
                component: component,
                topLeftCell: { row: 1, column: 1 },
                //customizeCell: ({ gridCell, excelCell }) => { setAlternatingRowsBackground(gridCell, excelCell); }
                customizeCell: ({ gridCell, excelCell }) => { 
                    if(gridCell.rowType === 'data') {
                        if(this.columnsSystem.some(x=>x.db_column==gridCell.column.dataField&&x.ux_type=='money')){
                            try{
                                excelCell.value = parseFloat(excelCell.value.replace(/[^\d.-]/g, '')); //remueve los símbolos, y convierte a Float
                                //Solamente como número, SIN formato de moneda, para evitar problemas con diferentes idiomas de Excel
                                //excelCell.numFmt = '$#,##0.00;[Red]-$#,##0.00';
                                //excelCell.numFmt = '$#,##0.00';
                            }catch(ex){ }
                        }
                    }
                    /*if(gridCell.column.dataType=='number'||gridCell.column.dataType=='money'){
                        console.dir(excelCell.numFmt)
                        excelCell.numFmt = '#'
                        console.dir(excelCell.numFmt)
                    }*/
                }

            }).then(() => {
                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), this.rptName+'.xlsx');
                })
            })
            
        },
        reorganizeUserColumns(){
            let visibleColumns = this.$refs['mainViewTable'].$refs['mainviewtableDxDataGrid'].instance.getVisibleColumns()
            let newColumnsOrder = JSON.parse(JSON.stringify(this.columnsUser))
            newColumnsOrder.map(x=>{
                if(visibleColumns.some(y=>y.dataField==x.db_column)){
                    x.sortIndex = parseInt(visibleColumns.find(z=>z.dataField==x.db_column).visibleIndex)
                }
            })
            newColumnsOrder = newColumnsOrder.sort(function(a, b){ return a.sortIndex-b.sortIndex })
            this.columnsUser = newColumnsOrder;
        }
    },
    computed: {
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        userCode: { get () { return this.$store.state.main.userCode }  },
        userCompany: { get () { return this.$store.state.main.userCompany }  },
        userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage } },
        rptName: { get () { return this.$store.state[this.moduleName].rptName }, },
        columnsSystem: {
            get () { return this.$store.state[this.moduleName].columnsSystem },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsSystem', value: val}) }
        },
        columnsUser: {
            get () { return this.$store.state[this.moduleName].columnsUser },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsUser', value: val}) }
        },
        columnsLookupData: {
            get () { return this.$store.state[this.moduleName].columnsLookupData },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsLookupData', value: val}) }
        },
        columnsUserLoaded: {
            get () { return this.$store.state[this.moduleName].columnsUser.length>0?true:false },
        },
        dxdatagridState: {
            get () { return this.$store.state[this.moduleName].dxdatagridState },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'dxdatagridState', value: val})  }
        },
        filters: {
            get () { return this.$store.state[this.moduleName].filters },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filters', value: val}) }
        },
        filtersDetails: {
            get () { return this.$store.state[this.moduleName].filtersDetails },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filtersDetails', value: val}) }
        },
        isLookupDataLoaded: {
            get () { return this.$store.state[this.moduleName].isLookupDataLoaded },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isLookupDataLoaded', value: val}) }
        },
        isModuleDataLoaded: {
            get () { return this.$store.state[this.moduleName].isModuleDataLoaded },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isModuleDataLoaded', value: val}) }
        },
        isFirstOpen: {
            get () { return this.$store.state[this.moduleName].isFirstOpen },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFirstOpen', value: val}) }
        },
        security: {
            get () { return this.$store.state[this.moduleName].security },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'security', value: val}) }
        },
        defaultSortColumn: {
            get () { return this.$store.state[this.moduleName].defaultSortColumn },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'defaultSortColumn', value: val}) }
        },
        defaultSortDescending: {
            get () { return this.$store.state[this.moduleName].defaultSortDescending },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'defaultSortDescending', value: val}) }
        },


        /*pagination: {
            get () { return this.$store.state[this.moduleName].pagination },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'pagination', value: val}) }
        },*/
        currentFilter: {
            get () { return this.$store.state[this.moduleName].currentFilter },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'currentFilter', value: val}) }
        },
        moduleReports: {
            get () { return this.$store.state[this.moduleName].moduleReports },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'moduleReports', value: val}) }
        },
        isFilterApplied: {
            get () { return this.$store.state[this.moduleName].isFilterApplied },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFilterApplied', value: val}) }
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
    }
})
</script>