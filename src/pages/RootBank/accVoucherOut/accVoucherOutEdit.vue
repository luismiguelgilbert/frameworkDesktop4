<template>
<q-page style="min-height: 200px; height: calc(100vh - 50px); overflow-y: hidden; min-width: calc(100vw - 50px);" class="q-pa-none">
    <q-card :class="dialogMode?'q-ma-none rounder-corners shadow-3':'q-ma-md rounder-corners shadow-3'" v-if="dataLoaded">
        <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
            <q-toolbar-title class="text-weight-bolder">{{editMode?'Nuevo Pago':'Editar Pago: '+editRecord.value}}</q-toolbar-title>
            <q-space />
            <!--dialogMode={{dialogMode}}-->
            <q-btn v-if="dialogMode==false" label="Cancelar" :color="userColor=='blackDark'?'white':'primary'" flat icon="fas fa-arrow-circle-left" stretch @click="goBack" />
            <q-btn v-if="dialogMode==false&&(editMode&&allow_insert)" label="Guardar" color="positive" title="Crear" flat icon="fas fa-save" stretch @click="saveData" />
            <q-btn v-if="dialogMode==false&&(!editMode&&allow_edit)" label="Guardar" color="positive" title="Guardar" flat icon="fas fa-save" stretch @click="saveData" />
            <q-btn v-if="dialogMode==true" label="Agregar" color="positive" flat icon="fas fa-plus" stretch />
        </q-toolbar>
        <q-separator />
        <!--initialPartnerID={{initialPartnerID}} // amountUnpaid={{amountUnpaid}}-->
        <q-splitter
            v-model="splitterModel"
                :style="dialogMode?'height: calc(100vh - 100px);':'height: calc(100vh - 140px);'" unit="px"
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
                    <q-item v-if="dialogMode==false" clickable @click="tab='lines'" :active="tab=='lines'" active-class="bg-primary text-white" :disable="!(partnerID>0)">
                        <q-item-section side>
                            <q-icon name="fas fa-list-ol" :color="tab=='lines'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='lines'?'text-white':'text-grey-7')">Detalle del Documento ({{lines.length}})</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item v-if="dialogMode==false" clickable @click="tab='payments'" :active="tab=='payments'" active-class="bg-primary text-white" :disable="!(methodID>0)||initialTypeID==2" >
                        <q-item-section side>
                            <q-icon name="fas fa-money-bill-alt"  :color="tab=='payments'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='payments'?'text-white':'text-grey-7')">Pagos Aplicados</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='accounting'" :active="tab=='accounting'" active-class="bg-primary text-white" :disable="!(methodID>0 && allow_accounting)" >
                        <q-item-section side>
                            <q-icon name="fas fa-book"  :color="tab=='accounting'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='accounting'?'text-white':'text-grey-7')">Asiento Contable</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item v-if="dialogMode==false" clickable @click="tab='files'" :active="tab=='files'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-paperclip"  :color="tab=='files'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='files'?'text-white':'text-grey-7')">Archivos Adjuntos</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item v-if="dialogMode==false" clickable @click="tab='history'" :active="tab=='history'" active-class="bg-primary text-white" >
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
                initialLines:{{initialLines}}
                <q-tab-panels
                    v-model="tab" keep-alive
                    animated
                    vertical
                    transition-prev="jump-up"
                    transition-next="jump-up"
                    >
                    <q-tab-panel name="basic"><basicComponent ref="basicComponent" :dialogMode="dialogMode" @onAccMoveCompute="updateAccountMove" :amountUnpaid="amountUnpaid" /></q-tab-panel>
                    <q-tab-panel name="lines" v-if="dialogMode==false" ><linesComponent ref="linesComponent" @onAccMoveCompute="updateAccountMove" /></q-tab-panel>
                    <q-tab-panel name="prj" v-if="dialogMode==false" ><prjComponent ref="prjComponent" @onAccMoveCompute="updateAccountMove" /></q-tab-panel>
                    <q-tab-panel name="files" v-if="dialogMode==false" > <filesComponent ref="filesComponent" :moduleName="moduleName" /> </q-tab-panel>
                    <q-tab-panel name="payments" v-if="dialogMode==false" > <paymentsComponent ref="paymentsComponent" :moduleName="moduleName" :allowPayment="false" :alloweReconcile="true" /> </q-tab-panel>
                    <q-tab-panel name="history" v-if="dialogMode==false" ><historyComponent  ref="historyComponent" :moduleName="moduleName" /></q-tab-panel>
                    <q-tab-panel name="accounting" ><accountingComponent ref="accountingComponent"  :moduleName="moduleName" :accountHeader="accountHeader" :accountLines="accountLines" @onAccMoveCompute="updateAccountMove" /></q-tab-panel>
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
import basicComponent from './accVoucherOutEditBasic'
import prjComponent from './accVoucherOutEditPrj'
import linesComponent from './accVoucherOutEditLines'
import accountingComponent from '../../../components/journalView/journalView'
import filesComponent from '../../../components/filesView/filesView'
import historyComponent from '../../../components/historyView/historyView'
import paymentsComponent from '../../../components/paymentsView/paymentsView'
import { date } from 'quasar';



