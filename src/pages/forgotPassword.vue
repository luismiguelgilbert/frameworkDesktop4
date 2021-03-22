<template>
<q-card :flat="$q.screen.lt.md" :square="$q.screen.lt.md" :class="'shadow-5 ' + ($q.screen.gt.xs?'fixed-center':'fixed-top')" :style="$q.screen.lt.md?undefined:'min-width: 410px;'" >
    <q-toolbar class="text-primary">
        <q-img src="logoTransparent.png" width="100px" class="q-ma-sm" />
        <q-toolbar-title />
        <div class="q-pl-md text-subtitle2" >No puedes ingresar?</div>
    </q-toolbar>
    <q-separator />
    <q-card-section class="text-primary q-ml-md q-mr-md">
            <b>1. Ingrese su usuario o correo electrónico:</b>
                <q-input class="text-white"  placeholder="Ingrese su mail o su usuario" v-model="recoveryMail" aria-required required >
                    <template v-slot:prepend>
                        <q-icon name="fas fa-envelope" :color="isOSdarkMode?'grey-4':undefined" />
                    </template>
                </q-input>
                <br/>
            <b>2. Confirme el casillero de seguridad:</b>
                <center><VueRecaptcha ref="captcha" sitekey="6LdTNukUAAAAAI9c5UtjllSWjLqcXaULeUhaYM-n" @verify="verificar" ></VueRecaptcha></center>
                <br/>
            <b>3. Presione el botón para recibir un correo:</b><br/>
                <center>
                <q-btn :color="isOSdarkMode?'white':'primary'" no-caps label="Enviarme código temporal" class="q-mb-lg q-mt-md"
                    :disable="!captchaResponse||!recoveryMail" outline
                    icon="img:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAEa0lEQVRoge2Z3U9bZRzHP8/py6AtLS9lDHlnvK2dK3O8jEWvXOaFFxsuaEzMEi/2D0wz9c7EC7PF6JVXu1s0MZIoGmNcgvFCjWNjY8CAgYWMBbewbry20PfHC9Y4ekqBctp60c9Ve855fr/v5/Sc57xU8D9A9jiN3gVTtxDiNJKXgMpnq+YQ3JbIPkvRWp/oHQvGjxWZjapm9WTnWaS8LKA+2XYCpqNCXizov/ld3PLsIHt6dL6FB5dAvrergUJ+Zn755gfiY6IASlrS7YCtwhvPncfcP4C5fwDjufPqgVK87/u949PY16wIrJ7sPLvrPb+Zi75XO85AFgRkj9OoSHlpz3Xgc9njNGZcwLtg6pZwUINSdd6n5tMZFxBwRrNagswLgDimYbG2bPwC5RrWqtAnWjHqdldFwvILiTgFFGjVECB64V1EIKBJLQlRlcCo210VDss7IIo16RJH2FaM4fEjbYpJ8VAl4PX5v8zbl5eW8AD+6rqkAsGrVwhevbKzYoJBXfyy2qNdXyGEKCm0phwyKTJKwdCANqUQn6hOYt96QBmacPPn0BjBcEiTRpvqu9oJlZZtuX7bW4lnSJixFHt/VAmcaHViMOiZm/dw7Y9beBaXtUkea6zT4el+e891FCEuiN6xoEqg6kApr51ow15oY83v57cbd7jrvo+Ucs9NY/hcHSyefD31AoJL5v6BHzY+xjF0zy0BpJSMTc8yPj2LlJISm5WuVgfm/LzUGz+PjGLv+4ai/p92O/Ky+ZUbH8Vup7cUiDH/dJGBkQnWA0EMBj1tjiaqy/enHjwOy/Ag9u+/xuCZT7pdqLSMJ2+8Q+Obb23KvK0AQCAY4sboJA89TwCoeaGM9sNN6BTVJJYSMhTiyS8/Yx29TfmyB1vAh6IohAvtBKrr8Lra8B05htTpONrSsHsBAAnMzD1kaMJNJBLFajHR5XJQWGDZU/gV7xp/DY+ztOpFpyg4G2ppqatCiMQPiykLxFj2+rg+PM7S6sZecjXX01hTmdKz6f1/5hkcmyISjWA1mzjuclBkTb5D9iwAEIlEGZ6a4e/ZOQAq9tvpeLEFoyHhrZWKUCjM4PgUDx49BjYOyTZnE3rd9oekJgIx5uY9DN6dIhAKkWc00uk6xIGSoqRjHi8sMTAywZo/gF6vo93ZRHX51he2tAoArPn9XB+5h2dhCQE01FTS2nIQJe4YVk3LhVaOH3FgMe1uWtZcYOtwh7CY8v+THJ7As7iMEIKG6oqEklkTiOFZXOb6yDhr64GNa4azGYDBsUlCoTCm/H0cP+KgtMiWaov0CoD6BI1RUWan4/DOT/StiBfYW7UEGAx6ulwOyu0l3BqfJCrB1VxPU03l9oNTQHOBGLUVZRTZNuZ0m8WcrjbpE4D0Bo+RtXejWpETyDaJBFYznmLnqJ5vEwn8moEgqXItfoFKQEH5EFjMSJzd8VTRqf9TUAm4Wuon9XpcIHqBlYxES84K8K2ik62uxsa5bIfJkSNHjhw5cjzPvzOzr+9pbEJxAAAAAElFTkSuQmCC"
                    @click="requestMail"
                    />
                </center>
            <b>4. Pegue su código temporal:</b>
            <q-input class="text-white" :autofocus="$q.screen.gt.sm?true:false" :input-class="isOSdarkMode?'text-white':undefined" placeholder="Ingrese su código temporal" v-model="temporalCode" aria-required required >
                    <template v-slot:prepend>
                        <q-icon name="fas fa-key" :color="isOSdarkMode?'grey-4':undefined" />
                    </template>
                </q-input>
    </q-card-section>
    <q-card-actions align="around">
         <q-btn class="q-mt-lg"  label="Ingresar" no-caps @click="login" size="lg"
                        v-shortkey="['enter']" @shortkey="login" color="primary"
                        :disable="!recoveryMail||!temporalCode"
                        icon="img:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAACjUlEQVRoge2Yv2tTURTHP/f2VQON5JFuti6FToIiT1EHhweBDqLp5tj/oaK2W6eCCDrYRVx1EQcLbo19+QeiFNTBCoViwKUlqXaoNfc4NME0hLyX9yOx+D5T7uWce77fvHPehQcpKf83Ks7DHMcZtW27aIyZVUo5wDlAgG8iUtFav6nVaquVSuUwrpqxGXBdt6iUegRM+4Ruisg9z/NW46g7EvWApaUlrbVeVkqtAOMBUsaVUnempqZOz83NeeVyWaLUj2xAa70MLPSZpoAb29vbp7a2tt5Fqh8l2XXdIvCgY/sAeCoi1yzLylqWlTXGXAdWgF/tgSKy4Lru7SgaQs+A4zijuVzuE8d7vioiNz3P2+iWUygULhlj3gJn27Y36/X6+bCDHfoJ2LZd5Lj4g17iAUql0gfgFsefxHTzrFCENmCMmW1fK6We9RLfYn19/b2IPG/fE5HBG1BKXe4Q8TJoroi86Ni6ElZHlCGeaF8YYz73kfux11n9EMVAtn1RLpd/Bk3sEpvtGhiASK/Rf4HUwLAJdJHJQyZ/j/AEmAHOJCuJH8Baw7CQuc+mX7Cvgab4DSAfh7o+2LU0F9Q81V5Bvi3U/OcHLR4gf2h47BcUZAZmYhATChWgdhADSfd8L3J+ASf+LZQaGDapgWFjJXGoANUa7Owf3ZT5MZiwY/4I1SQRA9UafN/7u279nrTjr5VIC+3sB9uLg0QMdGuVJNoHEjKQHwu2FweJzMBEs9d3m23TGuIkSMSA4mhgkxjaTk78PZAaGDapgWETxMCef0hi1P0CghgoxSAkLGt+Ab4GGopFYCcWOf2x29As+gX5Gsjc5YuluSjwisG00x7wuqG5mpnn6wDqpaScaP4AfZO2kcJYQIMAAAAASUVORK5CYII="
                        />
    </q-card-actions>
