<template>
<div>
  <div v-if="isDefaultDataLoaded">
    <q-layout v-if="isDefaultDataLoaded" dark view="hHh lpr lFf" style="min-height: 200px; overflow-y: hidden;">
      
      <q-header>
        <q-toolbar v-if="userCompanies && userCompanies.length>0" :class="userMainLayoutToolbar">
          
          <q-btn flat stretch icon="fas fa-bars" @click="leftDrawerOpen=!leftDrawerOpen" :color="userColor=='blackDark'?'primary':null" />
          <!--ROOT-->
          <div class="q-ml-md"
            v-if="menuData.find(x=>x.link_name==ruta) && menuData.find(y=>y.sys_link_id==menuData.find(x=>x.link_name==ruta).parent)">
              <div class="row items-center no-wrap">
                <q-icon v-if="$q.screen.gt.xs" left :name="menuData.find(y=>y.sys_link_id==menuData.find(x=>x.link_name==ruta).parent).icon"  />
                <div v-if="$q.screen.gt.xs" class="text-center">
                  {{menuData.find(y=>y.sys_link_id==menuData.find(x=>x.link_name==ruta).parent).label}}
                </div>
                <div v-if="$q.screen.gt.xs" class="q-ml-sm ">/</div>
              </div>
          </div>
          <q-btn v-else-if="$q.screen.gt.xs&&router.currentRoute.path=='/'" stretch flat no-caps 
            icon="fas fa-home" 
            label="Inicio" />


          <!--MODULE-->
          <!--icon-right="fas fa-caret-down"-->
          <q-btn  flat stretch class="q-ml-sm"
            v-if="$q.screen.gt.xs&&menuData.find(x=>x.link_name==ruta)"
            :label="$q.screen.gt.xs?menuData.find(x=>x.link_name==ruta).label:undefined"
            :icon="menuData.find(x=>x.link_name==ruta).icon"
            :title="$q.screen.gt.xs?menuData.find(x=>x.link_name==ruta).label:undefined"
            
            menu-anchor="bottom left" menu-self="top left"  no-caps >
            <q-menu square v-if="router.currentRoute.path!='/RootPreferences'" @show="scrolltoOption">
              <q-virtual-scroll ref="dropdownMenuList" style="height: 250px;" :items="menuData.filter(y=>y.parent == menuData.find(x=>x.link_name==ruta).parent)"  class="text-grey-7">
                <template v-slot="{ item, index }">
                  <q-item :key="index"
                    clickable :to="'/'+item.link_name"
                    :active="item.link_name==menuData.find(x=>x.link_name==ruta).link_name"
                    active-class="bg-primary text-white text-weight-bold"
                    :title="item.comment">
                    <q-item-section avatar>
                      <q-icon :name="item.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label >{{item.label}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-virtual-scroll>
              <!--<q-list class="text-grey-7">
                  <q-item
                    v-for="(menuItem,index) in menuData.filter(y=>y.parent == menuData.find(x=>x.link_name==ruta).parent)" :key="index"
                    clickable :to="'/'+menuItem.link_name"
                    :active="menuItem.link_name==menuData.find(x=>x.link_name==ruta).link_name"
                    active-class="bg-primary text-white text-weight-bold"
                    :title="menuItem.comment"
                    >
                    <q-item-section avatar>
                      <q-icon :name="menuItem.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label >{{menuItem.label}}</q-item-label>
                    </q-item-section>
                  </q-item>
              </q-list>-->
            </q-menu>
          </q-btn>

          <div v-if="$q.screen.gt.xs&&router.currentRoute.path!='/'&&!isNaN(router.currentRoute.path.split('/')[(router.currentRoute.path.split('/').length)-1])"
            class="row items-center q-ml-sm" >
            <div v-if="$q.screen.gt.xs" class="q-mr-sm">/</div>
            <q-icon name="fas fa-edit" color="white" class="q-mr-sm" /> Edición
          </div>

          <q-space />
          
          
          <!--Universal Search A FUTURO-->
          <q-space />

          
          <!--COMPANY-->
          <q-btn icon="fas fa-home" flat stretch to="/" title="Ir a Inicio" />
          <q-btn 
            flat stretch no-caps 
            :label="$q.screen.gt.sm?(userCompanies.find(x=>x.companyID==userCompany).companyShortName):undefined"
            :disable="disableCompanyChange"
            v-if="$q.screen.gt.sm"
            >
            <q-menu v-if="userCompanies.length>1">
              <q-list class="text-grey-7" v-close-popup >
                <q-item
                  v-for="company in userCompanies" :key="company.companyID"
                  clickable v-ripple v-close-popup
                  @click="changeCompany(company)"
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
            </q-menu>
          </q-btn>

          <q-toggle 
            v-model="userColor" 
            title="Color Preferido" 
            false-value="default" true-value="blackDark" 
            checked-icon="fas fa-moon" 
            unchecked-icon="fas fa-sun" 
            size="sm"
            @input="userColorChange"
            />

          <!--USER-->
          <q-btn flat  stretch :title="userID" >
            <q-img
              v-if="userPhoto&&userPhoto.length>2"
              :src="serverFilesPath + userPhoto"
              basic style="width: 30px; max-height: 35px;"
              spinner-color="white"
              class="rounded-borders"
              />
            <q-avatar v-if="!(userPhoto&&userPhoto.length>2)" color="primary" text-color="white" icon="fas fa-user" size="md" />
            <!--<q-img
              v-if="userPhoto&&userPhoto.length>2"
              :src="serverFilesPath + userPhoto"
              basic 
              :ratio="1"
              spinner-color="white"
              class="rounded-borders"
              />
              -->

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
                        <q-item-section><q-item-label class="text-primary text-caption">{{userMail}}</q-item-label></q-item-section>
                      </q-item>
                      <q-item dense>
                        <q-item-section side><q-icon name="fas fa-user-shield"/></q-item-section>
                        <q-item-section><q-item-label class="text-primary text-subtitle2">{{userProfileName}}</q-item-label></q-item-section>
                      </q-item>
                      <q-item dense>
                        <q-item-section side><q-icon name="fas fa-code-branch"/></q-item-section>
                        <q-item-section><q-item-label class="text-primary text-subtitle2">Version: {{version}}</q-item-label></q-item-section>
                      </q-item>
                      
                      <!--<q-item-label caption>{{userProfileName}}</q-item-label>-->
                      <q-item-label caption><q-btn icon="fas fa-user-edit" label="Mi Cuenta" no-caps class="full-width q-mt-sm" color="primary"  to="/RootPreferences" /></q-item-label>
                      <q-item-label caption><q-btn icon="fas fa-sign-out-alt" label="Cerrar Sesión" no-caps class="full-width" color="red"  @click="logOut" /></q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </q-menu>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer elevated overlay v-model="leftDrawerOpen" @show="focusSearchMenuInput" 
        :content-class="userColor=='default'?'text-grey-5':'bg-grey-10 text-white'">
        <!-- :content-class="userColor=='default'?'bg-primary text-white':'bg-grey-10 text-white'"> -->
        <!--<q-list class="text-grey-7"  >-->
        <q-input
          ref="mainMenuSearchStringInput"
          v-model="mainMenuSearchString"
          filled dense
          class="q-pl-sm q-pr-sm q-pb-sm q-mt-sm"
          debounce="750"
          placeholder="Buscar"
          >
          <template v-slot:prepend >
              <q-icon name="fas fa-search"  />
          </template>
          <template v-if="mainMenuSearchString" v-slot:append>
              <q-btn @click="()=>{mainMenuSearchString=''}" round flat icon="fas fa-times-circle"  color="white" />
          </template>
        </q-input>
        <q-separator inset dark />
        <q-list>
          <!-- :header-class="root.link_name==currentPath?'text-weight-bolder text-primary':'text-weight-bold'" -->
          <!-- v-for="(root,index) in menuData.filter(x=>x.parent==null&&x.sys_link_id!=99&&x.sys_link_id!=98)" :key="index" -->
          <q-expansion-item
            v-for="(root,index) in filteredMainMenu" :key="index"
            group="sameRootGroup" dark
            :icon="root.icon"
            :label="root.label"
            :header-class="root.link_name==rutaRoot?'bg-primary text-weight-bolder text-white':'text-weight-bold text-grey-7'"
            expand-icon-class="text-grey-5"
            >
            <q-card :dark="userColor=='blackDark'" class="text-grey-7">
              <q-list bordered>
                <!-- v-for="(modulo,index) in menuData.filter(y=>y.parent==root.sys_link_id)" :key="index" -->
                <q-item
                  v-for="(modulo,index) in filteredMainMenuDetails(root.sys_link_id)" :key="index"
                  clickable dense :to="'/'+modulo.link_name"
                  @click="shouldHideMenu?leftDrawerOpen=false:leftDrawerOpen=true"
                  :active="modulo.link_name==currentPathModule"
                  active-class="text-primary text-weight-bold"
                  expand-separator
                  >
                  <q-item-section side class="q-pl-lg">
                    <!--:color="modulo.link_name==menuData.find(x=>x.link_name==router.currentRoute.path.substring(1)).link_name?'primary':undefined"-->
                    <q-icon :name="modulo.icon" size="1rem"
                      :color="(menuData.some(x=>x.link_name==router.currentRoute.path.substring(1)) && modulo.link_name==menuData.find(x=>x.link_name==router.currentRoute.path.substring(1)).link_name)?'primary':undefined" 
                       />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :title="modulo.comment">{{modulo.label}}</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="(menuData.some(x=>x.link_name==router.currentRoute.path.substring(1)) && modulo.link_name==menuData.find(x=>x.link_name==router.currentRoute.path.substring(1)).link_name)">
                    <q-icon name="fas fa-chevron-right" color="primary" size="xs" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-drawer>

      <!-- El style hace que la página siempre crezca lo máximo disponible para que el drawer se extienda automáticamente-->
      <q-page-container style="height: calc(100vh); overflow-y: hidden;" ><!--background-color: #F2F6F9;-->
        <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in" >
          <router-view />
        </transition>
      </q-page-container>
    </q-layout>
  </div>
  <div v-else style="height: calc(100vh - 80px)"  >
    <q-inner-loading :showing="!isDefaultDataLoaded">
        <q-spinner-facebook size="10%" color="primary" />
    </q-inner-loading>
  </div>
