<template>
<q-page style="min-height: 200px; height: calc(100vh - 50px); overflow-y: hidden;" class="q-pa-none">

    <q-card class="q-ma-md rounder-corners shadow-3" v-if="dataLoaded">
        <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
            <q-toolbar-title class="text-weight-bolder">{{editMode?'Nuevo Item':'Editar Item: '+editRecord.value}}</q-toolbar-title>
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
                            <q-item-label :class="'text-subtitle2 '+(tab=='basic'?'text-white':'text-grey-7')">Información del Item</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item :disable="systemType!=3" clickable @click="tab='bom'" :active="tab=='bom'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-boxes" :color="tab=='bom'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='bom'?'text-white':'text-grey-7')">Receta (Bill of Materials)</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='account'" :active="tab=='account'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-book" :color="tab=='account'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='account'?'text-white':'text-grey-7')">Configuración Contable</q-item-label>
                        </q-item-section>
                    </q-item>
                    
                    <q-item clickable @click="tab='picture'" :active="tab=='picture'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-camera"  :color="tab=='picture'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='picture'?'text-white':'text-grey-7')">Foto de Perfil</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item :disable="!is_sales" clickable @click="tab='pricelists'" :active="tab=='pricelists'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-tags"  :color="tab=='pricelists'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='pricelists'?'text-white':'text-grey-7')">Listas de Precios</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item :disable="!is_purchase" clickable @click="tab='vendors'" :active="tab=='vendors'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-shopping-cart"  :color="tab=='vendors'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='vendors'?'text-white':'text-grey-7')">Proveedores Sugeridos</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item :disable="systemType!=4" clickable @click="tab='lots'" :active="tab=='lots'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-barcode"  :color="tab=='lots'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='lots'?'text-white':'text-grey-7')">Lotes y Series</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='bins'" :active="tab=='bins'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-warehouse"  :color="tab=='bins'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='bins'?'text-white':'text-grey-7')">Perchas Asignadas</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='files'" :active="tab=='files'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-paperclip"  :color="tab=='files'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='files'?'text-white':'text-grey-7')">Archivos Adjuntos</q-item-label>
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
                    <q-tab-panel name="basic"> <basicComponent ref="basicComponent" /> </q-tab-panel>
                    <q-tab-panel name="account"> <accountComponent ref="accountComponent" /> </q-tab-panel>
                    <q-tab-panel name="bom"> <bomComponent ref="bomComponent" /> </q-tab-panel>
                    <q-tab-panel name="vendors"> <vendorsComponent ref="vendorsComponent" /> </q-tab-panel>
                    <q-tab-panel name="pricelists"> <pricelistsComponent ref="pricelistsComponent" /> </q-tab-panel>
                    <q-tab-panel name="lots"> <lotsComponent ref="lotsComponent" /> </q-tab-panel>
                    <q-tab-panel name="bins"> <binsComponent ref="binsComponent" /> </q-tab-panel>
                    <q-tab-panel name="picture"> <pictureComponent /> </q-tab-panel>

                    <q-tab-panel name="files"> <filesComponent ref="filesComponent" :moduleName="moduleName" /> </q-tab-panel>
                    <q-tab-panel name="history"><historyComponent  ref="historyComponent" :moduleName="moduleName" /></q-tab-panel>
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
import basicComponent from './ItemsEditBasic'
import accountComponent from './ItemsEditAccount'
import bomComponent from './ItemsEditBom'
import pictureComponent from './ItemsEditPicture'
import vendorsComponent from './ItemsEditVendors'
import pricelistsComponent from './ItemsEditPricelists'
import binsComponent from './ItemsEditBins'
import lotsComponent from './ItemsEditLots'
//
import filesComponent from '../../../components/filesView/filesView'
import historyComponent from '../../../components/historyView/historyView'


export default ({
  components:{
     basicComponent: basicComponent
    ,accountComponent: accountComponent
    ,pictureComponent:pictureComponent
    ,bomComponent: bomComponent
    ,vendorsComponent: vendorsComponent
    ,filesComponent: filesComponent
    ,pricelistsComponent: pricelistsComponent
    ,lotsComponent: lotsComponent
    ,binsComponent: binsComponent
    ,historyComponent: historyComponent
  },
  data () {
    return {
        moduleName: "Items", router: this.$router,
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
            url: this.apiURL + 'spInvMasterSelectEdit',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
                row_id: this.editRecord&&this.editRecord.row&&this.editRecord.row.invID_ux?this.editRecord.row.invID_ux:0,
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
                    ,bom: this.editData.bom
                    ,taxes: this.editData.taxes
                    ,partners: this.editData.partners
                    ,pricelists: this.editData.pricelists
                    ,lots: this.editData.lots
                    ,bins: this.editData.bins
                    ,files: this.editData.files
                }
                //console.dir(this.editData)
                //console.dir(newEditData)
                this.$axios.post( this.apiURL + 'spInvMasterUpdate', {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        //"sys_user_language": this.$q.sessionStorage.getItem('sys_user_language'),
                        row_id: this.editMode?0:this.editRecord.row.invID_ux,
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
    systemType: {
        get () { return this.$store.state[this.moduleName].editData.basic.systemType },
    },
    is_sales:  {
        get () { return this.$store.state[this.moduleName].editData.basic.is_sales },
    },
    is_purchase:  {
        get () { return this.$store.state[this.moduleName].editData.basic.is_purchase },
    },
  },
})
</script>
