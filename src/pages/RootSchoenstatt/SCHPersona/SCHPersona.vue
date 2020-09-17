<template>
<q-page style="min-height: 200px; height: calc(100vh - 50px); overflow-y: hidden;" class="q-pa-none">

    <q-card class="q-ma-md rounder-corners shadow-3" v-if="dataLoaded">
        <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
            <q-toolbar-title class="text-weight-bolder">Mi Perfil</q-toolbar-title>
            <q-space />
            <q-btn v-if="!editMode&&allow_edit" label="Guardar" color="positive" title="Guardar" flat icon="fas fa-save" stretch @click="saveData" />
        </q-toolbar>
        <q-separator />
        <q-splitter
            v-model="splitterModel"
            style="height: calc(100vh - 140px);" unit="px"
            >

            <template v-slot:before>
                <q-list>
                    <q-item clickable @click="tab='basic'" :active="tab=='basic'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-info-circle" :color="tab=='basic'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='basic'?'text-white':'text-grey-7')">Mis Datos</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='groups'" :active="tab=='groups'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-users" :color="tab=='groups'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='groups'?'text-white':'text-grey-7')">Grupos</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='phones'" :active="tab=='phones'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-mobile" :color="tab=='phones'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='phones'?'text-white':'text-grey-7')">Teléfonos</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='address'" :active="tab=='address'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-map-marker-alt" :color="tab=='address'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='address'?'text-white':'text-grey-7')">Direcciones</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='mails'" :active="tab=='mails'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-envelope" :color="tab=='mails'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='mails'?'text-white':'text-grey-7')">Correos</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='children'" :active="tab=='children'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-child" :color="tab=='children'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='children'?'text-white':'text-grey-7')">Hijos</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='apostolados'" :active="tab=='apostolados'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-pray" :color="tab=='apostolados'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='apostolados'?'text-white':'text-grey-7')">Apostolados</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='formaciones'" :active="tab=='formaciones'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-chalkboard-teacher" :color="tab=='formaciones'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='formaciones'?'text-white':'text-grey-7')">Formación</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='trabajo'" :active="tab=='trabajo'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-briefcase" :color="tab=='trabajo'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='trabajo'?'text-white':'text-grey-7')">Bolsa de Trabajo</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='history'" :active="tab=='history'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-history" :color="tab=='history'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='history'?'text-white':'text-grey-7')">Auditoría de Cambios</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </template>

            <template v-slot:after>
                <q-tab-panels
                    v-model="tab" keep-alive
                    animated
                    vertical
                    transition-prev="jump-up"
                    transition-next="jump-up"
                    >
                    <q-tab-panel name="basic">
                        <basicComponent ref="basicComponent" />
                    </q-tab-panel>


                    <q-tab-panel name="groups">
                        <groupsComponent ref="groupsComponent" />
                    </q-tab-panel>

                    <q-tab-panel name="phones">
                        <phonesComponent ref="phonesComponent" />
                    </q-tab-panel>

                    <q-tab-panel name="address">
                        <addressComponent ref="addressComponent" />
                    </q-tab-panel>

                    <q-tab-panel name="mails">
                        <mailsComponent ref="mailsComponent" />
                    </q-tab-panel>

                    <q-tab-panel name="children">
                        <childrenComponent ref="childrenComponent" />
                    </q-tab-panel>

                    <q-tab-panel name="apostolados">
                        <apostoladosComponent ref="apostoladosComponent" />
                    </q-tab-panel>

                    <q-tab-panel name="formaciones">
                        <formacionesComponent ref="formacionesComponent" />
                    </q-tab-panel>

                     <q-tab-panel name="trabajo">
                        <trabajoComponent ref="trabajoComponent" />
                    </q-tab-panel>



                    <q-tab-panel name="history">
                        <historyComponent />
                    </q-tab-panel>

                </q-tab-panels>

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
import basicComponent from './SchPersonaEditBasic'
import phonesComponent from './SchPersonaEditPhones'
import addressComponent from './SchPersonaEditAddress'
import mailsComponent from './SchPersonaEditMails'
import childrenComponent from './SchPersonaEditChildren'
import groupsComponent from './SchPersonaEditGroups'
import apostoladosComponent from './SchPersonaEditApostolados'
import formacionesComponent from './SchPersonaEditFormaciones'
import trabajoComponent from './SchPersonaEditTrabajo'
import historyComponent from './SchPersonaEditHistory'


