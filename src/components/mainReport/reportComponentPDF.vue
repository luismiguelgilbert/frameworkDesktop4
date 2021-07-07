<template>
    <div>
        <q-page class="no-padding flex flex-center" style="margin: -16px; minHeight: calc(100vh - 119px); height: calc(100vh - 119px);">
            <q-pdfviewer
                ref="myPdfViewer"
                type="html5"
                :src="pdfSource"
                v-model="visible"
            />
            <q-page-sticky position="bottom-right" :offset="[40,20]">
                <q-btn color="positive" label="Guardar PDF" icon="fas fa-file-pdf" @click="downloadPDF" />
            </q-page-sticky>
            <q-inner-loading :showing="isloading">
                <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
        </q-page>
    </div>
</template>

<script>
import { Platform } from 'quasar'
import saveAs from 'file-saver';

export default {
    props: {
        moduleName: { type: String , required: true }
    },
    data () {
        return {
            show: true,
            reportURL: null,
            visible: true,
            pdfSource: '',
            isloading: false,
            reportBlobData: null,
        }
    },
    mounted(){
        if(Platform.is.chrome){ this.dynamicOffset = [18,70] }
        this.showPDF();

    },
    methods:{
        showPDF(){
            this.isloading = true

            ////////////////////////////////////////////////
            //Nueva Versión PBIRS only
            ////////////////////////////////////////////////
            //url syntax to get PDF file from report [ssrs_pruebas]     >   'https://localhost/ReportServerBI?/ssrs_pruebas&rs:ClearSession=true&rs:format=PDF'
            this.reportURL = this.$q.sessionStorage.getItem('ReportServer_Export_Path'); 
            this.reportURL = this.reportURL + this.$q.sessionStorage.getItem('ReportServer_BI_Path_ChildPath'); 
            this.reportURL = this.reportURL + this.rptLink + (this.rptLinkCompany?'_'+this.userCompany:'') //este component se carga dinámicamente, entonces el único parámetro que recibe es el del módulo; por lo tanto, en el vuex del módulo está el nombre del reporte)
            this.reportURL += '&rs:ClearSession=true&rs:format=PDF&sys_user_code=' + this.userCode + '&sys_user_language=es&sys_user_company=' + this.userCompany + '&row_id=' + this.editStatus.navigateToRecord
            this.$axios({
                    method: 'GET',
                    url: this.apiURL + 'pbirsGetPDF', //este método, se encarga de hacer el login a PBIRS (con enviroment variables iisnode); genera PDF; luego me lo devuelve para descargar
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    responseType: 'blob', // important
                    params: { 
                        reportURL: this.reportURL,
                        pdfName: this.rptName + ' ' + this.editStatus.navigateToRecord + '.pdf'
                    }
            }).then((response) => {
                this.reportBlobData = response.data
                const blob = new Blob([response.data], { type: response.data.type })
                this.pdfSource = window.URL.createObjectURL(blob)
                this.isloading = false
            }).catch((error) => {
                console.dir(error.message)
                this.isloading = false
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
        downloadPDF(){
            saveAs(new Blob([this.reportBlobData], { type: 'application/pdf' }), this.rptName + ' ' + this.editStatus.navigateToRecord + '.pdf' );
            //this.reportBlobData = response.data
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        rptLink: {
            get () { return this.$store.state[this.moduleName].rptLink },
        },
        rptLinkCompany: {
            get () { return this.$store.state[this.moduleName].rptLinkCompany },
        },
        rptName: {
            get () { return this.$store.state[this.moduleName].rptName },
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
        },
    }
}
</script>