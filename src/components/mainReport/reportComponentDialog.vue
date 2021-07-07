<template>
<!--<q-dialog square  v-model="isVisible" @show="showEvent">-->
<!--<div style="margin: -16px;">-->
<div :style="rptType.toLowerCase()=='ssrs'?'margin: -16px;':'margin: 0px;'">
    
    <iframe
        ref="bittrpt"
        name="bittrpt"
        class="full-width" frameborder="0"
        v-if="isURLready"
        :src="reportURL"
        referrerpolicy="unsafe-url"
        sandbox="allow-scripts allow-same-origin"
        />
      
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
            this.pruebas(); return;
            if(this.rptLinkCompany){
                this.reportLinkFull=this.rptLink+'_'+this.userCompany
            }else{
                this.reportLinkFull = this.rptLink
            }
            //Build URL
            //Ahora, solamente usamos PowerBI Report Server porque ya es compatible con paginated reports (ssrs)
            if(this.rptType.toLowerCase()=='ssrs'){
                //console.dir('SSRS')
                //console.dir('this.userCompany = ' + this.userCompany)
                //console.dir('sessionStorage = ' + this.$q.sessionStorage.getItem('sys_user_company'))
                
                //Ahora, solamente usamos PowerBI Report Server porque ya es compatible con paginated reports (ssrs)
                //this.reportURL = this.$q.sessionStorage.getItem('ReportServer_Path')//debido a qu
                this.reportURL = this.$q.sessionStorage.getItem('ReportServer_BI_Path')
                
                //Ahora, solamente usamos PowerBI Report Server porque ya es compatible con paginated reports (ssrs), entonces se cambia la ruta
                this.reportURL = this.reportURL.replace('powerbi','report')
                
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
                console.dir(this.reportURL)
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
        pruebas(){
            console.dir('pruebas START')
            //window.open("https://bitt.com.ec", "_blank");
            //http://192.168.0.3/reports/report/ChartofAccounts
            //this.reportURL = 'http://Administrador:Bitt2010@192.168.0.250/reportsbi/report'
            
            /*
            this.reportURL = 'http://Administrador:Bitt2010@192.168.0.3/reports/report/'
            this.reportURL += 'ChartofAccounts'
            this.reportURL += '?rs:Embed=true' 
            this.reportURL += '&sys_user_code=' + this.userCode
            this.reportURL += '&sys_user_language=es'
            this.reportURL += '&sys_user_company=' + this.userCompany
            */


            this.reportURL = 'http://luismiguelgilbert@gmail.com:titotito2011@localhost/reportsbi/powerbi/'
            //this.reportURL = 'http://localhost/reportsbi/powerbi/'
            //this.reportURL += 'mfgDashboard'
            //this.reportURL += 'CustomerProfitabilitySamplePBIX'
            //this.reportURL += '?rs:Embed=true'
            //this.reportURL += '&filterPaneEnabled=true&navContentPaneEnabled=true'
            //this.reportURL += '&filterPaneEnabled=false&navContentPaneEnabled=false'
            //this.reportURL += '&filter=sys_users/sys_user_code eq ' + this.$q.sessionStorage.getItem('sys_user_code')
            //console.dir(this.reportURL)
            //this.reportURL += ' and sys_companies/sys_company_id eq ' + this.$q.sessionStorage.getItem('sys_user_company')

            //this.reportURL = 'http://Administrador:Bitt2010@192.168.0.3/reportsbi/powerbi/'
            //this.reportURL = 'http://192.168.0.3/reportsbi/powerbi/'
            //this.reportURL = 'http://192.168.0.250/reportsbi/powerbi/'
            this.reportURL = 'http://Administrador:Bitt2010@192.168.0.250/reportsbi/powerbi/'
            this.reportURL += 'pbirs_pruebas'
            this.reportURL += '?rs:Embed=true' 
            //this.reportURL += '&sys_user_code=' + this.userCode
            //this.reportURL += '&sys_user_language=es'
            //this.reportURL += '&sys_user_company=' + this.userCompany

            //window.open("http://Administrador:Bitt2010@192.168.0.250/reportsbi/report/ssrs_pruebas?rs:embed=true");
            //window.open(this.reportURL);
            //var myWindow = window.open(this.reportURL, "MsgWindow", "width=200,height=100");
            var myWindow = window.open(this.reportURL);
            console.dir('myWindow:')
            console.dir(myWindow)
            //myWindow.document.write("<p>This is 'MsgWindow'. I am 200px wide and 100px tall!</p>");
            

            //this.reportURL = 'http://localhost/reportsbi/report/ssrs_pruebas?rs:embed=true'
            //this.reportURL = 'http://192.168.0.250/reportsbi/report/ssrs_pruebas?rs:embed=true'
            //this.reportURL = 'http://Administrador:Bitt2010@192.168.0.250/reportsbi/report/ssrs_pruebas?rs:embed=true'
            //this.reportURL = 'http://192.168.0.250/reportsbi/report/ssrs_pruebas?rs:embed=true'
            //this.reportURL = 'http://luismiguelgilbert@gmail.com:titotito2011@localhost/reportsbi/report/ssrs_pruebas?rs:embed=true'
            //this.reportURL = 'http://luismiguelgilbert@gmail.com:titotito2011@localhost/reportsbi/powerbi/HumanResourcesSamplePBIX?rs:embed=true'
            //window.open(this.reportURL, "_blank","width=500, height=500, titlebar=no, fullscreen=yes, statusbar=no");
            //window.open(this.reportURL, "_blank","location=no, titlebar=no, fullscreen=yes, statusbar=no");
            //window.open(this.reportURL);
            //console.dir(this.$refs)
            //console.dir(this.$refs.bittrpt)
            //console.dir(this.$refs.bittrpt.baseURI)
            //console.dir(this.$refs.bittrpt.baseURI)
            //this.$refs.bittrpt.src = this.reportURL
            //console.dir(this.$refs.bittrpt.src = this.reportURL)
            
            //this.$refs.bittrpt

            //var myWindow = window.open("http://luismiguelgilbert@gmail.com:titotito2011@localhost/reportsbi/report/ssrs_pruebas?rs:embed=true", "MsgWindow", "width=200,height=100");
            //myWindow.document.write("<p>This is 'MsgWindow'. I am 200px wide and 100px tall!</p>");
            //http://username:password@server:port/Reports/powerbi/report1?rs:embed=true

            //this.isURLready = true;
            return;

            
            this.$axios({
              method: 'GET',
              url: this.apiURL + 'pbirsLogin',
              headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
              //responseType: 'blob', // important
              params: { 
                //reportURL: 'https://bitt.com.ec/Reports/report/ChartofAccounts?rs:Embed=true&sys_user_code=1&sys_user_language=es&sys_user_company=4'
                //reportURL: 'http://localhost/ReportsBI/report/ssrs_pruebas?&rs:ClearSession=true&rs:format=PDF'
                //https://bitt.com.ec/ReportServer?/mktPO_10&rs:ClearSession=true&rs:format=PDF
                //reportURL: 'http://localhost/ReportServerBI?/ssrs_pruebas?rs:ClearSession=true&rs:format=PDF'
                
                //Algo hace
                //reportURL: 'http://localhost/ReportServerBI/Pages/ReportViewer.aspx?ssrs_pruebas&rs:Command=Render&rs:format=PDF'
                reportURL: 'https://localhost/ReportServerBI?/ssrs_pruebas&rs:ClearSession=true&rs:format=PDF'
                
              }
          }).then((response) => {
              /*
              let blob = new Blob([response.data])
              let link = document.createElement('a')
              link.setAttribute("type", "hidden"); // make it hidden if needed
              link.href = window.URL.createObjectURL(blob)
              document.body.appendChild(link);
              link.download = file.original_file_name//set download file name
              link.click()
              link.remove()
              */
             console.dir('Respuesta:')
             console.dir(response)
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

            console.dir('pruebas END')
        }
    },
    mounted(){
        this.showEvent();
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        /*rptName: { get () { return this.$store.state[this.moduleName].rptName },},
        rptLink: { get () { return this.$store.state[this.moduleName].rptLink },},
        rptLinkCompany: { get () { return this.$store.state[this.moduleName].rptLinkCompany },},
        rptType: { get () { return this.$store.state[this.moduleName].rptType },},*/
    }
    
})
</script>