</div>
</template>

<style lang="scss">
  ::selection {
    color: red;
    background: yellow;
  }
  .dx-datagrid{  
    font-weight: bold;
  }
  .dx-header-row > td[role="columnheader"]> div.dx-datagrid-text-content {  //controla que encabezado se vea con color azul (diferente a las filas)
    font-size: 13px;  
    font-weight: bold;
    color: #2F74EB;
  }
  
  .dx-datagrid-content .dx-datagrid-table .dx-row .dx-command-select{ //controla que checkbox en grids no se vea muy apretado a la derecha
    padding-left: 10px !important;
    padding-right: 10px !important;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }

  /*//los 2 hacen que la línea no se expanda al editar; pero mientras se está cambiando el valor de la celda, se abren 2 filas y se ve mal
  .dx-datagrid .dx-row .dx-widget {  
    height: 15px;  
  }  
  .dx-datagrid .dx-row .dx-widget input.dx-texteditor-input {  
    height: 15px;  
    min-height: 15px;  
  }*/


  //dxdatagrid selected row style
  .dx-datagrid-rowsview .dx-selection.dx-row > td,  
  .dx-datagrid-rowsview .dx-selection.dx-row:hover > td {  
    background-color: #2F74EB !important; // //#5990EF //#4c87ee //#87adee //#673AB7
    color: white !important;
  }

  //enlarge scrollbars vertical
  .dx-scrollbar-vertical.dx-scrollbar-hoverable {  
    width: 15px !important;
  }  
  .dx-scrollbar-vertical .dx-scrollable-scroll {  
    width: 15px !important;
  }

  //enlarge scrollbars horizontal
  .dx-scrollbar-horizontal.dx-scrollbar-hoverable {  
    height: 15px !important;
  }  
  .dx-scrollbar-horizontal .dx-scrollable-scroll {  
    height: 15px !important;
  }

  //always add top border to pager (so it visually separates rows from pager)
  .dx-datagrid-pager {
    border-top-style: solid !important;
    border-top-color: #e0e0e0 !important;
    border-top-width: 1px !important;
  }

  //Always make PopUp Title in primary color
  .dx-popup-title{
    color: #2F74EB !important;
  }
  .dx-checkbox-checked .dx-checkbox-icon{
    background-color: #2196F3 !important; //#03A9F4
  }
  .dx-checkbox-indeterminate .dx-checkbox-icon{
    background-color: #64B5F6 !important; 
  }

