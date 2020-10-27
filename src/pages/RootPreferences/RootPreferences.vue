<template>
<q-page>
    <q-form style="max-height: calc(100vh - 50px)"
        class="scroll"
        spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off">
        <q-list class="full-width" dense>
            <q-card class="q-ma-md q-pb-lg">
                <q-item dense>
                    <q-item-section>
                        <q-item-label header>Mis Datos</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item dense>
                    <q-item-section side>
                        <q-icon name="fas fa-user" color="primary"/>
                    </q-item-section>
                    <q-item-section>
                        <q-input dense v-model="userName" label="Nombres"
                            :rules="[
                                    val => !!val || '* Requerido',
                                    val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
                            ]"
                        />
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="far fa-user" color="primary"/>
                    </q-item-section>
                    <q-item-section>
                        <q-input dense v-model="userLastName" label="Apellidos"
                            :rules="[
                                    val => !!val || '* Requerido',
                                    val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
                            ]"
                        />
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-envelope" color="primary"/>
                    </q-item-section>
                    <q-item-section>
                        <q-input dense v-model="userMail" label="Mi Correo Electrónico" type="mail"
                            :rules="[
                                    val => !!val || '* Requerido',
                                    val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
                            ]"
                        />
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-user-shield" color="primary"/>
                    </q-item-section>
                    <q-item-section>
                        <q-input dense v-model="userProfileName" label="Perfil (Rol)" readonly
                            :rules="[
                                        val => !!val || '* Requerido',
                                        val => val > 0 || 'Campo debe tener al menos 3 carateres',
                                ]"
                        />
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-palette" color="primary"/>
                    </q-item-section>
                    <q-item-section>
                        <q-select v-model="userColor"  label="Color Preferido" emit-value map-options
                            :options="[
                                    { label: 'Default', value: 'default' },
                                    //{ label: 'Light', value: 'light' },
                                    { label: 'Dark', value: 'blackDark' },
                                    //{ label: 'Deep Purple', value: 'deep-purple' },
                                    //{ label: 'Cyan', value: 'cyan' },
                                    //{ label: 'Brown', value: 'brown' },
                                    //{ label: 'Dark', value: 'dark' },
                                    //{ label: 'Grey', value: 'grey' },
                                    //{ label: 'Deep Orange', value: 'deep-orange' },
                                    //{ label: 'Dark', value: 'blackDark' },
                                ]"/>
                    </q-item-section>
                </q-item>
            </q-card>
            <!--FOTO-->
            <q-card class="q-ma-md">
            <q-item-label header>Mi Foto</q-item-label>
            <div class="q-pa-md">
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
            </div>
            </q-card>

            <!--SEGURIDAD-->
            <q-card class="q-ma-md q-pb-lg">
                <q-item-label header>Seguridad</q-item-label>
                <q-item dense>
                    <q-item-section side>
                        <q-icon name="fas fa-key" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-input dense v-model="user_password_1" label="Nueva Contraseña" type="password" />
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-key" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-input dense v-model="user_password_2" label="Confirme su Contraseña" type="password" />
                    </q-item-section>
                </q-item>
            </q-card>

            <!--SISTEMA-->
            <q-card class="q-ma-md q-pb-lg">
                <q-item-label header>Sistema</q-item-label>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-building" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userCompany" :options="userCompanies" label="Compañía Predeterminada"
                            map-options emit-value option-value="companyID" option-label="companyShortName" />
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-folder-open" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userLinkID" :options="menuData.filter(x=>x.sys_link_id.length==4).sort((a, b) => a.parent - b.parent )" label="Abrir al iniciar sesión"
                            map-options emit-value option-value="sys_link_id" option-label="label" clearable >
                            <template v-slot:option="scope">
                                <q-item
                                    v-bind="scope.itemProps"
                                    v-on="scope.itemEvents"
                                    >
                                    <q-item-section avatar> <q-icon :name="scope.opt.icon" color="primary" /> </q-item-section>
                                    <q-item-section> <q-item-label v-html="scope.opt.label" /> <q-item-label caption>{{ menuData.find(x=>x.sys_link_id==scope.opt.parent).label }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-database" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userRowsPerPage"  label="Cantidad de registros por cada lectura de base de datos" emit-value map-options
                            :options="[
                                    { label: '17 (Más Rápido, ideal 1366x768)', value: 17, icon: 'fas fa-bolt' },
                                    { label: '27 (Más Rápido, ideal 1920x1080)', value: 27, icon: 'fas fa-bolt' },
                                    { label: '50 (Rápido)', value: 50, icon: 'fas fa-bolt' },
                                    { label: '100 (Normal)', value: 100, icon: 'far fa-hourglass' },
                                    { label: '250 (Lento)', value: 250, icon: 'fas fa-clock' },
                                    { label: '1000 (Muy Lento)', value: 1000, icon: 'fas fa-clock' },
                                    { label: 'Todos (Más Lento)', value: 1000000, icon: 'fas fa-clock' },
                                ]">
                            <template v-slot:option="scope">
                                <q-item
                                    v-bind="scope.itemProps"
                                    v-on="scope.itemEvents"
                                    >
                                    <q-item-section avatar> <q-icon :name="scope.opt.icon" color="primary" /> </q-item-section>
                                    <q-item-section> <q-item-label v-html="scope.opt.label" />
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                    </q-item-section>
                </q-item>
                <!--<q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-desktop" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userRowsToRender"  label="Filas a renderizar en listas virtuales" emit-value map-options
                            :options="[
                                    { label: '25 (Más Rápido)', value: 25, icon: 'fas fa-bolt' },
                                    { label: '50 (Rápido)', value: 50, icon: 'fas fa-bolt' },
                                    { label: '100 (Normal)', value: 100, icon: 'far fa-hourglass' },
                                    { label: '200 (Lento)', value: 200, icon: 'fas fa-clock' },
                                    { label: '500 (Más Lento)', value: 500, icon: 'fas fa-clock' },
                                ]">
                            <template v-slot:option="scope">
                                <q-item
                                    v-bind="scope.itemProps"
                                    v-on="scope.itemEvents"
                                    >
                                    <q-item-section avatar> <q-icon :name="scope.opt.icon" color="primary" /> </q-item-section>
                                    <q-item-section> <q-item-label v-html="scope.opt.label" />
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                    </q-item-section>
                </q-item>-->
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-table" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userTableLines" label="Estilo de Tabla" emit-value map-options
                            :options="[
                                    { label: 'Horizontal (default)', value: 'horizontal' },
                                    { label: 'Vertical', value: 'vertical' },
                                    { label: 'Celdas', value: 'cell' },
                                    { label: 'Ninguno', value: 'none' },
                                ]"/>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-expand-alt" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userTableDense" label="Tamaño de Tabla" emit-value map-options
                            :options="[
                                    { label: 'Compacto', value: true },
                                    { label: 'Amplio', value: false },
                                ]"/>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-dollar-sign" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userMoneyFormat" label="Formato usado para mostrar Dinero y Cantidades (guarde para aplicar cambios)" emit-value map-options
                            :options="[
                                    { label: '0 Decimales', value: 0},
                                    { label: '1 Decimal', value: 1},
                                    { label: '2 Decimales', value: 2},
                                    { label: '3 Decimales', value: 3},
                                    { label: '4 Decimales', value: 4},
                                    { label: '5 Decimales', value: 5},
                                    { label: '6 Decimales', value: 6},
                                ]"/>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-calendar" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userDateFormat" label="Formato usado para mostrar fechas (guarde para aplicar cambios)" emit-value map-options
                            :options="[
                                    { label: '30/01/2000', value: 'dd/MM/yyyy'},
                                    { label: '30 ene. 2000', value: 'dd MMM yyyy'},
                                    { label: '30 enero 2000', value: 'dd MMMM yyyy'},
                                    { label: 'domingo, 30 enero 2000', value: 'dddd, dd MMMM yyyy'}
                                ]"/>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-clock" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userTimeFormat" label="Formato usado para mostrar horas (guarde para aplicar cambios)" emit-value map-options
                            :options="[
                                    { label: '20:01', value: 'HH:mm'},
                                    { label: '20:01:20', value: 'HH:mm:ss'},
                                ]"/>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-users" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="userUsersFormat" label="Formato usado para mostrar Usuario (guarde para aplicar cambios)" emit-value map-options
                            :options="[
                                    { label: 'lgilbert@bitt.com.ec (ID de Usuario)', value: 'sys_user_id'},
                                    { label: 'LUIS (Nombres de Usuario)', value: 'sys_user_name'},
                                    { label: 'GILBERT (Apellidos de Usuario)', value: 'sys_user_lastname' },
                                    { label: 'LUIS GILBERT (Nombres y Apellidos de Usuario)', value: 'sys_user_name,sys_user_lastname'},
                                ]"/>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-bars" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-toggle v-model="shouldHideMenu" color="primary" label="Ocultar Menú automáticamente al abrir un módulo" />
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-external-link-alt" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-toggle v-model="shouldHideTableButtons" color="primary" label="Ocultar Botones de Edición en Tablas Principales" />
                    </q-item-section>
                </q-item>
                <!--<q-item>
                    <q-item-section side>
                        <q-icon name="fas fa-bell" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-select dense v-model="notificationInterval" label="Intervalo de tiempo para buscar Notificaciones" emit-value map-options
                            :options="[
                                    //{ label: '10 segundos', value: 10000},//solo para pruebas
                                    { label: '30 segundos', value: 30000},
                                    { label: '1 minuto', value: 60000},
                                    { label: '2 minutos', value: 120000},
                                    { label: '3 minutos (default)', value: 180000},
                                    { label: '4 minutos', value: 240000},
                                    { label: '5 minutos', value: 300000},
                                    { label: '10 minutos', value: 600000},
                                ]"/>
                    </q-item-section>
                </q-item>-->
            </q-card>
        </q-list>
        <br><br><br><br>
    </q-form>
    <q-page-sticky position="bottom-right" :offset="[35, 18]">
        <q-btn fab icon="fas fa-save" color="positive" :disable="isError" @click="saveUserPreferences" title="Guardar" />

    </q-page-sticky>
