<template>
<q-card style="min-width: calc(100vw - 50px); max-height: calc(99vh)">
    <q-toolbar class="q-pr-none bg-primary text-white">
        <div class="q-mr-lg text-h6">Asistente de Pagos</div>
        <q-space />
        <q-btn flat stretch icon="fas fa-times" @click="closeThisDialog" />
    </q-toolbar>
    <!--v-if="lookup_partners.length>0" es importante porque el lookup arranca vacío y se llena después de CREATED que es cuando se llama al sp de data-->
    <q-card-section v-if="lookup_partners.length>0" style="max-height: calc(99vh - 120px); overflow-y: auto;" class="no-padding">
        
        <selectSearchable 
            :square="true"
            prependIcon="fas fa-handshake"
            labelText="Proveedor(*)" labelSearchText="Buscar Proveedor"
            :optionsList="lookup_partners" borderless
            rowValueField="value" optionsListLabel="label" optionsListCaption="partner_ruc"
            :isRequired="false" 
            :isDisable="false" 
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

        <q-splitter v-if="partnerID>0" v-model="splitterModel" unit="%" style="height: calc(99vh - 185px); " separator-style="width: 6px" separator-class="bg-grey-5">
            <template v-slot:before>
                <q-splitter v-model="splitterModelVertical" :limits="[50, 50]" horizontal unit="%" separator-style="height: 6px" separator-class="bg-grey-5">
                    <template v-slot:before >
                        <div class="q-pa-sm">
                            <q-bar :class="'no-padding text-primary ' + (userColor=='blackDark'?'bg-grey-9':'bg-white')">
                                <q-btn 
                                    :icon="facturas.length!=selectedFacturas.length?'far fa-square':'fas fa-check-square'"
                                    :title="$q.screen.gt.sm?(facturas.length!=selectedFacturas.length?'Seleccionar Todos':'Limpiar Selección'):''"
                                    no-caps stretch flat
                                    :label="selectedFacturas.length>0?'Seleccionados ' + selectedFacturas.length + ', Saldo: $' + saldoFacturasSeleccionadas():'1.- Seleccione Documentos por Pagar'"
                                    @click="selectAllFacturas" /> <!--:label="$q.screen.gt.sm?(facturas.length!=selectedFacturas.length?'Seleccionar Todos':'Limpiar Selección'):''" -->
                            </q-bar>
                            <q-separator />
                            <q-list v-if="facturas.length>0" separator bordered style="max-height: calc(49vh - 145px); overflow-y: scroll;">
                                <q-item
                                    v-for="(factura, index) in facturas" :key="index" 
                                    clickable v-ripple v-ripple="{ color: 'primary' }"
                                    @click="changeFacturaSelection(factura)">
                                    <q-item-section side>
                                        <q-checkbox :value="selectedFacturas.some(x=>x==factura.ID)" @input="changeFacturaSelection(factura)" dense />
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label 
                                            :class="parametersData&&parametersData.editData&&parametersData.editData.basic&&parametersData.editData.basic.numeroDoc&&parametersData.editData.basic.numeroDoc==factura.numeroDoc?'text-weight-bolder text-positive':'text-weight-bolder'" 
                                            >
                                            {{factura.documentName}} {{factura.numeroDoc}}
                                        </q-item-label>
                                        <q-item-label caption><b>Fecha:</b> {{factura.headerDateName}} </q-item-label>
                                        <q-item-label caption class="ellipsis"><b>Cuenta:</b> {{factura.account_name}}</q-item-label>
                                        
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-item-label><div :class="factura.amountPending>=0?(factura.amountPending==0?'text-weight-bolder text-positive':'text-weight-bolder '):'text-weight-bolder text-red'"><b>Saldo:</b> ${{factura.amountPending.toFixed(2)}}</div></q-item-label>
                                        <!--<q-item-label caption><b>Total:</b> ${{factura.amountTotal.toFixed(2)}}</q-item-label>-->
                                        <q-item-label caption><b>Nuevo:</b> ${{factura.amountNew.toFixed(2)}}</q-item-label>
                                        <q-item-label caption><b>Pendiente:</b> ${{factura.amountUnpaid.toFixed(2)}}  </q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                            <div v-else>
                                <div class="text-primary text-subtitle text-center"><br/>No hay documentos por pagar pendientes<br/><br/></div>
                            </div>
                        </div>
                    </template>
                    <template v-slot:after>
                        <div class="q-pa-sm">
                            <q-bar :class="'no-padding text-primary ' + (userColor=='blackDark'?'bg-grey-9':'bg-white')">
                                <q-btn 
                                    :icon="(pagos.length==0||pagos.length!=selectedPagos.length)?'far fa-square':'fas fa-check-square'"
                                    :title="$q.screen.gt.sm?(pagos.length!=selectedPagos.length?'Seleccionar Todos':'Limpiar Selección'):''"
                                    no-caps no-wrap stretch flat class="ellipsis"
                                    :label="selectedPagos.length>0?'Seleccionados ' + selectedPagos.length + ', Saldo: $' + saldoPagosSeleccionados():'2.- Seleccione Pagos Disponibles'"
                                    @click="selectAllPagos" />
                                <q-space />
                                <q-btn icon="fas fa-plus" :label="$q.screen.gt.sm?'Nuevo Pago':undefined" title="Nuevo Pago" color="primary" flat stretch no-caps no-wrap @click="showCreateNewDialog" />
                                <q-btn icon="fas fa-trash-alt" :label="$q.screen.gt.sm?'Eliminar Pago':undefined" title="Eliminar Pago" color="red" flat stretch no-caps no-wrap @click="eliminarPago"  />
                                <!--:icon-right="facturas.length!=selectedFacturas.length?'fas fa-check-double':'far fa-square'"-->
                            </q-bar>
                            <q-separator />
                            <q-list v-if="pagos.length>0" dense separator bordered style="max-height: calc(49vh - 145px); overflow-y: scroll;">
                                <q-item dense
                                    v-for="(pago, index) in pagos" :key="index"
                                    clickable v-ripple v-ripple="{ color: 'primary' }"
                                    @click="changePagoSelection(pago)">
                                    <q-item-section side>
                                        <q-checkbox :value="selectedPagos.some(x=>x==pago.ID)" @input="changePagoSelection(pago)" dense />
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label class="text-weight-bolder">  
                                            {{pago.documentName}} {{pago.numeroDoc}}
                                            <q-badge v-if="pago.isNew" color="primary" align="middle" rounded outline >
                                                Nuevo<!--<q-icon color="white" name="fas fa-plus" />-->
                                            </q-badge>
                                        </q-item-label>
                                        <q-item-label caption><b>Fecha:</b> {{pago.headerDateName}}</q-item-label>
                                        <q-item-label caption><b>Cuenta:</b> {{pago.line_account_name}}</q-item-label>
                                        
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-item-label><div :class="pago.amountPending>=0?(pago.amountPending==0?'text-positive':'text-primary'):'text-red'"><b>Saldo:</b> ${{pago.amountPending}}</div></q-item-label>
                                        <!--<q-item-label caption><b>Total:</b> ${{pago.amountTotal}}</q-item-label>-->
                                        <q-item-label caption><b>Nuevo:</b> ${{pago.amountNew}}</q-item-label>
                                        <q-item-label caption><b>Pendiente:</b> ${{pago.amountUnpaid}}  </q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                            <div v-else>
                                <div class="text-primary text-subtitle text-center"><br/>No hay pagos disponibles<br/><br/></div>
                            </div>
                        </div>
                    </template>
                </q-splitter>
            </template>
            <template v-slot:after >
                <div class="q-ml-md q-mt-md q-mr-md ">
                
                    <q-card bordered >
                        <q-bar style="border: 1px;" :class="'q-pr-sm no-padding text-primary ' + (userColor=='blackDark'?'bg-grey-9':'bg-white')">
                            <q-btn color="primary" stretch flat size="sm" label="Aplicar" no-caps icon="fas fa-chevron-down" :disable="!(selectedPagos.length>0&&selectedFacturas.length>0)" @click="applyPayment" 
                                title="Aplica el saldo disponibles de los pagos seleccionados, sobre los documentos pendientes de pago" />
                            <q-btn color="red" stretch flat size="sm" label="Eliminar Conciliación" no-caps icon="fas fa-trash-alt" 
                                title="Eliminar las conciliaciones seleccionadas"
                                @click="eliminarConciliaciones" />
                            
                            <q-space />
                            <q-btn color="red" stretch flat size="sm" label="Limpiar Todo" no-caps icon="fas fa-eraser" @click="limpiarPagos" />
                            <q-btn v-if="$q.screen.gt.sm" stretch flat no-caps size="sm" 
                                :label="nuevosPagos.length>0?('Conciliación de Pagos Suma $'+nuevosPagos.reduce((total, row)=>{return total + row.amountNew },0).toFixed(2)):'3.- Conciliación de Pagos'" />
                        </q-bar>
                        <q-separator />

                        <div v-if="nuevosPagos.length > 0">
                            <q-input 
                                ref="headerDate" class="q-ml-md q-mr-md q-mt-md" outlined
                                mask="date" :rules="['date']" hide-bottom-space  square color="primary"
                                placeholder="Ingrese la fecha de Pago (aaaa/mm/dd)" label="Fecha del Asiento Contable de Pago (aaaa/mm/dd)"
                                v-model="headerDate" :title="dateName(headerDate)"
                                >
                                <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer"  color="primary">
                                    <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
                                    <q-date :locale="myQDateLocale" minimal v-model="headerDate" >
                                        <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                        </div>
                                    </q-date>
                                    </q-popup-proxy>
                                </q-icon>
                                </template>
                                <template v-slot:prepend><q-icon name="fas fa-calendar" color="primary" /></template>
                            </q-input>
                            
                            <q-card-section>
                                <q-list  bordered separator style="height: calc(99vh - 350px); overflow-y: scroll; ">
                                    <q-item v-for="(nuevoPago, index) in nuevosPagos" :key="index"  >
                                        <q-item-section side>
                                            <q-checkbox :value="selectedNuevosPagos.some(x=>x==nuevoPago.lineID)" @input="changeNuevoPagoSelection(nuevoPago)" dense :title="nuevoPago.lineID" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label class="text-weight-bolder">{{nuevoPago.facturaDocumentName}} {{nuevoPago.facturaDocumentNumber}}</q-item-label>
                                            <q-item-label caption class="ellipsis"><b>Cuenta:</b> {{nuevoPago.factura_account_name}}</q-item-label>
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label class="text-weight-bolder">{{nuevoPago.pagoDocumentName}} {{nuevoPago.pagoDocumentNumber}}</q-item-label>
                                            <q-item-label caption class="ellipsis"><b>Cuenta:</b> {{nuevoPago.pago_account_name}}</q-item-label>
                                        </q-item-section>
                                        <q-item-section side>
                                            <q-input  dense :value="nuevoPago.amountNew" label="Monto" outlined input-class="text-right" type="number" 
                                                debounce="500" :min="0" style="max-width: 100px;"
                                                @input="(e)=>{
                                                        //actualiza [nuevosPagos]
                                                        nuevosPagos.find(linea=> linea.lineID == nuevoPago.lineID ).amountNew = (e>=0)?parseFloat(parseFloat(e).toFixed(2)):0;
                                                        //actualiza [facturas]
                                                        facturas.find(linea=> linea.ID == nuevoPago.facturaID).amountNew = parseFloat(parseFloat(nuevosPagos.filter(x=>x.facturaID==nuevoPago.facturaID).reduce((total, row)=>{return total + row.amountNew},0)).toFixed(2));
                                                        facturas.map(linea=> { linea.amountPending = parseFloat(parseFloat(linea.amountUnpaid - linea.amountNew).toFixed(2)); return linea;} );
                                                        //actualiza [pagos]
                                                        pagos.find(linea=> linea.ID == nuevoPago.pagoID).amountNew = parseFloat(parseFloat(nuevosPagos.filter(x=>x.pagoID==nuevoPago.pagoID).reduce((total, row)=>{return total + row.amountNew},0)).toFixed(2));
                                                        pagos.map(linea=> { linea.amountPending = parseFloat(parseFloat(linea.amountUnpaid - linea.amountNew).toFixed(2)); return linea;} );
                                                    }"
                                                />
                                        </q-item-section>
                                        <!--<q-item-section side>
                                            <q-btn icon="fas fa-trash-alt" color="red" flat round @click="removePago(nuevoPago)"  />
                                        </q-item-section>-->
                                    </q-item>
                                    <q-separator />
                                </q-list>
                                
                            </q-card-section>
                        </div>
                        <div v-else>
                            <div class="text-primary text-subtitle text-center"><br/>No hay pagos aplicados<br/><br/></div>
                        </div>

                       
                    </q-card>
                </div>
            </template>
        </q-splitter>
        <div v-else>
            <div class="text-primary text-subtitle text-center"><br/>Seleccione un proveedor antes de continuar<br/><br/></div>
        </div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="around">
        <q-btn label="Guardar" icon="fas fa-save" color="primary" @click="saveData" :disable="!(nuevosPagos.length>0 || pagos.filter(x=>x.isNew).length>0 )" />
    </q-card-actions>

    <q-dialog v-model="createNewDialog">
        <paymentsAssistantNew 
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
import paymentsAssistantNew from './paymentsAssistantNew.vue'

