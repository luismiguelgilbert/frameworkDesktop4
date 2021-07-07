<template>
<div style="margin: -16px;">
    <div v-if="paymentTypeID==1">
        <q-toolbar class="no-padding">
            <div class="text-primary text-subtitle2 q-ml-md q-mr-md">Formato Predeterminado: </div>
            <q-select 
                :options="lookup_payment_formats"
                v-model="formatID"
                option-label="label"
                map-options emit-value borderless
                @input="showPDF"
                />
        </q-toolbar>
        <q-separator />
        <q-card>
                <div v-if="pdfSource">
                    <q-page class="no-padding flex flex-center" style="margin: -16px; minHeight: calc(100vh - 160px); height: calc(100vh - 160px);">
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
        </q-card>
    </div>
    <div v-else >
        <q-banner dense class="bg-primary text-white">
            <q-icon name="fas fa-exclamation-circle" />
            Primero debe guardar su documento, y debe ser de tipo Cheque.
        </q-banner>
    </div>
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { Platform } from 'quasar'
//import computeFunctions from './computeFunctions.js'
//import reportComponentPDF from '../../../components/mainReport/reportComponentPDF'
import reportComponent from '../../../components/mainReport/reportComponentDialog'


export default ({
    props: {
        dialogMode: { type: Boolean, default: false },
        amountUnpaid: { type: Number, default: 0 },
    },
    components: {
        reportComponent: reportComponent
        //,partnersEdit: () => import('../../../pages/RootMaster/Partners/PartnersEdit.vue')
    },
    created(){
        if(this.amountUnpaid && this.amountUnpaid >= 0){
            this.amount = this.amountUnpaid
        }
    },
    data () {
        return {
            moduleName: "accVoucherOut",
            show: true,
            reportURL: null,
            visible: true,
            pdfSource: '',
            isloading: false,
            reportBlobData: null,
            rptLinkCompany: false,
            rptName: 'cheque_',
            rptLink: 'cheque_pacifico_01'
        }
    },
    mounted(){
        if(Platform.is.chrome){ this.dynamicOffset = [18,70] }
        this.showPDF();
    },
    methods:{
        showPDF(){
            this.rptLink = ''
            try{
                this.rptLink = this.lookup_payment_formats.find(x=>x.value==this.formatID).ssrs_report_name
            }catch(ex){}
            
            this.isloading = true

                        ////////////////////////////////////////////////
            //Nueva Versión PBIRS only
            ////////////////////////////////////////////////
            //url syntax to get PDF file from report [ssrs_pruebas]     >   'https://localhost/ReportServerBI?/ssrs_pruebas&rs:ClearSession=true&rs:format=PDF'
            this.reportURL = this.$q.sessionStorage.getItem('ReportServer_Export_Path'); 
            this.reportURL = this.reportURL + this.$q.sessionStorage.getItem('ReportServer_BI_Path_ChildPath'); 
            this.reportURL = this.reportURL + this.rptLink + (this.rptLinkCompany?'_'+this.userCompany:'') //este component se carga dinámicamente, entonces el único parámetro que recibe es el del módulo; por lo tanto, en el vuex del módulo está el nombre del reporte)
            this.reportURL += '&rs:ClearSession=true&rs:format=PDF&sys_user_code=' + this.userCode + '&sys_user_language=es&sys_user_company=' + this.userCompany + '&row_id=' + this.headerID //en vez de this.editStatus.navigateToRecord

            //this.reportURL = this.$q.sessionStorage.getItem('ReportServer_Export_Path'); //ruta
            //this.reportURL += this.rptLink + (this.rptLinkCompany?'_'+this.userCompany:'')
            //ClearSession sirve para NO usar cache (de lo contrario, el reporte NO presenta datos actualizados, sino que hay que cerrar y volver a entrar)
            //format define el formato a exportar
            //this.reportURL += '&rs:ClearSession=true&rs:format=PDF&sys_user_code=' + this.userCode + '&sys_user_language=es&sys_user_company=' + this.userCompany + '&row_id=' + this.

            this.$axios({
                method: 'GET',
                //url: this.apiURL + 'generatePDFandDOWNLOAD',
                url: this.apiURL + 'pbirsGetPDF',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                responseType: 'blob', // important
                params: { 
                    reportURL: this.reportURL,
                    pdfName: this.rptName + ' ' + this.headerID /*en vez de this.editStatus.navigateToRecord*/ + '.pdf'
                    /*reportURL: this.reportURL,
                    fileName: this.rptName + ' ' + this.headerID + '.pdf'*/
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
            saveAs(new Blob([this.reportBlobData], { type: 'application/pdf' }), this.rptName + ' ' + this.headerID + '.pdf' );
            //this.reportBlobData = response.data
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        allow_edit: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_edit').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_insert: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_insert').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        //allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        //allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        //allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        headerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerID', value: val}) }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
        methodID: {
            get () { return this.$store.state[this.moduleName].editData.basic.methodID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'methodID', value: val}) }
        },
        paymentTypeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.paymentTypeID },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'paymentTypeID', value: val}) }
        },
        formatID: {
            get () { return this.$store.state[this.moduleName].editData.basic.formatID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'formatID', value: val}) }
        },
        numberType: {
            get () { return this.$store.state[this.moduleName].editData.basic.numberType },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'numberType', value: val}) }
        },
        numeroDoc: {
            get () { return this.$store.state[this.moduleName].editData.basic.numeroDoc },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'numeroDoc', value: val}) }
        },
        voided: {
            get () { return this.$store.state[this.moduleName].editData.basic.voided },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'voided', value: val}) }
        },
        headerDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerDate },
            set (val) { 
                this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerDate', value: val}) //actualiza campo
                this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'printDate', value: val}) //actualiza campo de impresión (pero el de impresión NO cambia éste)
                this.$emit('onAccMoveCompute')
            }
        },
        printDate:  {
            get () { return this.$store.state[this.moduleName].editData.basic.printDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'printDate', value: val}) }
        },
        printName:  {
            get () { return this.$store.state[this.moduleName].editData.basic.printName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'printName', value: val}) }
        },
        amountTotal:  {
            get () { return this.$store.state[this.moduleName].editData.basic.amountTotal },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'amountTotal', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },
        lookup_partners: {
            get () { return this.$store.state[this.moduleName].editData.lookup_partners },
        },
        lookup_accTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accTypes },
        },
        lookup_accPaymentMethods: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accPaymentMethods },
        },
        lookup_voucherInitialTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_voucherInitialTypes },
        },
        lookup_payment_formats: {
            get () { return this.$store.state[this.moduleName].editData.lookup_payment_formats },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'paymentTypeID', value: val}) }
        },
    },
})
</script>