export default ({
  components:{
     basicComponent: basicComponent
    ,historyComponent: historyComponent
    ,phonesComponent: phonesComponent
    ,addressComponent: addressComponent
    ,mailsComponent: mailsComponent
    ,childrenComponent: childrenComponent
    ,groupsComponent: groupsComponent
    ,apostoladosComponent: apostoladosComponent
    ,formacionesComponent: formacionesComponent
    ,trabajoComponent: trabajoComponent
  },
  data () {
    return {
        moduleName: "SCHPersona", router: this.$router,
        tab: 'basic', splitterModel: 250, dataLoaded: false,
    }
  },
  created(){
    if(this.$q.screen.lt.sm){this.splitterModel = 60}
    this.loadData();
  },
  methods:{
    loadData(){
        this.loadingData = true
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spSchPersonasSelectEdit',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
                row_id: this.userCode,
                editMode: this.editMode
            }
        }).then((response) => {
            this.editData = [];
            let newEditData = {};
            Object.keys(response.data[0]).map(x=>{
                let name = x
                newEditData[x] = JSON.parse(response.data[0][x])
            })
            newEditData['password'] = '';//le agrego la contraseña, porque NO se recupera desde la base, y después quedaría como NULL limitando la reactividad
            this.editData = newEditData;
            this.loadingData = false
            this.dataLoaded = true
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
    saveData(){
        try{
            this.loadingData = true
            let promise1 = this.$refs.basicComponent.$refs.formulario.validate() //valida tab BASIC
            Promise.all([promise1]).then((resultados)=>{
                if(resultados.filter(x=>x==false).length>0){
                    this.loadingData = false
                    this.$q.notify({ html: true, multiLine: false, color: 'red', message: "Revise el formulario" ,timeout: 1000, progress: true , icon: "fas fa-exclamation-circle"})
                    if(resultados[0]==false){this.tab='basic'}
                }else{//NO hay errores, entonces guardar
                    this.loadingData = false//xq usuario puede cancelar en la confirmación del diálogo
                    this.saveDataExec();
                }
            })
        }catch(ex){
            this.loadingData = false
            this.$q.notify({ html: true, multiLine: false, color: 'red', message: "Se produjo el siguiente error:<br/>"+ex.message ,timeout: 1000, progress: true , icon: "fas fa-exclamation-circle"})
        }
    },
    saveDataExec(){
        this.$q.dialog({
                title: 'CONFIRMACIÓN',
                message: 'Desea guardar los datos?',
                ok: {  label: 'Sí', flat: true, icon: 'fas fa-save', color: 'primary', "no-caps": true },
                cancel: {  label: 'No',  flat: true, color: 'primary', "no-caps": true },
                persistent: true
            }).onOk(() => {
                this.loadingData = true

                let newEditData = {
                     basic: this.editData.basic
                    ,phones: this.editData.phones
                    ,address: this.editData.address
                    ,mails: this.editData.mails
                    ,children: this.editData.children
                    ,groups: this.editData.groups
                    ,apostolados: this.editData.apostolados
                    ,formaciones: this.editData.formaciones
                    ,jobs: this.editData.jobs
                    //,address: this.editData.address.filter(x=>x.is_allowed).map(x=>x.sys_user_code)
                }
                //console.dir(this.editData)
                //console.dir(newEditData)
                this.$axios.post( this.apiURL + 'spSchPersonasUpdate', {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    //"sys_user_language": this.$q.sessionStorage.getItem('sys_user_language'),
                    "row_id": this.userCode,
                    "editRecord": JSON.stringify(newEditData),
                }
            , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
            ).then((response) => {
                this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                this.loadData = true;
                //3 lines, same as goback (without confirmation)
                this.editRecord = null;
                this.editMode = false;
                this.loadingData = false
                //this.router.replace('/'+this.currentPathModule); //navigate to previous Main module
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
        })
    }
  },
  computed:{
    loadingData: {
        get () { return this.$store.state[this.moduleName].loadingData },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'loadingData', value: val}) }
    },
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
    editRecord: {
      get () { return this.$store.state[this.moduleName].editRecord },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editRecord', value: val}) }
    },
    editData: {
        get () { return this.$store.state[this.moduleName].editData },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editData', value: val}) }
    },
    editMode: {
        get () { return this.$store.state[this.moduleName].editMode },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editMode', value: val}) }
    },
    allow_view: { get () { return true }, },
    allow_edit: { get () { return true }, },
    allow_insert: { get () { return true }, },
    allow_report: { get () { return true }, },
    allow_disable: { get () { return true }, },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
  },
})
</script>
