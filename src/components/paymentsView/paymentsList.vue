<template>
<div style="margin: -16px;">
    <div v-if="parametersData&&parametersData.editStatus&&parametersData.editStatus.editMode&&parametersData.editStatus.editMode=='edit'">
        <q-toolbar class="no-padding">
            <q-btn label="Nuevos Pagos" no-caps icon="far fa-plus-square" color="primary" flat stretch @click="paymentsAssistantVisible=true" />
            <q-btn label="Actualizar Datos" no-caps icon="fas fa-sync" color="primary" flat stretch @click="loadData" />
        </q-toolbar>
        <q-separator />
        <DxDataGrid
            ref="dxgrid"
            key="maindatagrid"
            height="calc(100vh - 170px)"
            column-resizing-mode="widget"
            :data-source="pagos"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="true"
            :show-column-lines="true"
            :show-row-lines="true"
            key-expr="rowID"
            >
            <DxColumn caption="ID de Conciliación" data-field="headerID" name="headerID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :visible="false" />
            <DxColumn caption="# Línea Conciliación" data-field="lineID" name="lineID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :visible="false" />
            <DxColumn caption=" " name="printButton" :allow-editing="false" alignment="left" :visible="true" cell-template="printEditor" :width="57" :minWidth="57" />
            <template #printEditor="{ data: cellInfo }">
                <q-btn icon="fas fa-print" color="primary" flat stretch title="Imprimir Documento" @click="openDocument(cellInfo)"
                    style="margin: -10px;"/>
            </template>
            <DxColumn caption="# Asiento Conciliación" data-field="accMoveID" name="accMoveID" data-type="string" :allow-editing="false" alignment="left" :minWidth="50" :visible="false" />
            <DxColumn caption="Conciliación" data-field="headerDate" :allow-editing="false" alignment="center" :visible="true" :minWidth="60" :width="100" />
            <DxColumn caption="Tipo Documento" data-field="accTypeName" name="accTypeName" data-type="string" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="true" />
            <DxColumn caption="Documento" data-field="paymentMethodTypeName" name="paymentMethodTypeName" data-type="string" :allow-editing="false" alignment="left" :minWidth="200" :visible="true" />
            <DxColumn caption="ID Documento de Pago" data-field="accHeaderID" name="accHeaderID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :visible="false" />
            <DxColumn caption="# Documento" data-field="numeroDoc" name="numeroDoc" data-type="string" :allow-editing="false" alignment="left" :minWidth="50" :visible="true" />
            <DxColumn caption="Documento" data-field="paymentHeaderDate"  :allow-editing="false" alignment="center" :visible="true" :minWidth="60" :width="100"  />
            <DxColumn caption="# Línea Doc Pago" data-field="accLineID" name="accLineID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :visible="false" />
            <DxColumn caption="Cuenta Línea Doc de Pago" data-field="accLineAccountName" name="accLineAccountName" data-type="string" :allow-editing="false" alignment="left" :minWidth="50" :visible="false" />
            <DxColumn caption="Monto" data-field="lineAmount" name="lineAmount" data-type="number" :allow-editing="false" alignment="right" :minWidth="150" :width="150" :format="userMoneyFormat" />
            <DxColumn caption=" " name="voidButton" :allow-editing="false" alignment="left" :visible="true" cell-template="voidEditor" :width="57" />
            <template #voidEditor="{ data: cellInfo }">
                <q-btn icon="fas fa-trash-alt" color="red" flat stretch :title="'Anular Conciliación # ' + cellInfo.data.headerID" @click="anularConciliacion(cellInfo)"
                    style="margin: -10px;"/>
            </template>
            <DxSummary >
                <DxTotalItem column="accHeaderID" summary-type="count"/>
                <DxTotalItem column="lineAmount" summary-type="sum" cssClass="q-mr-none" > <DxValueFormat type="#.00" /> </DxTotalItem>
            </DxSummary>
        </DxDataGrid>
        <q-dialog square persistent v-model="paymentsAssistantVisible">
            <paymentsAssistant v-if="paymentsAssistantVisible" @onClose="loadData" :parametersData="parametersData"/>
        </q-dialog>
    </div>
    <div v-else >
        <q-banner dense class="bg-primary text-white">
            <q-icon name="fas fa-exclamation-circle" />
            Primero debe guardar su documento antes de continuar.
        </q-banner>
    </div>

    
