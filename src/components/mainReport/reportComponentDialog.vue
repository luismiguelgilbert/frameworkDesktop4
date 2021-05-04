<template>
<!--<q-dialog square  v-model="isVisible" @show="showEvent">-->
<!--<div style="margin: -16px;">-->
<div :style="rptType.toLowerCase()=='ssrs'?'margin: -16px;':'margin: 0px;'">
    <iframe
        ref="bittrpt"
        name="bittrpt"
        class="full-width" frameborder="0"
        :style="rptType.toLowerCase()=='ssrs'?'min-height: calc(100vh - 86px); max-height: calc(100vh - 86px);':'min-height: calc(100vh - 119px); max-height: calc(100vh - 119px);'" 
        v-if="isURLready"
        :src="reportURL"
        
        />
        
    <!--@load="checkHeight"
         calc(100vh - 92px)
        <q-card :style="isFullSize?'minWidth: 95%; minHeight: 95%;':'minWidth: 45%; minHeight: 45%;'">
        <q-bar class="bg-primary text-white">
          <div>Reporte: {{rptName}}</div>
          <q-space />
          <q-btn dense flat :icon="isFullSize?'fas fa-window-minimize':'fas fa-window-maximize'" @click="isFullSize=!isFullSize" >
            <q-tooltip>{{isFullSize?'Minimizar':'Maximizar'}}</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="fas fa-times-circle" @click="closeComponent" >
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="no-padding">
            <iframe
                class="full-width" style="height: calc(100vh - 95px);" frameborder="0"
                v-if="isURLready"
                :src="reportURL"
                />
        </q-card-section>
    </q-card>-->
</div>
<!--</q-dialog>-->
</template>
<!--
<style lang="scss">
  .report{
    height: 300px !important;
    min-height: 300px !important;
    max-height: 300px !important;
  }
</style>
-->
<script>
import Vue from 'vue';
import Vuex from 'vuex';
export default ({
    props: {
        moduleName: { type: String , required: true },
        rptName: { type: String , required: true },
        rptLink: { type: String , required: true },
        rptLinkCompany: { type: Boolean , required: true },
        rptType: { type: String , required: true },
        rptPowerBiExtraFilter: { type: String  },
    },
    data () {
        return {
            isVisible: true
            ,isFullSize: true
            ,reportLinkFull: ''
            ,reportURL: ''
            ,isURLready: false
            ,router: this.$router
        }
    },
    methods:{
        closeComponent(){
            this.$emit('closeComponent', true)
        },
        showEvent(){
            if(this.rptLinkCompany){
                this.reportLinkFull=this.rptLink+'_'+this.userCompany
            }else{
                this.reportLinkFull = this.rptLink
            }
            //Build URL
            if(this.rptType.toLowerCase()=='ssrs'){
                console.dir('SSRS')
                console.dir('this.userCompany = ' + this.userCompany)
                console.dir('sessionStorage = ' + this.$q.sessionStorage.getItem('sys_user_company'))
                this.reportURL = this.$q.sessionStorage.getItem('ReportServer_Path')
                this.reportURL += this.reportLinkFull
                this.reportURL += '?rs:Embed=true' 
                this.reportURL += '&sys_user_code=' + this.userCode
                this.reportURL += '&sys_user_language=es'
                this.reportURL += '&sys_user_company=' + this.userCompany
                //si es que el reporte tiene row_id, lo adiciona
                /*if(parseInt(this.reportRecordID)>0){
                    this.reportURL += '&row_id=' + parseInt(this.reportRecordID)
                }*/
                if(parseInt(this.router.currentRoute.params.id)>0){
                    this.reportURL += '&row_id=' + parseInt(this.router.currentRoute.params.id)
                }
                this.isURLready = true
                //console.dir(this.reportURL)
            }else{//PBIRS
                console.dir('PBIRS')
                console.dir('this.userCompany = ' + this.userCompany)
                console.dir('sessionStorage = ' + this.$q.sessionStorage.getItem('sys_user_company'))
                this.reportURL += this.$q.sessionStorage.getItem('ReportServer_BI_Path');
                this.reportURL += this.reportLinkFull
                this.reportURL += '?rs:Embed=true'
                //this.reportURL += '&filterPaneEnabled=true&navContentPaneEnabled=true'
                this.reportURL += '&filter=sys_users/sys_user_code eq ' + this.$q.sessionStorage.getItem('sys_user_code')
                this.reportURL += ' and sys_companies/sys_company_id eq ' + this.$q.sessionStorage.getItem('sys_user_company')
                if(this.rptPowerBiExtraFilter&&this.rptPowerBiExtraFilter.length>0){
                    this.reportURL += this.rptPowerBiExtraFilter
                }
                this.isURLready = true
                //console.dir(this.reportURL)
            }
        },
    },
    mounted(){
        this.showEvent();
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        /*rptName: { get () { return this.$store.state[this.moduleName].rptName },},
        rptLink: { get () { return this.$store.state[this.moduleName].rptLink },},
        rptLinkCompany: { get () { return this.$store.state[this.moduleName].rptLinkCompany },},
        rptType: { get () { return this.$store.state[this.moduleName].rptType },},*/
    }
    
})
</script>