import { DxDataGrid, DxColumn, DxMasterDetail, DxSelection, DxScrolling, DxSummary, DxTotalItem, DxEditing } from 'devextreme-vue/data-grid';

export default ({
    components: {
        selectSearchable, DxDataGrid, DxColumn, DxMasterDetail, DxSelection, DxScrolling, DxSummary, DxTotalItem, DxEditing, paymentsAssistantNew: paymentsAssistantNew
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
            ,headerDate: null
            ,pagos: []
            ,selectedPagos: []
            ,facturas: []
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
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                }
            )
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
                this.facturas = JSON.parse(response.data[0].documents)
                this.pagos = JSON.parse(response.data[0].vouchers)
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
        changeFacturaSelection(factura){
            if(this.selectedFacturas.some(x=>x==factura.ID)){
                this.selectedFacturas = this.selectedFacturas.filter(x=>x!=factura.ID)
            }else{
                this.selectedFacturas.push(factura.ID)
            }
        },
        saldoFacturasSeleccionadas(){
            return this.facturas.filter(x=> this.selectedFacturas.some(y=>y==x.ID)).reduce((total, row)=>{return total + row.amountPending},0).toFixed(2)
        },
        changePagoSelection(pago){
            if(this.selectedPagos.some(x=>x==pago.ID)){
                this.selectedPagos = this.selectedPagos.filter(x=>x!=pago.ID)
            }else{
                this.selectedPagos.push(pago.ID)
            }
        },
        saldoPagosSeleccionados(){
            return this.pagos.filter(x=> this.selectedPagos.some(y=>y==x.ID)).reduce((total, row)=>{return total + row.amountPending},0).toFixed(2)
        },
        changeNuevoPagoSelection(nuevoPago){
            if(this.selectedNuevosPagos.some(x=>x==nuevoPago.lineID)){
                this.selectedNuevosPagos = this.selectedNuevosPagos.filter(x=>x!=nuevoPago.lineID)
            }else{
                this.selectedNuevosPagos.push(nuevoPago.lineID)
            }
        },
        selectAllFacturas(){
            if(this.selectedFacturas.length==this.facturas.length){
                this.selectedFacturas = [];
            }else{
                //this.selectedFacturas = this.facturas.map(x=>{this.selectedFacturas.push(x.ID)});
                this.selectedFacturas = this.facturas.map(x=>x.ID);
            }
        },
        selectAllPagos(){
            if(this.selectedPagos.length==this.pagos.length){
                this.selectedPagos = [];
            }else{
                //this.selectedFacturas = this.facturas.map(x=>{this.selectedFacturas.push(x.ID)});
                this.selectedPagos = this.pagos.map(x=>x.ID);
                
            }
        },
        applyPayment(){
            //GetMaxId
            let max_id = 0
            let temp = null
            if(this.nuevosPagos.length > 0){
                temp = this.getMax(this.nuevosPagos, "lineID");
                max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
            }

            let facturas = this.facturas.filter(x=> this.selectedFacturas.some(y=>y==x.ID));
            let pagos = this.pagos.filter(x=> this.selectedPagos.some(y=>y==x.ID));
            console.dir('facturas')
            console.dir(facturas)
            console.dir('pagos')
            console.dir(pagos)
            let internalPartnerID = this.partnerID
            for (var i = 0; i < pagos.length; i++) {
                    for (var j = 0; j < facturas.length; j++) {
                        //if(facturas[j].amountPending > 0){
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
                                    console.dir('Caso 1 en ID ' + max_id + ' con ' + pagos[i].account_name)
                                    this.nuevosPagos.push({
                                        //Header
                                         lineID: max_id
                                        ,partnerID: internalPartnerID
                                        ,headerDate: this.headerDate
                                        //Factura
                                        ,facturaID: facturas[j].ID
                                        ,factura_headerID: facturas[j].headerID
                                        ,factura_accTypeID: facturas[j].accTypeID
                                        ,factura_line_id: 0//porque las facturas NO se parten a diferencia con los pagos
                                        ,factura_account_id: facturas[j].account_id
                                        ,factura_account_name: facturas[j].account_name
                                        ,facturaDocumentName: facturas[j].documentName
                                        ,facturaDocumentNumber: facturas[j].numeroDoc
                                        //Pago
                                        ,pagoID: pagos[i].ID
                                        ,pago_headerID: pagos[i].headerID
                                        ,pago_accTypeID: pagos[i].accTypeID
                                        ,pago_isNew: pagos[i].isNew
                                        ,pago_line_id: pagos[i].lineID
                                        ,pago_account_id: pagos[i].line_account_id
                                        ,pago_account_name: pagos[i].line_account_name
                                        ,pagoDocumentName: pagos[i].documentName
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
                                    console.dir('Caso 2 en ID ' + max_id + ' con ' + pagos[i].account_name)
                                    this.nuevosPagos.push({
                                        //Header
                                        lineID: max_id
                                        ,partnerID: internalPartnerID
                                        ,headerDate: this.headerDate
                                        //Factura
                                        ,facturaID: facturas[j].ID
                                        ,factura_headerID: facturas[j].headerID
                                        ,factura_accTypeID: facturas[j].accTypeID
                                        ,factura_line_id: 0//porque las facturas NO se parten a diferencia con los pagos
                                        ,factura_account_id: facturas[j].account_id
                                        ,factura_account_name: facturas[j].account_name
                                        ,facturaDocumentName: facturas[j].documentName
                                        ,facturaDocumentNumber: facturas[j].numeroDoc
                                        //Pago
                                        ,pagoID: pagos[i].ID
                                        ,pago_headerID: pagos[i].headerID
                                        ,pago_accTypeID: pagos[i].accTypeID
                                        ,pago_isNew: pagos[i].isNew
                                        ,pago_line_id: pagos[i].lineID
                                        ,pago_account_id: pagos[i].line_account_id
                                        ,pago_account_name: pagos[i].line_account_name
                                        ,pagoDocumentName: pagos[i].documentName
                                        ,pagoDocumentNumber: pagos[i].numeroDoc
                                        ,amountNew: valorUsado
                                    })
                                }
                            }
                        }
                    }
                }
        },
        limpiarPagos(){
            this.nuevosPagos = [];
            this.pagos.map(x=>{
                x.amountNew = 0;
                x.amountPending = x.amountUnpaid;
                return x
            })
            this.facturas.map(x=>{
                x.amountNew = 0;
                x.amountPending = x.amountUnpaid;
                return x;
            })
        },
        removePago(pagoEliminar){
            this.nuevosPagos = this.nuevosPagos.filter(x=>x.lineID!=pagoEliminar.lineID)
            //actualiza [facturas]
            this.facturas.find(linea=> linea.ID == pagoEliminar.facturaID).amountNew = parseFloat(parseFloat(this.nuevosPagos.filter(x=>x.facturaID==pagoEliminar.facturaID).reduce((total, row)=>{return total + row.amountNew},0)).toFixed(2));
            this.facturas.map(linea=> { linea.amountPending = parseFloat(parseFloat(linea.amountUnpaid - linea.amountNew).toFixed(2)); return linea;} );
            //actualiza [pagos]
            this.pagos.find(linea=> linea.ID == pagoEliminar.pagoID).amountNew = parseFloat(parseFloat(this.nuevosPagos.filter(x=>x.pagoID==pagoEliminar.pagoID).reduce((total, row)=>{return total + row.amountNew},0)).toFixed(2));
            this.pagos.map(linea=> { linea.amountPending = parseFloat(parseFloat(linea.amountUnpaid - linea.amountNew).toFixed(2)); return linea;} );
        },
        eliminarConciliaciones(){
            //Loop de NUEVO_PAGO que están seleccionados
            this.nuevosPagos.filter(x=> this.selectedNuevosPagos.some(y=>y==x.lineID) ).map(registro=>{
                //Eliminar el NUEVO_PAGO (considerando que function "removePago" se encarga de encerar el pago )
                this.removePago(registro)
            })
            this.selectedNuevosPagos = [];
        },
        showCreateNewDialog(){
            this.initialAmount = parseFloat(this.saldoFacturasSeleccionadas())
            this.createNewDialog = true
        },
        newPaymentClose(data){
            this.createNewDialog = false;
            if(data){
                //GetMaxId
                let max_id = 0
                let temp = null
                if(this.pagos.length > 0){
                    temp = this.getMax(this.pagos, "ID");
                    max_id = parseInt(temp.ID);//no es necesario incrementar en 1, porque lo hace luego 
                }
                
                console.dir('pagos')
                console.dir(this.pagos)
                console.dir()
                if(!(this.pagos.some(x=>x.methodID==data.payment_method_id&&x.numeroDoc==data.numeroDoc))){
                    data.lines.map(linea=>{
                        max_id++;
                        this.pagos.push({
                            ID: max_id
                            ,isNew: true
                            ,accTypeID: 3 /*3 = accTypes.accTypeID = Pago*/
                            ,partnerID: data.partnerID
                            ,methodID: data.payment_method_id
                            ,documentName: this.lookup_payment_methods.find(x=>x.value==data.payment_method_id).paymentTypeName
                            ,numeroDoc: data.numeroDoc
                            ,comments: data.comments
                            ,headerID: max_id
                            ,headerDate: data.headerDate
                            ,headerDateName: this.dateNameList(data.headerDate)
                            ,printDate: data.printDate
                            ,printName: data.printName
                            ,lineID: linea.lineID
                            ,line_account_id: linea.account_id
                            ,line_account_name: linea.account_name
                            ,line_comments: linea.comments
                            ,amountTotal: linea.amount
                            ,amountUnpaid: linea.amount
                            ,amountNew: 0
                            ,amountPending: linea.amount
                        })
                        
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
        eliminarPago(){
            //Loop de los pagos disponibles que están seleccionados
            this.pagos.filter(x=> x.isNew&&this.selectedPagos.some(y=>y==x.ID) ).map(registro=>{
                console.dir('Busco este registro:')
                console.dir(registro)
                //Loop de los NUEVO_PAGO Pagos que pertenezcan al PAGO SELECCIONADO
                this.nuevosPagos.filter(nuevopago=>nuevopago.pagoID==registro.ID).map(eliminar=>{
                    //Eliminar el NUEVO_PAGO (considerando que function "removePago" se encarga de encerar el pago )
                    this.removePago(eliminar)
                })
            })
            //REMUEVO DE LA FILA
            this.pagos = this.pagos.filter(x=> !(x.isNew&&this.selectedPagos.some(y=>y==x.ID)) )
            this.selectedPagos = [];
        },
        saveData(){
            let nuevaData = {
                pagos: this.pagos.filter(x=>x.isNew)
                ,conciliaciones: this.nuevosPagos
            }
            this.$q.loading.show()
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
        } 
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
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    },
    watch: {
        headerDate: function(newValue, oldValue) {
            this.nuevosPagos.map(x=>x.headerDate = newValue)
        }
    },
})
</script>