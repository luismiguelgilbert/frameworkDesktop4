<template>
    <q-card v-if="senderData" style="min-width: 800px;">
        <q-card-section>
            <q-form class="q-gutter-md">
                <q-input
                    filled
                    :value="senderData.sys_user_fullname + ' (' + senderData.sys_user_mail + ')'"
                    label="De" disable
                    >
                    <template v-slot:prepend><q-icon name="fas fa-user" /></template>
                </q-input>
                <q-input
                    filled
                    v-model="destinations"
                    label="Para (para varios destinatarios separe las direcciones usando coman)" clearable square
                    >
                    <template v-slot:prepend><q-icon name="fas fa-envelope" /></template>
                </q-input>
                <q-input
                    filled
                    v-model="senderData.subjectText"
                    label="Asunto"  square
                    >
                    <template v-slot:prepend><q-icon name="fas fa-mail-bulk" /></template>
                </q-input>
                <q-editor 
                    v-model="senderData.bodyText" 
                    min-height="5rem" max-height="8rem"  />
                <q-list v-for="file in attachmentsData" :key="file.fileName" dense >
                    <q-item clickable @click="downloadTempFile(file)">
                        <q-item-section side>
                            <q-icon name="fas fa-paperclip" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{file.fileName}}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-form>
        </q-card-section>
        <q-card-actions align="around">
            <q-btn color="primary" label="Incluirme" icon="fas fa-copy" @click="includeMe" />
            <q-btn color="primary" label="Enviar" icon="fas fa-paper-plane" @click="sendMail" />
        </q-card-actions>
        <q-inner-loading :showing="isBusy">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { uid } from 'quasar'

export default({
  name: 'tableComponent',
  props: {
      moduleName: { type: String , required: true },
      moduleRow: { type: Object , required: true },
      moduleReportURL: { type: String , required: true },
  },
  data () {
    return {
      dataRows: [], router: this.$router, senderData: null, destinationsData: [], destinations: '', attachmentsData: [], isBusy: false,
      //selectedRows: [],
    }
  },
  mounted(){
    /*console.dir(this.moduleName)
    console.dir(this.moduleRow)
    console.dir(this.moduleRow.value)*/
    this.loadData();
  },
  methods:{
    loadData(){
        this.isBusy = true;
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spGetMailFormData',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
                userCompany: this.userCompany,
                moduleName: this.moduleName,
                row_id: this.moduleRow.value,
                moduleReportURL: this.moduleReportURL,
                uid: uid()
            }
        }).then((response) => {
            this.senderData = JSON.parse(response.data[0].sender);
            this.destinationsData = JSON.parse(response.data[0].destinations);
            this.attachmentsData = response.data[0].attachments;
            this.destinations = this.destinationsData.filter(y=>y.mail.length>0&&y.mail.includes('@')).map(x=>x.mail).join(", ");
            this.isBusy = false;
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
            this.isBusy = false
        })
    },
    includeMe(){
        if(!this.destinations){ this.destinations = '' }//if cleared goes to null, so avoid null
        if(this.destinations.includes(this.senderData.sys_user_mail)){
            this.$q.notify({ html: true, multiLine: false, color: 'primary'
                ,message: "Ya se encuentra en la lista de Destinatarios."
                ,timeout: 1000, progress: false
            })
        }else{
            if(this.destinations&&this.destinations.includes('@')){
                this.destinations += ', ' + this.senderData.sys_user_mail
            }else{
                this.destinations += this.senderData.sys_user_mail
            }
            
        }
    },
    sendMail(){
        if(this.destinations.length>0&&this.destinations.includes('@')){//validaciones
            this.isBusy = true;
            this.$axios.post( this.apiURL + 'sendUserMail', {
                    senderName: this.senderData.sys_user_fullname,
                    senderMail: this.senderData.sys_user_mail,
                    destinations: this.destinations,
                    subjectText: this.senderData.subjectText,
                    bodyText: this.senderData.bodyText,
                    attachments: JSON.stringify(this.attachmentsData)
                }
                , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
            ).then((response) => {
                this.isBusy = false;
                this.$emit('onSent', response)
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
                this.isBusy = false;
            })
        }
    },
    downloadTempFile(file){
        console.dir('downloadTempFile')
        console.dir(file)
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
      }
  },
  computed:{
    userCode: { get () { return this.$store.state.main.userCode } },
    userCompany: { get () { return this.$store.state.main.userCompany } },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    serverTempFilesPath: { get () { return this.$q.sessionStorage.getItem('serverTempFilesPath') } },
  },
})
</script>