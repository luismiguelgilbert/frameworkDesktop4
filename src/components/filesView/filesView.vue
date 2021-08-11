<template>
<div style="margin: -16px;">
  <q-toolbar class="no-padding">
    <q-btn v-if="( (editStatus.editMode=='edit'&&allow_edit) || (editStatus.editMode=='create'&&allow_insert) )" :label="$q.screen.gt.sm?'Subir Archivo':''" title="Subir Archivo" @click="addRow" icon="fas fa-upload" color="primary" flat stretch no-caps no-wrap />
    <q-btn v-if="( (editStatus.editMode=='edit'&&allow_edit) || (editStatus.editMode=='create'&&allow_insert) )" :label="$q.screen.gt.sm?'Cargar Foto':''" title="Cargar Foto" @click="addPicture" icon="fas fa-camera" color="primary" flat stretch no-caps no-wrap />
    <q-btn v-if="( (editStatus.editMode=='edit'&&allow_edit) || (editStatus.editMode=='create'&&allow_insert) )" flat stretch :label="$q.screen.gt.sm?'Eliminar':''" title="Eliminar" color="red" icon="fas fa-trash-alt" :disable="!selectedRowKeys.length>0" @click="deleteSelectedRows" no-caps no-wrap />
  </q-toolbar>
  <q-separator />
  <DxDataGrid
    ref="mainviewtableDxDataGrid"
    height="calc(100vh - 170px)"
    column-resizing-mode="widget"
    :data-source="files"
    :allow-column-resizing="true" 
    :allow-column-reordering="true"
    :show-borders="false"
    :show-column-lines="userTableLinesDXcols"
    :show-row-lines="userTableLinesDXrows"
    key-expr="attach_id"
    :selected-row-keys="selectedRowKeys" @selection-changed="onSelectionChanged"
    >
    <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="true" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
    <DxPaging :enabled="true" :page-size="userRowsPerPage" />
    <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
    <DxPager :visible="true" :show-page-size-selector="false" :allowed-page-sizes="allowedPageSizes" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="false" :showPageSizeSelector="false" />
    <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
    <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />
    
      <DxColumn  caption="" data-field="uploadFileName" data-type="string" cell-template="imagePreviewTemplate" alignment="center" :allowFiltering="false" :allowSorting="false"  width="80" css-class="no-padding"/>
      <template #imagePreviewTemplate="{ data }">
        <!--<q-avatar square  :title="!(data.row.data.file_type.includes('image'))?data.row.data.file_type:undefined">-->
          <div>
          <q-icon v-if="!(data.row.data.file_type.includes('image'))" 
            :name="getIcon(data.row.data.file_type)"
            :color="userColor=='blackDark'?'white':'grey-7'" />
          <q-img v-if="data.row.data.file_type.includes('image')" :src="$q.sessionStorage.getItem('serverFilesPath') + data.data[data.column.dataField]" style="max-height: 50px;">
              <q-tooltip anchor="top left" self="top left" :content-class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" >
                  <q-img  style="width: 250px" :src="$q.sessionStorage.getItem('serverFilesPath') + data.data[data.column.dataField]" />
              </q-tooltip>
          </q-img>
          </div>
        <!--</q-avatar>-->
      </template>

      <DxColumn  caption="Nombre" data-field="original_file_name" data-type="string" width="350" />
      <DxColumn  caption="Tipo" data-field="file_type" data-type="string" :visible="false" /> 
      <DxColumn  caption="Tamaño" data-field="file_size" data-type="number" alignment="left" :calculate-cell-value="calculateSizeCellValue" :calculateSortValue="calculateSizeSortValue" />
      <DxColumn  caption="Fecha Modif." data-field="audit_last_date" data-type="date" format="dd-MMM-yyyy" /> 
      <DxColumn  caption="Responsable" data-field="sys_user_fullname" data-type="string" width="200"  /> 
      
      <DxColumn  caption="Descargar" cell-template="cellTemplate" width="90" alignment="center" css-class="no-padding no-margin" :minWidth="70" :width="70" />
      <template #cellTemplate="{ data }" >
        <q-btn icon="fas fa-download" flat stretch color="primary" @click="downloadFile(data.data)" title="Descargar archivo" 
          style="display: block; overflow: auto; height: 50px; width: 100%;"
          />
          
      </template>

      
  </DxDataGrid>

  <q-dialog v-model="dialogVisible" square>
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

  <q-dialog v-model="camDialogVisible" square class="rounded-borders" >
    <q-card>
      <cameraComponent @pictureclicked="uploadPicture" />
    </q-card>
  </q-dialog>
</div>

</template>


<script>
import { DxDataGrid, DxColumn, DxScrolling, DxPaging, DxPager, DxSorting, DxHeaderFilter, DxSelection, DxButton } from 'devextreme-vue/data-grid';
import cameraComponent from '../cameraComponent/cameraComponent'
//import Vue from 'vue';
//import Vuex from 'vuex';
import { date } from 'quasar';

