<template>
  <q-layout view="hHh lpr lFf" style="min-height: 200px;">
    <q-header >
      <q-toolbar v-if="userCompanies && userCompanies.length>0" :class="userMainLayoutToolbar">
        <span >&ensp;</span>
        <q-btn flat icon="fas fa-bars" @click="leftDrawerOpen=!leftDrawerOpen" :color="userColor=='blackDark'?'primary':null" />
        <!--ROOT-->
        <span v-if="$q.screen.gt.xs">&ensp;</span>
        <div flat :dense="!$q.screen.gt.xs" v-if="currentPath" menu-anchor="bottom left" menu-self="top left" no-caps size="sm">
            <div class="row items-center no-wrap">
              <q-icon v-if="$q.screen.gt.xs" left :name="menuData.find(x=>x.link_name==currentPath).icon"  />
              <div v-if="$q.screen.gt.xs" class="text-center">
                {{menuData.find(x=>x.link_name==currentPath).label}}
              </div>
            </div>
        </div>
        <span v-if="$q.screen.gt.xs">&ensp;</span><span v-if="$q.screen.gt.xs">&ensp;</span><div v-if="$q.screen.gt.xs && currentPathModule">/</div>
        <!--MODULE-->
        <span v-if="$q.screen.gt.xs">&ensp;</span>
        <q-btn-dropdown  flat :dense="!$q.screen.gt.xs" v-if="currentPathModule" menu-anchor="bottom left" menu-self="top left"  no-caps >
          <template v-slot:label>
            <div class="row items-center no-wrap">
              <q-icon left :name="menuData.find(x=>x.link_name==currentPathModule).icon" />
              <div v-if="$q.screen.gt.xs" class="text-center">
                {{menuData.find(x=>x.link_name==currentPathModule).label}}
              </div>
            </div>
          </template>
          <q-list class="text-grey-7">
              <q-item
                v-for="(module,index) in menuData.filter(y=>y.parent == (menuData.find(x=>x.link_name==currentPathModule).parent) )" :key="index"
                clickable @click="openModule(module)"
                :active="module.link_name==currentPathModule"
                active-class="text-primary text-weight-bold"
                >
                <q-item-section avatar>
                  <q-icon :name="module.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label :title="module.comment" >{{module.label}}</q-item-label>
                </q-item-section>
              </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-space />
        <!--Universal Search A FUTURO-->
        <q-space />


        <!--COMPANY-->
        <q-btn-dropdown flat :dense="!$q.screen.gt.xs" menu-anchor="bottom left" menu-self="top left" no-caps  >
          <template v-slot:label>
            <div class="row items-center no-wrap">
              <q-icon left name="fas fa-building" />
              <div v-if="$q.screen.gt.xs" class="text-center">
                {{userCompanies.find(x=>x.companyID==userCompany).companyShortName}}
              </div>
            </div>
          </template>
          <q-list class="text-grey-7" v-close-popup >
              <q-item
                v-for="company in userCompanies" :key="company.companyID"
                clickable @click="changeCompany(company)"
                :active="userCompany==company.companyID"
                active-class="text-primary text-weight-bold"
                >
                <q-item-section avatar>
                  <q-icon name="fas fa-building" />
                </q-item-section>
                <q-item-section>
                  <q-item-label :title="company.companyName + ' (' + company.companyNumber + ')'" >{{company.companyShortName}}</q-item-label>
                </q-item-section>
              </q-item>
          </q-list>
        </q-btn-dropdown>

        <!--NOTIFICATION-->
        <span>&ensp;</span>
        <q-btn flat dense :loading="isNotificationBusy" menu-anchor="bottom left" menu-self="top left" no-caps icon="fas fa-bell" class="q-mr-md"  >
          <q-badge floating color="red" v-if="unreadNotifications.length>0&&unreadCount>0">!</q-badge>
          <q-menu>
            <div class="scroll" style="max-height: 240px;">
              <q-list separator class="text-grey-7" v-close-popup >
                <q-item clickable v-for="(note,index) in unreadNotifications" :key="index" @click="gotoNotifications(note.sender_sys_user_code)">
                  <q-item-section avatar>
                    <q-img
                      v-if="note.userPhoto&&note.userPhoto.length>2"
                      :src="serverFilesPath + note.userPhoto"
                      basic style="width: 30px; max-height: 35px;"
                      spinner-color="white"
                      class="rounded-borders"
                      />
                    <q-avatar v-if="!(note.userPhoto&&note.userPhoto.length>2)" color="primary" text-color="white" icon="fas fa-user" size="md" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{note.title}}</q-item-label>
                    <q-item-label caption lines="2">{{note.sender_sys_user_name}} {{note.sender_sys_user_lastname}}</q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <q-item-label caption>{{note.messageDateElapsed}}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="unreadNotifications.length <= 0">
                  <q-item-section>
                    <q-item-label>No tiene notificaciones pendientes</q-item-label>
                  </q-item-section>
                </q-item>

              </q-list>
            </div>
            <q-item-label caption><q-btn icon="fas fa-external-link-alt" size="lg" label="Abrir Notificaciones" no-caps class="full-width no-border-radius" color="primary"  @click="gotoNotifications(0)" /></q-item-label>
          </q-menu>
        </q-btn>


        <!--USER-->
        <span>&ensp;</span>
        <q-btn flat dense :title="userID">
          <q-img
            v-if="userPhoto&&userPhoto.length>2"
            :src="serverFilesPath + userPhoto"
            basic style="width: 30px; max-height: 35px;"
            spinner-color="white"
            class="rounded-borders"
            />
          <q-avatar v-if="!(userPhoto&&userPhoto.length>2)" color="primary" text-color="white" icon="fas fa-user" size="md" />

          <q-menu auto-close content-style="min-width: 325px;" >
            <q-card bordered class="text-primary q-pa-sm">
              <q-list separator dense>
                <q-item>
                  <q-item-section avatar>
                      <q-img
                        v-if="userPhoto"
                        :src="serverFilesPath + userPhoto"
                        basic style="width: 120px"
                        spinner-color="white"
                        class="rounded-borders"
                      />
                  </q-item-section>
                  <q-item-section>
                    <q-item dense>
                      <q-item-section side><q-icon name="fas fa-user"/></q-item-section>
                      <q-item-section><q-item-label class="text-primary text-subtitle2">{{userName}} {{userLastName}}</q-item-label></q-item-section>
                    </q-item>
                    <q-item dense>
                      <q-item-section side><q-icon name="fas fa-envelope"/></q-item-section>
                      <q-item-section><q-item-label class="text-caption">{{userMail}}</q-item-label></q-item-section>
                    </q-item>
                    <q-item dense>
                      <q-item-section side><q-icon name="fas fa-user-shield"/></q-item-section>
                      <q-item-section><q-item-label class="text-primary text-subtitle2">{{userProfileName}}</q-item-label></q-item-section>
                    </q-item>
                    <!--<q-item-label caption>{{userProfileName}}</q-item-label>-->
                    <q-item-label caption><q-btn icon="fas fa-user-edit" label="Mi Cuenta" no-caps class="full-width q-mt-sm" color="primary"  @click="gotoPreferences" /></q-item-label>
                    <q-item-label caption><q-btn icon="fas fa-sign-out-alt" label="Cerrar Sesión" no-caps class="full-width" color="red"  @click="logOut" /></q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer elevated   v-model="leftDrawerOpen" >
      <q-list class="text-grey-7"  >
        <!--
          <q-item
          v-for="(root,index) in menuData.filter(x=>x.parent==null&&x.sys_link_id!=99)" :key="index"
          clickable
          :active="root.link_name==currentPath"
          active-class="text-primary text-weight-bold"
          >
            <q-item-section avatar>
              <q-icon :name="root.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label :title="root.comment">{{root.label}}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="fas fa-chevron-right" />
            </q-item-section>
            <q-menu anchor="top right" self="top left">
              <q-list class="text-grey-7">
                <q-item
          -->
        <q-expansion-item
          v-for="(root,index) in menuData.filter(x=>x.parent==null&&x.sys_link_id!=99&&x.sys_link_id!=98)" :key="index"
          group="sameRootGroup"
          :icon="root.icon"
          :label="root.label"
          :header-class="root.link_name==currentPath?'text-weight-bolder text-primary':'text-weight-bold'"
          >
          <q-card :dark="userColor=='blackDark'">
            <q-list class="text-grey-7" bordered>
              <q-item
                v-for="(module,index) in menuData.filter(y=>y.parent==root.sys_link_id)" :key="index"
                clickable @click="openModule(module)" dense
                :active="module.link_name==currentPathModule"
                active-class="text-primary text-weight-bold"
                expand-separator
                >
                <q-item-section side class="q-pl-lg">
                  <q-icon :name="module.icon" size="1rem" :color="module.link_name==currentPathModule?'primary':undefined" />
                </q-item-section>
                <q-item-section>
                  <q-item-label :title="module.comment" >{{module.label}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <!-- El style hace que la página siempre crezca lo máximo disponible para que el drawer se extienda automáticamente-->
    <q-page-container style="height: calc(100vh - 2px)">
      <transition  enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in" >
      <router-view />
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import { debounce, colors, SessionStorage, Notify } from 'quasar'
Vue.use(Vuex)

export default {
  name: 'MainLayout',

  created(){
    console.dir(window.location.pathname)
    alert('Estoy en MainLayout')
    alert(window.location.href)
    this.$q.loading.show({ delay: 0, message: 'Cargando configuración..', messageColor: 'white', spinnerColor: 'white' })
    if(! (this.$q.sessionStorage.getItem('sys_user_code') && this.$q.sessionStorage.getItem('sys_profile_id') && this.$q.sessionStorage.getItem('jwtToken') ) ){
      this.$q.notify({color: 'info', message: 'Ingrese su usuario y contraseña', timeout: 3000, icon: "fas fa-lock" });
      //this.router.replace('/Login'); //navigate to login
      this.router.replace('/LoginENS'); //navigate to login
      //this.router.replace('/LoginSchoenstatt'); //navigate to login
      return;
    }

    this.$axios({
      method: 'GET',
      url: this.apiURL + 'spSysUserMainData',
      headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
      params: {
          sys_user_code: this.$q.sessionStorage.getItem('sys_user_code'),
          sys_profile_id: this.$q.sessionStorage.getItem('sys_profile_id'),
          sys_user_language: null
      }
    }).then((response) => {
      if(response && response.data && response.data[0]){
        Object.keys(response.data[0]).map(x => {
          try{
            this[x] = JSON.parse(response.data[0][x])
          }catch(ex){
            this[x] = response.data[0][x]
          }
        })
        this.computedDataLoaded=true;//para que se cargue el router-view IF computedData is loaded
        this.userColor = this.userColor//force theme to be applied
        this.$q.dark.set(this.userDarkMode)//force darkMode to be applied
        this.loadNotifications();//Forza 1 llamada inicial
        this.poolNotifications();//inicia intervalo de lectura de notificaciones
        //navigate to user default init module, if exists
        try{
          if(this.userLinkID){
            if(this.menuData.some(x=>x.sys_link_id==this.userLinkID)){
              this.currentPath = this.menuData.find(x=>x.sys_link_id==this.menuData.find(x=>x.sys_link_id==this.userLinkID).parent).link_name
              this.currentPathModule = this.menuData.find(x=>x.sys_link_id==this.userLinkID).link_name
              if(this.router.currentRoute.path != '/'+this.menuData.find(x=>x.sys_link_id==this.userLinkID).link_name){
                this.router.push('/'+this.menuData.find(x=>x.sys_link_id==this.userLinkID).link_name)
              }
            }
          //}else{ this.router.push({ path: '/RootHome' }) }
          }//else{ this.router.push({ path: '/' }) }
        }catch(ex){console.dir(ex)}

      }
      this.$q.loading.hide()
    }).catch((error) => {
      this.$q.loading.hide()
      console.error(error)
      console.dir(error.response)
      let mensaje = 'Hubo un eror de acceso al servidor'
      if(error && error.response && error.response.data && error.response.data.info && error.response.data.info.message){
          mensaje = mensaje + ': ' + error.response.data.info.message
      }
      this.$q.notify({
          color: 'red'
          ,position: 'bottom'
          ,message: mensaje
          ,icon: 'fas fa-exclamation-circle'
          ,multiLine: true, html: true
      })
    })
  },

  methods: {
    openSameRoot(){
      if(this.currentPathModule!=null && this.currentPathModule!=null){
        this.router.push('/'+ this.currentPath)
        this.currentPathModule = null
      }
    },
    openRoot(module){
      if(this.currentPath!=module.link_name){
        //this.currentPath = this.moduleName
        this.currentPath = module.link_name
        this.currentPathModule = null
        this.router.push('/'+module.link_name)
      }
    },
    openModule(module){
      if(this.currentPathModule!=module.link_name){
        this.currentPath = this.menuData.find(x=>x.sys_link_id==module.parent).link_name //module.link_name
        this.currentPathModule = module.link_name
        this.router.push('/'+module.link_name)
      }
    },
    gotoPreferences(){
      if(this.currentPath != 'RootPreferences'){
        this.currentPath = 'RootPreferences'
        this.currentPathModule = null
        this.router.push({ path: '/RootPreferences' })
      }
    },
    gotoNotifications(selectedContact){
      if(this.currentPath != 'RootNotifications'){
        this.currentPath = 'RootNotifications'
        this.currentPathModule = null
        if(selectedContact&&selectedContact>0){
          this.selectedContact = selectedContact
        }
        this.router.push({ path: '/RootNotifications' })
      }
    },
    changeCompany(company){
      this.userCompany = company.companyID
    },
    logOut(){
      this.router.push({ path: '/Login' })//states se resetean en el created de Login
      clearInterval(this.interval)
    },
    poolNotifications(){
      this.interval = setInterval(function () {
        this.loadNotifications();
      }.bind(this), this.notificationInterval);
    },
    loadNotifications(){
      this.isNotificationBusy = true;
      this.$axios({
        method: 'GET',
        url: this.apiURL + 'spMyUnreadNotifications',
        headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
        params: {
            userCode: this.userCode,
            userCompany: this.userCompany,
            userLanguage: 'es'
        }
      }).then((response) => {
        this.isNotificationBusy = false;
        this.unreadCount = response.data[0].unreadCount
        this.unreadNotifications = JSON.parse(response.data[0].unreadNotifications)
      }).catch((error) => {
        this.isNotificationBusy = false;
        console.error(error)
        console.dir(error.response)
      })
    }
  },

  data () {
    return {
      router: this.$router, leftDrawerOpen: true, isNotificationBusy: false, unreadCount: 0, interval: null
    }
  },

  computed:{
    userColor: {
      get () { return this.$store.state.main.userColor },
      set (val) { this.$store.commit('main/updateState', {key: 'userColor', value: val}) }
    },
    userMainLayoutToolbar: { get () {
      let result = 'no-padding '
      if(this.$store.state.main.userColor=='default'){
        result=result + 'bg-primary text-white'
        colors.setBrand('primary', '#1867C0') //#1976D2 //1867C0
        this.$q.dark.set(false)
      }
      if(this.$store.state.main.userColor=='blackDark'){
        result=result + 'bg-grey-10 text-white'
        colors.setBrand('primary', '#2196F3')//#2196F3 //#FFC107 //#1976D2 //#31CCEC //FFC107 //1867C0
        this.$q.dark.set(true)
      }
      return result
    }},
    userMainDrawer: { get () {
      let result = 'no-padding '
      if(this.$store.state.main.userColor=='default'){
        result=result + 'text-primary'
      }
      if(this.$store.state.main.userColor=='light'){
        result=result + 'text-primary'
      }
      if(this.$store.state.main.userColor=='blackDark'){
        result=result + 'bg-grey-10 text-white'
      }
      return result
    }},
    userDarkMode: { get () { return this.$store.state.main.userDarkMode }, set (val) { this.$store.commit('main/updateState', {key: 'userDarkMode', value: val}) }  },
    userPhoto: { get () { return this.$store.state.main.userPhoto }, set (val) { this.$store.commit('main/updateState', {key: 'userPhoto', value: val}) } },
    userID: { get () { return this.$store.state.main.userID }, set (val) { this.$store.commit('main/updateState', {key: 'userID', value: val}) } },
    userCode: { get () { return this.$store.state.main.userCode }, set (val) { this.$store.commit('main/updateState', {key: 'userCode', value: val}) } },
    userMail: { get () { return this.$store.state.main.userMail }, set (val) { this.$store.commit('main/updateState', {key: 'userMail', value: val}) } },
    userName: { get () { return this.$store.state.main.userName }, set (val) { this.$store.commit('main/updateState', {key: 'userName', value: val}) } },
    userLastName: { get () { return this.$store.state.main.userLastName }, set (val) { this.$store.commit('main/updateState', {key: 'userLastName', value: val}) } },
    userProfileName: { get () { return this.$store.state.main.userProfileName }, set (val) { this.$store.commit('main/updateState', {key: 'userProfileName', value: val}) } },
    userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage }, set (val) { this.$store.commit('main/updateState', {key: 'userRowsPerPage', value: val}) } },
    userRowsToRender: { get () { return this.$store.state.main.userRowsToRender }, set (val) { this.$store.commit('main/updateState', {key: 'userRowsToRender', value: val}) } },
    userTableLines: { get () { return this.$store.state.main.userTableLines }, set (val) { this.$store.commit('main/updateState', {key: 'userTableLines', value: val}) } },
    userTableDense: { get () { return this.$store.state.main.userTableDense }, set (val) { this.$store.commit('main/updateState', {key: 'userTableDense', value: val}) } },
    userDateFormat: { get () { return this.$store.state.main.userDateFormat }, set (val) { this.$store.commit('main/updateState', {key: 'userDateFormat', value: val}) } },
    userTimeFormat: { get () { return this.$store.state.main.userTimeFormat }, set (val) { this.$store.commit('main/updateState', {key: 'userTimeFormat', value: val}) } },
    userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }, set (val) { this.$store.commit('main/updateState', {key: 'userMoneyFormat', value: val}) } },
    userUsersFormat: { get () { return this.$store.state.main.userUsersFormat }, set (val) { this.$store.commit('main/updateState', {key: 'userUsersFormat', value: val}) } },
    userCompanies: { get () { return this.$store.state.main.userCompanies }, set (val) { this.$store.commit('main/updateState', {key: 'userCompanies', value: val}) } },
    userCompany: { get () { return this.$store.state.main.userCompany }, set (val) { this.$store.commit('main/updateState', {key: 'userCompany', value: val}) } },
    notificationInterval: { get () { return this.$store.state.main.notificationInterval }, set (val) { this.$store.commit('main/updateState', {key: 'notificationInterval', value: val}) } },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
    userLinkID: { get () { return this.$store.state.main.userLinkID }, set (val) { this.$store.commit('main/updateState', {key: 'userLinkID', value: val?val.toString():null}) } },//tostring para que el rootpreferences lo interprete como string
    menuData: { get () { return this.$store.state.main.menuData }, set (val) { this.$store.commit('main/updateState', {key: 'menuData', value: val}) } },
    currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
    unreadNotifications: { get () { return this.$store.state.main.unreadNotifications }, set (val) { this.$store.commit('main/updateState', {key: 'unreadNotifications', value: val}) } },
    selectedContact: { get () { return this.$store.state.main.selectedContact }, set (val) { this.$store.commit('main/updateState', {key: 'selectedContact', value: val}) } },
  },

  watch: {
    notificationInterval: function (val) {
      clearInterval(this.interval)
      this.poolNotifications();//inicia intervalo de lectura de notificaciones (con Intervalo actualizado)
    },
  }
}
</script>
