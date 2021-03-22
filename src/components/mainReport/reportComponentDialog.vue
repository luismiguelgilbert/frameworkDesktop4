<template>
<!--<q-dialog square  v-model="isVisible" @show="showEvent">-->
<div style="margin: -16px;">    
    <iframe
        class="full-width" style="min-height: calc(100vh - 146px); max-height: calc(100vh - 146px);" frameborder="0"
        v-if="isURLready"
        :src="reportURL"
        />
    <!--<q-card :style="isFullSize?'minWidth: 95%; minHeight: 95%;':'minWidth: 45%; minHeight: 45%;'">
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
                this.reportURL = this.$q.sessionStorage.getItem('ReportServer_Path')
                this.reportURL += this.reportLinkFull
                this.reportURL += '?rs:embed=true' 
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
                console.dir(this.reportURL)
            }else{//PBIRS
                this.reportURL += this.$q.sessionStorage.getItem('ReportServer_BI_Path');
                this.reportURL += this.reportLinkFull
                this.reportURL += '?rs:embed=true' 
                this.reportURL += '&filter=sys_users/sys_user_code eq ' + this.$q.sessionStorage.getItem('sys_user_code')
                this.reportURL += ' and sys_companies/sys_company_id eq ' + this.$q.sessionStorage.getItem('sys_user_company')
                this.isURLready = true
                console.dir(this.reportURL)
            }
        }
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