<template>
  <div style="height: calc(100vh - 180px);" >
    <q-card class="absolute-center">
        <q-toolbar>
            <q-toolbar-title :class="userColor=='blackDark'?'text-white':'text-primary'">Foto</q-toolbar-title>
            <q-space />
            <q-btn flat color="positive" title="Cargar Nueva Foto" icon="fas fa-camera" @click="isDialogVisible=true" :disable="!allow_edit&&!allow_insert" />
        </q-toolbar>
        <q-separator />
        <q-img 
            v-if="Photo" 
            :src="serverFilesPath + Photo" 
            style="width: 250px; max-height: 350px;"
            spinner-color="white"
            class="q-ma-sm rounded-borders"
            />
            <q-card-actions align="around" class="no-padding">
                <q-banner inline-actions class="text-white bg-info" style="width: 270px;" rounded >
                    Esta opción se aplica inmediatamente.
                    <template v-slot:avatar>
                        <q-icon name="fas fa-info-circle" color="white" />
                    </template>
                </q-banner>
            </q-card-actions>

    </q-card>

    <q-dialog v-model="isDialogVisible">
        <q-uploader
                accept=".jpg, image/*"
                @added="getNewFileName"
                :factory="factoryFn"
                ref="uploaderComponent"
                style="max-height: calc(50vh); max-width: 100%;"
                label="Tomar Foto o Cargar desde Archivo"
                :max-file-size="10485760"
                @finish="finish"
                hide-upload-btn
            />
    </q-dialog>
  </div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default ({
    data () {
        return {
            moduleName: "BitaCars", isDialogVisible: false, fileToUpload: null,
        }
    },
    methods:{
        getNewFileName(files){
            this.$q.loading.show({ delay: 0, message: 'Subiendo..', spinner: 'QSpinnerIos', messageColor: 'white', spinnerColor: 'white' })
            this.$axios.post(this.apiURL+'spBitaCarsPictureUpload',
                {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    originalFilename: files[0].name,
                    fileType: files[0].type,
                    fileSize: files[0].size,
                    row_id: this.editMode?0:this.editRecord.row.carID_ux
                }
            , {headers: { 'Authorization': "Bearer " + this.$q.sessionStorage.getItem('jwtToken') }}
            ).then((response) => {
                this.fileToUpload = response.data[0]
                this.$refs.uploaderComponent.upload()
            }).catch((error) => {
                console.error(error)
                this.$q.loading.hide()
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo realizar acción.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            })
        },
        factoryFn(files){
            return new Promise((resolve) => {
                resolve({
                    url: this.apiURL+'uploadFile' 
                    + '?attach_id='+this.fileToUpload.attach_id+''+'&upload_file_name=' + this.fileToUpload.upload_file_name,//agregar attach_id usado por API para marcar attachment como uploaded, y se envía Nombre de archivo a guardar en disco
                    method: 'POST',
                    headers: [
                    { name: 'Authorization', value: 'Bearer ' + this.$q.sessionStorage.getItem('jwtToken')}
                    ],
                })
            })
        },
        finish(){
            this.$q.loading.hide()
            this.Photo = this.fileToUpload.upload_file_name
            this.$q.notify({multiLine: false, color: 'positive', message: "Archivo recibido" , timeout: 1200, icon: "fas fa-check", progress: true,})
            this.isDialogVisible=false
        },
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        Photo: { 
            get () { return this.$store.state[this.moduleName].editData.basic.Photo }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'Photo', value: val}) }  
        },
        editMode: { 
            get () { return this.$store.state[this.moduleName].editMode }, 
        },
        editRecord: { 
            get () { return this.$store.state[this.moduleName].editRecord }, 
        },
    }
})

</script>