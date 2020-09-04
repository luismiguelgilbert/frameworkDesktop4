<template>
<q-page style="min-height: 200px; height: calc(100vh - 50px); overflow-y: hidden;" class="q-pa-none">

    <q-card class="q-ma-md rounder-corners shadow-3" v-if="dataLoaded">
        <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
            <q-toolbar-title class="text-weight-bolder">{{editMode?'Nueva Actividad':'Editar Actividad: '+editRecord.value}}</q-toolbar-title>
            <q-space />
            <q-btn label="Cancelar" :color="userColor=='blackDark'?'white':'primary'" flat icon="fas fa-arrow-circle-left" stretch @click="goBack" />
            <q-btn v-if="editMode&&allow_insert" label="Guardar" color="positive" title="Crear" flat icon="fas fa-save" stretch @click="saveData" />
            <q-btn v-if="!editMode&&allow_edit" label="Guardar" color="positive" title="Guardar" flat icon="fas fa-save" stretch @click="saveData" />
        </q-toolbar>
        
        <q-separator />
       
        <div>
            <q-stepper
                v-model="step" ref="stepper" color="primary" animated >
                <q-step
                    :name="1" style="height: calc(100vh - 220px);" 
                    title="Seleccione la actividad (*)"
                    icon="fas fa-cog"
                    :done="step > 1"
                    :header-nav="step > 1"
                    >
                    <!--<div style="margin: auto; width: 15%; min-width: 200px;">-->
                    <!--class="absolute-center"-->
                    <div>
                        <q-option-group
                            v-model="group" :disable="!editMode" 
                            :options="[
                                { label: 'Ronda', value: 1 },
                                /*{ label: 'Evento', value: 2 },
                                { label: 'Alarma', value: 3 },
                                { label: 'Ingreso', value: 4 },*/
                                { label: 'Food Defense', value: 5 },
                            ]"
                            color="primary"
                        />
                        <q-stepper-navigation>
                            <q-btn @click="() => { done1 = true; step = 2 }" color="primary" label="Continuar" icon-right="fas fa-chevron-right"
                                :disable="!group"
                                 />
                        </q-stepper-navigation>
                    </div>
                    

                   
                </q-step>

                <q-step
                        :name="2"  style="height: calc(100vh - 220px);" 
                        title="Create an ad group"
                        caption="Optional"
                        icon="fas fa-tasks"
                        :done="step > 2"
                        :header-nav="step > 2"
                    >
                    <div>
                        
                        <BitaconsolaEditRonda v-if="group==1"  />
                        
                        <q-stepper-navigation>
                            <!--<q-btn @click="() => { done2 = true; step = 3 }" color="primary" label="Continue" />-->
                            <q-btn @click="step = 1" color="primary" label="Regresar" icon="fas fa-chevron-left" />
                        </q-stepper-navigation>
                    </div>
                </q-step>

            </q-stepper>
            
       </div>
       
    </q-card>
    
    <q-inner-loading :showing="loadingData" style="z-index: 999;">
        <q-spinner-ios size="50px" color="amber" />
    </q-inner-loading>

</q-page>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import BitaconsolaEditRonda from './BitaconsolaEditRonda'
//import columnsComponent from './ModulesEditColumns'

export default ({
  components:{
     BitaconsolaEditRonda: BitaconsolaEditRonda
  },
  data () {
    return {
        moduleName: "Bitaconsola", router: this.$router,
        tab: 'basic', splitterModel: 250, dataLoaded: false,
        group: null, step: 1
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
            url: this.apiURL + 'spSysModulesSelectEdit',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: { 
                userCode: this.userCode,
                userLanguage: 'es',
                userCompany: this.userCompany,
                row_id: this.editRecord&&this.editRecord.row&&this.editRecord.row.link_id_ux?this.editRecord.row.link_id_ux:0,
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
        this.$q.dialog({
                title: 'CONFIRMACIÓN',
                message: 'Desea guardar los datos?',
                ok: {  label: 'Sí', flat: true, icon: 'fas fa-save', color: 'primary', "no-caps": true },
                cancel: {  label: 'No',  flat: true, color: 'primary', "no-caps": true },
                persistent: true
            }).onOk(() => {
                this.router.replace('/'+this.currentPathModule); //navigate to previous Main module
                /*this.loadingData = true
                
                let newEditData = {
                     basic: this.editData.basic
                    ,system: this.editData.system
                    ,users: this.editData.users.filter(x=>x.is_allowed).map(x=>x.sys_user_code)
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
        */})
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