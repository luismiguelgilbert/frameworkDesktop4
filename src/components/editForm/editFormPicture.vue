<template>
<div style="margin: -16px;">
  <q-toolbar class="no-padding">
    <q-btn label="Subir Imagen"  icon="fas fa-upload" color="primary" flat stretch @click="isDialogVisible=true"/>
    <q-btn flat stretch label="Eliminar" color="red" icon="fas fa-trash-alt" :disable="upload_file_name?false:true" @click="clearFile"  />
  </q-toolbar>
  <q-separator />
  
  <q-img
        :src="upload_file_name?serverFilesPath+upload_file_name:null"
        style="height: calc(100vh - 170px)"
        :ratio="1"
        basic contain
        spinner-color="white"
      >
      <div class="absolute-bottom text-subtitle1 text-center">
        {{upload_file_name?'Imagen de Perfil':'No ha cargado imagen'}}
      </div>
  </q-img>

    <q-dialog v-model="isDialogVisible" square>
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

export default ({
    props: {
        moduleName: { type: String, required: true },
        tabRecord: { type: Object },
    },
    data () {
        return {
            isDialogVisible: false,
            fileToUpload: null
        }
    },
    methods:{
        getNewFileName(files){
            this.$q.loading.show({ delay: 0, message: 'Subiendo..', spinner: 'QSpinnerIos', messageColor: 'white', spinnerColor: 'white' })
            this.$axios.post(this.apiURL+'spAttachGenerateID',
                {
                  userCode: this.userCode,
                  userCompany: this.userCompany,
                  original_file_name: files[0].name,
                  file_type: files[0].type,
                  file_size: files[0].size,
                  //row_id: this.row_id
                  moduleName: this.moduleName
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
            this.attach_id = this.fileToUpload.attach_id
            this.upload_file_name = this.fileToUpload.upload_file_name
            this.$q.notify({multiLine: false, color: 'positive', message: "Archivo recibido" , timeout: 1200, icon: "fas fa-check", progress: true,})
            this.isDialogVisible=false
        },
        clearFile(){
            this.upload_file_name = null;
            this.attach_id = null;
        }
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        upload_file_name: {
            get () { return this.$store.state[this.moduleName].editData[this.tabRecord.pictureConfig.section][this.tabRecord.pictureConfig.upload_file_name] },
            set (val) { 
                let temporal = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].editData[this.tabRecord.pictureConfig.section]));
                temporal[this.tabRecord.pictureConfig.upload_file_name] = val;//este el el nombre del archivo subido a la ruta
                this.$store.commit((this.moduleName)+'/updateEditData', {section: this.tabRecord.pictureConfig.section, key: this.tabRecord.pictureConfig.upload_file_name, value: val}) 
            }
        },
        attach_id: {
            get () { return this.$store.state[this.moduleName].editData[this.tabRecord.pictureConfig.section][this.tabRecord.pictureConfig.attach_id] },
            set (val) { 
                let temporal = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].editData[this.tabRecord.pictureConfig.section]));
                temporal[this.tabRecord.pictureConfig.attach_id] = val;//este el el attach_id
                this.$store.commit((this.moduleName)+'/updateEditData', {section: this.tabRecord.pictureConfig.section, key: this.tabRecord.pictureConfig.attach_id, value: val}) 
            }
        },
    }
})

</script>