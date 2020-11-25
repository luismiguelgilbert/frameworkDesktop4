<template>
<q-page style="min-height: 200px; height: calc(100vh - 50px); overflow-y: hidden;" class="q-pa-none">

    <q-card class="q-ma-md rounder-corners shadow-3" v-if="dataLoaded">
        <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
            <q-toolbar-title class="text-weight-bolder">{{editMode?'Nuevo Ingreso':'Ver Ingreso: '+editRecord.row.kardexID_ux}}</q-toolbar-title>
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
                            <q-item-label :class="'text-subtitle2 '+(tab=='basic'?'text-white':'text-grey-7')">Documento de Ingreso</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='items'" :active="tab=='items'" active-class="bg-primary text-white" :disable="!(partnerID>0 && whID > 0)" >
                        <q-item-section side>
                            <q-icon name="fas fa-boxes"  :color="tab=='items'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='items'?'text-white':'text-grey-7')">Items Recibidos ({{lines.filter(x=>x.newQuantity>0).length}})</q-item-label>
                        </q-item-section>
                    </q-item>
                    
                    <q-item clickable @click="tab='lots'" :active="tab=='lots'" active-class="bg-primary text-white" :disable="!(partnerID>0 && whID > 0 && lines.some(x=>x.systemType==4))" >
                        <q-item-section side>
                            <q-icon name="fas fa-barcode"  :color="tab=='lots'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='lots'?'text-white':'text-grey-7')">Lotes y Series ({{lines.filter(x=>x.newQuantity>0&&x.systemType==4).length}})</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item clickable @click="tab='prj'" :active="tab=='prj'" active-class="bg-primary text-white" :disable="!(partnerID>0 && allow_accounting)">
                        <q-item-section side>
                            <q-icon name="fas fa-folder-open" :color="tab=='prj'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='prj'?'text-white':'text-grey-7')">Cuentas Contables</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item clickable @click="tab='accounting'" :active="tab=='accounting'" active-class="bg-primary text-white" :disable="!(partnerID>0 && whID > 0 && allow_accounting)" >
                        <q-item-section side>
                            <q-icon name="fas fa-book"  :color="tab=='accounting'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='accounting'?'text-white':'text-grey-7')">Asiento Contable</q-item-label>
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

                    <q-tab-panel name="basic"> <basicComponent ref="basicComponent" @onAccMoveCompute="updateAccountMove" /> </q-tab-panel>
                    <q-tab-panel name="items"> <itemsComponent ref="itemsComponent" @onAccMoveCompute="updateAccountMove" /> </q-tab-panel>
                    <q-tab-panel name="lots"> <lotsComponent ref="lotsComponent" @onAccMoveCompute="updateAccountMove" /> </q-tab-panel>
                    <q-tab-panel name="prj"><prjComponent ref="prjComponent" @onAccMoveCompute="updateAccountMove" /></q-tab-panel>
                    <q-tab-panel name="accounting"> <accountingComponent ref="accountingComponent" /> </q-tab-panel>
                    <q-tab-panel name="files"> <filesComponent ref="filesComponent" /> </q-tab-panel>
                    <q-tab-panel name="history"> <historyComponent /> </q-tab-panel>

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
import basicComponent from './invIncomingEditBasic'
import itemsComponent from './invIncomingEditLines'
import lotsComponent from './invIncomingEditLots'
import prjComponent from './invIncomingEditPrj'
import accountingComponent from './invIncomingEditAccounting'
import filesComponent from './invIncomingEditFiles'
import historyComponent from './invIncomingEditHistory'



export default ({
  components:{
     basicComponent: basicComponent
    ,itemsComponent: itemsComponent
    ,lotsComponent: lotsComponent
    ,prjComponent: prjComponent
    ,accountingComponent: accountingComponent
    ,filesComponent: filesComponent
    ,historyComponent: historyComponent
  },
  data () {
    return {
        moduleName: "invIncoming", router: this.$router,
        tab: 'basic', splitterModel: 220, dataLoaded: false,
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
            url: this.apiURL + 'spInvKardexIncomingSelectEdit',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
                row_id: this.editRecord&&this.editRecord.row&&this.editRecord.row.kardexID_ux?this.editRecord.row.kardexID_ux:0,
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
                    ,lines: this.editData.lines.filter(x=>x.newQuantity>0)
                    ,accountLines: this.editData.accountLines
                    ,lots: this.editData.lots
                    ,files: this.editData.files
                }
                this.$axios.post( this.apiURL + 'spInvKardexIncomingUpdate', {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        //"sys_user_language": this.$q.sessionStorage.getItem('sys_user_language'),
                        row_id: this.editMode?0:this.editRecord.row.kardexID_ux,
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
    },
    updateAccountMove(){
        console.dir('updateAccountMove')
        this.$q.loading.show()
        let newRowsAccount = []
        let newAccLineID = 0
        //#region ITEM_LINES_debit (Cuenta de Inventario porque es un Ingreso)
            this.lines.filter(x=>x.newQuantity>0).map(row=>{
                console.dir('línea mayor a 0')
                console.dir(row)
                newAccLineID++;
                newRowsAccount.push({
                    accLineID: newAccLineID
                    ,lineID: row.lineID
                    ,taxLineID: 0
                    ,accountID: row.accInventory//row.account_id
                    ,partnerID: this.partnerID
                    ,debit: row.newQuantity * row.price
                    ,credit: 0
                    ,invID: row.invID
                    ,prjID: row.prjID
                    ,stockID: row.stockID
                    ,mktLineID: row.lineID
                    ,comments: row.invName
                })
            })
        //#endregion ITEM_LINES_debit
        //#region TAX_LINES_credit (Cuenta de Provisión)
            this.lines.filter(x=>x.newQuantity>0).map(row=>{
                newAccLineID++;
                newRowsAccount.push({
                accLineID: newAccLineID
                    ,lineID: row.lineID
                    ,taxLineID: 0
                    ,accountID: row.accAllocation//row.account_id
                    ,partnerID: this.partnerID
                    ,debit: 0
                    ,credit: row.newQuantity * row.price
                    ,invID: row.invID
                    ,prjID: row.prjID
                    ,stockID: row.stockID
                    ,mktLineID: row.lineID
                    ,comments: row.invName
            })
            })
        //#endregion TAX_LINES_credit
        //#region Finalize
        this.accountLines = newRowsAccount
        this.$q.loading.hide()
        //#endregion Finalize
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
    allow_accounting: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_accounting').value }, },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
    partnerID: {
        get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
    },
    whID: {
        get () { return this.$store.state[this.moduleName].editData.basic.whID },
    },
    lines: {
        get () { return this.$store.state[this.moduleName].editData.lines },
    },
    accountLines: {
        get () { return this.$store.state[this.moduleName].editData.linesTaxes },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAccountLines', val) }
    },
  },
})
</script>