</q-card>
</template>
<script>
import Vue from 'vue'
import VueRecaptcha from 'vue-recaptcha';
import { debounce, colors } from 'quasar'
Vue.use(require('vue-shortkey'))

export default {
    name: 'forgotPassword',
    components: {
        VueRecaptcha: VueRecaptcha
    },
    data() {
        return {
            router: this.$router,
            recoveryMail: null, captchaResponse: null, temporalCode: null
        }
    },
    methods: {
        //verificar(response: any){
        verificar(response){
            this.$q.loading.show({ message: 'Enviando Mail...' })
            this.captchaResponse = response
            this.$q.loading.hide()
        },
        requestMail(){
            this.$q.loading.show({ delay: 0, message: 'Enviando Mail..', spinner: 'QSpinnerIos', messageColor: 'white', spinnerColor: 'white' })
            //sp_sys_users_reset
            let urlPath = this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') + 'sp_sys_users_reset'
            this.$axios.post( urlPath,
                {
                    sys_user_id: this.recoveryMail,
                    url_destination: this.URL_Data + ':' + this.URL_UX_Port
                }).then((response) => {
                    console.dir(response)
                    console.dir(response.data.accepted)
                    this.$q.loading.hide();
                    if(response.data.accepted[0]){
                        this.$q.notify({ html: true, multiLine: false, color: 'positive'
                            ,message: "Correo enviado a: " + response.data.accepted[0]
                            ,timeout: 0, progress: false , icon: "fas fa-envelope"
                            ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                        })
                    }else{
                        this.$q.notify({ html: true, multiLine: false, color: 'red'
                            ,message: "Error"
                            ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                            ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                        })
                    }
                    
                }).catch((error) => {
                    console.dir(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.$q.loading.hide();
                })
        },
        login: debounce(function(reason){
            this.recoveryMail = this.recoveryMail.trim()
            this.temporalCode = this.temporalCode.trim()
            this.$q.loading.show({ delay: 0, message: "Autenticando..", })
            let urlPath = this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') + 'spSysLogin'
            //console.dir('urlPath')
            //console.dir(urlPath)
            this.$axios.post( urlPath,
                {
                    "sys_user_id": this.recoveryMail,
                    "sys_user_password": this.temporalCode,
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
    },
    watch: {
        captchaResponse: function (val) {
            console.dir('cambió captchaResponse')
            console.dir(val)
        },
    }
}

</script>