<template>
<div style="margin: -16px;">
  <q-table
    ref="mainTable"
    :data="files"
    :table-style="editMode==true?'min-height: calc(100vh - 193px); max-height: calc(100vh - 193px);' : 'min-height: calc(100vh - 193px); max-height: calc(100vh - 193px);'"
    row-key="attach_id"
    :separator="userTableLines"
    :rows-per-page-options="[0]"
    hide-bottom dense flat
    virtual-scroll
    :class="tableLastLine"
    :filter="filterString"
    :columns="[
      //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
      { name: 'uploaded', required: true, label: 'Descargar', align: 'center', field: row => row.uploaded, sortable: true },
      { name: 'original_file_name', required: true, label: 'Archivo', align: 'left', field: row => row.original_file_name, sortable: true },
      { name: 'file_size', required: true, label: 'Tamaño (KB)', align: 'left', field: row => row.file_size, sortable: true },
      { name: 'file_type', required: true, label: 'Tipo', align: 'left', field: row => row.file_type, sortable: true },
      { name: 'sys_user_fullname', required: true, label: 'Usuario', align: 'center', field: row => row.sys_user_fullname, sortable: true },
      { name: 'audit_last_date', required: true, label: 'Fecha', align: 'center', field: row => row.audit_last_date, sortable: true },
      { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },
    ]"


    >
    <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="uploaded" :props="props">
              <q-btn v-if="props.row.uploaded" color="primary" icon="fas fa-download" size="xs" dense flat @click="downloadFile(props.row)" />
            </q-td>
            <q-td key="original_file_name" :props="props">
              {{ props.row.original_file_name }}
            </q-td>
            <q-td key="file_size" :props="props" :title="getFileSizeInMB(props.row.file_size)">
              {{ props.row.file_size }}
            </q-td>
            <q-td key="file_type" :props="props">
              {{ props.row.file_type }}
            </q-td>
            <q-td key="sys_user_fullname" :props="props">
              {{ props.row.sys_user_fullname }}
            </q-td>
            <q-td key="audit_last_date" :props="props" :title="dateName(props.row.audit_last_date)">
              {{ props.row.audit_last_date }}
            </q-td>

            <q-td key="estado" :props="props">
              <q-toggle :value="props.row.estado" color="positive" icon="fas fa-check" size="sm" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
            </q-td>


          </q-tr>
    </template>
    <template v-slot:top>
        <q-btn label="Subir Archivo" @click="addRow" icon="fas fa-upload" color="primary" no-caps />
        <q-space />
        <q-input borderless dense v-model="filterString" placeholder="Buscar...">
          <template v-slot:append>
            <q-icon :name="filterString?'fas fa-times':'fas fa-search'" @click="filterString?filterString='':undefined" />
          </template>
        </q-input>
    </template>
    <template v-slot:bottom-row >
      <q-tr></q-tr>
    </template>
  </q-table>
  <q-dialog v-model="dialogVisible">
    <q-card>
      <q-uploader

                @added="getNewFileName"
                :factory="factoryFn"
                ref="uploaderComponent"
                style="max-height: calc(50vh); max-width: 100%;"
                label="Buscar Archivo (Máximo 20MB)"
                :max-file-size="20971520"
                @finish="finish"
                hide-upload-btn
            />
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
import { date } from 'quasar';

export default ({
    props: {
        moduleName: { type: String, required: true }
        //row_id: { type: Number, required: true },
    },
    data () {
        return {
            //row_id: 31/*=31mktPR*/, 
            filterString: '', dialogVisible: false
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
      updateRow(newVal, colName, row){
        let newRows = JSON.parse(JSON.stringify(this.files))
        newRows.find(x=>x.attach_id==row.attach_id)[colName] = newVal
        this.files = newRows
      },
      addRow(){
        this.dialogVisible = true
      },
      dateName(fecha){
        //
        return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
            days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            //daysShort: ['Dum', 'Lun', /* and all the rest of days - remember starting with Sunday */],
            months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            //monthsShort: ['Ian', 'Feb', /* and all the rest of months */]
          }
        )
      },
      getAge(fecha){
        return date.getDateDiff(new Date(), fecha, 'years')
      },
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
        //this.userPhoto = this.fileToUpload.upload_file_name
        //this.files = this.fileToUpload.attach_id
        let newRows = JSON.parse(JSON.stringify(this.files))
        newRows.push({
           attach_id: this.fileToUpload.attach_id
          ,original_file_name: this.fileToUpload.original_file_name
          ,uploadFileName: this.fileToUpload.upload_file_name
          ,file_size: this.fileToUpload.file_size
          ,file_type: this.fileToUpload.file_type
          ,uploaded: true
          ,estado: true
          ,sys_user_fullname: 'Yo'
          ,audit_last_date: this.fileToUpload.audit_last_date
        })
        this.files = newRows
        this.$q.notify({multiLine: false, color: 'positive', message: "Archivo recibido" , timeout: 1200, icon: "fas fa-check", progress: true,})
        this.dialogVisible=false
      },
      downloadFile(file){
        console.dir('downloadFile')
        console.dir(file)
        this.$axios({
              method: 'GET',
              url: this.apiURL + 'downloadFile',
              headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
              responseType: 'blob', // important
              params: { fileName: file.uploadFileName }
          }).then((response) => {
              let blob = new Blob([response.data])
              let link = document.createElement('a')
              link.setAttribute("type", "hidden"); // make it hidden if needed
              link.href = window.URL.createObjectURL(blob)
              document.body.appendChild(link);
              link.download = file.original_file_name//set download file name
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
      getFileSizeInMB(size){
        let resultado = '';
        try{
          resultado = ((size / 1024)/1024)
        }catch(ex){}
        return resultado.toFixed(2) + ' MB';
      }
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
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
        files: {
            get () { return this.$store.state[this.moduleName].editData.files },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataFiles', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        /*
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        */
    }
})
</script>