</q-page>
</template>
<script>
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import { colors } from 'quasar'

export default {
data () {
    return {
      router: this.$router, isUserPreferencesVisible: false,
      userPreferenceTab: 'basic', splitterModel: 35, isPictureDialogOpen: false,
      user_password_1: '', user_password_2: '', fileToUpload: null,
    }
},

methods: {
    saveUserPreferences(){
        if(!this.isError){
            this.$q.loading.show({ delay: 0, message: 'Guardando..', spinner: 'QSpinnerIos', messageColor: 'white', spinnerColor: 'white' })
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
                        ,notificationInterval: this.notificationInterval
                    }),
                }
                ,{headers: { 'Authorization': "Bearer " + this.$q.sessionStorage.getItem('jwtToken') }},
                ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    this.$q.loading.hide()
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
        }
    },
    getNewFileName(files){
      this.$q.loading.show({ delay: 0, message: 'Subiendo..', spinner: 'QSpinnerIos', messageColor: 'white', spinnerColor: 'white' })
      this.$axios.post(this.apiURL+'sp_sys_user_picture_upload',
        {
            sys_user_code: this.userCode,
            original_file_name: files[0].name,
            file_type: files[0].type,
            file_size: files[0].size,
            editing_sys_user_code: this.userCode
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
      //this.$q.sessionStorage.set('sys_user_picture', this.fileToUpload.upload_file_name)
      //console.dir(this.fileToUpload)
      //this.formData.sys_user_picture = this.fileToUpload.upload_file_name
      //:src="$q.sessionStorage.getItem('Server_Files_Path') + formData.sys_user_picture"
      this.$q.loading.hide()
      this.userPhoto = this.fileToUpload.upload_file_name
      this.$q.notify({multiLine: false, color: 'positive', message: "Archivo recibido" , timeout: 1200, icon: "fas fa-check", progress: true,})
    },
},

computed:{
    isError: {
        get(){
            let resultado = false;
            if(this.userName.length<=0){resultado=true}
            if(this.userLastName.length<=0){resultado=true}
            if(this.userMail.length<=0){resultado=true}
            if(this.userColor.length<=0){resultado=true}
            if((this.user_password_1.length>0||this.user_password_2.length>0)&&(this.user_password_1!=this.user_password_2)){resultado=true}
            if(this.userCompany<=0){resultado=true}
            if(this.userRowsPerPage<=0){resultado=true}
            if(this.userRowsToRender<=0){resultado=true}
            return resultado
        }
    },
    userColor: { get () { return this.$store.state.main.userColor }, set (val) {
            //is also changed in MainLayout
            //if(val == 'default'){ colors.setBrand('primary', '#1867C0') }
            //if(val == 'light'){ colors.setBrand('primary', '#9C27B0') }
            //if(val == 'dark'){ colors.setBrand('primary', '#1D1D1D') }
            //if(val == 'deep-purple'){ colors.setBrand('primary', '#673AB7') }
            //if(val == 'indigo'){ colors.setBrand('primary', '#3F51B5') }
            //if(val == 'cyan'){ colors.setBrand('primary', '#00BCD4') }
            //if(val == 'brown'){ colors.setBrand('primary', '#795548') }
            //if(val == 'grey'){ colors.setBrand('primary', '#9E9E9E') }
            //if(val == 'deep-orange'){ colors.setBrand('primary', '#FF5722') }
            //if(val == 'blackDark'){ colors.setBrand('primary', 'white') }
            this.$store.commit('main/updateState', {key: 'userColor', value: val})
        }
    },
    userDarkMode: { get () { return this.$store.state.main.userDarkMode }, set (val) {
            this.$store.commit('main/updateState', {key: 'userDarkMode', value: val})
            this.$q.dark.set(val)
        }
    },
    userPhoto: { get () { return this.$store.state.main.userPhoto }, set (val) { this.$store.commit('main/updateState', {key: 'userPhoto', value: val}) } },
    userID: { get () { return this.$store.state.main.userID }, set (val) { this.$store.commit('main/updateState', {key: 'userID', value: val}) } },
    userCode: { get () { return this.$store.state.main.userCode } },
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
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
    userLinkID: { get () { return this.$store.state.main.userLinkID }, set (val) { this.$store.commit('main/updateState', {key: 'userLinkID', value: val}) } },
    menuData: { get () { return this.$store.state.main.menuData }, set (val) { this.$store.commit('main/updateState', {key: 'menuData', value: val}) } },
    currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
    notificationInterval: { get () { return this.$store.state.main.notificationInterval }, set (val) { this.$store.commit('main/updateState', {key: 'notificationInterval', value: val}) } },
    shouldHideMenu: { get () { return this.$store.state.main.shouldHideMenu }, set (val) { this.$store.commit('main/updateState', {key: 'shouldHideMenu', value: val}) } },
    shouldHideTableButtons: { get () { return this.$store.state.main.shouldHideTableButtons }, set (val) { this.$store.commit('main/updateState', {key: 'shouldHideTableButtons', value: val}) } },
    
    
}

}
</script>
