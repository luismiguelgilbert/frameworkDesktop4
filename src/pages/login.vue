<template style="width: 800px;">
<div>
    <q-layout view="hHh lpr lFf" > <!-- :class="isOSdarkMode?'bg-grey-10':'bg-grey-2'"  -->
        <q-card :square="$q.screen.lt.md" :class="' ' + ($q.screen.gt.xs?'fixed-center':'fixed-top')" style="min-width: 200px;" >
            <q-toolbar class="text-primary">
                <q-space />
                <q-img src="logoTransparent.png" width="150px" class="q-mt-sm" />
                <q-space />
                
            </q-toolbar>
            <q-separator />
            <q-card-section class="text-primary q-pl-xl q-pr-xl">
                <center>
                    <q-form spellcheck="false" autocorrect="off" autocapitalize="off">
                        <q-input class="text-white" :autofocus="$q.screen.gt.sm?true:false" placeholder="Ingrese su usuario" v-model="username" aria-required required style="min-width: 250px;" > <!-- :input-class="isOSdarkMode?'text-white':undefined" -->
                            <template v-slot:prepend>
                                <q-icon 
                                    name="img:data:image/png;base64,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"
                                    />
                            </template>
                        </q-input>
                        <q-input  type="password" placeholder="Ingrese su contraseña" class="q-pt-md" v-model="password" aria-required required> <!-- :input-class="isOSdarkMode?'text-white':undefined" -->
                            <template v-slot:prepend>
                                <q-icon 
                                    name="img:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAADDklEQVRoge2Yu24TURCGv9ld2+GqIJDAIRAuqRAFTeh5AJCSksaJEIqoEE1kGmREEeEGOkiTxDwAkeApQKKgoklhhBUCIYBkDMl68VA4wVrHe7FzjCPkr7P3PzPza86cPTb06dOnTy+RdsQ6R4IBJoBrKGPA0NajFeA18IJNlmSaquE6A4ltQBeYQMgD5yOkywgzkmFpd6XFI9KA5rA4wyww02bsPEXuSo5aZ6XFw4lUdFY8wAwjKJDtYG1srLCHusAEjeJdhCxKGiWNkAXc0OjCjBYYN1NqUIoAdI4EKd6xveeFrGR46NMskEWYjcixzCYXujXYwR2onzaNga1R2KFxWny3k1FS3etC2Ba6FrnajX2KXY2pa5tgA8rlpm8md2hsMjHzNMcyRtgpdML3SbivCzS2jUcGyMXMk+6kuDgED/EiZeCgoTxlmeSwoVg+wmZg1WCejwZj+Qgz8MpUEtcTR3Ph75xOCQ4qvDSVZO2Lda6Uct52w0RwwA2eA8u7TVD1hHLF4sdPuVg9ybxqezfgKAINyDRVpKM7kI/Sqo0qDB6qkUiQYZEnJk2EtnTrSpzvNPj6N4uNjXqtbtVCFRCmTZqI3pNF7qL+O1Acvn63+Lxug4BtQ+UXfPjoNEwUeGzCRPwfNAXGUfLAaJiu6gmf1izKFQsEThz7zYF9yvsVB8+DA/uVU2kPEUCZY5JbImjXDcDfG+o4cBVhDGV4K0rJdcVZW7fOlyv1rWLbMHTc4+D+em2uK10xYWyYNIdVGnDe/KjIpcHDNY4eqZFw/DV1w4TRI01zWJtDPE0luRmkMW3CqAEAVYRFHiHcDtKYNGHcQBC66C/KlImu3E/ikEwqI0MejgOVn+I/Ytt4T/TMAJgx0VMDsHsT/2wGmjE1Ez3vwDahnXjGnaB1e8YAhJhQpoLW7CkDEGjios5zoZW+ZzPQTNRMDKe9B/YU95rX7bkObJNMKqfTHo5d78TKqn2jlW7PGgBIpZSRkx4DKd0cSMn1Vprov9d7TDKpxbPD3hWZotjrWvr06dPnP+QPLHJTFXTiaXcAAAAASUVORK5CYII="
                                    /> <!-- :color="isOSdarkMode?'grey-4':undefined"  -->
                            </template>
                        </q-input>
                    </q-form>
                    <q-btn class="q-mt-lg"  label="Ingresar" no-caps @click="login" size="lg" flat 
                        v-shortkey="['enter']" @shortkey="login" color="primary"
                        icon="img:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAACjUlEQVRoge2Yv2tTURTHP/f2VQON5JFuti6FToIiT1EHhweBDqLp5tj/oaK2W6eCCDrYRVx1EQcLbo19+QeiFNTBCoViwKUlqXaoNfc4NME0hLyX9yOx+D5T7uWce77fvHPehQcpKf83Ks7DHMcZtW27aIyZVUo5wDlAgG8iUtFav6nVaquVSuUwrpqxGXBdt6iUegRM+4Ruisg9z/NW46g7EvWApaUlrbVeVkqtAOMBUsaVUnempqZOz83NeeVyWaLUj2xAa70MLPSZpoAb29vbp7a2tt5Fqh8l2XXdIvCgY/sAeCoi1yzLylqWlTXGXAdWgF/tgSKy4Lru7SgaQs+A4zijuVzuE8d7vioiNz3P2+iWUygULhlj3gJn27Y36/X6+bCDHfoJ2LZd5Lj4g17iAUql0gfgFsefxHTzrFCENmCMmW1fK6We9RLfYn19/b2IPG/fE5HBG1BKXe4Q8TJoroi86Ni6ElZHlCGeaF8YYz73kfux11n9EMVAtn1RLpd/Bk3sEpvtGhiASK/Rf4HUwLAJdJHJQyZ/j/AEmAHOJCuJH8Baw7CQuc+mX7Cvgab4DSAfh7o+2LU0F9Q81V5Bvi3U/OcHLR4gf2h47BcUZAZmYhATChWgdhADSfd8L3J+ASf+LZQaGDapgWFjJXGoANUa7Owf3ZT5MZiwY/4I1SQRA9UafN/7u279nrTjr5VIC+3sB9uLg0QMdGuVJNoHEjKQHwu2FweJzMBEs9d3m23TGuIkSMSA4mhgkxjaTk78PZAaGDapgWETxMCef0hi1P0CghgoxSAkLGt+Ab4GGopFYCcWOf2x29As+gX5Gsjc5YuluSjwisG00x7wuqG5mpnn6wDqpaScaP4AfZO2kcJYQIMAAAAASUVORK5CYII="
                        /> <!-- :color="isOSdarkMode?'white':'primary'" -->
                </center>
            </q-card-section>
            <q-card-actions align="around">
                <q-btn flat size="sm"  label="No puedes ingresar?"  :class="$q.screen.lt.md?'q-mr-xl':undefined"
                to="/forgotPassword" 
                icon="img:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAACsklEQVRoge2XTUhUURTHf/fNzMZBxSARMgj6oGWLCKJF2rJJivzAslWEipCQq4gW7qJNX8KoCxcJNioZhUa7pHYVbVpVaAQKuYhsqCnI8R0X7zmpb3w+efeNM/B+m3lzzuH+z7n3vnvPg5CQkJCdRDksE68TiAwCewqfjivziLTTXPdirdFwhIkMUHzJA9Si1OBGYzRvINBwYF/gGW2HyZmvAHs32p0rUGKUfAH5tpAzSCku1VRSXxVHgOnFDCMLabIiBfH7LqCtppLz1RW5/43288NvPwvid8PTFjpVFXfadsUL5nfDUwH5FtKUwvnd8FTA9GLG1Ra03w1P78DIQhqAenuppxczPLJthfC74WwlHr8SKNqLDJpOrsu55O+Bki8g3zswD9Tmlqy4mNtoyNeNtmMVUWzMYZjtO51ESIhn+lP36e0N/JQLUqCbmsMTDE6WBagR8D0gco7l3y/pH64OSsLZSvihf7gaot0oI4HIkTWeL0jkNF0tn7Tq4bGZ80RytBnMIVDlePiS0oWeLZQcbUbJGKhy4BkidTmf8AaWjgcx+6BjC1nbZsaaea7TdeG2ZU8JSj1FxdvoaPjzPz5VRyzygSstP3xro2UFot25mV9NHkCpeyx8bFyf/NgJ4DnZbId/XVvd/xDqDAAid9eZO1uvOUJNiWNQhqnOArf8a+t5B/YDINH3W0b++/sWAMVBDbqAlgK2ceREYqb9pO3081+AMmatkZaPbhkbM1ZjZn3r2uhYgSnrR/VsGarsGJFJ/7oW/guQpT6QXyhpIJm6sWlcMnUTIQGkidDnW9dGTysxkGpCGLfHm8I07oB6B4CRPYZSPXbyglJNdLY+0aKLzl7IKmIIqNgkIo1Sl3UmD7qbuQfju4ktXwUSwCHb+hmRKSL00XHxu1a9kJCQkB1nBdtiGOor5WJRAAAAAElFTkSuQmCC"
                /> <!-- :color="isOSdarkMode?'white':'primary'" -->
            </q-card-actions>
        </q-card>
    </q-layout>
