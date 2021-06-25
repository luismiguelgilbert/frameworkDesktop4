<template>
<q-page style="min-height: 200px; height: calc(100vh - 50px); overflow-y: hidden;" class="q-pa-none">

    <q-card class="rounder-corners shadow-3" v-if="dataLoaded">
        <q-separator />
        <q-splitter 
            v-model="splitterModel"
            style="height: calc(100vh - 50px);" unit="px"
            >
            <template v-slot:before>
                <q-toolbar class="bg-primary text-white ">
                    <q-btn round flat icon="fas fa-sync" class="q-mr-xs" @click="reloadContacts" />
                    <q-space />
                    <q-input dark borderless v-model="searchContacts" input-class="text-right" class="q-ml-md" placeholder="Buscar..">
                        <template v-slot:append>
                            <q-icon v-if="searchContacts === ''" name="search" />
                            <q-icon v-else name="clear" class="cursor-pointer" @click="searchContacts = ''" />
                        </template>
                    </q-input>
                </q-toolbar>
                <q-separator />
                <div :class="userColor=='blackDark'?'scroll bg-grey-9':'scroll bg-grey-1'">
                    <!--selectedContact = {{selectedContact}}
                    <br>contactsList = {{contactsList}}-->
                    <q-virtual-scroll
                        style="height: calc(100vh - 110px)"
                        :items="contactsList.filter(x=> ( x.sender_sys_user_name.toLowerCase().includes(searchContacts) || x.sender_sys_user_lastname.toLowerCase().includes(searchContacts) ))"
                        separator
                        >
                        <template v-slot="{ item, index }">
                            <q-item 
                                :key="index"
                                :active="item.sender_sys_user_code == selectedContact"
                                :active-class="userColor=='blackDark'?'bg-grey-7 text-white':'bg-grey-3'"
                                clickable @click="loadMessages(item)">
                                <q-item-section avatar>
                                    <q-img 
                                        v-if="item.userPhoto&&item.userPhoto.length>2" 
                                        :src="serverFilesPath + item.userPhoto" 
                                        basic style="width: 30px; max-height: 35px;"
                                        spinner-color="white"
                                        class="rounded-borders"
                                        />
                                    <q-avatar v-if="!(item.userPhoto&&item.userPhoto.length>2)" color="primary" text-color="white" icon="fas fa-user" size="md" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label lines="1">{{item.sender_sys_user_name}} {{item.sender_sys_user_lastname}}</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-badge align="middle" color="red" v-if="item.isReadCounter>0">{{item.isReadCounter}}</q-badge>
                                </q-item-section>
                            </q-item>                            
                        </template>
                    </q-virtual-scroll>
                </div>
            </template>

            <template v-slot:after>
                <div v-if="selectedContact">
                    <q-toolbar class="bg-primary text-white ">
                        <q-toolbar-title v-if="selectedContact&&selectedContact>0&&contactsList.find(x=>x.sender_sys_user_code==selectedContact)">
                            <q-img 
                                v-if="selectedContact&&selectedContact>0&&contactsList.find(x=>x.sender_sys_user_code==selectedContact)&&contactsList.find(x=>x.sender_sys_user_code==selectedContact).userPhoto&&contactsList.find(x=>x.sender_sys_user_code==selectedContact).userPhoto.length>2" 
                                :src="serverFilesPath + contactsList.find(x=>x.sender_sys_user_code==selectedContact).userPhoto" 
                                basic style="width: 30px; max-height: 35px;"
                                spinner-color="white"
                                class="rounded-borders"
                                />
                            <q-avatar 
                                v-if="!(selectedContact&&selectedContact>0&&contactsList.find(x=>x.sender_sys_user_code==selectedContact)&&contactsList.find(x=>x.sender_sys_user_code==selectedContact).userPhoto&&contactsList.find(x=>x.sender_sys_user_code==selectedContact).userPhoto.length>2)" 
                                color="primary" text-color="white" icon="fas fa-user" size="md" />
                            Notificaciones de {{contactsList.find(x=>x.sender_sys_user_code==selectedContact).sender_sys_user_name}} {{contactsList.find(x=>x.sender_sys_user_code==selectedContact).sender_sys_user_lastname}}
                        </q-toolbar-title>
                        <q-input borderless disable />
                    </q-toolbar>
                    <q-separator />
                    <q-splitter 
                        v-model="splitterModelInside"
                        style="height: calc(100vh - 110px);" unit="%"
                        >
                        <template v-slot:before>
                            <q-virtual-scroll
                                style="height: calc(100vh - 110px)"
                                :items="contactMessages"
                                separator
                                >
                                <template v-slot="{ item, index }">
                                    <q-item 
                                        :key="index" 
                                        :active="item == selectedMessage"
                                        :active-class="userColor=='blackDark'?'bg-grey-7 text-white':'bg-grey-3'"
                                        clickable @click="showMessage(item)">
                                        <q-item-section>
                                            <q-item-label class="text-primary text-subtitle2">{{item.title}}</q-item-label>
                                            <q-item-label caption  lines="1">{{item.messageDate}}</q-item-label>
                                        </q-item-section>
                                        <q-item-section side top>
                                            <q-item-label lines="1">{{item.messageDateElapsed}}</q-item-label>
                                        </q-item-section>
                                    </q-item>                            
                                </template>
                            </q-virtual-scroll>
                        </template>
                        <template v-slot:after>
                            <q-card-section v-if="selectedMessage" v-html="selectedMessage.message" />
                        </template>
                    </q-splitter>
                </div>
                <div v-if="!selectedContact">
                    Debe seleccionar un usuario de la lista
                </div>
            </template>
        </q-splitter>
    </q-card>
    
    <q-inner-loading :showing="loadingData" style="z-index: 999;">
        <q-spinner-ios size="50px" color="amber" />
    </q-inner-loading>

