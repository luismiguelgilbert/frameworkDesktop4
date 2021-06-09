<template>
<q-card style="min-width: calc(100vw - 100px); max-height: calc(99vh)">
    <q-toolbar class="q-pr-none bg-primary text-white">
        <div class="q-mr-lg text-h6">Asistente de Pagos</div>
        <q-space />
        <q-btn flat stretch icon="fas fa-times" @click="closeThisDialog" />
    </q-toolbar>
    <q-card-section style="max-height: calc(99vh - 120px); overflow-y: auto;" class="no-padding">
        <selectSearchable 
            :square="true"
            prependIcon="fas fa-handshake"
            labelText="Proveedor(*)" labelSearchText="Buscar Proveedor"
            :optionsList="this.lookup_partners" borderless
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
                    this.printName=row.label;
                    this.account_id_invoice=row.account_id_invoice;
                    this.account_id_advance=row.account_id_advance;
                    this.partnerName=row.label;//usado en el asiento contable, en la línea de proveedor (campo comentario), 

                    //this.partner_account_id=row.account_id
                    this.$emit('onAccMoveCompute')
                }"
            />
            
        <q-splitter v-model="splitterModel" unit="%" style="height: calc(99vh - 185px); " separator-style="width: 6px" separator-class="bg-grey-5">
            <template v-slot:before>
                <q-splitter v-model="splitterModelVertical" horizontal unit="%" separator-style="height: 6px" >
                    <template v-slot:before>
                        <q-bar :class="'no-padding text-primary ' + (userColor=='blackDark'?'bg-grey-9':'bg-white')">
                            <q-btn 
                                :icon="facturas.length!=selectedFacturas.length?'far fa-square':'fas fa-check-square'"
                                :title="$q.screen.gt.sm?(facturas.length!=selectedFacturas.length?'Limpiar Selección':'Seleccionar Todos'):''"
                                no-caps stretch flat 
                                @click="selectAllFacturas" /> <!--:label="$q.screen.gt.sm?(facturas.length!=selectedFacturas.length?'Seleccionar Todos':'Limpiar Selección'):''" -->
                            <q-space />
                            <q-btn v-if="$q.screen.gt.sm"  stretch flat no-caps size="sm" align="left"
                                :label="selectedFacturas.length>0?'Seleccionados ' + selectedFacturas.length + ', Saldo: $' + saldoFacturasSeleccionadas():'1.- Seleccione Documentos por Pagar'"
                                /><!--icon="fas fa-shopping-cart"-->
                            
                        </q-bar>
                        <q-separator />
                        <q-list dense separator >
                            <q-item
                                v-for="(factura, index) in facturas" :key="index" dense
                                clickable v-ripple v-ripple="{ color: 'primary' }"
                                @click="changeFacturaSelection(factura)">
                                <q-item-section side>
                                    <q-checkbox :value="selectedFacturas.some(x=>x==factura.ID)" @input="changeFacturaSelection(factura)" dense />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{factura.documentName}} {{factura.documentNumber}}</q-item-label>
                                    <q-item-label caption>{{factura.fecha}}</q-item-label>
                                    <q-item-label caption><b>Total:</b> ${{factura.amountTotal}}</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-item-label caption><b>Pendiente:</b> ${{factura.amountUnpaid}}  </q-item-label>
                                    <q-item-label caption><b>Nuevo:</b> ${{factura.amountNew}}</q-item-label>
                                    <q-item-label><div :class="factura.amountPending>=0?(factura.amountPending==0?'text-positive':'text-primary'):'text-red'"><b>Saldo:</b> ${{factura.amountPending}}</div></q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                        <q-separator />
                    </template>
                    <template v-slot:after>
                        <q-bar :class="'no-padding text-primary ' + (userColor=='blackDark'?'bg-grey-9':'bg-white')">
                            <q-btn 
                                :icon="pagos.length!=selectedPagos.length?'far fa-square':'fas fa-check-square'"
                                :title="$q.screen.gt.sm?(facturas.length!=selectedFacturas.length?'Limpiar Selección':'Seleccionar Todos'):''"
                                no-caps stretch flat 
                                @click="selectAllPagos" /> <!--:label="$q.screen.gt.sm?(facturas.length!=selectedFacturas.length?'Seleccionar Todos':'Limpiar Selección'):''" -->
                            <q-space />
                            <q-btn v-if="$q.screen.gt.sm" stretch flat no-caps size="sm"
                                :label="selectedPagos.length>0?'Seleccionados ' + selectedPagos.length + ', Saldo: $' + saldoPagosSeleccionados():'2.- Seleccione Pagos Disponibles'"
                                />
                            <!--:icon-right="facturas.length!=selectedFacturas.length?'fas fa-check-double':'far fa-square'"-->
                        </q-bar>
                        <q-separator />
                        <q-list dense separator>
                            <q-item dense
                                v-for="(pago, index) in pagos" :key="index"
                                clickable v-ripple v-ripple="{ color: 'primary' }"
                                @click="changePagoSelection(pago)">
                                <q-item-section side>
                                    <q-checkbox :value="selectedPagos.some(x=>x==pago.ID)" @input="changePagoSelection(pago)" dense />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{pago.documentName}} {{pago.documentNumber}}</q-item-label>
                                    <q-item-label caption>{{pago.fecha}}</q-item-label>
                                    <q-item-label caption><b>Total:</b> ${{pago.amountTotal}}</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-item-label caption><b>Pendiente:</b> ${{pago.amountUnpaid}}  </q-item-label>
                                    <q-item-label caption><b>Nuevo:</b> ${{pago.amountNew}}</q-item-label>
                                    <q-item-label><div :class="pago.amountPending>=0?(pago.amountPending==0?'text-positive':'text-primary'):'text-red'"><b>Saldo:</b> ${{pago.amountPending}}</div></q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                        <q-separator />
                    </template>
                </q-splitter>
            </template>
            <template v-slot:after >
                <div >
                    <q-bar :class="'q-pr-sm no-padding text-primary ' + (userColor=='blackDark'?'bg-grey-9':'bg-blue-1')">
                        <q-btn v-if="$q.screen.gt.sm" icon="fas fa-dollar-sign" stretch flat no-caps size="sm" label="3.- Detalle de Pagos a Aplicar" />
                        
                        <q-space />
                        <q-btn color="primary" stretch size="sm" text-color="white" label="Aplicar" no-caps icon="fas fa-chevron-down" :disable="!(selectedPagos.length>0&&selectedFacturas.length>0)" @click="applyPayment" />
                        <q-btn icon="fas fa-plus" label="Nuevo Pago" flat stretch no-caps  />
                        
                    </q-bar>
                    <q-separator />
                    <q-input 
                        ref="headerDate" class="q-ml-sm q-mr-md" dense borderless style=""
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
                    
                    <q-separator />
                    <q-list  separator>
                        <q-item v-for="(pago, index) in nuevosPagos" :key="index">
                            <q-item-section>
                                <q-item-label>{{pago.facturaDocumentName}}</q-item-label>
                                <q-item-label caption>{{pago.facturaDocumentNumber}}</q-item-label>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{pago.pagoDocumentName}}</q-item-label>
                                <q-item-label caption>{{pago.pagoDocumentNumber}}</q-item-label>
                            </q-item-section>
                            <q-item-section>
                                <q-input borderless v-model="pago.amountNew" label="Monto" />
                            </q-item-section>
                            <q-item-section side>
                                <q-btn icon="fas fa-trash-alt" color="red" flat round  />
                            </q-item-section>
                        </q-item>
                    </q-list>

                    <div v-if="nuevosPagos.length > 0">
                    <q-separator />
                    <q-item class="bg-primary text-white">
                        <q-item-section>
                            <q-item-label>Pagos {{nuevosPagos.length}}</q-item-label>
                        </q-item-section>
                        <q-item-section>
                        </q-item-section>
                        <q-item-section >
                            <q-item-label>{{nuevosPagos.reduce((total, row)=>{return total + row.amountNew },0).toFixed(2)}}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    </div>
                    
                </div>
            </template>
         </q-splitter>
    </q-card-section>
    <q-separator />
    <q-card-actions align="around">
        <q-btn label="Guardar" icon="fas fa-save" color="primary" @click="$emit('onClose')" />
    </q-card-actions>
