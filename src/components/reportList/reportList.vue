<template>
<div>
    <q-card class="q-ma-sm rounder-corners shadow-8 "  style="min-height: 200px; height: calc(100vh - 68px); overflow-y: hidden;" >
        <div v-if="dataLoaded">
            <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
                <q-toolbar-title class="text-weight-bolder">{{rootTitle}}</q-toolbar-title>
            </q-toolbar>
            <q-separator />
            <q-list  :class="'rounded-borders q-ma-lg ' + (userColor=='default'?' bg-white ':'  bg-dark ')" separator  style=" height: calc(100vh - 168px); overflow-y: auto;"> <!--bordered-->
                <!--<div class="q-pa-md text-primary text-subtitle2">
                    <q-icon name="fas fa-th-list" color="primary" size="1.5rem" class="q-mr-sm" />
                    Lista de todos los reportes disponibles
                </div>
                <q-separator />
                -->
                <q-card v-for="report in all_reports" :key="report.sys_report_id"  class="q-ma-xl">
                    <q-item clickable    v-ripple:primary @click.prevent="openReport(report)"  v-ripple :active="true" active-class="text-primary">
                        <q-item-section side >
                            <q-btn :icon="report.icon" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{report.name_es}}</q-item-label>
                            <q-item-label caption>{{report.comment_es}}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            Abrir de forma automática
                            <q-toggle tag="label" :value="report.autoOpen" color="green" title="Este reporte se abre de forma automática al abrir este módulo" @input="changeAutoOpen(report)" /> <!--v-model="value"-->
                        </q-item-section>
                    </q-item>
                    <!--<q-separator />-->
                </q-card>
           
            </q-list>
        </div>
         <div v-else style="height: calc(100vh - 80px)"  >
            <q-inner-loading :showing="!dataLoaded">
                <q-spinner-facebook size="10%" color="primary" />
            </q-inner-loading>
        </div>
    </q-card>
</div>
</template>
<script>

export default ({
    props: {
        rootName: { type: String, required: true },
        rootTitle: { type: String, required: true },
    },
    data () {
        return {
            dataLoaded: false,
            all_reports: [],
        }
    },
    mounted(){
        this.dataLoaded = true;
        this.loadData(true);
    },
    methods:{
        loadData(isFirstLoad){
            this.$q.loading.show()
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spSysReportsSelect',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    rootName: this.rootName,
                }
            }).then((response) => {
                this.all_reports = JSON.parse(response.data[0].all_reports)
                this.$q.loading.hide()
                this.openAllAutoOpen(isFirstLoad);
            }).catch((error) => {
                console.error(error.message)
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
                this.$q.loading.hide()
            })
        },
        openAllAutoOpen(isFirstLoad){
            if(isFirstLoad){
                this.all_reports.filter(x=>x.autoOpen).map(report=>{
                    this.openReport(report)
                })
            }
        },
        changeAutoOpen(report){
            this.$q.loading.show()
            this.$axios.post( this.apiURL + 'spSysReportsUpdate', {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    sys_report_id: report.sys_report_id,
                    newAutoOpenState: !report.autoOpen
                }
                , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
            ).then((response) => {
                this.$q.loading.hide()
                this.loadData(false);
            }).catch((error) => {
                this.$q.loading.hide()
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
        openReport(report){
            //Obtiene URL del PBIRS Portal
            let reportURL = this.$q.sessionStorage.getItem('ReportServer_BI_Path')
            //Adiciona Usuario y Clave de Windows de PBIRS Portal
            let user =  this.$q.sessionStorage.getItem('ReportServer_BI_Path_User')
            let pwd =  this.$q.sessionStorage.getItem('ReportServer_BI_Path_Pwd')
            reportURL = reportURL.replace('https://','https://'+user+':'+pwd+'@')//para https
            reportURL = reportURL.replace('http://','http://'+user+':'+pwd+'@')//para http
            //si es SSRS, entonces arma filtros basado en ssrs
            if(report.report_type=="ssrs"){
                reportURL += 'report/'
                reportURL += this.$q.sessionStorage.getItem('ReportServer_BI_Path_ChildPath')
                reportURL += report.link_name
                reportURL += '?rs:Embed=true' 
                reportURL += '&sys_user_token=' + this.$q.sessionStorage.getItem('jwtToken')
                reportURL += '&sys_user_code=' + this.userCode
                reportURL += '&sys_user_language=es'
                reportURL += '&sys_user_company=' + this.userCompany
            }else{//si es PBIRS, entonces arma filtros basado en pbirs
                reportURL += 'powerbi/'
                reportURL += this.$q.sessionStorage.getItem('ReportServer_BI_Path_ChildPath')
                reportURL += report.link_name
                reportURL += '?rs:Embed=true' 
                reportURL += '&filterPaneEnabled=false&navContentPaneEnabled=false'
                //filter=[Table Name]/[Column Name] eq '[Variable texto]' > Entre comillas cuando es texto
                //filter=[Table Name]/[Column Name] eq [Variable Número] > sin comillas cuando es número
                //&filter=spRPT_PBISecurity_Companies/sys_user_code eq 1 and spRPT_PBISecurity_Companies/sys_user_company eq 10 and spRPT_PBISecurity_Companies/sys_user_token eq 'algunTokenEntreComilla'
                //NOTA: El caracter / no se comporta bien al abrir nuevo tab, entonces se usa %2F que es el encoding correcto
                reportURL += "&filter=spRPT_PBISecurity_Companies%2Fsys_user_code eq " + this.userCode //filtra spRPT_PBISecurity_Companies basado en Usuario (Número)
                reportURL += " and spRPT_PBISecurity_Companies%2Fsys_user_company eq " + this.userCompany  //filtra spRPT_PBISecurity_Companies basado en Companía (Número)
                reportURL += " and spRPT_PBISecurity_Companies%2Fsys_user_token eq '" + this.$q.sessionStorage.getItem('jwtToken') + "'" //filtra spRPT_PBISecurity_Companies basado en Token (String)
            }
            //console.dir(report)
            //console.dir(reportURL)
            window.open(reportURL);
            //http://localhost/ReportsBI/powerbi/allReports/BitacoraDigital?rs:Embed=true&filterPaneEnabled=false&navContentPaneEnabled=false&filter=spRPT_PBISecurity_Companies%2Fsys_user_code%20eq%201
            //http://localhost/ReportsBI/powerbi/allReports/BitacoraDigital?rs:Embed=true&filterPaneEnabled=false&navContentPaneEnabled=false&filter=spRPT_PBISecurity_Companies/sys_user_code eq 1
            //openURL(reportURL)
        }
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode }  },
        userCompany: { get () { return this.$store.state.main.userCompany }  },
        userName: { get () { return this.$store.state.main.userName }  },
        userLastName: { get () { return this.$store.state.main.userLastName }  },
        userColor: { get () { return this.$store.state.main.userColor }  },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    },
})

</script>