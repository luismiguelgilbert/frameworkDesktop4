<template>
<q-card style="min-width: calc(100vw - 50px); max-height: calc(99vh)">
    <q-toolbar class="q-pr-none bg-primary text-white">
        <div class="q-mr-lg text-h6">Asistente de Pagos</div>
        <q-space />
        <q-btn flat stretch icon="fas fa-times" @click="closeThisDialog" />
    </q-toolbar>

    <q-stepper keep-alive v-model="step" ref="stepper" color="primary" animated dense v-if="lookup_partners.length>0">
        <q-step :name="1" title="1. Seleccionar Proveedor" icon="fas fa-user" active-icon="fas fa-user" :done="step > 1">
            <div style="height: calc(100vh - 266px);" >
                <selectSearchable 
                    
                    :square="true" :isDense="false"
                    prependIcon="fas fa-handshake"
                    labelText="Proveedor(*)" labelSearchText="Buscar Proveedor"
                    :optionsList="this.lookup_partners" borderless
                    rowValueField="value" optionsListLabel="label" optionsListCaption="partner_ruc"
                    :isRequired="false" 
                    :isDisable="partnerID>0?true:false" 
                    :isReadonly="false"
                    :initialValue="partnerID"
                    :tableSearchColumns="[
                            { name: 'label', label: 'Proveedor', field: 'label', align: 'left'}
                            ,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
                        ]"
                    @onItemSelected="(row)=>{
                            this.partnerID=row.value;
                            //this.partnerName=row.label;
                            this.loadPendingInvoices();
                            //this.$emit('onAccMoveCompute')
                        }"
                    />
            </div>
        </q-step>
        <q-step :name="2" title="2. Seleccionar/Crear Documentos a Conciliar" icon="fas fa-exchange-alt" active-icon="fas fa-exchange-alt" :done="step > 2" style="height: calc(100vh - 217px)">
            <DxDataGrid
                style="margin: -24px;"
                ref="dxgrid"
                key="maindatagrid"
                height="calc(100vh - 218px)"
                column-resizing-mode="widget"
                :data-source="allDocs"
                :allow-column-resizing="true" 
                :allow-column-reordering="true"
                :show-borders="true"
                :show-column-lines="false"
                :show-row-lines="true"
                key-expr="rowID"
                @selection-changed="onSelectionChanged"
                >
                    <DxScrolling mode="virtual"  rowRenderingMode="virtual" columnRenderingMode="virtual" :useNative="true" showScrollbar="always" />
                    <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="false" /><!--:deferred="false" hace que el customTotalCalculate busque por key-->
                    <DxPaging :enabled="false" /> 
                    

                    <DxColumn caption="rowID" data-field="rowID" name="rowID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="false" />
                    <DxColumn caption="accTypeID" data-field="accTypeID" name="accTypeID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="false" />
                    <DxColumn caption="headerID" data-field="headerID" name="headerID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="false" />
                    <DxColumn caption="lineID" data-field="lineID" name="lineID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="false" />
                    <DxColumn caption="account_id" data-field="account_id" name="account_id" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="false" />
                    <DxColumn  caption="Documento" data-field="documentName" name="documentName" cell-template="cellTemplateDocumentName" :allow-editing="false" alignment="left" :minWidth="50" :width="330" :visible="true"  />
                    <template #cellTemplateDocumentName="{ data }" >
                        <div
                            v-if="parametersData&&parametersData.editData&&parametersData.editData.basic&&parametersData.editData.basic.numeroDoc&&parametersData.editData.basic.numeroDoc==data.data.numeroDoc"
                            class="text-positive" style="margin-left: -15px;"
                        >
                            <q-item dense>
                                <q-item-section>
                                    <q-item-label>{{data.data.documentName}} </q-item-label>
                                    <q-item-label caption>{{data.data.subdocumentName}} {{data.data.numeroDoc}} </q-item-label>
                                </q-item-section>
                                <q-item-section side v-if="data.data.isNew">
                                    <q-chip outline color="positive" size="sm">Nuevo</q-chip>
                                </q-item-section>
                            </q-item>
                        </div>
                        <div v-else style="margin-left: -15px;">
                            <q-item dense>
                                <q-item-section>
                                    <q-item-label>{{data.data.documentName}} </q-item-label>
                                    <q-item-label caption>{{data.data.subdocumentName}} {{data.data.numeroDoc}} </q-item-label>
                                </q-item-section>
                                <q-item-section side v-if="data.data.isNew">
                                    <q-chip outline color="positive" size="sm">Nuevo</q-chip>
                                </q-item-section>
                            </q-item>
                        </div>
                    </template>
                    <DxColumn caption="headerDate" data-field="headerDate" name="headerDate" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="false" />
                    <DxColumn caption="Fecha Doc." data-field="headerDateName" name="headerDateName" data-type="string" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="true" />
                    <DxColumn caption="dueDate" data-field="dueDate" name="dueDate" data-type="string" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="false" />
                    <DxColumn caption="amountTotal" data-field="amountTotal" name="amountTotal" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="false" />
                    <DxColumn caption="amountPaid" data-field="amountPaid" name="amountPaid" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="false" />
                    <DxColumn caption="Saldo" data-field="amountUnpaid" name="amountUnpaid" cell-template="cellTemplateAmountUnpaid" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="true" :format="userMoneyFormat" />
                    <template #cellTemplateAmountUnpaid="{ data }" >
                        <div v-if="data.data.esPositivo">{{data.data.amountUnpaid.toFixed(2)}}</div>
                        <div v-else>{{(data.data.amountUnpaid * -1).toFixed(2)}}</div>
                    </template>
                    <DxColumn caption="Monto a Conciliar" data-field="amountNew" name="amountNew" cell-template="cellTemplateAmountNew" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="130" :visible="true" :format="userMoneyFormat" 
                        :cssClass="userColor=='default'?'bg-grey-2':'bg-grey-9'" />
                    <template #cellTemplateAmountNew="{ data }" >
                        <div v-if="data.data.esPositivo">{{(data.data.amountNew * -1).toFixed(2)}}</div>
                        <div v-else>{{(data.data.amountNew * +1).toFixed(2)}}</div>
                    </template>
                    <DxColumn caption="Saldo Final" data-field="amountPending" name="amountPending" cell-template="cellTemplateAmountPending" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="true" :format="userMoneyFormat" 
                        :cssClass="userColor=='default'?'bg-grey-2':'bg-grey-9'" />
                    <template #cellTemplateAmountPending="{ data }" >
                        <div v-if="data.data.esPositivo">{{data.data.amountPending.toFixed(2)}}</div>
                        <div v-else>{{(data.data.amountPending * -1).toFixed(2)}}</div>
                    </template>
                    <DxColumn caption="Cuenta Contable" data-field="account_name" name="account_name" data-type="string" :allow-editing="false" alignment="left" :minWidth="50"  :visible="true" />
                    <DxColumn  caption=" " data-field="isNew" name="isNew" cell-template="cellTemplateDeletePayment" :allow-editing="false" alignment="left" :minWidth="57" :width="57" :visible="true"  
                        css-class="no-padding" />
                    <template #cellTemplateDeletePayment="{ data }">
                        <q-btn  icon="fas fa-trash-alt" color="red" flat stretch style="width: 100%; height: 58px;"
                            :disable="!(data.data.isNew)" @click="eliminarPagoDeAllDocs(data.data)"
                            />
                    </template>

                    <DxSummary :calculate-custom-summary="calculateSelectedRow">
                        <DxTotalItem name="SelectedRowsSummary" summary-type="custom" display-format="{0}" show-in-column="amountUnpaid"> <DxValueFormat type="#.00" /> </DxTotalItem>
                        <!--<DxTotalItem name="SelectedRowsSummaryNew" summary-type="custom" display-format="{0}" show-in-column="amountNew"> <DxValueFormat type="#.00" /> </DxTotalItem>-->
                        <DxTotalItem name="SelectedRowsSummaryAmountPending" summary-type="custom" display-format="{0}" show-in-column="amountPending"> <DxValueFormat type="#.00" /> </DxTotalItem>
                    </DxSummary>
            </DxDataGrid>
        </q-step>
        <q-step :name="3" title="3. Ajustes y Confirmación" icon="fas fa-exchange-alt" :done="step > 2" style="height: calc(100vh - 217px)">
            <DxDataGrid
                style="margin: -24px;"
                ref="dxgridFinal"
                key="finaldatagrid"
                height="calc(100vh - 218px)"
                column-resizing-mode="widget"
                :data-source="nuevosPagos"
                :allow-column-resizing="true" 
                :allow-column-reordering="true"
                :show-borders="true"
                :show-column-lines="true"
                :show-row-lines="true"
                key-expr="lineID"
                >
                    <DxScrolling mode="virtual"  rowRenderingMode="virtual" columnRenderingMode="virtual" :useNative="true" showScrollbar="always" />
                    <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="false" /><!--:deferred="false" hace que el customTotalCalculate busque por key-->
                    <DxPaging :enabled="false" /> 

                    <DxColumn  caption="Documento x Pagar" data-field="facturaDocumentNumber" name="facturaDocumentNumber" cell-template="cellTemplatefacturaDocumentName" :allow-editing="false" alignment="left" :minWidth="50"  :visible="true"  />
                    <template #cellTemplatefacturaDocumentName="{ data }" >
                        <q-item dense style="margin-left: -15px;">
                            <q-item-section>
                                <q-item-label>{{data.data.facturaSubdocumentName}} {{data.data.facturaDocumentNumber}}</q-item-label>
                                <q-item-label caption>{{data.data.facturaDocumentName}}  </q-item-label>
                                <q-item-label caption>{{data.data.factura_account_name}}  </q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                    

                    <DxColumn  caption="Pago" data-field="pagoDocumentNumber" name="pagoDocumentNumber" cell-template="cellTemplatepagoDocumentName" :allow-editing="false" alignment="left" :minWidth="50" :visible="true"  />
                    <template #cellTemplatepagoDocumentName="{ data }" >
                        <q-item dense style="margin-left: -15px;">
                            <q-item-section>
                                <q-item-label >{{data.data.pagoSubdocumentName}} {{data.data.pagoDocumentNumber}} </q-item-label>
                                <q-item-label caption>{{data.data.pagoDocumentName}} </q-item-label>
                                <q-item-label caption>{{data.data.pago_account_name}}  </q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                    <DxColumn caption="Monto" data-field="amountNew" name="amountNew" cell-template="cellTemplateNuevoPagoMonto" data-type="number" :allow-editing="true" alignment="right" :minWidth="50" :width="100" :visible="true" :format="userMoneyFormat" />
                    <template #cellTemplateNuevoPagoMonto="{ data }"  >
                        <q-input  dense :value="data.data.amountNew" autofocus borderless input-class="text-right" type="number" 
                            debounce="1000" :min="0" 
                            @input="(e)=>{
                                //Toma el INPUT y lo convierte en 0 cuando sea negativo
                                let nuevoAmountNew = (e>=0)?parseFloat(parseFloat(e).toFixed(2)):0;
                                //Validar Saldo Final de Factura
                                let nuevoAmountFacturaInitial = allDocs.find(linea=> linea.rowID == data.data.facturaID).amountUnpaid
                                let nuevoAmountFactura = 0;
                                nuevosPagos.filter(x=>x.facturaID==data.data.facturaID&&x.lineID!=data.data.lineID).map(currentRow=>{nuevoAmountFactura = nuevoAmountFactura + currentRow.amountNew})
                                nuevoAmountFactura = nuevoAmountFactura + nuevoAmountNew//le suma la línea actual
                                if(nuevoAmountFactura > nuevoAmountFacturaInitial){
                                    $q.notify({ html: true, multiLine: false, color: 'red' ,message: 'El valor excede el saldo de la factura' ,timeout: 1000, progress: false , icon: 'fas fa-exclamation-circle'})
                                    return
                                }
                                //Validar Saldo Final del Pago
                                let nuevoAmountPagoInitial = allDocs.find(linea=> linea.rowID == data.data.pagoID).amountUnpaid
                                let nuevoAmountPago = 0;
                                nuevosPagos.filter(x=>x.pagoID==data.data.pagoID&&x.lineID!=data.data.lineID).map(currentRow=>{nuevoAmountPago = nuevoAmountPago + currentRow.amountNew})
                                nuevoAmountPago = nuevoAmountPago + nuevoAmountNew//le suma la línea actual
                                if(nuevoAmountPago > nuevoAmountPagoInitial){
                                    $q.notify({ html: true, multiLine: false, color: 'red' ,message: 'El valor excede el saldo del pago' ,timeout: 1000, progress: false , icon: 'fas fa-exclamation-circle'})
                                    return
                                }
                                //actualiza Registros
                                nuevosPagos.find(linea=> linea.lineID == data.data.lineID ).amountNew = (e>=0)?parseFloat(parseFloat(e).toFixed(2)):0;//actualiza input
                                allDocs.map(x=>{
                                    if(x.rowID==data.data.facturaID){
                                        x.amountNew = nuevoAmountFactura;
                                        x.amountPending =   x.amountUnpaid - x.amountNew;
                                    }
                                    if(x.rowID==data.data.pagoID){
                                        x.amountNew = nuevoAmountPago;
                                        x.amountPending =   x.amountUnpaid - x.amountNew;
                                    }
                                    return x
                                })
                            }"
                            />
                    </template>
                    <DxColumn caption="Fecha Conciliación" data-field="headerDate" name="headerDate" cell-template="cellTemplateNuevoPagoFecha" data-type="date" :allow-editing="true" alignment="center" :minWidth="50" :width="160" :visible="true" />
                    <template #cellTemplateNuevoPagoFecha="{ data }" >
                        <q-input dense :value="data.data.headerDate" readonly borderless mask="date" :rules="['date']" hide-bottom-space  color="primary"
                            placeholder="(aaaa/mm/dd)" label="(aaaa/mm/dd)" style="border-bottom-style: hidden !important;"
                            @input="(e)=>{return data.data.headerDate}"
                            >
                            <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer"  color="primary">
                                <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
                                <q-date :locale="myQDateLocale" minimal v-model="data.data.headerDate" >
                                    <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                    </div>
                                </q-date>
                                </q-popup-proxy>
                            </q-icon>
                            </template>
                        </q-input>
                    </template>
                    <DxColumn  caption=" " name="deleteButton" cell-template="cellTemplateDeleteNewPayment" :allow-editing="false" alignment="left" :minWidth="57" :width="57" :visible="true"  
                        css-class="no-padding" />
                    <template #cellTemplateDeleteNewPayment="{ data }" >
                        <q-btn  icon="fas fa-trash-alt" color="red" flat stretch style="width: 100%; height: 75px;"
                            @click="eliminarPagoDeNuevosPagos(data.data)"
                            />
                    </template>
                    
            </DxDataGrid>
           
        </q-step>
        <template v-slot:navigation>
            <!--<q-stepper-navigation>-->
            <q-separator />
            <q-toolbar class="no-padding">
                <q-btn v-if="step === 2" icon="fas fa-plus" :label="$q.screen.gt.sm?'Nuevo Pago':undefined" title="Nuevo Pago" color="primary" flat stretch  no-caps no-wrap @click="showCreateNewDialog" />
                <q-btn v-if="step === 2"
                    color="primary" stretch flat
                    :disable="isApplyDisable"
                    @click="applyPayment" 
                    :label="$q.screen.gt.sm?'Aplicar':''" no-caps no-wrap icon="fas fa-exchange-alt" title="Aplica el saldo disponibles de los pagos seleccionados, sobre los documentos pendientes de pago" />
                <!--<q-btn v-if="step === 3" color="red" stretch flat 
                        :label="$q.screen.gt.sm?'Eliminar Conciliación':''"
                        no-wrap no-caps icon="fas fa-trash-alt"
                        title="Eliminar las conciliaciones seleccionadas"
                        @click="eliminarConciliaciones" />
                    <q-btn v-if="step === 3"
                        color="red" stretch flat 
                                :label="$q.screen.gt.sm?'Limpiar Todo':''" no-caps no-wrap
                                icon="fas fa-eraser" @click="limpiarPagos" />-->
                <q-space />
                <q-btn v-if="step > 1" flat color="primary" stretch @click="$refs.stepper.previous()" label="Regresar" no-caps no-wrap class="q-ml-sm" icon="fas fa-angle-left" />
                <q-btn 
                    @click="nextSaveButtonClick" color="primary" stretch no-caps no-wrap 
                    :label="step === 3 ? 'Guardar' : 'Continuar'" 
                    :icon-right="step === 3 ? 'fas fa-save' : 'fas fa-angle-right'"
                    style="min-width: 150px;"
                    />
                
            </q-toolbar>
            <!--</q-stepper-navigation>-->
        </template>
    </q-stepper>

    <q-dialog v-model="createNewDialog">
        <paymentsListAssistantNew 
            v-if="createNewDialog" 
            @onClose="newPaymentClose"
            :partnerID="partnerID"
            :lookup_partners="lookup_partners"
            :lookup_accounts="lookup_accounts"
            :lookup_payment_methods="lookup_payment_methods"
            :initialAmount="initialAmount"
            />
    </q-dialog>