</q-page>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
//import basicComponent from './NotificationsEditBasic'



export default ({
  components:{
     //basicComponent: basicComponent
  },
  data () {
    return {
        moduleName: "Notifications", router: this.$router,
        tab: 'basic', splitterModel: 350, dataLoaded: true, loadingData: false, searchContacts: ''
        //,selectedContact: null
        ,contactsList: []
        ,contactMessages: []
        ,splitterModelInside: 50
        ,selectedMessage: null
    }
  },
  created(){
    if(this.$q.screen.lt.sm){this.splitterModel = 60}
    this.reloadContacts();
  },
  methods:{
    reloadContacts(){
        //this.selectedContact = null //esto se inactivó, porque [this.selectedContact] puede contener un ID desde mainlayout
        this.loadingData = true
        this.selectedMessage = null
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spMyNotificationsContacts',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: { 
                userCode: this.userCode,
                userLanguage: 'es',
                userCompany: this.userCompany,
            }
        }).then((response) => {
            this.contactsList = JSON.parse(response.data[0].myContacts)
            this.loadingData = false
            if(this.selectedContact&&this.selectedContact>0){
                if(this.contactsList.find(x=>x.sender_sys_user_code==this.selectedContact)){
                    this.loadMessages(this.contactsList.find(x=>x.sender_sys_user_code==this.selectedContact))
                }
            }
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
    loadMessages(item){
        item.isReadCounter = 0
        this.selectedMessage = null
        this.selectedContact = item.sender_sys_user_code
        this.loadingData = true
        this.contactMessages = []
        //remueve del Vuex, para que dé la impresión de sincronismo
        //this.unreadNotifications = this.unreadNotifications.filter(x=>x.sender_sys_user_code!=this.selectedContact.sender_sys_user_code)
        this.unreadNotifications = this.unreadNotifications.filter(x=>x.sender_sys_user_code!=this.selectedContact)
        
        
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spMyNotificationsContactMessages',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: { 
                userCode: this.userCode,
                userLanguage: 'es',
                userCompany: this.userCompany,
                contactUserCode: this.selectedContact,//.sender_sys_user_code
            }
        }).then((response) => {
            this.contactMessages = JSON.parse(response.data[0].contactMessages)
            this.loadingData = false
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
    showMessage(message){
        this.selectedMessage = message
    }
  },
  computed:{
    userMainToolbarComponentClass: { get () { 
        let result = 'no-padding '
        if(this.$store.state.main.userColor=='default'){
            result=result + 'bg-white text-primary'
        }
        if(this.$store.state.main.userColor=='blackDark'){
            result=result + 'bg-grey-10 text-white'
        }
        return result
    }},
    userColor: { get () { return this.$store.state.main.userColor }  },
    userCode: { get () { return this.$store.state.main.userCode } },
    userCompany: { get () { return this.$store.state.main.userCompany } },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
    unreadNotifications: { get () { return this.$store.state.main.unreadNotifications }, set (val) { this.$store.commit('main/updateState', {key: 'unreadNotifications', value: val}) } },
    selectedContact: { get () { return this.$store.state.main.selectedContact }, set (val) { this.$store.commit('main/updateState', {key: 'selectedContact', value: val}) } },
  },
})
</script>