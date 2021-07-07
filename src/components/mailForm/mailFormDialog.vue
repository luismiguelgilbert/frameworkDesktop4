<template>
<div>
    <q-card flat>
        <q-card-section class="q-pa-none q-gutter-sm">
            <q-input
                filled
                :value="recipientsText"
                placeholder="Seleccione el Proveedor (*)"
                label="Para (para varios destinatarios separe las direcciones usando coma)"
                >
                <template v-slot:prepend><q-icon name="fas fa-envelope" /></template>
                <template v-slot:append>
                    <q-btn 
                        :icon="mailData_destinations.filter(x=>x.mail==userMail&&x.isSelected).length>0?'fas fa-user-times':'fas fa-user-check'" 
                        :title="mailData_destinations.filter(x=>x.mail==userMail&&x.isSelected).length>0?'Quitar':'Incluirme'" 
                        flat round  @click="addMe"/>
                    <q-btn icon="fas fa-plus-circle" flat round title="Agregar dirección" @click="insertMail"/>
                    <q-btn icon="fas fa-address-book" flat round title="Directorio" @click="isAddressbook=!isAddressbook" />
                </template>
            </q-input>
            <q-input
                filled
                v-model="subjectText"
                label="Asunto" 
                >
                <template v-slot:prepend><q-icon name="fas fa-mail-bulk" /></template>
            </q-input>
            
            <q-editor 
                v-model="bodyText" class="q-mt-md"
                min-height="calc(100vh - 410px)" max-height="calc(100vh - 410px)"  />
            
        </q-card-section>

        <q-card-actions align="around">
            <q-btn color="primary" label="Enviar" icon="fas fa-paper-plane" class="q-mb-md" 
                title="Enviar correo desde la plataforma"
                :disable="mailData_destinations.filter(x=>x.isSelected).length<=0"  
                @click="generatePDFandSEND"/>
            <q-btn color="primary" label="Descargar" icon="fas fa-download" class="q-mb-md" 
                title="Descargar correo (formato EML) para enviar con su cliente de correo preferido"
                :disable="mailData_destinations.filter(x=>x.isSelected).length<=0 || subjectText.length<=0 || bodyText.length<=0"  
                @click="downloadEML"
                />
        </q-card-actions>
    </q-card>

    <q-dialog v-model="isAddressbook">
        <q-card style="min-width: 95%;" > 
        <q-bar class="bg-primary text-white">
            Buscar Contactos
            <q-space />
            <q-input input-class="text-white" borderless dense debounce="300" autofocus v-model="searchFilter" placeholder="Buscar">
            <template v-slot:append>
                <q-icon v-if="!searchFilter" name="fas fa-search" flat round size="xs" color="white" />
                <q-btn v-if="searchFilter" @click="searchFilter=''" flat round icon="fas fa-times" size="xs" color="white" />
            </template>
            </q-input>
        </q-bar>
        <q-card-section class="no-padding">
            <q-table
                ref="itemsSearchTable" flat square
                table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
                :data="mailData_destinations"
                :columns="[
                    //{ name: 'value', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
                    { name: 'contactName', required: true, label: 'Contacto', align: 'left', field: row => row.contactName, sortable: true, style: 'min-width: 250px;', },
                    { name: 'mail', required: true, label: 'Dirección de Correo', align: 'left', field: row => row.mail, sortable: true, style: 'min-width: 50px;', },
                    { name: 'isPartner', required: true, label: 'Contacto?', align: 'left', field: row => row.isPartner, sortable: true, style: 'min-width: 50px;', },
                ]"
                row-key="value"
                virtual-scroll :rows-per-page-options="[0]"
                hide-bottom dense
                selection="single" :selected.sync="selectedContacts"
                :filter="searchFilter"
                :class="tableLastLine"
                :separator="userTableLines"
                >
                <template v-slot:body="props">
                    <q-tr :props="props" >
                        <q-td auto-width>
                            <q-checkbox v-if="props.row.estado" :value="props.row.isSelected" dense :disable="!(props.row.estado)" @input="addRows(props.row)" />
                            <q-icon v-if="!(props.row.estado)" name="fas fa-ban" color="red" style="margin-left: 2px;" title="Se encuentra Inactivo"/>
                        </q-td>
                        <q-td key="contactName" :props="props" >
                            {{props.row.contactName}}
                        </q-td>
                        <q-td key="mail" :props="props" >
                            {{props.row.mail}}
                        </q-td>
                        <q-td key="isPartner" :props="props" >
                            <q-icon v-if="props.row.isPartner" name="fas fa-handshake" title="Este contacto pertenece al Socio" color="positive" />
                            <q-icon v-if="!props.row.isPartner" name="fas fa-user-check" :title="'Colaborador de '+userCompanyName" color="primary" />
                        </q-td>
                    </q-tr>
                </template>
                <template v-slot:bottom-row >
                    <q-tr></q-tr>
                </template>
            </q-table>
            
        </q-card-section>
        <q-card-actions align="around">
            <q-btn icon-right="fas fa-broom" flat label="Limpiar" no-caps color="primary" :disable="mailData_destinations.filter(x=>x.isSelected).length<=0" @click="clearRows" ></q-btn>
            <q-btn icon-right="fas fa-check-circle" flat label="OK" no-caps color="primary" @click="isAddressbook=false" ></q-btn>
        </q-card-actions>
        </q-card>
    </q-dialog>
    