export default ({
    props: {
        dialogMode: { type: Boolean, default: false },
        initialPartnerID: { type: Number, required: false, default: null },
        initialLines: { type: Array, required: false, default: null },
        amountUnpaid: { type: Number, required: false, default: null },
        
    },
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
        moduleName: "accVoucherOut", router: this.$router,
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
        //#region IfFirstCallEver
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spSysModulesSelect',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    sys_user_code: this.userCode,
                    link_name: this.moduleName,
                }
            }).then((response) => {
                this.columnsSystem = JSON.parse(response.data[0].columnsSystem)
                this.filters = JSON.parse(response.data[0].filters)
                this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
                this.security = JSON.parse(response.data[0].security)
                //antes estaba aquí this.pagination = JSON.parse(response.data[0].pagination)
                if(!this.columnsUserLoaded){//es primera carga?
                    this.pagination = JSON.parse(response.data[0].pagination)//ahora está aquí
                    this.columnsUser=JSON.parse(response.data[0].columnsUser)//(asigna columnas de usuarios
                    let initialPagination = JSON.parse(JSON.stringify(this.pagination))//clona
                    initialPagination.rowsPerPage = this.userRowsPerPage//asigna rowsPerPage
                    this.pagination = initialPagination;//save to vuex
                    this.currentFilter = JSON.parse(response.data[0].currentFilter)//filtroPredeterminado viene desde la base de datos
                    this.moduleReports = JSON.parse(response.data[0].moduleReports)//filtroPredeterminado viene desde la base de datos
                }
                this.maindataLoaded = true
                this.loadingData = false
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
        //#endregion IfFirstCallEver
        //#region GetData
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spAccvoucherOutSelectEdit',
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
                
                if(this.initialPartnerID && this.initialPartnerID > 0){
                    this.partnerID = this.initialPartnerID
                    this.printName = this.lookup_partners.filter(x=>x.value==this.initialPartnerID).map(y=>y.label).join("")
                }
                
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
        //#endregion GetData
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
                    ,accountLines: this.editData.accountLines
                    ,reconciliation: this.editData.reconciliation
                    ,reconciliationLines: this.editData.reconciliationLines
                    ,files: this.editData.files
                    //,address: this.editData.address.filter(x=>x.is_allowed).map(x=>x.headerID_ux)
                }
                this.$axios.post( this.apiURL + 'spAccvoucherOutUpdate', {
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
    getMax(arr, prop) {
        var max;
        for (var i=0 ; i<arr.length ; i++) {
            if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                max = arr[i];
        }
        return max;
    },
    updateAccountMove(){
        this.$q.loading.show()
        let newAccountHeader = JSON.parse(JSON.stringify(this.accountHeader))
        //console.dir(newAccountHeader)//accMoveDateNew
        newAccountHeader.accMoveDateNew = this.headerDate
        this.accountHeader = newAccountHeader

        //#region ACCOUNT_LINES
            let newRowsAccount = []
            let totalAmount = 0
            let newAccLineID = 0
            //#region DEBE
            this.lines.map(row=>{
                newAccLineID++;
                totalAmount += row.amount
                newRowsAccount.push({
                        accLineID: newAccLineID
                    ,lineID: row.lineID
                    ,account_id: row.line_account_id
                    ,partnerID: this.partnerID
                    ,debit: row.amount
                    ,credit: 0
                    ,invID: 0
                    ,prjID: row.prjID
                    ,mktHeaderID: 0
                    ,mktLineID: 0
                    ,mktTaxID: 0
                    ,comments: row.comments
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
                ,credit: totalAmount
                ,invID: 0
                ,prjID: 0
                ,mktLineID: 0
                ,comments: this.lookup_accPaymentMethods.filter(x=>x.value==this.methodID).map(y => {return y.label + " - Documento: " + this.numeroDoc + (this.printName?" - Nombre: " + this.printName:"") } ).join("")
            })
            //#endregion HABER
            this.accountLines = newRowsAccount
            this.amount = totalAmount
        //#endregion ACCOUNT_LINES


        //#region PAYMENTS
        console.dir('this.reconciliation')
        console.dir(this.reconciliation)
        /*let newLineID = 0
        if(this.reconciliation.length > 0){
            let temp = this.getMax(this.reconciliation, "lineID");
            newLineID = parseInt(temp.lineID);
        }
        let newPayments = JSON.parse(JSON.stringify(this.reconciliation.filter(x=>x.uploaded)))
        console.dir('newPayments')
        
        this.lines.map(x=>{
            
            console.dir(x)
            //Build Date
            let fecha = new Date()
            let fechaTimeOffset = (fecha.getTimezoneOffset())
            if(fechaTimeOffset>0){//positivo entonces resto
                fecha = date.subtractFromDate(fecha, {minutes: fechaTimeOffset} )
            }else{//negativo entonces sumo
                fecha = date.addToDate(fecha, {minutes: (fechaTimeOffset*-1)} )
            }
            //console.dir(date.formatDate(fecha,'YYYY/MM/DD'))
            if(x.initialAccHeaderID>0 && x.amount>0){
                newLineID++;
                newPayments.push({
                     lineID: newLineID
                    ,reconciliationHeaderID: null
                    ,reconciliationMoveID: null
                    ,voided: false
                    ,reconciliationHeaderDate: date.formatDate(fecha,'YYYY/MM/DD')//get current date in user pc (exact date no matter timezone)
                    ,accTypeID: x.docAccTypeID
                    ,headerID: x.docHeaderID
                    ,account_id: x.account_id//el ID de la CxP
                    ,accTypeName: x.initialAccTypeName//el accType del Documento que se está pagando
                    ,accHeaderNumeroDoc: x.comments
                    ,amount: x.amount//monto pagando
                    
                    ,uploaded: false
                })
            }
        })
        console.dir('newPayments')
        console.dir(newPayments)
        this.payments = newPayments*/
        //#endregion
        this.$q.loading.hide()
        //console.dir('Asiento actualizado')
    }
  },
  computed:{
    columnsSystem: {
        get () { return this.$store.state[this.moduleName].columnsSystem },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsSystem', value: val}) }
    },
    columnsUser: {
        get () { return this.$store.state[this.moduleName].columnsUser },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsUser', value: val}) }
    },
    columnsUserLoaded: {
        get () { return this.$store.state[this.moduleName].columnsUser.length>0?true:false },
    },
    pagination: {
      get () { return this.$store.state[this.moduleName].pagination },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'pagination', value: val}) }
    },
    filters: {
        get () { return this.$store.state[this.moduleName].filters },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filters', value: val}) }
    },
    filtersDetails: {
        get () { return this.$store.state[this.moduleName].filtersDetails },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filtersDetails', value: val}) }
    },
    security: {
        get () { return this.$store.state[this.moduleName].security },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'security', value: val}) }
    },
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
    amount:  {
        get () { return this.$store.state[this.moduleName].editData.basic.amount },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'amount', value: val}) }
    },
    lines: {
        get () { return this.$store.state[this.moduleName].editData.lines },
    },
    /*linesTaxes: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
    },*/
    account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id },
    },
    partnerName: {
        get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
    },
    accountHeader: {
        get () { return this.$store.state[this.moduleName].editData.accountHeader },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAccountHeader', val) }
    },
    accountLines: {
        get () { return this.$store.state[this.moduleName].editData.accountLines },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAccountLines', val) }
    },
    payments: {
        get () { return this.$store.state[this.moduleName].editData.payments },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPayments', val) }
    },
    headerDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerDate },
    },
    initialTypeID: {
        get () { return this.$store.state[this.moduleName].editData.basic.initialTypeID },
    },
    methodID: {
        get () { return this.$store.state[this.moduleName].editData.basic.methodID },
    },
    numeroDoc: {
        get () { return this.$store.state[this.moduleName].editData.basic.numeroDoc },
    },
    printName:  {
        get () { return this.$store.state[this.moduleName].editData.basic.printName },
        set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'printName', value: val}) }
    },
    lookup_accPaymentMethods: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accPaymentMethods },
    },
    lookup_partners: {
        get () { return this.$store.state[this.moduleName].editData.lookup_partners },
    },
  },
})
</script>