</div>
</template>
<script>
import paymentsAssistant from './paymentsAssistant.vue'
import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser, DxGrouping, DxGroupPanel, DxGroupItem } from 'devextreme-vue/data-grid';
import { openURL } from 'quasar'

export default ({
    components:{
        paymentsAssistant: paymentsAssistant,
        DxDataGrid,
        DxColumn,
        DxColumnFixing,
        DxScrolling,
        DxStateStoring,
        DxSorting,
        DxPaging,
        DxHeaderFilter,
        DxSelection,
        DxEditing,
        DxLookup,
        DxSummary,
        DxGrouping,
        DxGroupPanel,
        DxGroupItem,
        DxTotalItem,
        DxValueFormat,
        DxColumnChooser,
    },
    props: {
        parametersData: { type: Object, required: false },
    },
    data(){
        return {
            router: this.$router
            ,paymentsAssistantVisible: false
            ,pagos: []
        }
    },
    mounted(){
        this.loadData();
    },
    methods:{
        loadData(){
            this.paymentsAssistantVisible=false
            if(this.parametersData&&this.parametersData.editStatus&&this.parametersData.editStatus.editMode&&this.parametersData.editStatus.editMode=='edit'){
                this.$q.loading.show()
                this.$axios({
                    method: 'GET',
                    url: this.apiURL + 'spAccConciliationSelectEdit',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        userLanguage: 'es',
                        accTypeID: this.parametersData.editData.basic.accTypeID,
                        headerID: this.parametersData.editData.basic.headerID
                    }
                }).then((response) => {
                    this.pagos = JSON.parse(response.data[0].lines)
                    this.$q.loading.hide()
                }).catch((error) => {
                    console.error(error.message)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.$q.loading.hide()
                })
            }
        },
        anularConciliacion(cellInfo){
            console.dir('anularConciliacion')
            console.dir(cellInfo)
            this.$q.dialog({ 
                title: 'Confirmación'
                ,persistent: false
                ,message: 'Desea anular la conciliación?'
                ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true, color: 'red', flat: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
            }
            ).onOk(() => {
                this.$q.loading.show()
                //POST data to server
                this.$axios.post( this.apiURL + 'spAccConciliationVoid', {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        headerID: cellInfo.data.headerID,
                    }
                , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.loading.hide()
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    this.loadData();
                }).catch((error) => {
                    console.dir(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Se encontraron los siguientes inconvenientes:<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white', } ]
                    })
                    this.$q.loading.hide()
                })
            })
        },
        openDocument(cellInfo){
            //let variables = this.$q.sessionStorage.getAll()
            let variables = this.$q.sessionStorage.getAllKeys()
            //borrar localStorage
            this.$q.localStorage.clear();
            //Copy sessionStorage to localStorage
            variables.map(x=>{
                if(x=='sys_profile_id'||x=='URL_Path'||x=='URL_ws'||x=='ReportServer_Path'||x=='ReportServer_BI_Path'||x=='sys_user_code'||x=='URL_Data'||x=='URL_Port'||x=='Google_API_key'||x=='pathname'||x=='serverFilesPath'||x=='serverTempFilesPath'||x=='sys_user_company'||x=='jwtToken'||x=='ReportServer_Export_Path')
                this.$q.localStorage.set(x,this.$q.sessionStorage.getItem(x))
            })
            //Open new tab (mainlayout will read localstorage, copy to sessionStorage, and clear localstorage)
            try{
                //openURL(window.location.origin + '/#/RootBank/accVoucherOut/2')
                openURL(window.location.origin + '/#/' + cellInfo.data.pathToDocument + '/' + cellInfo.data.accHeaderID)
            }catch(ex){
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "No se puede realizar acción: " + ex.message
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }
            
            
        }
    },
    computed:{
        console: () => console,
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        userMoneyFormat: { get () { 
            let resultado ="#0.000000";
            if(this.$store.state.main.userMoneyFormat==0){ resultado = "#0" }
            if(this.$store.state.main.userMoneyFormat==1){ resultado = "#0.0" }
            if(this.$store.state.main.userMoneyFormat==2){ resultado = "#0.00" }
            if(this.$store.state.main.userMoneyFormat==3){ resultado = "#0.000" }
            if(this.$store.state.main.userMoneyFormat==4){ resultado = "#0.0000" }
            if(this.$store.state.main.userMoneyFormat==5){ resultado = "#0.00000" }
            if(this.$store.state.main.userMoneyFormat==6){ resultado = "#0.000000" }
            return resultado }
        },
    },
    
    
})
</script>