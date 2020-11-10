<template>
<q-layout v-if="maindataLoaded && userCode" container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px);">

    <q-header>
        <headerBar
            :moduleName="moduleName.toString()"
            :moduleEditName="moduleEditName.toString()"
            @onClearFilter="onClearFilter"
            @onFilterApplied="onFilterApplied"  />
        <q-separator color="grey-4" />
    </q-header>

    <q-page-container>
        <tableComponent
            :moduleName="moduleName.toString()" ref="mainTableComponent"
            :moduleEditName="moduleEditName.toString()"
            @onContextMenuClicked="contextMenuClicked"
            />
    </q-page-container>

    <q-drawer side="right" v-model="isDrawerVisible" bordered behavior="desktop" >
        <filtersLayoutComponent v-if="isFiltersDrawerVisible"
                :moduleName="moduleName.toString()"
                @onFilterApplied="onFilterApplied"
                />
        <columnsLayoutComponent v-if="isColumnsDrawerVisible"
            :moduleName="moduleName.toString()"
            />
    </q-drawer>


    <q-inner-loading :showing="loadingData" style="z-index: 999;">
        <q-spinner-ios size="50px" color="primary" />
    </q-inner-loading>

    <q-dialog v-if="mailDialog" v-model="mailDialog">
        <q-card>
            Contenido:
            {{this.mailSender}}
            {{this.mailDestinations}}
            {{this.mailSubject}}
            {{this.mailBody}}
            {{this.mailAttachments}}
        </q-card>
    </q-dialog>

</q-layout>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import columnsLayoutComponent from '../../../components/mainTable/columnsLayoutComponent.vue'
import tableComponent from '../../../components/mainTable/tableComponent.vue'
import filtersLayoutComponent from '../../../components/mainTable/filtersLayoutComponent.vue'
/*Specific*/
import headerBar from './barComponent.vue'

export default ({
  components: {
     columnsLayoutComponent: columnsLayoutComponent
    ,tableComponent: tableComponent
    ,filtersLayoutComponent: filtersLayoutComponent
    ,headerBar: headerBar
  },
  mounted(){
    //si userCode existe, entonces carga datos básicos del módulo (eg. page refresh puede hacer que userCode se cargue luego, y ese dato es indispensable para la lectura)
    if(this.userCode){
        this.loadModouleData();
    }
  },
  data () {
    return {
        moduleName: "mktPO",
        moduleEditName: "mktPOEdit",
        maindataLoaded: false,
        router: this.$router,
        mailDialog: false, mailSender: null, mailDestinations: null, mailSubject: null, mailBody: null
    }
  },
  methods:{
    loadModouleData(){
        this.loadingData = true
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spSysModulesSelect',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                sys_user_code: this.userCode,
                link_name: this.moduleName,
            }
        }).then((response) => {
            this.columnsSystem = JSON.parse(response.data[0].columnsSystem)
            this.filters = JSON.parse(response.data[0].filters)
            this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
            this.security = JSON.parse(response.data[0].security)
            //antes estaba aquí this.pagination = JSON.parse(response.data[0].pagination)
            if(!this.columnsUserLoaded){//es primera carga?
                this.pagination = JSON.parse(response.data[0].pagination)//ahora está aquí
                this.columnsUser=JSON.parse(response.data[0].columnsUser)//(asigna columnas de usuarios
                let initialPagination = JSON.parse(JSON.stringify(this.pagination))//clona
                initialPagination.rowsPerPage = this.userRowsPerPage//asigna rowsPerPage
                this.pagination = initialPagination;//save to vuex
                this.currentFilter = JSON.parse(response.data[0].currentFilter)//filtroPredeterminado viene desde la base de datos
                this.moduleReports = JSON.parse(response.data[0].moduleReports)//filtroPredeterminado viene desde la base de datos
            }
            this.maindataLoaded = true
            this.loadingData = false
        }).catch((error) => {
            console.dir(error)
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
    },
    onFilterApplied(){
        let resetPagination = JSON.parse(JSON.stringify(this.pagination))//clona
        resetPagination.page = 1; resetPagination.rowsNumber = 0; //reset to default
        this.pagination = resetPagination; //update pagintation
        this.$refs.mainTableComponent.loadData(); //reload Data
    },
    onClearFilter(){
        this.currentFilter = [];
        this.$refs.mainTableComponent.loadData();
    },
    contextMenuClicked(data)
    {
        //console.dir('contextMenuClicked')
        //console.dir(data)
        this[data.name](data.dataProp)
    },
    //custom
    downloadReportForm(currentRow){
        /*console.dir('downloadReportForm')
        console.dir(currentRow)
        console.dir(currentRow.cols.find(x=>x.is_key).field)*/
        let newReportData = {
            report: {
                 comment_es: "Orden de Compra"
                ,icon: "fas fa-file"
                ,is_paginated_rpt: true
                ,link_name: "mktPO" + '_' + this.userCompany
                ,name_es: "Órden de Compra"
                ,position: 1
                ,report_type: "ssrs"
                ,sys_report_id: 1
            }
            ,parameters: {
                row_id: currentRow.row[currentRow.cols.find(x=>x.is_key).field]
            }
        }
        //console.dir(newReportData)
        this.currentReportData = newReportData
        this.router.push('/mainReport');
    },
    sendMail(currentRow){
        /*alert('Enviar Mail')
        this.mailSender = 'luismiguelgilbert@gmail.com'
        this.mailDestinations = 'lgilbert@bitt.com.ec'
        this.mailSubject = 'Orden de Compra'
        this.mailBody = 'El mensaje debe ser enviado de esta forma:'
        this.mailAttachments = []
        this.mailDialog=true
        //obtener datos de mails, subject, cuerpo de mail*/
        this.loadingData = true
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spMktPOSendMail',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                sys_user_code: this.userCode,
                link_name: this.moduleName,
            }
        }).then((response) => {
            this.loadingData = false
            alert(JSON.stringify(response))
        }).catch((error) => {
            console.dir(error)
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
    userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage } },
    pagination: {
      get () { return this.$store.state[this.moduleName].pagination },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'pagination', value: val}) }
    },
    columnsSystem: {
        get () { return this.$store.state[this.moduleName].columnsSystem },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsSystem', value: val}) }
    },
    columnsUser: {
        get () { return this.$store.state[this.moduleName].columnsUser },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsUser', value: val}) }
    },
    columnsUserLoaded: {
        get () { return this.$store.state[this.moduleName].columnsUser.length>0?true:false },
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
    currentReportData: {
        get () { return this.$store.statemain.currentReportData },
        set (val) { this.$store.commit('main/updateState', {key: 'currentReportData', value: val}) }
    },
    selectedRows: {
        get () { return this.$store.state[this.moduleName].selectedRows },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'selectedRows', value: val}) }
    },
    
  },
  watch: {
    userCode: function (val) {
      if(val){
        this.loadModouleData();
      }
    },
    userCompany: function (val) {
      if(this.$refs.mainTableComponent){
          this.selectedRows=[];
          this.$refs.mainTableComponent.loadData();
      }
    },

  }
})
</script>