</style>

<script>
//import socketIO from 'socket.io-client'
import Vue from 'vue'
import Vuex from 'vuex'
import { debounce, colors, SessionStorage, Notify } from 'quasar'
import {version} from '../../package.json'

//import 'components/dxComponents/dx.common.css'; esto se carga automáticamente en "created" basado en el color predeterminado del usuario
//import 'components/dxComponents/dx.material.default.css'); esto se carga automáticamente en "created" basado en el color predeterminado del usuario
import esMessages from "devextreme/localization/messages/es.json";
import { locale, loadMessages } from 'devextreme/localization';

export default {
  name: 'MainLayout',
  /*components: {
    DevExpress
  },*/
  
  data () {
    return {
      router: this.$router,
      leftDrawerOpen: false,//arranca oculto, porque ahora existe el home que tiene un menú
      isNotificationBusy: false,
      unreadCount: 0,
      interval: null,
      version: version,
      isDefaultDataLoaded: false, //se agregó para que al duplicar una pestaña NO se cargue el contenido, sino hasta que se haya recuperado la data
      mainMenuSearchString: '',
      //isWebSocketConnected: false,
    }
  },

  created(){
    loadMessages(esMessages);//load Spanish Messages
    locale('es');//apply Spanish message
    
    this.$q.sessionStorage.set('pathname',window.location.pathname)
    this.$q.loading.show({ delay: 0, message: 'Cargando configuración..', messageColor: 'white', spinnerColor: 'white' })
    if(! (this.$q.sessionStorage.getItem('sys_user_code') && this.$q.sessionStorage.getItem('sys_profile_id') && this.$q.sessionStorage.getItem('jwtToken') ) ){
      this.$q.notify({color: 'info', message: 'Ingrese su usuario y contraseña', timeout: 1500, icon: "fas fa-lock" });
      if(this.$q.sessionStorage.getItem('pathname').toLowerCase().includes('ens')){
        this.router.replace('/LoginENS'); //navigate to login
      }
      if(this.$q.sessionStorage.getItem('pathname').toLowerCase().includes('schoenstatt')){
        this.router.replace('/LoginSchoenstatt'); //navigate to login
      }
      if(this.$q.sessionStorage.getItem('pathname').toLowerCase().includes('framework') || this.$q.sessionStorage.getItem('pathname')=='/'){
        this.router.replace('/Login'); //navigate to login
      }
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
          if(x=='userCompany'){
            this.$q.sessionStorage.set('sys_user_company', response.data[0][x]) //sys_user_company
          }
        })
        
        this.computedDataLoaded=true;//para que se cargue el router-view IF computedData is loaded
        this.userColor = this.userColor//force theme to be applied
        this.$q.dark.set(this.userDarkMode)//force darkMode to be applied

        if(this.userColor=='default'){ 
          import('components/dxComponents/dx.common.css').then(common=>{
            import('components/dxComponents/dx.material.default.css').then(x=>{
              this.isDefaultDataLoaded=true//para que se haga visible la página porque YA se cargó datos básicos
            });
          });
        }
        if(this.userColor=='blackDark'){ 
          import('components/dxComponents/dx.common.css').then(common=>{
            import('components/dxComponents/dx.material.dark.css').then(x=>{
              this.isDefaultDataLoaded=true//para que se haga visible la página porque YA se cargó datos básicos
            });
          });
        }

        //check version
        this.checkVersion();
        
        //navigate to startup module if exists
        if(this.router.currentRoute.path=='/'){//controla que sea la ruta inicial, de lo contrario, se está duplicando el tab en el browser
          if(this.userLinkID&&this.userLinkID.length>1){
            let initialModule = this.menuData.find(x=>x.sys_link_id==this.userLinkID);
            if(initialModule&&initialModule.link_name){
              this.router.push('/' + initialModule.link_name)
            }
          }
        }
        
      }else{

      }
      this.$q.loading.hide()
      
    }).catch((error) => {
      this.$q.loading.hide()
      console.error(error)
      console.dir(error.response)
      this.isDefaultDataLoaded=true
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

  mounted(){
    this.checkVersion();
    //console.dir('aquí debería resettodefault, pero solo de los que tengo acceso')
    /*
      Object.keys(this.$store.state).filter(y=>y=='main').map(x=>{
          this.$store.commit(x+'/resetToDefaultState')
      })//Loop across all vuex states, and reset each state to its initial status
    */
  },
  
  methods: {
    changeCompany(company){
      this.userCompany = company.companyID
      this.$q.sessionStorage.set('sys_user_company', company.companyID) //sys_user_company
    },
    logOut(){
      

      this.$q.notify({ html: true, multiLine: false, color: 'purple'
          ,message: "Vuelve pronto!"
          ,timeout: 1500, progress: false , icon: "fas fa-exclamation-circle"
          ,actions: [ { icon: 'fas fa-smile', color: 'white' } ]
      })
      this.isDefaultDataLoaded = false;

      
      

      if(!(this.router.currentRoute.path=='/')){
        this.router.replace('/'); //navigate to home, para evitar mensajes de error es computedcolumns usados en módulos (main o editforms)
      }

      setTimeout(()=>{ 
          if(this.$q.sessionStorage.getItem('pathname').toLowerCase().includes('ens')){
            this.router.replace('/LoginENS'); //navigate to login
          }
          if(this.$q.sessionStorage.getItem('pathname').toLowerCase().includes('schoenstatt')){
            this.router.replace('/LoginSchoenstatt'); //navigate to login
          }
          if(this.$q.sessionStorage.getItem('pathname').toLowerCase().includes('framework') || this.$q.sessionStorage.getItem('pathname')=='/'){
            this.router.replace('/Login'); //navigate to login
          }
          clearInterval(this.interval)
          localStorage.clear();//clear dxdatagrid states

          Object.keys(this.$store.state).map(x=>{
            this.$store.commit(x+'/resetToDefaultState')
          })
      }, 900);


      
    },
    userColorChange(){
      this.isDefaultDataLoaded = false;
      this.$q.loading.show()
      this.$axios.post(this.apiURL+'spSysUsersPreferencesUpdate',
        {
            sys_user_code: this.userCode,
            user_data: JSON.stringify({
                  userName: this.userName
                ,userLastName: this.userLastName
                ,userMail: this.userMail
                ,userColor: this.userColor
                ,userDarkMode: this.userDarkMode
                ,userDateFormat: this.userDateFormat
                ,userTimeFormat: this.userTimeFormat
                ,userMoneyFormat: this.userMoneyFormat
                ,userUsersFormat: this.userUsersFormat
                ,userLinkID: this.userLinkID
                ,userRowsPerPage: this.userRowsPerPage
                ,userTableLines: this.userTableLines
                ,userRowsToRender: this.userRowsToRender
                ,user_password_1: this.user_password_1
                ,userCompany: this.userCompany
                ,shouldHideMenu: this.shouldHideMenu
                ,shouldHideTableButtons: this.shouldHideTableButtons
                ,shouldWrapCellText: this.shouldWrapCellText
                ,notificationInterval: this.notificationInterval
            }),
        }
        ,{headers: { 'Authorization': "Bearer " + this.$q.sessionStorage.getItem('jwtToken') }},
        ).then((response) => {
            this.$q.loading.hide()
            this.$router.go()
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
            this.$router.go()
        })
      
    },
    checkVersion(){
      if(this.sysVersion&& this.sysVersion.length>0){
        this.sysVersion.filter(x=>x.platformName=='desktop').map(y=>{
          if(y.platformVersion==version){
            try{
              console.dir('Su versión: ' + version)
              console.dir('Versión de la plataforma: ' + y.platformVersion)
              console.dir('Usted tiene la misma versión')
            }catch(ex){}
            
          }else{
            console.dir('Su versión: ' + version)
            console.dir('Versión de la plataforma: ' + y.platformVersion)
            console.dir('Usted tiene una versión diferente!!!!!')
            let nuevaVersion = ''
            try{
              nuevaVersion = this.sysVersion.find(x=>x.platformName=='desktop').platformVersion;
            }catch(ex){}
            
            this.$q.notify({
                color: 'red'
                ,multiLine: false
                ,html: true
                ,message: 'Actualización '+ nuevaVersion +' disponible.<br/>Por favor presione "Control + F5"'
                ,timeout: 0
                ,icon: "fas fa-code-branch" 
                ,actions: [
                  { icon: 'fas fa-times', color: 'white', }
                ]
              });
          }
        })
      }
      //
    },
    filteredMainMenuDetails(rootID){
      if(this.mainMenuSearchString.trim().length==0){
        return this.menuData.filter(x=>x.parent==rootID)
      }else{
        return this.menuData.filter(x=>x.parent==rootID&&x.sys_link_id.length==4&&(x.label.toLowerCase().includes(this.mainMenuSearchString.toLowerCase())||x.comment.toLowerCase().includes(this.mainMenuSearchString.toLowerCase()))  )
      }
    },
    focusSearchMenuInput(){
      this.$refs['mainMenuSearchStringInput'].focus()
    },
    scrolltoOption(e){
      let indice = 0
      try{
        indice = this.menuData.filter(y=>y.parent == this.menuData.find(x=>x.link_name==this.ruta).parent).findIndex(k => k.link_name==this.ruta)
        indice++;
        if(indice>0){
          this.$refs.dropdownMenuList.scrollTo(indice)
        }
      }
      catch(ex){}
      
    }
     
  },

  computed:{
    console: () => console,
    userColor: {
      get () { return this.$store.state.main.userColor },
      set (val) { this.$store.commit('main/updateState', {key: 'userColor', value: val}) }
    },
    userMainLayoutToolbar: { get () {
      let result = 'no-padding '
      if(this.$store.state.main.userColor=='default'){
        result=result + 'bg-primary text-white'
        //result=result + 'bg-white text-primary'

        if(this.$q.sessionStorage.getItem('pathname').toLowerCase().includes('ens')){
          //console.dir('Branding ENS')
          colors.setBrand('primary', '#2F74EB') //#1976D2 //1867C0
        }
        if(this.$q.sessionStorage.getItem('pathname').toLowerCase().includes('schoenstatt')){
          //console.dir('Branding Schoenstatt')
          colors.setBrand('primary', '#2F74EB') //#1976D2 //1867C0 //FBC42A
        }
        if(this.$q.sessionStorage.getItem('pathname').toLowerCase().includes('framework') || this.$q.sessionStorage.getItem('pathname')=='/'){
          //console.dir('Branding Framework')
          colors.setBrand('primary', '#2F74EB') //#1976D2 //ANTES:1867C0 //389ffd //2A68D3 //2F74EB nuevo
        }

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
    sysVersion: { get () { return this.$store.state.main.sysVersion }, set (val) { this.$store.commit('main/updateState', {key: 'sysVersion', value: val}) } },
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
    URL_ws: { get () { return this.$q.sessionStorage.getItem('URL_ws') } },
    wsConnection: { get () { return this.$store.state.main.wsConnection }, set (val) { this.$store.commit('main/updateState', {key: 'wsConnection', value: val}) } },
    shouldHideMenu: { get () { return this.$store.state.main.shouldHideMenu }, set (val) { this.$store.commit('main/updateState', {key: 'shouldHideMenu', value: val}) } },
    shouldHideTableButtons: { get () { return this.$store.state.main.shouldHideTableButtons }, set (val) { this.$store.commit('main/updateState', {key: 'shouldHideTableButtons', value: val}) } },
    shouldWrapCellText: { get () { return this.$store.state.main.shouldWrapCellText }, set (val) { this.$store.commit('main/updateState', {key: 'shouldWrapCellText', value: val}) } },
    ruta: { get () { 
        let ruta = this.router.currentRoute.path.split('/').filter(x=>isNaN(x)).map(y=>y).join('/')
        return ruta
      } },
    rutaRoot: { get () { 
        let ruta = null
        try{
          ruta = this.router.currentRoute.path.split('/').filter(x=>isNaN(x)).filter(y=>y.length>0)[0]
        }catch(ex){}
        return ruta
      } },
    disableCompanyChange:{ get() { 
      let result = false; 
      try{
        result = this.router.currentRoute.path.indexOf('Edit') > 0
        if(this.router.currentRoute.params.id){ result = true}
        
      }catch(ex){} 
      return result; } },
    isOSdarkMode: { get() {
      let result = false
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        result = true
      }
      return result
    }},
    filteredMainMenu:{
      get(){
        if(this.mainMenuSearchString.trim().length==0){
          return this.menuData.filter(x=>x.parent==null&&x.sys_link_id!=99&&x.sys_link_id!=98)
        }else{
          let initialData = this.menuData.filter(x=>x.sys_link_id!=99&&x.sys_link_id!=98);
          let detailsData = initialData.filter(x => x.parent&&x.sys_link_id.length==4&&(x.label.toLowerCase().includes(this.mainMenuSearchString.toLowerCase() || x.comment.toLowerCase().includes(this.mainMenuSearchString.toLowerCase()) ) ))
          let parentData = initialData.filter(x=>x.parent==null&&(detailsData.some(y=>y.parent==x.sys_link_id)))
          return parentData
        }
      }
    },
  }
  /*watch: {
    userCode: function(val){
      console.dir('cambio en userCode')
    },
  }*/
}
</script>