</div>
</template>

<style lang="scss">
  .q-table__bottom{ padding: 0px; padding-left: 10px; padding-right: 10px; }
  .q-virtual-scroll__padding{ visibility: hidden;}
  .q-table thead tr:first-child th{ position: sticky; top: 0; opacity: 1; z-index: 1; padding-left: 5px; font-weight: bolder; color: $primary; }
  .my-sticky-header-table{
    .q-table thead tr:first-child th{ background-color: white }
  }
  .my-sticky-header-table-LastLine{
    .q-table thead tr:first-child th{ background-color: white }
    .q-table .q-virtual-scroll__content td{ border-bottom-width: 1px }
  }
  .my-sticky-header-table-dark{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
  }
  .my-sticky-header-table-dark-LastLine{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
    .q-table td{ border-bottom-width: 1px }
  }
</style>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { uid } from 'quasar'

export default ({
    name: 'tableComponent',
    props: {
        moduleName: { type: String , required: true },
    },
    data () {
        return {
            //confirmed
            isAddressbook: false
            ,searchFilter:''
            ,selectedContacts: []
            ,router: this.$router
        }
    },
    methods:{
        getMax(arr, prop) {
            var max;
            for (var i=0 ; i<arr.length ; i++) {
                if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                    max = arr[i];
            }
            return max;
        },
        addRows(fila){
            let newRows = JSON.parse(JSON.stringify(this.mailData_destinations))
            newRows.filter(x=>x.value==fila.value).map(y=>{
                y.isSelected = !y.isSelected
            })
            this.mailData_destinations = newRows;
        },
        clearRows(){
            let newRows = JSON.parse(JSON.stringify(this.mailData_destinations))
            newRows.map(y=>{
                y.isSelected = false
            })
            this.mailData_destinations = newRows;
        },
        addMe(){
            let newRows = JSON.parse(JSON.stringify(this.mailData_destinations))
            let estado = this.mailData_destinations.filter(x=>x.mail==this.userMail&&x.isSelected).length>0?true:false
            newRows.filter(x=>x.mail==this.userMail).map(y=>{
                y.isSelected = !estado
            })
            this.mailData_destinations = newRows;
        },
        insertMail() {
            this.$q.dialog({
                //title: 'Prompt',
                message: 'Agregar Dirección',
                prompt: { model: '', type: 'text'},
                cancel: true,
                persistent: false
            }).onOk(data => {
                let newRows = JSON.parse(JSON.stringify(this.mailData_destinations))
                let existe = newRows.some(x=>x.mail==data.trim())
                if(!existe){
                    //GetMaxId
                    let max_id = 0
                    let temp = null
                    if(this.mailData_destinations.length > 0){
                        temp = this.getMax(this.mailData_destinations, "value");
                        max_id = parseInt(temp.value) + parseInt(1);
                    }
                    newRows.push({
                        contactName: data.trim()
                        ,estado: true
                        ,isPartner: false
                        ,isSelected: true
                        ,mail: data.trim()
                        ,value: max_id
                    })
                    this.mailData_destinations = newRows;
                    
                }
            })
        },
        downloadEML(){
            try{
                this.$q.loading.show();
                //generate serverSide url for server generation in server disk
                let mailReportURL = ''
                if(this.rptType=='ssrs'){
                    ////////////////////////////////////////////////
                    //Nueva Versión PBIRS only
                    ////////////////////////////////////////////////
                    //url syntax to get PDF file from report [ssrs_pruebas]     >   'https://localhost/ReportServerBI?/ssrs_pruebas&rs:ClearSession=true&rs:format=PDF'
                    mailReportURL = this.$q.sessionStorage.getItem('ReportServer_Export_Path'); 
                    mailReportURL = mailReportURL + this.$q.sessionStorage.getItem('ReportServer_BI_Path_ChildPath'); 
                    //mailReportURL = this.$q.sessionStorage.getItem('ReportServer_Export_Path'); //ruta
                    mailReportURL += (this.rptLinkCompany?(this.rptLink+'_'+this.userCompany):(this.rptLink)); //reporte es x compañía, entonces se agrega
                    mailReportURL += '&rs:format=PDF'; //formato PDF
                    mailReportURL += '&sys_user_code=' + this.userCode; //Parámetro Usuario
                    mailReportURL += '&sys_user_language=es' ; //Parámetro Language
                    mailReportURL += '&sys_user_company=' + this.userCompany; //Parámetro Compañía
                    mailReportURL += '&row_id=' + this.router.currentRoute.params.id; //Parámetro RowID
                }
                //post Data and receive file
                //this.$axios.post( this.apiURL + 'generatePDFandEML', {
                this.$axios.post( this.apiURL + 'pbirsGetEML', {
                        mailReportURL: mailReportURL,
                        uid: uid(),
                        rptName: this.rptName + ' ' + this.router.currentRoute.params.id + '.pdf',
                        senderMail: this.userMail,
                        senderName: this.userName + ' ' + this.userLastName,
                        destinations: this.mailData_destinations.filter(x=>x.isSelected),
                        subjectText: this.subjectText,
                        bodyText: this.bodyText,
                    }
                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.loading.hide();
                    this.emlFile = response.data
                    this.downloadTempFile(response.data)
                }).catch((error) => {
                    this.$q.loading.hide();
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
                    this.isBusy = false;
                })

            }catch(ex){
                this.$q.loading.hide();
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + ex.message
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }
        },
        downloadTempFile(file){
            //console.dir('downloadTempFile')
            //console.dir(file)
            this.isDownloadingEML = true
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'downloadTempFile',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                responseType: 'blob', // important
                params: { fileName: file.uploadFilename }
                //params: { fileName: 'Nuevo.pdf' }
            }).then((response) => {
                let blob = new Blob([response.data])
                let link = document.createElement('a')
                link.setAttribute("type", "hidden"); // make it hidden if needed
                link.href = window.URL.createObjectURL(blob)
                document.body.appendChild(link);
                link.download = file.fileName//set download file name
                link.click()
                link.remove()
                this.isDownloadingEML = false
            }).catch((error) => {
                this.$q.loading.hide();
                this.isDownloadingEML = false
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
        },
        generatePDFandSEND(){
            try{
                this.$q.loading.show();
                //generate serverSide url for server generation in server disk
                let mailReportURL = ''
                if(this.rptType=='ssrs'){
                    ////////////////////////////////////////////////
                    //Nueva Versión PBIRS only
                    ////////////////////////////////////////////////
                    //url syntax to get PDF file from report [ssrs_pruebas]     >   'https://localhost/ReportServerBI?/ssrs_pruebas&rs:ClearSession=true&rs:format=PDF'
                    mailReportURL = this.$q.sessionStorage.getItem('ReportServer_Export_Path'); 
                    mailReportURL = mailReportURL + this.$q.sessionStorage.getItem('ReportServer_BI_Path_ChildPath'); 
                    mailReportURL += (this.rptLinkCompany?(this.rptLink+'_'+this.userCompany):(this.rptLink)); //reporte es x compañía, entonces se agrega
                    mailReportURL += '&rs:format=PDF'; //formato PDF
                    mailReportURL += '&sys_user_code=' + this.userCode; //Parámetro Usuario
                    mailReportURL += '&sys_user_language=es' ; //Parámetro Language
                    mailReportURL += '&sys_user_company=' + this.userCompany; //Parámetro Compañía
                    mailReportURL += '&row_id=' + this.router.currentRoute.params.id; //Parámetro RowID
                }
                //post Data and receive file
                //this.$axios.post( this.apiURL + 'generatePDFandSEND', {
                this.$axios.post( this.apiURL + 'pbirsSendMail', {
                        mailReportURL: mailReportURL,
                        uid: uid(),
                        rptName: this.rptName + ' ' + this.router.currentRoute.params.id + '.pdf',
                        senderMail: this.userMail,
                        senderName: this.userName + ' ' + this.userLastName,
                        destinations: this.mailData_destinations.filter(x=>x.isSelected),
                        subjectText: this.subjectText,
                        bodyText: this.bodyText,
                    }
                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.loading.hide();
                    this.$q.notify({ html: true, multiLine: true, color: 'positive'
                        ,message: "Mensaje puesto en cola de envíos.<br/>" + response.data.response + '<br/>' + response.data.accepted.map(x=>x).join('<br/>')
                        ,timeout: 1500, progress: true
                    })
                }).catch((error) => {
                    this.$q.loading.hide();
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
                    this.isBusy = false;
                    this.$q.loading.hide();
                })

            }catch(ex){
                this.$q.loading.hide();
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + ex.message
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }
        }
    },
    computed:{
        //Confirmed
        editData: { get () { return this.$store.state[this.moduleName].editData } },
        userCode: { get () { return this.$store.state.main.userCode } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCompany: { get () { return this.$store.state.main.userCompany }  },
        userCompanies: { get () { return this.$store.state.main.userCompanies }  },
        userCompanyName: { get () { return this.$store.state.main.userCompanies.filter(x=>x.companyID==this.userCompany).map(y=>y.companyShortName) } },
        userMail: { get () { return this.$store.state.main.userMail }  },
        userName: { get () { return this.$store.state.main.userName }  },
        userLastName: { get () { return this.$store.state.main.userLastName }  },
        editData: { get () { return this.$store.state[this.moduleName].editData } },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        tableLastLine: {
            get () { 
                let resultado = ''
                if(this.userColor=='blackDark'){
                if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
                {
                    resultado = 'my-sticky-header-table-dark-LastLine bg-grey-10 '
                }else{
                    resultado = 'my-sticky-header-table-dark bg-grey-10 '
                }
                }
                if(this.userColor!='blackDark'){
                    if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
                    {
                        resultado = 'my-sticky-header-table-LastLine '
                    }else{
                        resultado = 'my-sticky-header-table '
                    }
                }
                return resultado
            }
        },
        recipientsText: {
            get () { return this.$store.state[this.moduleName].editData.mailData_destinations.filter(x=>x.isSelected).map(y=>y.mail).join(", ") },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'mailData_Text', key: 'recipientsText', value: val}) }
        },
        subjectText: {
            get () { return this.$store.state[this.moduleName].editData.mailData_Text.subjectText },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'mailData_Text', key: 'subjectText', value: val}) }
        },
        bodyText: {
            get () { return this.$store.state[this.moduleName].editData.mailData_Text.bodyText },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'mailData_Text', key: 'bodyText', value: val}) }
        },
        mailData_destinations: {
            get () { return this.$store.state[this.moduleName].editData.mailData_destinations },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'mailData_destinations', value: val}) }
        },
        rptName: { get () { return this.$store.state[this.moduleName].rptName },},
        rptLink: { get () { return this.$store.state[this.moduleName].rptLink },},
        rptLinkCompany: { get () { return this.$store.state[this.moduleName].rptLinkCompany },},
        rptType: { get () { return this.$store.state[this.moduleName].rptType },},
    }
})
</script>