</q-card>

    <!--<q-page-container class="no-padding" >
        <q-splitter v-model="splitterModel" unit="%" style="height: calc(80vh - 100px); margin-top: 50px;" separator-style="width: 6px">
            <template v-slot:before  >
                <div>
                    <q-bar :class="'no-padding text-primary ' + (userColor=='blackDark'?'bg-grey-9':'bg-white')">
                        <q-btn v-if="$q.screen.gt.sm" icon="fas fa-money-check-alt"  stretch flat no-caps 
                            :label="selectedPagos.length>0?'Seleccionados ' + selectedPagos.length + ', Saldo: $' + selectedPagos.reduce((total, row)=>{return total + row.amountPending},0).toFixed(2) :'Seleccione Pagos Disponibles'"
                            />
                        <q-space />
                        <q-btn icon-right="fas fa-chevron-right" label="Aplicar" stretch flat :disable="!(selectedPagos.length>0)" @click="applyPayment" />
                    </q-bar>
                    <q-separator />
                    <DxDataGrid
                        ref="paymentsGrid"
                        :show-borders="false"
                        :data-source="pagos"
                        key-expr="ID"
                        :allow-column-resizing="true" :allow-column-reordering="true"
                        @selection-changed="onPagosSelectionChanged"
                        height="calc(80vh - 134px)"
                        @cell-prepared="(e) => { 
                                if (e.rowType == 'data' && e.column.name == 'amountPending' ){
                                    e.cellElement.style.color = e.value < 0 ? 'red' : '#21BA45';
                                }
                            }"
                        >
                        <DxScrolling mode="virtual"/>
                        <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="true" />
                        <DxColumn :allow-reordering="false" data-field="documentName" caption="Tipo"  width="70" />
                        <DxColumn :allow-reordering="false" data-field="documentNumber" caption="# Doc" alignment="left"  width="100"/>
                        <DxColumn :allow-reordering="false" data-field="fecha" caption="Fecha" width="110" />
                        <DxColumn :allow-reordering="false" data-field="amountTotal" caption="Total" :visible="allColumns" />
                        <DxColumn :allow-reordering="false" data-field="amountPaid" caption="Pagado" :visible="allColumns" />
                        <DxColumn :allow-reordering="false" data-field="amountUnpaid" caption="Disponible" />
                        <DxColumn :allow-reordering="false" data-field="amountNew" caption="Usar" />
                        <DxColumn :allow-reordering="false" data-field="amountPending" caption="Saldo" />

                        <DxSummary>
                            <DxTotalItem column="documentName" summary-type="count" display-format="{0}" />
                            <DxTotalItem column="amountUnpaid" summary-type="sum" :customizeText="formatSummaryMoney" />
                            <DxTotalItem column="amountNew" summary-type="sum" :customizeText="formatSummaryMoney" />
                            <DxTotalItem column="amountPending" summary-type="sum" :customizeText="formatSummaryMoney" />
                        </DxSummary>

                    </DxDataGrid>
                </div>
            </template>
            <template v-slot:after >
                <div>
                    <q-bar :class="'no-padding text-primary ' + (userColor=='blackDark'?'bg-grey-9':'bg-white')">
                        <q-btn v-if="$q.screen.gt.sm" icon="fas fa-shopping-cart" stretch flat no-caps 
                            :label="selectedFacturas.length>0?'Seleccionados ' + selectedFacturas.length + ', Saldo: $' + selectedFacturas.reduce((total, row)=>{return total + row.amountPending},0).toFixed(2) :'Seleccione Documentos por Pagar'"
                            />
                        <q-space />
                        <q-btn :icon="autoExpandAllDetails?'fas fa-chevron-left':'fas fa-chevron-right'" 
                                :label="autoExpandAllDetails?'Contraer Lista':'Expandir Lista'" 
                                flat stretch no-caps @click="autoExpandAllDetails=!autoExpandAllDetails" />
                        <q-btn icon-right="fas fa-eraser" label="Limpiar Pagos" stretch flat @click="limpiarPagos" />
                    </q-bar>

                    <q-separator />
                    <DxDataGrid
                        ref="gridMasterFacturas"
                        :show-borders="false"
                        :data-source="facturas"
                        key-expr="ID"
                        height="calc(80vh - 134px)"
                        column-resizing-mode="widget" :allow-column-resizing="true" :allow-column-reordering="true"
                        @selection-changed="onFacturasSelectionChanged"
                        @cell-prepared="(e) => { 
                                if (e.rowType == 'data' && e.column.name == 'amountPending' ){
                                    e.cellElement.style.color = e.value < 0 ? 'red' : '#21BA45';
                                }
                            }"
                        >
                        <DxScrolling mode="virtual"/>
                        <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="true" />
                        <DxColumn :allow-reordering="false" data-field="documentName" caption="Tipo" width="70" />
                        <DxColumn :allow-reordering="false" data-field="documentNumber" caption="# Doc" width="140" />
                        <DxColumn :allow-reordering="false" data-field="fecha" caption="Fecha" width="95" />
                        <DxColumn :allow-reordering="false" data-field="amountTotal" caption="Total" :visible="allColumns" />
                        <DxColumn :allow-reordering="false" data-field="amountPaid" caption="Pagado" :visible="allColumns"  />
                        <DxColumn :allow-reordering="false" data-field="amountUnpaid" caption="Pendiente"  width="75" />
                        <DxColumn :allow-reordering="false" data-field="amountNew" caption="Nuevo" width="75"/>
                        <DxColumn :allow-reordering="false" data-field="amountPending" caption="Saldo" width="75"/>

                        <DxMasterDetail :enabled="true" template="masterDetailTemplate" :autoExpandAll="autoExpandAllDetails" />
                        <template #masterDetailTemplate="{ data: factura }" >
                            <div v-if="nuevosPagos.filter(x=>x.facturaID==factura.data.ID).length>0" class="q-ml-xl" >
                                <div class="text-primary">Nuevos Pagos de Documento: {{factura.data.documentNumber}}</div>
                                <DxDataGrid
                                    ref="gridDetailsFacturas"
                                    :show-borders="false"
                                    :data-source="nuevosPagos.filter(x=>x.facturaID==factura.data.ID)"
                                    :allow-column-resizing="true" :allow-column-reordering="true"
                                    @row-updated="onRowUpdated"
                                    @row-removed="onRowRemoved"
                                    >
                                    <DxScrolling mode="virtual"/>
                                    <DxEditing :allow-updating="true" :allow-deleting="true" mode="cell" :useIcons="false" :select-text-on-edit-start="true" start-edit-action="click" />

                                    <DxColumn :allow-reordering="false" data-field="documentName" caption="Tipo" :allow-editing="false" />
                                    <DxColumn :allow-reordering="false" data-field="documentNumber" caption="# Doc" :allow-editing="false" />
                                    <DxColumn :allow-reordering="false" data-field="amountNew" caption="Monto" :allow-editing="true" />

                                </DxDataGrid>
                            </div>
                            <div v-else>No hay nuevos pagos</div>
                        </template>

                        <DxSummary>
                            <DxTotalItem column="amountUnpaid" summary-type="sum" :customizeText="formatSummaryMoney"  />
                            <DxTotalItem column="amountNew" summary-type="sum" :customizeText="formatSummaryMoney"  />
                            <DxTotalItem column="amountPending" summary-type="sum" :customizeText="formatSummaryMoney"  />
                        </DxSummary>
                    </DxDataGrid>
                </div>
            </template>
        </q-splitter>
    </q-page-container>
