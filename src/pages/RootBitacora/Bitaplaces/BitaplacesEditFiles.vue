<template>
<div>
    <q-table
        :data="files"
        :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
        table-style="min-height: 150px; max-height: calc(100vh - 225px)"
        row-key="sys_user_code"
        rows-per-page-label= "Registros por Página"
        no-data-label= "No hay archivos"
        no-results-label= "No se encontraron archivos"
        virtual-scroll
        :rows-per-page-options="[0]"
        dense
        :filter="filterString"
        :columns="[
            { name: 'delete', field: row => row.delete, label: '', align: 'center', sortable: true },
            //{ name: 'attach_id', field: row => row.attach_id, label: 'ID', align: 'center', sortable: true },
            { name: 'originalFilename', field: row => row.originalFilename, label: 'Archivo', align: 'left', sortable: true },
            { name: 'type', field: row => row.type, label: 'Tipo', align: 'left', sortable: true },
            { name: 'size', field: row => row.size, label: 'Tamaño (KB)', align: 'right', sortable: true },
            { name: 'audit_last_date', field: row => row.audit_last_date, label: 'Fecha de Carga', align: 'right', sortable: true },
            { name: 'uploaded', field: row => row.is_new, label: '', align: 'center', sortable: true },
        ]"
        >
        <!--<template v-slot:no-data="{ icon, message, filter }" >
            <q-icon name="fas fa-battery-empty" class="q-pl-sm q-pr-sm" /> {{message}}
            filter: {{filter}}
        </template >-->
        <template v-slot:top>
            <q-btn label="Adjuntar Archivo" icon="fas fa-upload" color="positive" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" @click="isUploadDialog=true" />
            <q-space />
            <q-input borderless dense v-model="filterString" placeholder="Buscar...">
            <template v-slot:append>
                <q-icon name="fas fa-search" />
            </template>
            </q-input>
        </template>
        <template v-slot:body-cell-delete="props">
            <q-td :props="props" style="width: 20px;">
                <q-btn flat size="xs" round color="red" icon="fas fa-trash-alt" 
                    @click="removeFile(props.row)"
                    :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                    title="Quitar registro" />
            </q-td>
        </template>
        <template v-slot:body-cell-uploaded="props">
            <q-td :props="props" style="width: 60px;">
                <q-btn v-if="props.row.uploaded" size="xs" flat round color="amber" icon="fas fa-download" title="Descargar archivo a su equipo" @click="downloadFile(props.row)" />
                <q-btn v-if="!props.row.uploaded" size="xs" flat round color="amber" icon="fas fa-pause" title="Archivo listo para guardar" />
            </q-td>
        </template>
    </q-table>

    <q-dialog v-model="isUploadDialog" @show="dialogShowing" >
        <q-card>
            <!--accept=".jpg, image/*"-->
            <q-uploader
                @added="getNewFileName"
                :factory="factoryFn"
                ref="uploaderComponent"
                style="max-height: calc(50vh);"
                label="Nuevo Archivo"
                :max-file-size="10485760"
                @finish="finish"
                hide-upload-btn
            />
        </q-card>
    </q-dialog>
</div>
    
</template>
<style lang="sass">
.q-table__bottom
    padding: 0px
.my-sticky-header-usercompany
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: white

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2

.my-sticky-header-usercompany-dark
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: $grey-10

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2
</style>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default ({
    data () {
        return {
            moduleName: "Bitaplaces", filterString: '', isUploadDialog: false, fileToUpload: null
        }
    },
    methods:{
        downloadFile(row){
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'downloadAttachmentFile',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                responseType: 'blob', // important
                params: { 
                    fileName: row.upload_file_name
                }
            }).then((response) => {
                let blob = new Blob([response.data])
                let link = document.createElement('a')
                link.setAttribute("type", "hidden"); // make it hidden if needed
                link.href = window.URL.createObjectURL(blob)
                document.body.appendChild(link);
                link.download = row.originalFilename//set download file name
                link.click()
                link.remove()
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
        removeFile(row){
            let initialFiles = JSON.parse(JSON.stringify(this.files))//clona
            initialFiles = initialFiles.filter(x => x.attachID!=row.attachID)
            this.files = initialFiles
        },
        dialogShowing(){
            this.$refs.uploaderComponent.pickFiles()
        },
        getNewFileName(filesFromComponent){
            this.loadingData = true
            console.dir('getNewFileName')
            console.dir('this.editMode')
            console.dir(this.editMode)
            console.dir('this.editRecord')
            console.dir(this.editRecord)
            this.$axios.post( this.apiURL + 'spBitaplacesAttach', {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    //"userLanguage": 'es',
                    originalFilename: filesFromComponent[0].name,
                    type: filesFromComponent[0].type,
                    size: filesFromComponent[0].size,
                    row_id: this.editMode?0:this.editRecord.row.placeID_ux
                }
                , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
            ).then((response) => {
                //this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                this.fileToUpload = response.data[0]
                
                let initialFiles = JSON.parse(JSON.stringify(this.files))//clona
                initialFiles.push({
                     uploaded: false
                    ,attachID: response.data[0].attach_id
                    ,originalFilename: response.data[0].original_file_name
                    ,type: response.data[0].file_type
                    ,size: response.data[0].file_size
                    ,sys_user_name: response.data[0].sys_user_name
                    ,sys_user_lastname: response.data[0].sys_user_lastname
                    ,audit_last_date: response.data[0].audit_last_date
                    ,audit_last_date_name: response.data[0].audit_last_date_name
                })
                this.files = initialFiles
                this.$refs.uploaderComponent.upload()
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
        factoryFn(filesFromComponent){
            return new Promise((resolve) => {
                resolve({
                    url: this.apiURL + 'uploadFile' 
                    + '?attach_id='+this.fileToUpload.attach_id+''+'&upload_file_name=' + this.fileToUpload.upload_file_name,//agregar attach_id usado por API para marcar attachment como uploaded, y se envía Nombre de archivo a guardar en disco
                    method: 'POST',
                    headers: [
                    { name: 'Authorization', value: 'Bearer ' + this.$q.sessionStorage.getItem('jwtToken')}
                    ],
                })
            })
        },
        finish(){
            this.isUploadDialog = false
            this.loadingData = false
            this.$q.notify({multiLine: false, color: 'positive', message: "Archivo recibido" , timeout: 1200, icon: "fas fa-check", progress: true,})
        },
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        loadingData: { 
            get () { return this.$store.state[this.moduleName].loadingData }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'loadingData', value: val}) }  
        },
        files: { 
            get () { return this.$store.state[this.moduleName].editData.files }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataFiles', val) }
        },
        editMode: { 
            get () { return this.$store.state[this.moduleName].editMode }, 
        },
        editRecord: { 
            get () { return this.$store.state[this.moduleName].editRecord }, 
        },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        sys_user_color: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color }, 
        },
    }
})
</script>