export default ({
    props: {
        moduleName: { type: String, required: true }
    },
    data () {
        return {
            //row_id: 31/*=31mktPR*/, 
            filterString: '', 
            dialogVisible: false,
            camDialogVisible: false,
            selectedRowKeys: []
        }
    },
    components:{
      DxDataGrid, DxColumn, DxScrolling, DxPaging, DxPager, DxSorting, DxHeaderFilter, DxSelection, DxButton,
      cameraComponent: cameraComponent
    },
    methods:{
      onSelectionChanged({ selectedRowKeys, selectedRowsData }) {
          this.selectedRowKeys = selectedRowKeys;
      },
      deleteSelectedRows(){
        if(this.selectedRowKeys.length > 0){
            this.$q.dialog({ 
                title: 'Confirmación'
                ,persistent: false
                ,message: 'Desea eliminar las líneas seleccionadas?'
                ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true, color: 'red', flat: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
            }
            ).onOk(() => {
                let newRows = JSON.parse(JSON.stringify(this.files.filter(x=>!this.selectedRowKeys.some(y=>y==x.attach_id))))
                this.files = newRows;
                this.selectedRowKeys = []//limpia selección para evitar problema de referencia a filas que no existan
            })
        }
      },
      calculateSizeCellValue(e){
        let units = 'KB'
        let size = 0
        if(parseFloat(e.file_size) / 1024 < 1000){
          units = 'KB'
          size = parseFloat(e.file_size / 1024).toFixed(2)
        }else{
          units = 'MB'
          size = parseFloat(e.file_size / 1024 / 1024).toFixed(2)
        }
        return size + ' ' + units;
      },
      calculateSizeSortValue(e){
        return e.file_size
      },
      addRow(){
        this.dialogVisible = true
      },
      addPicture(){
        this.camDialogVisible = true
      },
      uploadPicture(picture){
        this.$q.loading.show({ delay: 0, message: 'Subiendo..', spinner: 'QSpinnerIos', messageColor: 'white', spinnerColor: 'white' })
        this.$axios.post(this.apiURL+'spAttachGenerateID',
            {
              userCode: this.userCode,
              userCompany: this.userCompany,
              original_file_name: "webcamphoto.jpeg",
              file_type: "image/jpeg",
              file_size: parseInt((picture.length * (3/4)) - 1),
              //row_id: this.row_id
              moduleName: this.moduleName
            }
        , {headers: { 'Authorization': "Bearer " + this.$q.sessionStorage.getItem('jwtToken') }}
        ).then((response) => {
            this.fileToUpload = response.data[0]
            //Convert base64 image to blob
            const formData = new FormData();
            fetch(picture)
            .then(res => res.blob())
            .then(result => {
              formData.append('webcamphoto.jpeg', result); //append blob to formData
              //post data using formData
              this.$axios.post(this.apiURL+'uploadFile' + '?attach_id=' + this.fileToUpload.attach_id +'' + '&upload_file_name=' + this.fileToUpload.upload_file_name
              ,formData
              ,{headers: { 'Authorization': "Bearer " + this.$q.sessionStorage.getItem('jwtToken') }}
              ).then((secondResponse) => {
                this.finish();
                this.camDialogVisible = false;
              }).catch((error) => {
                console.error(error)
                this.$q.loading.hide()
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo realizar acción.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
              })
            })

        }).catch((error) => {
          console.error(error)
          this.$q.loading.hide()
          let mensaje = ''
          if(error.message){ mensaje = error.message }
          if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
          if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
          mensaje = mensaje.replace('Request failed with status code 400<br/>','')
          this.$q.notify({ html: true, multiLine: false, color: 'red'
              ,message: "Lo sentimos, no se pudo realizar acción.<br/>" + mensaje
              ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
              ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
          })
        })
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
              mensaje = mensaje.replace('Request failed with status code 400<br/>','')
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
                headers: [ { name: 'Authorization', value: 'Bearer ' + this.$q.sessionStorage.getItem('jwtToken')} ],
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
        //console.dir('downloadFile')
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
              mensaje = mensaje.replace('Request failed with status code 400<br/>','')
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
      },
      getIcon(fileType){
        let icono = 'fas fa-paperclip'
        if(fileType.includes('pdf')){icono='fas fa-file-pdf'}
        if(fileType.includes('text/plain')){icono='fas fa-file-alt'}
        if(fileType.includes('wordprocessing')){icono='fas fa-file-word'}
        if(fileType.includes('spreadsheet')){icono='fas fa-file-excel'}
        return icono
      },
    },
    computed:{
        console: () => console,
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
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
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
        /*files: {
            get () { return this.$store.state[this.moduleName].editData.files },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataFiles', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },*/
        files: {
            get () { return this.$store.state[this.moduleName].editData.files },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'files', value: val}) }
        },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        userTableLinesDXcols: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='vertical'){ result = true }
                return result
            } 
        },
        userTableLinesDXrows: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='horizontal'){ result = true }
                return result
            } 
        },
        userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage }  },
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
        },
        /*
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        */
    }
})
</script>
