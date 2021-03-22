<template>
<q-page style="min-height: 200px; height: calc(100vh - 100px);">
    <q-card class="rounder-corners shadow-3">
        <q-bar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'bg-white text-primary')">
            <q-toolbar-title>
            Reporte: {{currentReportData.report.name_es}}
            </q-toolbar-title>
            <q-space />
            <div v-if="passwordRequired" class="text-caption"> Usuario: {{ReportServer_User}} / Clave: {{ReportServer_Password}}</div>
            <q-btn label="Regresar" :color="userColor=='blackDark'?'white':'primary'" flat icon="fas fa-chevron-left" stretch @click="goBack" />
        </q-bar>
        <q-separator />
        <!--{{reportURL}}-->
        <!--style="height: calc(100vh - 58px);"-->
        <iframe
            class="full-width"
            style="height: calc(100vh - 95px);"
            :src="reportURL" 
            @load="onload"
            frameborder="0" />
    </q-card>
    
    <q-inner-loading :showing="loadingData" style="z-index: 999;">
        <q-spinner-ios size="50px" color="amber" />
    </q-inner-loading>
</q-page>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default ({
  data () {
    return {
        moduleName: "reportComponent", router: this.$router, loadingData: false, passwordRequired: true,
    }
  },
  created(){
        this.passwordRequired = true
        this.loadingData = true
  },
  methods:{
    goBack(){
        //this.router.replace('/'+this.currentPathModule); //navigate to previous Main module
        this.router.go(-1)
    },
    onload(){
        console.dir('fire onLoad')
        this.passwordRequired = false
        this.loadingData = false
    },
  },
  computed:{
    userMainToolbarComponentClass: { get () { 
        let result = 'no-padding '
        if(this.$store.state.main.userColor=='default'){
            result=result + 'bg-white text-primary'
        }
        if(this.$store.state.main.userColor=='blackDark'){
            result=result + 'bg-grey-10 text-white'
        }
        return result
    }},
    userColor: { get () { return this.$store.state.main.userColor }  },
    userCode: { get () { return this.$store.state.main.userCode } },
    userCompany: { get () { return this.$store.state.main.userCompany } },
    /*editRecord: { get () { 
        return this.$store.state.main[this.moduleName].editRecord;
      },
      set(val) {
        let cambio = { module: this.moduleName, key: 'editRecord', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    editMode: { get () { 
        return this.$store.state.main[this.moduleName].editMode;
      },
      set(val) {
        let cambio = { module: this.moduleName, key: 'editMode', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    loadingData: { get () { 
            return this.$store.state.main[this.moduleName].loadingData
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'loadingData', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },*/
    currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
    currentReportData: { get () { return this.$store.state.main.currentReportData; }, set (val) { this.$store.commit('main/updateState', {key: 'currentReportData', value: val}) } },
    reportURL: { get () { 
            let  result = ''
            let report = this.currentReportData.report
            if(report.report_type=='ssrs'){
                result = this.$q.sessionStorage.getItem('ReportServer_Path')
                result = result + this.currentReportData.report.link_name
                result = result + '?rs:embed=true'
                result = result + '&sys_user_code=' + this.userCode
                result = result + '&sys_user_language=es'//result = result + '&sys_user_language=' + this.$q.sessionStorage.getItem('sys_user_language')
                result = result + '&sys_user_company=' + this.userCompany
                //si es que el reporte tiene row_id, lo adiciona
                try{
                    result = result + '&row_id=' + this.currentReportData.parameters.row_id
                }catch(ex){}
                console.dir(this.currentReportData)
            }else{//PBIRS
                result = this.$q.sessionStorage.getItem('ReportServer_BI_Path');
                result = result + this.currentReportData.report.link_name
                result = result + '?rs:embed=true'
                result = result + '&filter=sys_users/sys_user_code eq ' + this.$q.sessionStorage.getItem('sys_user_code')
                //this.reportURL = this.reportURL + ' and sys_user_companies/sys_user_code eq ' + this.$q.sessionStorage.getItem('sys_user_code')
                result = result + ' and sys_companies/sys_company_id eq ' + this.$q.sessionStorage.getItem('sys_user_company')
            }
            console.dir(result)
            return result; 
        } 
    },
    ReportServer_User: { get () { return this.$q.sessionStorage.getItem('ReportServer_User') } },
    ReportServer_Password: { get () { return this.$q.sessionStorage.getItem('ReportServer_Password') } },
  },
})
</script>