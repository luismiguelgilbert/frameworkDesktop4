<template>
    <div>
        <q-card class="q-ma-sm rounder-corners shadow-8"  style="min-height: 200px; height: calc(100vh - 68px); overflow-y: hidden;" >
            <div v-if="dataLoaded">
                <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
                    <q-toolbar-title class="text-weight-bolder">Tablero Gerencial para Visitas y Bitácora</q-toolbar-title>
                    <q-btn
                        flat no-caps no-wrap stretch
                        :color="userColor=='blackDark'?'white':'primary'"
                        icon="fas fa-chart-bar" label="Reportes de Bitácora Digital" icon-right="fas fa-caret-down"
                        >
                        <q-menu>
                            <q-list>
                                <q-item
                                    clickable v-close-popup="2" :class="userColor=='blackDark'?'text-white':'text-primary'" @click="openReportForm(1)"
                                    >
                                    <q-item-section avatar><q-icon name="fas fa-people-arrows" /></q-item-section>
                                    <q-item-section><q-item-label>Reporte de Visitas</q-item-label></q-item-section>
                                </q-item>
                                <q-item
                                    clickable  v-close-popup="2" :class="userColor=='blackDark'?'text-white':'text-primary'" @click="openReportForm(2)"
                                    >
                                    <q-item-section avatar><q-icon name="fas fa-exclamation-circle" /></q-item-section>
                                    <q-item-section><q-item-label>Reporte de Bitácora</q-item-label></q-item-section>
                                </q-item>
                                <q-item
                                    clickable  v-close-popup="2" :class="userColor=='blackDark'?'text-white':'text-primary'" @click="openReportForm(3)"
                                    >
                                    <q-item-section avatar><q-icon name="fas fa-car-side" /></q-item-section>
                                    <q-item-section><q-item-label>Reporte de Viajes</q-item-label></q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                        <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                            <b>Reportes</b><br>Ver reportes y dashboards
                        </q-tooltip>
                    </q-btn>
                </q-toolbar>
                <q-separator />
                <div style="width: calc(100vw - 16px); overflow: hidden;">
                    <reportComponent
                        :moduleName="moduleName"
                        rptName="Tablero Gerencial de Visitas y Bitácora"
                        rptLink="BitacoraDigital"
                        :rptLinkCompany="false"
                        rptType="PBIRS"
                        :rptPowerBiExtraFilter="' and bitaPlacesUsers/sys_company_id eq ' + userCompany + ' and bitaPlacesUsers/sys_user_code eq ' + userCode "
                        />
                        <!-- :rptPowerBiExtraFilter="' and bitaPlacesUsers_view/sys_company_id eq 1 and bitaPlacesUsers_view/sys_user_code eq 1 '" -->
                    
                </div>
            </div>
            <div v-else style="height: calc(100vh - 80px)"  >
                <q-inner-loading :showing="!dataLoaded">
                    <q-spinner-facebook size="10%" color="primary" />
                </q-inner-loading>
            </div>
        </q-card>

        <!-- Report Execution Digalog -->
        <q-dialog v-if="isreportDialog" v-model="isreportDialog" square>
            <q-card style="min-width: calc(95vw)">
                <q-bar class="bg-primary text-white q-pl-none q-pr-none">
                    <q-btn :label="'Reporte: ' + reportData.name_es" no-caps flat stretch color="white" />
                    <q-space />
                    <q-btn flat stretch color="white" icon="fas fa-times" @click="isreportDialog=false" />
                </q-bar>
                <q-card-section>
                    <reportComponent
                        :moduleName="moduleName"
                        :rptName="reportData.name_es"
                        :rptLink="reportData.link_name"
                        :rptLinkCompany="false"
                        :rptType="reportData.report_type"
                        v-if="isreportDialog"
                        @closeComponent="isreportDialog=false"
                        />
                </q-card-section>
                
            </q-card>
        </q-dialog>
    </div>
</template>
<script>
import reportComponent from 'components/mainReport/reportComponentDialog'

export default ({
    components: {
        reportComponent
    },
    created(){
        if(!(this.$store.state[this.moduleName].columnsUser)){//NO existe, entonces inicializo
            this.$store.commit(this.moduleName+'/resetToDefaultState')
        }
        this.columnKeyName = 'record_id'
        this.mainRoute = this.moduleMainRoute;
        this.rptName = this.rptName_;
        this.rptLink = this.rptLink_;
        this.rptLinkCompany = this.rptLinkCompany_;
        this.rptType = this.rptType_;
        this.loadUserPlaces();
    },
    data () {
        return {
            moduleName: "Bitadashboard", //this should match the module Name (same as table sys_links.link_name) AND should match Vuex Store Name
            moduleMainRoute: '/RootBitacora/Bitadashboard',
            rptName_: 'Ingreso', rptLink_: 'Bitadashboard', rptLinkCompany_: true, rptType_: 'ssrs',
            dataLoaded: false, lookup_places: [], placeID: null,
            isreportDialog: false, reportData: null
        }
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
                if(!(this.editStatus.placeID)){
                    if(response.data&&response.data.length>0){
                        this.placeID = response.data[0].value;
                        this.dataLoaded = true;
                    }
                }else{
                    this.placeID = this.editStatus.placeID;
                    this.loadData();
                    this.dataLoaded = true;
                }
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
        openReportForm(reporte){
            if(reporte==1){
                this.reportData = { name_es: 'Reporte de Visitas', link_name:'sp_RPT_bita_records_details', report_type: 'ssrs' }
            }
            if(reporte==2){
                this.reportData = { name_es: 'Reporte de Bitácora', link_name:'sp_RPT_bita_events_details', report_type: 'ssrs' }
            }
            if(reporte==3){
                this.reportData = { name_es: 'Reporte de Viajes', link_name:'sp_RPT_bita_cars_details', report_type: 'ssrs' }
            }
            
            this.isreportDialog = true;
        }
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode }  },
        userCompany: { get () { return this.$store.state.main.userCompany }  },
        userName: { get () { return this.$store.state.main.userName }  },
        userLastName: { get () { return this.$store.state.main.userLastName }  },
        userColor: { get () { return this.$store.state.main.userColor }  },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        columnKeyName: {
            get () { return this.$store.state[this.moduleName].columnKeyName },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnKeyName', value: val}) }
        },
        mainRoute: {
            get () { return this.$store.state[this.moduleName].mainRoute },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'mainRoute', value: val}) }
        },
        rptName: {
            get () { return this.$store.state[this.moduleName].rptName },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptName', value: val}) }
        },
        rptLink: {
            get () { return this.$store.state[this.moduleName].rptLink },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptLink', value: val}) }
        },
        rptLinkCompany: {
            get () { return this.$store.state[this.moduleName].rptLinkCompany },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptLinkCompany', value: val}) }
        },
        rptType: {
            get () { return this.$store.state[this.moduleName].rptType },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptType', value: val}) }
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
    }    
})
</script>