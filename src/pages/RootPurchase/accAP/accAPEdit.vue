<template>
<q-page style="min-height: 200px; height: calc(100vh - 50px); overflow-y: hidden;" class="q-pa-none">

    <q-card class="q-ma-md rounder-corners shadow-3" v-if="dataLoaded">
        <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
            <q-toolbar-title class="text-weight-bolder">{{editMode?'Nueva Cuenta x Pagar':'Editar Cuenta x Pagar: '+editRecord.value}}</q-toolbar-title>
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
                            <q-item-label :class="'text-subtitle2 '+(tab=='basic'?'text-white':'text-grey-7')">Datos del Documento</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='lines'" :active="tab=='lines'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-list-ol" :color="tab=='lines'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='lines'?'text-white':'text-grey-7')">Detalle del Documento ({{lines.length}})</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='payments'" :active="tab=='payments'" active-class="bg-primary text-white" :disable="!(partnerID>0)" >
                        <q-item-section side>
                            <q-icon name="fas fa-money-bill-alt"  :color="tab=='payments'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='payments'?'text-white':'text-grey-7')">Pagos Aplicados</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='prj'" :active="tab=='prj'" active-class="bg-primary text-white" :disable="!(partnerID>0 && allow_accounting)">
                        <q-item-section side>
                            <q-icon name="fas fa-folder-open" :color="tab=='prj'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='prj'?'text-white':'text-grey-7')">Ajustes Contables</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='accounting'" :active="tab=='accounting'" active-class="bg-primary text-white" :disable="!(partnerID>0 && allow_accounting)" >
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
                    <q-item>
                          <q-item-section />
                          <q-item-section side>
                              <q-item-label class="text-subtitle2 text-grey-7"></q-item-label>
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
                    <q-tab-panel name="basic"><basicComponent ref="basicComponent" @onAccMoveCompute="updateAccountMove" /></q-tab-panel>
                    <q-tab-panel name="lines"><linesComponent ref="linesComponent" @onAccMoveCompute="updateAccountMove" /></q-tab-panel>
                    <q-tab-panel name="prj"><prjComponent ref="prjComponent" @onAccMoveCompute="updateAccountMove" /></q-tab-panel>
                    <q-tab-panel name="files"> <filesComponent ref="filesComponent" :moduleName="moduleName" /> </q-tab-panel>
                    <q-tab-panel name="payments"> <paymentsComponent ref="paymentsComponent" :moduleName="moduleName" :allowPayment="true" :allowReconcile="true" :initialPartnerID="partnerID" :amountUnpaid="amountUnpaid" /> </q-tab-panel>
                    <q-tab-panel name="history"><historyComponent  ref="historyComponent" :moduleName="moduleName" /></q-tab-panel>
                    <q-tab-panel name="accounting"><accountingComponent ref="accountingComponent"  :moduleName="moduleName" :accountHeader="accountHeader" :accountLines="accountLines" @onAccMoveCompute="updateAccountMove" /></q-tab-panel>

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
import basicComponent from './accAPEditBasic'
import prjComponent from './accAPEditPrj'
import linesComponent from './accAPEditLines'
import accountingComponent from '../../../components/journalView/journalView'
import filesComponent from '../../../components/filesView/filesView'
import historyComponent from '../../../components/historyView/historyView'
import paymentsComponent from '../../../components/paymentsView/paymentsView'



export default ({
  components:{
     basicComponent: basicComponent
    ,linesComponent: linesComponent
    ,accountingComponent: accountingComponent
    ,paymentsComponent: paymentsComponent
    ,prjComponent: prjComponent
    ,filesComponent: filesComponent
    ,historyComponent: historyComponent
    
  },
  data () {
    return {
        moduleName: "accAP", router: this.$router,
        tab: 'basic'/*'basic'*/, splitterModel: 250, dataLoaded: false,
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
            url: this.apiURL + 'spAccAPSelectEdit',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
                row_id: this.editRecord&&this.editRecord.row&&this.editRecord.row.headerID_ux?this.editRecord.row.headerID_ux:0,
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
                    ,lines: this.editData.lines
                    ,linesTaxes: this.editData.linesTaxes
                    ,accountLines: this.editData.accountLines
                    ,files: this.editData.files
                    //,address: this.editData.address.filter(x=>x.is_allowed).map(x=>x.headerID_ux)
                }
                //console.dir(this.editData)
                //console.dir(newEditData)
                this.$axios.post( this.apiURL + 'spAccAPUpdate', {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    //"sys_user_language": this.$q.sessionStorage.getItem('sys_user_language'),
                    "row_id": this.editMode?0:this.editRecord.row.headerID_ux,
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
    //custom
    updateAccountMove(){
        //console.dir('updateAccountMove')
        this.$q.loading.show()
        let newRowsAccount = []
        let partnerCredit = 0
        let newAccLineID = 0
        //#region DEBE
        this.lines.map(row=>{
            newAccLineID++;
            partnerCredit += row.lineUntaxed
            newRowsAccount.push({
                    accLineID: newAccLineID
                ,lineID: row.lineID
                ,taxLineID: 0
                ,account_id: row.account_id
                ,partnerID: this.partnerID
                ,debit: row.lineUntaxed
                ,credit: 0
                ,invID: row.invID
                ,prjID: row.prjID
                ,mktHeaderID: this.editMode?0:this.editRecord.row.headerID_ux
                ,mktLineID: row.lineID
                ,mktTaxID: null//porque esta línea se calcula por item
                ,comments: row.invName
            })
            row.taxes.map(taxLine=>{
                newAccLineID++;
                partnerCredit += taxLine.taxAmount
                newRowsAccount.push({
                        accLineID: newAccLineID
                    ,lineID: row.lineID
                    ,taxLineID: 0
                    ,account_id: taxLine.account_id
                    ,partnerID: this.partnerID
                    ,debit: taxLine.taxAmount
                    ,credit: 0
                    ,invID: row.invID
                    ,prjID: row.prjID
                    ,mktHeaderID: this.editMode?0:this.editRecord.row.headerID_ux
                    ,mktLineID: row.lineID
                    ,mktTaxID: taxLine.taxID//porque esta línea se calcula por item
                    ,comments: taxLine.short_name_es
                })
            })
        })
        //#endregion DEBE
        
        //#region HABER
        newAccLineID++;
        newRowsAccount.push({
            accLineID: newAccLineID
            ,lineID: 0
            ,taxLineID: 0
            ,account_id: this.account_id
            ,partnerID: this.partnerID
            ,debit: 0
            ,credit: partnerCredit
            ,invID: 0
            ,prjID: 0
            ,mktLineID: 0
            ,comments: this.partnerName
        })
        //#endregion HABER
        
        this.accountLines = newRowsAccount
        this.$q.loading.hide()
        //console.dir('Asiento actualizado')
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
    partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
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
    userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
    lines: {
        get () { return this.$store.state[this.moduleName].editData.lines },
    },
    linesTaxes: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
    },
    account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id },
    },
    partnerName: {
        get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
    },
    amountUnpaid: {
        get () { return this.$store.state[this.moduleName].editData.basic.amountUnpaid },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'amountUnpaid', value: val}) }
    },
    accountHeader: {
        get () { return this.$store.state[this.moduleName].editData.accountHeader },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAccountHeader', val) }
    },
    accountLines: {
        get () { return this.$store.state[this.moduleName].editData.accountLines },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAccountLines', val) }
    },
  },
})
</script>
