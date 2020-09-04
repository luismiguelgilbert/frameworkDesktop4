<template>
<q-card class="fixed-center shadow-5" style="min-width: 300px; max-width: 400px; margin: 0 auto;">
    <q-toolbar class="text-primary">
        <q-img src="logoTransparent.png" width="100px" class="q-ma-sm" />
        <div class="q-pl-md text-subtitle2" >Ingresar a Framework</div>
        <q-toolbar-title />
        <q-btn flat icon="fas fa-desktop" to="/loginMobile" title="Cambiar a Modo Celular" />
    </q-toolbar>
    <q-separator />
    <q-card-section class="text-primary q-pa-xl">
        <center>
            <q-form spellcheck="false" autocorrect="off" autocapitalize="off">
                <q-input class="text-white" autofocus standout="bg-primary text-white" placeholder="Ingrese su usuario" v-model="username" aria-required required >
                    <template v-slot:prepend>
                        <q-icon name="fas fa-user" />
                    </template>
                </q-input>
                <q-input standout="bg-primary text-white" type="password" placeholder="Ingrese su contraseña" class="q-pt-md" v-model="password" aria-required required>
                    <template v-slot:prepend>
                        <q-icon name="fas fa-key" />
                    </template>
                </q-input>
            </q-form>
            <q-btn class="q-mt-lg" color="primary" label="Entrar" glossy icon="fas fa-sign-in-alt" @click="login" size="lg"
                v-shortkey="['enter']" @shortkey="login" />
        </center>
    </q-card-section>
</q-card>
</template>
<script>
import Vue from 'vue'
import Vuex from 'vuex'
import { debounce, colors } from 'quasar'
Vue.use(require('vue-shortkey'))

export default {
  name: 'Login',
  data() {
    return {
        username: '', password: '',
        router: this.$router,
    }
  },
  created(){
      this.$q.sessionStorage.clear();//Clear Storage
      Object.keys(this.$store.state).map(x=>{this.$store.commit(x+'/resetToDefaultState');})//Loop across all vuex states, and reset each state to its initial status
      colors.setBrand('primary', '#1867C0') //#1976D2
      this.$q.loading.show({ delay: 0, message: 'Cargando configuración..', messageColor: 'white', spinnerColor: 'white' })
      this.$q.dark.set(false)//force darkMode to be off always
      //apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data')
      //+ ':' + this.$q.sessionStorage.getItem('URL_Port')
      //+ this.$q.sessionStorage.getItem('URL_Path') } },
      this.$axios.get('config.json')
      .then((response) => {
        if(response && response.data){
            this.username = response.data.defaultUser
            this.password = response.data.defaultPassword
            this.$q.sessionStorage.set('URL_Data',response.data.URL_Data)
            this.$q.sessionStorage.set('URL_Port',response.data.URL_Port)
            this.$q.sessionStorage.set('URL_Path',response.data.URL_Path)
            //this.$q.sessionStorage.set('URL_Path',window.location.port)
            this.$q.sessionStorage.set('serverFilesPath',response.data.serverFilesPath)
            this.$q.sessionStorage.set('ReportServer_Path',response.data.ReportServer_Path)
            this.$q.sessionStorage.set('ReportServer_BI_Path',response.data.ReportServer_BI_Path)
            this.$q.sessionStorage.set('Google_API_key',response.data.Google_API_key)
            //this.$q.sessionStorage.set('ReportServer_User',response.data.ReportServer_User)
            //this.$q.sessionStorage.set('ReportServer_Password',response.data.ReportServer_Password)

            this.$q.loading.hide()
        }
      })
      .catch((error) => {
        this.$q.loading.hide()
        console.error(error)
        this.$q.notify({
            color: 'red'
            ,position: 'bottom'
            ,message: 'Error al cargar configuración.<br>Revise su conexión a Internet, y luego actualice la página.'
            ,icon: 'fas fa-exclamation-circle'
            ,multiLine: true, html: true
        })
      })
  },
  methods: {
    login: debounce(function(reason){
        this.username = this.username.trim()
        this.password = this.password.trim()
        this.$q.loading.show({ delay: 0, message: "Autenticando..", })
        let urlPath = this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') + 'spSysLogin'
        console.dir('urlPath')
        console.dir(urlPath)
        this.$axios.post( urlPath,
            {
                "sys_user_id": this.username,
                "sys_user_password": this.password,
            }).then((response) => {
                if(response.data.length > 0){
                    this.$q.sessionStorage.set('jwtToken', response.data[0].jwtToken) //token, indispensable
                    this.$q.sessionStorage.set('sys_user_code', response.data[0].sys_user_code) //sys_user_code
                    this.$q.sessionStorage.set('sys_profile_id', response.data[0].sys_profile_id) //sys_profile_id
                    this.$q.loading.hide()
                    //this.router.push({ path: '/RootHome' }); //navigate to Home Page
                    this.router.push({ path: '/' }); //navigate to MainLayout Page
                }else{
                    this.$q.loading.hide()
                    this.$q.notify({color: 'red', message: 'Su usuario y contraseña no son correctos', timeout: 3000, icon: "fas fa-lock" });
                }
            }).catch((error) => {
                this.$q.loading.hide()
                console.dir(error)
                let mensaje = 'Error: '
                if(error && error.response && error.response.data && error.response.data.info && error.response.data.info.message){
                    mensaje = mensaje + error.response.data.info.message
                }
                this.$q.notify({
                    color: 'red'
                    ,position: 'bottom'
                    ,message: mensaje
                    ,icon: 'fas fa-exclamation-circle'
                    ,multiLine: true, html: true
                })

            })
    }, 100),
  }
}
</script>