</q-card>

</template>
<script>
import { date } from 'quasar';
//import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import selectSearchable from '../selectSearchable/selectSearchable.vue'
import paymentsListAssistantNew from './paymentsListAssistantNew.vue'

import { DxDataGrid, DxColumn, DxMasterDetail, DxSelection, DxScrolling, DxSummary, DxTotalItem, DxValueFormat, DxFormat, DxPaging, DxEditing } from 'devextreme-vue/data-grid';

export default ({
    components: {
        selectSearchable, DxDataGrid, DxColumn, DxMasterDetail, DxSelection, DxScrolling, DxSummary, DxTotalItem, DxValueFormat, DxFormat,  DxPaging, DxEditing, paymentsListAssistantNew: paymentsListAssistantNew
    },
    props: {
        parametersData: { type: Object, required: false },
        //moduleName: { type: String, required: true },
        //initialPartnerID: { type: Number, required: false, default: null },
        //initialFacturaID: { type: Number, required: false, default: null },
    },
    data(){
        return {
            router: this.$router
            ,splitterModel: 50
            ,splitterModelVertical: 50
            ,step: 1
            ,headerDate: null
            ,allDocs: []
            ,isApplyDisable: true
            ,tab: 'documentos'
            //,selectedRowKeys: []
            /////
            //,pagos: []
            ,selectedPagos: []
            //,facturas: []
            ,selectedFacturas: []
            ,nuevosPagos: []
            ,selectedNuevosPagos: []
            ,lookup_partners: []
            ,lookup_accounts: []
            ,lookup_payment_methods: []
            ,partnerID: null
            ,initialAmount: 0
            ,myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            }
            //Nuevo pago
            ,createNewDialog: false
        }
    },
    methods:{
        //CONFIRMADOS
        getMax(arr, prop) {
            var max;
            for (var i=0 ; i<arr.length ; i++) {
                if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                    max = arr[i];
            }
            return max;
        },
        closeThisDialog() {
            this.$emit('onClose')
        },
        dateNameList(fecha){
            return date.formatDate(fecha, 'D MMM YYYY')
            /*
            return date.formatDate(fecha, 'D MMM YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                })
            */
        },
        loadPendingInvoices(){
            this.$q.loading.show()
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spAccVoucherOutAssistant',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    partnerID: this.partnerID?this.partnerID:0,
                    //editMode: this.editStatus.editMode=='create'?true:false
                }
            }).then((response) => {
                this.lookup_partners = JSON.parse(response.data[0].lookup_partners)
                this.lookup_accounts = JSON.parse(response.data[0].lookup_accounts)
                this.lookup_payment_methods = JSON.parse(response.data[0].lookup_payment_methods)
                //this.facturas = JSON.parse(response.data[0].documents)
                //this.pagos = JSON.parse(response.data[0].vouchers)
                this.allDocs = JSON.parse(response.data[0].alldocuments)
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
        },
        nextSaveButtonClick(){
            if(this.step < 3){
                this.$refs.stepper.next()
            }else{
                //if(!(this.nuevosPagos.length>0 || this.pagos.filter(x=>x.isNew).length>0 )){
                if(!(this.nuevosPagos.length>0 )){
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "No hay nada por guardar. Usted no ha registrado conciliaciones, ni nuevos pagos."
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white', } ]
                    })
                }else{
                    this.saveData();
                }
            }
        },
        showCreateNewDialog(){
            this.initialAmount = this.initialAmount;
            this.createNewDialog = true
        },
        newPaymentClose(data){
            this.createNewDialog = false;
            if(data){
                //GetMaxId
                let max_id = 0
                let temp = null
                if(this.allDocs.length > 0){
                    temp = this.getMax(this.allDocs, "rowID");
                    max_id = parseInt(temp.rowID);//no es necesario incrementar en 1, porque lo hace luego 
                }
                
                if(!(this.allDocs.some(x=>x.methodID==data.payment_method_id&&x.numeroDoc==data.numeroDoc))){
                    data.lines.map(linea=>{
                        max_id++;
                        let nuevoPago = {
                            rowID: max_id
                            ,isNew: true
                            ,esPositivo: false
                            ,accTypeID: 3 /*3 = accTypes.accTypeID = Pago*/
                            ,ID: max_id
                            ,headerID: max_id
                            ,lineID: linea.lineID
                            ,account_id: linea.account_id//,line_account_id: linea.account_id
                            ,account_name: linea.account_name //,line_account_name: linea.account_name
                            ,documentName: this.lookup_payment_methods.find(x=>x.value==data.payment_method_id).paymentTypeName
                            ,subdocumentName: this.lookup_payment_methods.find(x=>x.value==data.payment_method_id).paymentTypeSubname
                            ,numeroDoc: data.numeroDoc
                            ,headerDate: data.headerDate
                            ,headerDateName: this.dateNameList(data.headerDate)
                            ,dueDate: ''


                            ,partnerID: data.partnerID
                            ,methodID: data.payment_method_id
                            ,comments: data.comments
                            ,printDate: data.printDate
                            ,printName: data.printName
                            ,line_comments: linea.comments
                            ,amountTotal: linea.amount
                            ,amountUnpaid: linea.amount
                            ,amountNew: 0
                            ,amountPending: linea.amount
                        }
                        //this.pagos.push(nuevoPago)
                        this.allDocs.push(nuevoPago)
                        
                    })
                }else{
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Ya se encuentra regiatrado ese número de documento. No se registró el nuevo pago."
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white', } ]
                    })
                }
            }
        },
        onSelectionChanged(e) {
            e.component.refresh(true);
            let temp = e.component.getSelectedRowsData();
            this.isApplyDisable = true;//resetea
            if(temp.filter(x=>x.esPositivo&&x.amountPending>0).length > 0){//Si es que existe al menos 1 docuemtno seleccionado que sea POSITIVO
                if(temp.filter(x=>x.esPositivo==false&&x.amountPending).length > 0){//Si es que existe al menos 1 docuemtno seleccionado que sea NEGATIVO
                    this.isApplyDisable = false;//false significa que permite aplicar
                }
            }
        },
        calculateSelectedRow(options) {
            if (options.name === 'SelectedRowsSummary') {
                if(options.component.getSelectedRowsData().length>0){
                    if (options.summaryProcess === 'start') {
                        options.totalValue = 0;
                    } else if (options.summaryProcess === 'calculate') {
                        if (options.component.isRowSelected(options.value.rowID)) {
                            options.totalValue = options.totalValue + (options.value.esPositivo?options.value.amountUnpaid:(options.value.amountUnpaid*-1));
                            this.initialAmount = options.totalValue;
                        }
                    }
                }else{
                    options.totalValue = null
                }
            }
            if (options.name === 'SelectedRowsSummaryNew') {
                if(options.component.getSelectedRowsData().length>0){
                    if (options.summaryProcess === 'start') {
                        options.totalValue = 0;
                    } else if (options.summaryProcess === 'calculate') {
                        if (options.component.isRowSelected(options.value.rowID)) {
                            options.totalValue = options.totalValue + (options.value.esPositivo?options.value.amountNew:0);
                            //this.initialAmount = options.totalValue;
                        }
                    }
                }
            }
            if (options.name === 'SelectedRowsSummaryAmountPending') {
                if(options.component.getSelectedRowsData().length>0){
                    if (options.summaryProcess === 'start') {
                        options.totalValue = 0;
                    } else if (options.summaryProcess === 'calculate') {
                        if (options.component.isRowSelected(options.value.rowID)) {
                            options.totalValue = options.totalValue + (options.value.esPositivo?options.value.amountPending:(options.value.amountPending*-1));
                        }
                    }
                }
            }
            
        },
        eliminarPagoDeAllDocs(fila){
            this.nuevosPagos = this.nuevosPagos.filter(x=>x.pagoID != fila.rowID) //elimina todos los registros de Nuevos pagos
            this.allDocs = this.allDocs.filter(x=>x.rowID != fila.rowID) //elimina el registro de Pagos
            this.allDocs.map(x=>{
                if(x.esPositivo){//Es Factura
                    let montoFacturaNuevo = 0
                    this.nuevosPagos.filter(z=>z.facturaID==x.rowID).map(zz=>{
                        montoFacturaNuevo = montoFacturaNuevo + zz.amountNew;
                    })
                    x.amountNew = montoFacturaNuevo;
                    x.amountPending =  x.amountUnpaid - x.amountNew;
                }else{//Es Pago
                    let montoPagoNuevo = 0
                    this.nuevosPagos.filter(z=>z.pagoID==x.rowID).map(zz=>{
                        montoPagoNuevo = montoPagoNuevo + zz.amountNew;
                    })
                    x.amountNew = montoPagoNuevo;
                    x.amountPending =  x.amountUnpaid - x.amountNew;
                }
            })
        },
        applyPayment(){
            //GetMaxId
            let max_id = 0
            let temp = null
            if(this.nuevosPagos.length > 0){
                temp = this.getMax(this.nuevosPagos, "lineID");
                max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
            }

            let facturas = this.$refs.dxgrid.instance.getSelectedRowsData().filter(x=>x.esPositivo&&x.amountPending > 0); //registros seleccionados del grid, y que sean POSITIVOS entonces son facturas que se están conciliando
            //let pagos = this.allDocs.filter(x=>x.esPositivo==false&&x.amountPending > 0); //porque si tiene saldo disponible entonces lo considero
            let pagos = this.$refs.dxgrid.instance.getSelectedRowsData().filter(x=>x.esPositivo==false&&x.amountPending > 0); //registros seleccionados del grid, y que sean NEGATIVOS entonces son pagos que se están conciliando
            let internalPartnerID = this.partnerID
            for (var i = 0; i < pagos.length; i++) {
                    for (var j = 0; j < facturas.length; j++) {
                        if(pagos[i].amountPending > 0 && facturas[j].amountPending > 0){
                            //Si el pago tiene un monto disponible menor al de la factura entonces su usa todo el pago; de lo contrario entonces solamente se usa el saldo de la factura
                            if(pagos[i].amountPending <= facturas[j].amountPending){
                                let valorUsado = pagos[i].amountPending
                                facturas[j].amountNew = parseFloat(parseFloat(facturas[j].amountNew + valorUsado).toFixed(2))
                                facturas[j].amountPending = parseFloat(parseFloat(facturas[j].amountUnpaid - facturas[j].amountNew).toFixed(2))
                                pagos[i].amountNew = parseFloat(parseFloat(pagos[i].amountNew + valorUsado).toFixed(2))
                                pagos[i].amountPending = parseFloat(parseFloat(pagos[i].amountUnpaid - pagos[i].amountNew).toFixed(2))
                                if(valorUsado > 0){
                                    max_id++;
                                    this.nuevosPagos.push({
                                        //documentName subdocumentName numeroDoc
                                        //Header
                                         lineID: max_id
                                        ,partnerID: internalPartnerID
                                        ,headerDate: this.headerDate
                                        //Factura
                                        ,facturaID: facturas[j].rowID//,facturaID: facturas[j].ID
                                        ,factura_headerID: facturas[j].headerID
                                        ,factura_accTypeID: facturas[j].accTypeID
                                        ,factura_line_id: 0//porque las facturas NO se parten a diferencia con los pagos
                                        ,factura_account_id: facturas[j].account_id
                                        ,factura_account_name: facturas[j].account_name
                                        ,facturaSubdocumentName: facturas[j].subdocumentName
                                        ,facturaDocumentName: facturas[j].documentName
                                        ,facturaDocumentNumber: facturas[j].numeroDoc


                                        //Pago
                                        ,pagoID: pagos[i].rowID//,pagoID: pagos[i].ID
                                        ,pago_headerID: pagos[i].headerID
                                        ,pago_accTypeID: pagos[i].accTypeID
                                        ,pago_isNew: pagos[i].isNew
                                        ,pago_line_id: pagos[i].lineID
                                        ,pago_account_id: pagos[i].account_id //line_account_id
                                        ,pago_account_name: pagos[i].account_name //line_account_name
                                        ,pagoDocumentName: pagos[i].documentName
                                        ,pagoSubdocumentName: pagos[i].subdocumentName
                                        ,pagoDocumentNumber: pagos[i].numeroDoc

                                        ,amountNew: valorUsado
                                    })
                                }
                            }else{//se usa solamente el saldo de la factura
                                let valorUsado = facturas[j].amountPending
                                facturas[j].amountNew = parseFloat(parseFloat(facturas[j].amountNew + valorUsado).toFixed(2))
                                facturas[j].amountPending = parseFloat(parseFloat(facturas[j].amountUnpaid - facturas[j].amountNew).toFixed(2))
                                pagos[i].amountNew = parseFloat(parseFloat(pagos[i].amountNew + valorUsado).toFixed(2))
                                pagos[i].amountPending = parseFloat(parseFloat(pagos[i].amountUnpaid - pagos[i].amountNew).toFixed(2))
                                if(valorUsado > 0){
                                    max_id++;
                                    this.nuevosPagos.push({
                                        //Header
                                        lineID: max_id
                                        ,partnerID: internalPartnerID
                                        ,headerDate: this.headerDate
                                        //Factura
                                        ,facturaID: facturas[j].rowID//,facturaID: facturas[j].ID
                                        ,factura_headerID: facturas[j].headerID
                                        ,factura_accTypeID: facturas[j].accTypeID
                                        ,factura_line_id: 0//porque las facturas NO se parten a diferencia con los pagos
                                        ,factura_account_id: facturas[j].account_id
                                        ,factura_account_name: facturas[j].account_name
                                        ,facturaDocumentName: facturas[j].documentName
                                        ,facturaSubdocumentName: facturas[j].subdocumentName
                                        ,facturaDocumentNumber: facturas[j].numeroDoc
                                        //Pago
                                        ,pagoID: pagos[i].rowID//,pagoID: pagos[i].ID
                                        ,pago_headerID: pagos[i].headerID
                                        ,pago_accTypeID: pagos[i].accTypeID
                                        ,pago_isNew: pagos[i].isNew
                                        ,pago_line_id: pagos[i].lineID
                                        ,pago_account_id: pagos[i].account_id //line_account_id
                                        ,pago_account_name: pagos[i].account_name //line_account_name
                                        ,pagoDocumentName: pagos[i].documentName
                                        ,pagoSubdocumentName: pagos[i].subdocumentName
                                        ,pagoDocumentNumber: pagos[i].numeroDoc
                                        ,amountNew: valorUsado
                                    })
                                }
                            }
                        }
                    }
                }
            this.isApplyDisable = true;//obliga a resetear el estado del botón para que el usuario se vea forzado a seleccionar nuevamente documentos a conciliar
        },
        eliminarPagoDeNuevosPagos(fila){
            this.nuevosPagos = this.nuevosPagos.filter(x=>x.lineID != fila.lineID) //elimina todos los registros de Nuevos pagos
            //this.allDocs = this.allDocs.filter(x=>x.rowID != fila.rowID) //elimina el registro de Pagos
            this.allDocs.map(x=>{
                if(x.esPositivo){//Es Factura
                    let montoFacturaNuevo = 0
                    this.nuevosPagos.filter(z=>z.facturaID==x.rowID).map(zz=>{
                        montoFacturaNuevo = montoFacturaNuevo + zz.amountNew;
                    })
                    x.amountNew = montoFacturaNuevo;
                    x.amountPending =  x.amountUnpaid - x.amountNew;
                }else{//Es Pago
                    let montoPagoNuevo = 0
                    this.nuevosPagos.filter(z=>z.pagoID==x.rowID).map(zz=>{
                        montoPagoNuevo = montoPagoNuevo + zz.amountNew;
                    })
                    x.amountNew = montoPagoNuevo;
                    x.amountPending =  x.amountUnpaid - x.amountNew;
                }
            })
        },
        saveData(){
            //en allDocs, no debe existir ningún registro que amountPending sea menor a 0 (no importa si es factura o pago)
            try{
                this.$q.loading.show()

                let nuevaData = {
                    //corregir pagos: this.pagos.filter(x=>x.isNew)
                    pagos: this.allDocs.filter(x=>x.isNew)
                    ,conciliaciones: this.nuevosPagos
                }

                //POST data to server
                this.$axios.post( this.apiURL + 'spAccVoucherOutAssistantUpdate', {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        "editRecord": JSON.stringify(nuevaData),
                    }
                , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.loading.hide()
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    this.$emit('onClose')
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
            }catch(ex){

            }
        } ,
    },
    created(){
        //Asigna Fecha Actual para Nuevo Asiento
        const yourDate = new Date();
        this.headerDate = (yourDate.toISOString().split('T')[0]).replace(/-/g,'/');
        
        //Si parametersData tiene partnerID es porque estamos dentro de una factura?
        try{
            this.partnerID = this.parametersData.editData.basic.partnerID
        }catch(ex){
            console.dir('Cannot auto set partner')
            console.dir(ex)
        }
        this.loadPendingInvoices();
    },
    computed:{
        console: () => console,
        //notify: () => this.$q.notify,
        //notify: { get () { return this.$q.notify }  },
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
    watch: {
        headerDate: function(newValue, oldValue) {
            this.nuevosPagos.map(x=>x.headerDate = newValue)
        }
    },
})
</script>