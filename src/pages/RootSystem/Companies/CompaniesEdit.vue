<template>
<q-page style="min-height: 200px; height: calc(100vh - 50px); overflow-y: hidden;" class="q-pa-none">

    <q-card class="q-ma-md rounder-corners shadow-3" v-if="dataLoaded">
        <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
            <q-toolbar-title class="text-weight-bolder">{{editMode?'Nueva Compañía':'Editar Compañía: '+editRecord.value}}</q-toolbar-title>
            <q-space />
            <q-btn label="Cancelar" :color="userColor=='blackDark'?'white':'primary'" flat icon="fas fa-arrow-circle-left" stretch @click="goBack" />
            <q-btn v-if="editMode&&allow_insert" label="Guardar" color="positive" title="Crear" flat icon="fas fa-save" stretch @click="saveData" />
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
                            <q-item-label :class="'text-subtitle2 '+(tab=='basic'?'text-white':'text-grey-7')">Información de Compañía</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='system'" :active="tab=='system'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-cog" :color="tab=='system'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='system'?'text-white':'text-grey-7')">Configuración</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='users'" :active="tab=='users'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-users"  :color="tab=='users'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='users'?'text-white':'text-grey-7')">Lista de Usuarios</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='rucLength'" :active="tab=='rucLength'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-passport"  :color="tab=='rucLength'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='rucLength'?'text-white':'text-grey-7')">Control de RUCs</q-item-label>
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

            <template v-slot:after >
                <div class="q-mt-md q-ml-md q-mr-md">
                    <basicComponent v-show="tab=='basic'" ref="basicComponent" />
                    <systemComponent v-show="tab=='system'" ref="systemComponent" />
                    <usersComponent v-show="tab=='users'" ref="usersComponent" />
                    <rucComponent v-show="tab=='rucLength'" ref="rucComponent" />
                    <historyComponent v-show="tab=='history'" ref="historyComponent" :moduleName="moduleName" />
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
import basicComponent from './CompaniesEditBasic'
import usersComponent from './CompaniesEditUsers'
import systemComponent from './CompaniesEditSystem'
import rucComponent from './CompaniesEditRucLength'
//import historyComponent from './CompaniesEditHistory'
import historyComponent from '../../../components/historyView/historyView'

export default ({
  components:{
     basicComponent: basicComponent
    ,usersComponent: usersComponent
    ,systemComponent: systemComponent
    ,rucComponent: rucComponent
    ,historyComponent: historyComponent
  },
  data () {
    return {
        moduleName: "Companies", router: this.$router,
        tab: 'basic', splitterModel: 250, dataLoaded: false,
    }
  },
  created(){
    if(this.$q.screen.lt.sm){this.splitterModel = 60}
    this.loadData();
  },
  methods:{
    goBack(){
        this.$q.dialog({
                title: 'CONFIRMACIÓN',
                message: 'Desea regresar y descartar cambios realizados?',
                ok: {  label: 'Sí', flat: true, icon: 'fas fa-arrow-circle-left', color: 'primary' },
                cancel: {  label: 'No',  flat: true, color: 'primary', "no-caps": true },
                persistent: true
            }).onOk(() => {
            this.editRecord = null;
            this.editMode = false;
            this.router.replace('/'+this.currentPathModule); //navigate to previous Main module
        });
    },
    loadData(){
        this.loadingData = true
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spSysCompaniesSelectEdit',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userLanguage: 'es',
                userCompany: this.userCompany,
                row_id: this.editRecord&&this.editRecord.row&&this.editRecord.row.sys_company_id_ux?this.editRecord.row.sys_company_id_ux:0,
                editMode: this.editMode
            }
        }).then((response) => {
            this.editData = [];
            let newEditData = {};
            Object.keys(response.data[0]).map(x=>{
                let name = x
                newEditData[x] = JSON.parse(response.data[0][x])
            })
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
            let promise2 = this.$refs.systemComponent.$refs.formulario.validate() //valida tab SYSTEM
            Promise.all([promise1, promise2]).then((resultados)=>{
                if(resultados.filter(x=>x==false).length>0){
                    this.loadingData = false
                    this.$q.notify({ html: true, multiLine: false, color: 'red', message: "Revise el formulario" ,timeout: 1000, progress: true , icon: "fas fa-exclamation-circle"})
                    if(resultados[0]==false){this.tab='basic'}
                    if(resultados[1]==false){this.tab='system'}
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
                    ,system: this.editData.system
                    ,users: this.editData.users.filter(x=>x.is_allowed).map(x=>x.sys_user_code)
                    ,rucLengths: this.editData.rucLengths
                }
                //console.dir(this.editData)
                //console.dir(newEditData)
                this.$axios.post( this.apiURL + 'spSysCompaniesUpdate', {
                    "sys_user_code": this.$q.sessionStorage.getItem('sys_user_code'),
                    //"sys_user_language": this.$q.sessionStorage.getItem('sys_user_language'),
                    "currentRow": this.editMode?0:this.editRecord.row.sys_company_id_ux,
                    "editRecord": JSON.stringify(newEditData),
                }
            , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
            ).then((response) => {
                this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                this.loadData = true;
                //3 lines, same as goback (without confirmation)
                this.editRecord = null;
                this.editMode = false;
                this.router.replace('/'+this.currentPathModule); //navigate to previous Main module
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
    allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
    allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
    allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
    allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
    allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
  },
})
</script>