</div>
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
        this.$q.sessionStorage.set('pathname',window.location.pathname)
        Object.keys(this.$store.state).filter(y=>y=='main').map(x=>{
            this.$store.commit(x+'/resetToDefaultState')
        })
        //this.$store.commit('Partners/clearModuleState')//hacer x cada módulo, excepto main
        
        colors.setBrand('primary', '#2F74EB') //#1976D2 //ANTES:1867C0 //389ffd //2A68D3 //2F74EB nuevo
        this.$q.loading.show({ delay: 0, message: 'Cargando configuración..', messageColor: 'white', spinnerColor: 'white' })
        //this.$q.dark.set(this.isOSdarkMode)//this.$q.dark.set(false)//force darkMode to be off always
        this.$axios.get('config.json')
        .then((response) => {
            if(response && response.data){
                this.username = response.data.defaultUser
                this.password = response.data.defaultPassword
                this.$q.sessionStorage.set('URL_Data',response.data.URL_Data)
                this.$q.sessionStorage.set('URL_Port',response.data.URL_Port)
                this.$q.sessionStorage.set('URL_Path',response.data.URL_Path)
                this.$q.sessionStorage.set('URL_ws',response.data.URL_ws)
                this.$q.sessionStorage.set('serverFilesPath',response.data.serverFilesPath)
                this.$q.sessionStorage.set('serverTempFilesPath',response.data.serverTempFilesPath)
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
            //console.dir('urlPath')
            //console.dir(urlPath)
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
                        console.dir('Welcome to BITT!')
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
    },
    computed:{
        isOSdarkMode: { get() {
        let result = false
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            result = true
        }
        return result
        }}
    }
}
</script>