</q-layout>
    -->

</template>
<script>
import { date } from 'quasar';
//import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import selectSearchable from '../selectSearchable/selectSearchable.vue'

import { DxDataGrid, DxColumn, DxMasterDetail, DxSelection, DxScrolling, DxSummary, DxTotalItem, DxEditing } from 'devextreme-vue/data-grid';

export default ({
    components: {
        selectSearchable, DxDataGrid, DxColumn, DxMasterDetail, DxSelection, DxScrolling, DxSummary, DxTotalItem, DxEditing
    },
    data(){
        return {
            router: this.$router
            ,splitterModel: 40
            ,splitterModelVertical: 50
            ,headerDate: null
            ,pagos: []
            ,selectedPagos: []
            ,facturas: []
            ,selectedFacturas: []
            ,nuevosPagos: []
            ,autoExpandAllDetails: false
            ,allColumns: false
            ,pagosData: []
            ,lookup_partners: []
            //,initial: []
            ,partnerID: 0
            ,myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            }
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
        loadPendingInvoices(){
            this.facturas.push({
                ID: 1
                ,parent: null
                ,documentName: 'Factura'
                ,documentNumber: '001003000001239'
                ,fecha: '22 Abr 2021'
                ,amountTotal: 90.34
                ,amountPaid: 0
                ,amountUnpaid: 90.34
                ,amountNew: 0
                ,amountPending: 90.34
            })
            this.facturas.push({
                ID: 2
                ,parent: null
                ,documentName: 'Factura'
                ,documentNumber: '001003000001316'
                ,fecha: '25 Abr 2021'
                ,amountTotal: 810.34
                ,amountPaid: 0
                ,amountUnpaid: 810.34
                ,amountNew: 0
                ,amountPending: 810.34
            })
            this.facturas.push({
                ID: 3
                ,parent: null
                ,documentName: 'Factura'
                ,documentNumber: '001003000001861'
                ,fecha: '29 Abr 2021'
                ,amountTotal: 810.34
                ,amountPaid: 0
                ,amountUnpaid: 810.34
                ,amountNew: 0
                ,amountPending: 810.34
            })
            
            let i
            for(i=0; i<=50; i++){
                this.pagos.push({
                    ID: i
                    ,documentName: 'Cheque'
                    ,documentNumber: 875 + i
                    ,fecha: '25 Abr 2021'
                    ,amountTotal: 100.05 + i
                    ,amountPaid: 0
                    ,amountUnpaid: 100.05 + i
                    ,amountNew: 0
                    ,amountPending: 100.05 + i
                })
            }
            
            
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
                                    this.nuevosPagos.push({
                                        lineID: max_id
                                        ,facturaID: facturas[j].ID
                                        ,pagoID: pagos[i].ID
                                        ,facturaDocumentName: facturas[j].documentName
                                        ,facturaDocumentNumber: facturas[j].documentNumber
                                        ,pagoDocumentName: pagos[i].documentName
                                        ,pagoDocumentNumber: pagos[i].documentNumber
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
                                        lineID: max_id
                                        ,facturaID: facturas[j].ID
                                        ,pagoID: pagos[i].ID
                                        ,facturaDocumentName: facturas[j].documentName
                                        ,facturaDocumentNumber: facturas[j].documentNumber
                                        ,pagoDocumentName: pagos[i].documentName
                                        ,pagoDocumentNumber: pagos[i].documentNumber
                                        ,amountNew: valorUsado
                                    })
                                }
                            }
                        }
                    }
                }
                //Refresh grids > Hace que totales se re-calculen
                //this.$refs['paymentsGrid'].instance.refresh();
                //this.$refs['gridMasterFacturas'].instance.refresh();

            /*
            let pagos;
            let promesaPagos = this.$refs['paymentsGrid'].instance.getSelectedRowsData();
            let facturas;
            let promesaFacturas = this.$refs['gridMasterFacturas'].instance.getSelectedRowsData();
            //GetMaxId
            let max_id = 0
            let temp = null
            if(this.nuevosPagos.length > 0){
                temp = this.getMax(this.nuevosPagos, "lineID");
                max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
            }

            Promise.all([promesaPagos, promesaFacturas]).then((values) => {
                pagos = values[0].filter(x=>x.amountPending > 0);
                facturas = values[1].filter(x=>x.amountPending > 0);
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
                                    this.nuevosPagos.push({
                                        lineID: max_id
                                        ,facturaID: facturas[j].ID
                                        ,pagoID: pagos[i].ID
                                        ,documentName: pagos[i].documentName
                                        ,documentNumber: pagos[i].documentNumber
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
                                        lineID: max_id
                                        ,facturaID: facturas[j].ID
                                        ,pagoID: pagos[i].ID
                                        ,documentName: pagos[i].documentName
                                        ,documentNumber: pagos[i].documentNumber
                                        ,amountNew: valorUsado
                                    })
                                }
                            }
                        }
                    }
                }
                //Refresh grids > Hace que totales se re-calculen
                this.$refs['paymentsGrid'].instance.refresh();
                this.$refs['gridMasterFacturas'].instance.refresh();
            });
        */},
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
            //Refresh grids > Hace que totales se re-calculen
            this.$refs['paymentsGrid'].instance.refresh();
            this.$refs['gridMasterFacturas'].instance.refresh();
        },
        formatSummaryMoney(e){
            let resultado = '$ 0.00'
            try{
                resultado = '$ ' + e.value.toFixed(2)
            }catch(ex){

            }
            return resultado
        },
        onRowUpdated(e){
            //Actualiza el monto correspondiente de la Factura
            let factura = this.facturas.find(factura=>factura.ID == e.data.facturaID)
            let nuevoValorFactura = this.nuevosPagos.filter(pago=>pago.facturaID == e.data.facturaID).reduce((total, row)=>{return total + row.amountNew},0)
            factura.amountNew =  parseFloat(parseFloat(nuevoValorFactura).toFixed(2))
            factura.amountPending = parseFloat(parseFloat(factura.amountUnpaid - factura.amountNew).toFixed(2))
            //Actualiza el monto correspondiente del Pago
            let pago = this.pagos.find(pago=>pago.ID == e.data.pagoID)
            let nuevoValorPago = this.nuevosPagos.filter(pago=>pago.pagoID == e.data.pagoID).reduce((total, row)=>{return total + row.amountNew},0)
            pago.amountNew =  parseFloat(parseFloat(nuevoValorPago).toFixed(2))
            pago.amountPending = parseFloat(parseFloat(pago.amountUnpaid - pago.amountNew).toFixed(2))
            //Refresh grids > Hace que totales se re-calculen
            this.$refs['paymentsGrid'].instance.refresh();
            this.$refs['gridMasterFacturas'].instance.refresh();
        },
        onRowRemoved(e){
            this.nuevosPagos = this.nuevosPagos.filter(x=>x.lineID != e.data.lineID)
            //Reversa el monto correspondiente del Pago
            let pago = this.pagos.find(pago=>pago.ID == e.data.pagoID)
            pago.amountNew =  parseFloat(parseFloat(pago.amountNew - e.data.amountNew).toFixed(2))
            pago.amountPending = parseFloat(parseFloat(pago.amountUnpaid - pago.amountNew).toFixed(2))
            //Reversa el monto correspondiente de la Factura
            let factura = this.facturas.find(factura=>factura.ID == e.data.facturaID)
            factura.amountNew =  parseFloat(parseFloat(factura.amountNew - e.data.amountNew).toFixed(2))
            factura.amountPending = parseFloat(parseFloat(factura.amountUnpaid - factura.amountNew).toFixed(2))
            //Refresh grids > Hace que totales se re-calculen
            this.$refs['paymentsGrid'].instance.refresh();
            this.$refs['gridMasterFacturas'].instance.refresh();
        },
    },
    created(){
        //Asigna Fecha Actual para Nuevo Asiento
        const yourDate = new Date();
        this.headerDate = (yourDate.toISOString().split('T')[0]).replace(/-/g,'/');
        //loadPendingInvoices
        this.loadPendingInvoices();
    },
    computed:{
        console: () => console,
        userColor: { get () { return this.$store.state.main.userColor }  },
    }
})
</script>