<template>
<q-card style="min-width: calc(100vw - 50px); max-height: calc(99vh)">
    <q-toolbar class="q-pr-none bg-primary text-white">
        <div class="q-mr-lg text-h6">Asistente de Retenciones</div>
        <q-space />
        <q-btn flat stretch icon="fas fa-times" @click="closeThisDialog" />
    </q-toolbar>
    <q-stepper keep-alive v-model="step" ref="stepper" color="primary" animated dense v-if="this.lookup_sys_companies_locations.length>0">
        <q-step :name="1" title="1. Datos Básico" icon="fas fa-info" active-icon="fas fa-info" :done="step > 1">
            <div style="height: calc(100vh - 266px);">
                <selectSearchable 
                    :square="false" :isDense="true"
                    prependIcon="fas fa-store"
                    labelText="Establecimiento donde se emite la Retención (*)" labelSearchText="Buscar Establecimiento"
                    :optionsList="this.lookup_sys_companies_locations" borderless
                    rowValueField="value" optionsListLabel="label"  optionDisableField="estado"
                    :isRequired="true" 
                    :isDisable="false" 
                    :isReadonly="false"
                    :initialValue="sys_location_id"
                    :tableSearchColumns="[
                            { name: 'label', label: 'Establecimiento', field: 'label', align: 'left'}
                        ]"
                    @onItemSelected="(row)=>{
                            this.sys_location_id=row.value;
                            //Pre-selecciona Punto de Emisión y Número de Documento Sugerido
                            console.dir('estoy aquí')
                            if(this.lookup_sys_companies_locations_pos.length>0){
                                //recupera el primer POS del establecimiento
                                this.sys_location_pos_id = this.lookup_sys_companies_locations_pos.find(x=>x.sys_location_id==this.sys_location_id&&x.estado).value
                                //recupera el número sugerido del POS
                                this.numeroDoc = this.lookup_sys_companies_locations_pos.find(x=>x.sys_location_id==this.sys_location_id).suggestedNumberRetencion
                                //trata de incrementar la secuencia
                                if(!isNaN(this.numeroDoc)){
                                    this.numeroDoc = '0000000000' + (parseInt(this.numeroDoc)+1).toString();
                                    this.numeroDoc = this.numeroDoc.slice(-9)
                                }
                            }
                            //Resetea selección del grid del paso 2, y variable a guardar
                            this.retentionsDetails = [];
                            if(this.$refs.dxgrid){this.$refs.dxgrid.instance.clearSelection()}
                        }"
                    />
                <selectSearchable 
                    :square="false" :isDense="true"
                    prependIcon="fas fa-list"
                    labelText="Punto de Emisión donde se emite la Retención (*)" labelSearchText="Buscar Punto de Emisión" optionsListCaption="esElectronicaName"
                    :optionsList="this.lookup_sys_companies_locations_pos.filter(x=>x.sys_location_id==sys_location_id)" borderless
                    rowValueField="value" optionsListLabel="label"  optionDisableField="estado"
                    :isRequired="true" 
                    :isDisable="!(sys_location_id>0)"
                    :isReadonly="false"
                    :initialValue="sys_location_pos_id"
                    :tableSearchColumns="[
                            { name: 'label', label: 'Punto de Emisión', field: 'label', align: 'left'}
                        ]"
                    @onItemSelected="(row)=>{
                            //recupera el primer POS del establecimiento
                            this.sys_location_pos_id=row.value;
                            //recupera el número sugerido del POS
                            this.numeroDoc = row.suggestedNumberRetencion;
                            //trata de incrementar la secuencia
                            if(!isNaN(this.numeroDoc)){
                                this.numeroDoc = '0000000000' + (parseInt(this.numeroDoc)+1).toString();
                                this.numeroDoc = this.numeroDoc.slice(-9)
                            }
                            this.retentionsDetails = [];
                            if(this.$refs.dxgrid){this.$refs.dxgrid.instance.clearSelection()}
                        }"
                    />
                <q-input 
                    v-model="numeroDoc" dense
                    placeholder="Ingrese el Secuencial del Documento (*)" label="Secuencial de la Retención(*)" filled
                    filled 
                    mask="#########"
                        :rules="[
                            val => !!val || '* Requerido',
                        ]"
                        
                        @input="()=>{
                            this.retentionsDetails = [];
                            if(this.$refs.dxgrid){this.$refs.dxgrid.instance.clearSelection()}
                        }"
                    >
                    <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
                </q-input>
                <q-input
                    ref="headerDate" dense
                    mask="date" :rules="['date']" 
                    placeholder="Ingrese la fecha de Retención (aaaa/mm/dd)" label="Fecha de Retención (aaaa/mm/dd) (*)" filled
                    v-model="headerDate" :title="dateName(headerDate)"
                    >
                    <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
                        <q-date :locale="myQDateLocale" minimal v-model="headerDate" >
                            <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                            </div>
                        </q-date>
                        </q-popup-proxy>
                    </q-icon>
                    </template>
                    <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
                </q-input>
                <selectSearchable 
                            prependIcon="fas fa-handshake" :isDense="true"
                            labelText="Proveedor(*)" labelSearchText="Buscar Proveedor"
                            :optionsList="this.lookup_partners"
                            rowValueField="value" optionsListLabel="label" optionsListCaption="partner_ruc"
                            :isRequired="true" 
                            :isDisable="((parametersData&&parametersData.editData&&parametersData.editData.basic&&parametersData.editData.basic.partnerID)?true:false)" 
                            :isReadonly="false"
                            :initialValue="((parametersData&&parametersData.editData&&parametersData.editData.basic&&parametersData.editData.basic.partnerID)?parametersData.editData.basic.partnerID:undefined)"
                            :tableSearchColumns="[
                                    { name: 'label', label: 'Proveedor', field: 'label', align: 'left'}
                                    ,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
                                ]"
                            @onItemSelected="(row)=>{
                                this.partnerID=row.value;
                                this.payment_account_id = row.accPaymentOutcomeAdvance;
                                this.loadPartnerDocuments();
                                }"
                            />
                <selectSearchable 
                    prependIcon="fas fa-sign-in-alt fa-rotate-180" :isDense="true" 
                    labelText="Cuenta del Pago de Retención(*)" labelSearchText="Cuenta Contable del Pago de Retención"
                    :optionsList="lookup_accounts"
                    rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" optionDisableField="estado"
                    :isRequired="true" 
                    :isDisable="false" 
                    :isReadonly="false"
                    :initialValue="payment_account_id"
                    :tableSearchColumns="[
                            { name: 'label', label: 'Proveedor', field: 'label', align: 'left'}
                            ,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
                        ]"
                    @onItemSelected="(row)=>{
                            //console.dir(row)
                            //this.account_id_invoice=row.account_id_invoice;
                            this.payment_account_id=row.value;
                            
                            //let temp = this.lookup_accounts.find(x=>x.value==this.payment_account_id)
                            this.payment_account_name = row.code_es + ' - ' + row.label
                            //this.$emit('onAccMoveCompute')
                            //this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
                        }"
                    />
            </div>
        </q-step>
        <q-step :name="2" title="2. Selección de Documentos" icon="fas fa-file-invoice-dollar" active-icon="fas fa-file-invoice-dollar" :done="step > 2">
            <DxDataGrid
                style="margin: -24px;" 
                ref="dxgrid"
                key="maindatagrid"
                height="calc(100vh - 218px)"
                column-resizing-mode="widget"
                :data-source="documentos"
                :allow-column-resizing="true" 
                :allow-column-reordering="true"
                :show-borders="true"
                :show-column-lines="userTableLinesDXcols"
                :show-row-lines="userTableLinesDXrows"
                key-expr="headerID"
                @selection-changed="onSelectionChanged"
                >
                <DxScrolling mode="virtual"  rowRenderingMode="virtual" columnRenderingMode="virtual" :useNative="true" showScrollbar="always" />
                <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="single" :deferred="false" /><!--:deferred="false" hace que el customTotalCalculate busque por key-->
                <DxPaging :enabled="false" /> 
                <DxColumn  caption="Documento" data-field="numeroDoc" name="numeroDoc" cell-template="cellTemplateDocumentName" :allow-editing="false" alignment="left" :minWidth="50" width="50%"  :visible="true"  />
                <template #cellTemplateDocumentName="{ data }" >
                    <div
                        v-if="parametersData&&parametersData.editData&&parametersData.editData.basic&&parametersData.editData.basic.numeroDoc&&parametersData.editData.basic.numeroDoc==data.data.numeroDoc"
                        class="text-positive" style="margin-left: -15px;"
                    >
                        <q-item dense>
                            <q-item-section>
                                <q-item-label>{{data.data.tipoComprobanteName}} {{data.data.numeroDoc}}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </div>
                    <div v-else style="margin-left: -15px;">
                        <q-item dense>
                            <q-item-section>
                                <q-item-label>{{data.data.tipoComprobanteName}} {{data.data.numeroDoc}}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </div>
                </template>
                <DxColumn caption="Fecha Doc." data-field="headerDateName" name="headerDateName" data-type="string" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="true" />
                <DxColumn caption="Fecha Pago" data-field="dueDateName" name="dueDateName" data-type="string" :allow-editing="false" alignment="left" :minWidth="50" :width="120" :visible="true" />
                <DxColumn caption="Total" data-field="amountTotal" name="amountTotal" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="true" :format="userMoneyFormat" />
                <DxColumn caption="Pagado" data-field="amountPaid" name="amountPaid" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="true" :format="userMoneyFormat" />
                <DxColumn caption="Saldo" data-field="amountUnpaid" name="amountUnpaid" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="true" :format="userMoneyFormat" />
                <DxColumn caption="Retenciones" data-field="amountRetenciones" name="amountRetenciones" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="110" :visible="true" :format="userMoneyFormat" />
            </DxDataGrid>
        </q-step>
        <q-step :name="3" title="3. Ajustes y Confirmación" icon="fas fa-percent" :done="step > 2" style="height: calc(100vh - 217px)">
            <DxDataGrid
                style="margin: -24px;" 
                ref="dxgridFinal"
                key="maindatagridFinal"
                height="calc(100vh - 218px)"
                column-resizing-mode="widget"
                :data-source="retentionsDetails"
                :allow-column-resizing="true" 
                :allow-column-reordering="true"
                :show-borders="true"
                :show-column-lines="userTableLinesDXcols"
                :show-row-lines="userTableLinesDXrows"
                key-expr="lineID"
                >
                <DxScrolling mode="virtual"  rowRenderingMode="virtual" columnRenderingMode="virtual" :useNative="true" showScrollbar="always" />
                <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="false" /><!--:deferred="false" hace que el customTotalCalculate busque por key-->
                <DxPaging :enabled="false" /> 
                <DxEditing :allow-updating="true" mode="cell" :useIcons="false" :select-text-on-edit-start="true" start-edit-action="click" /> <!-- me gustan: cell, row, popup, batch mejora rendimiento pero NO calcula en línea y muestra un toolbar extra -->
                
                <DxColumn  caption="Documento" data-field="accAPdocumentType" name="accAPdocumentType" cell-template="cellTemplateDocumentName" :allow-editing="false" alignment="left" :minWidth="50" :width="220"  :visible="true"  />
                <template #cellTemplateDocumentName="{ data }" >
                    <q-item dense class="no-padding">
                        <q-item-section>
                            <q-item-label>{{data.data.accAPdocumentType}} {{data.data.accAPnumeroDoc}}</q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
                <DxColumn caption="Sustento" data-field="sustentoShortName" name="sustentoShortName" data-type="string" :allow-editing="false" alignment="left" :minWidth="50" :width="250" :visible="true" />
                <DxColumn caption="Subtotal" data-field="lineSubtotal" name="lineSubtotal" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="true" :format="userMoneyFormat" />
                <DxColumn caption="Impuesto" data-field="taxID" name="taxID" data-type="number" :allow-editing="true" alignment="left" :minWidth="50" :width="250" :visible="true" :editor-options="{ opened: true }"
                    :set-cell-value="(newData, value, currentRowData)=>{
                        newData.taxID = value;
                        let nuevoTax = lookup_taxes.find(x=>x.value==value);
                        newData.tax_account_id = nuevoTax.account_id;
                        newData.factor = nuevoTax.factor;
                        newData.factor_base = nuevoTax.factor_base;
                        newData.printName = nuevoTax.printName;
                        newData.baseImponible = (currentRowData.lineSubtotal * nuevoTax.factor_base);
                        newData.valorRetenido = nuevoTax.isPercent?(parseFloat(currentRowData.lineSubtotal * nuevoTax.factor_base * nuevoTax.factor))  :  (parseFloat(nuevoTax.factor));
                    }" >
                    <DxLookup value-expr="value" display-expr="short_name_es" :data-source="lookup_taxes" :opened="true" />
                </DxColumn>
                <!--calculate-display-value hace que DxLookup NO se use mientras no se esté editando la celda, y eso mejora rendimiento según devexpress
                <DxColumn caption="Sustento Tributario" data-field="sustentoID" name="sustentoID" data-type="string" :allow-editing="true" alignment="left" :minWidth="200" calculate-display-value="sustentoName" :editor-options="{ opened: true }"> 
                -->
                <DxColumn caption="Cuenta HABER" data-field="tax_account_id" name="tax_account_id" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="false" />
                <DxColumn caption="Cuenta DEBE" data-field="paymentOutcome_account_id" name="paymentOutcome_account_id" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="false" />
                <DxColumn caption="factor" data-field="factor" name="factor" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="false" :format="userMoneyFormat" />
                <DxColumn caption="factor_base" data-field="factor_base" name="factor_base" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="false" :format="userMoneyFormat" />
                <DxColumn caption="Base Imponible" data-field="baseImponible" name="baseImponible" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="130" :visible="true" :format="userMoneyFormat" />
                <DxColumn caption="% Retención" data-field="printName" name="printName" data-type="string" :allow-editing="false" alignment="center" :minWidth="50" :width="110" :visible="true" />
                <DxColumn caption="Valor Retenido" data-field="valorRetenido" name="valorRetenido" data-type="number" :allow-editing="false" alignment="right" :minWidth="50"  :visible="true" :format="userMoneyFormat" />
                <DxSummary>
                    <DxTotalItem column="valorRetenido" summary-type="sum" ><DxValueFormat type="#.00" /> </DxTotalItem>
                </DxSummary>
            </DxDataGrid>
        </q-step>
        <template v-slot:navigation>
            <!--<q-stepper-navigation>-->
            <q-separator />
            <q-toolbar class="no-padding">
                <!--@click="showCreateNewDialog"-->
                <q-btn v-if="step === 3" icon="fas fa-plus" :label="$q.screen.gt.sm?'Agregar Retención':undefined" title="Agregar Retención" color="primary" flat stretch  no-caps no-wrap @click="dialogAddRetencionLines = true" />
                <q-btn v-if="step === 3" icon="fas fa-trash-alt" :label="$q.screen.gt.sm?'Eliminar líneas seleccionadas':undefined" title="Eliminar Líneas" color="red" flat stretch  no-caps no-wrap @click="deleteFromRetentionsDetails" />
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

    <q-dialog v-model="dialogAddRetencionLines" @show="()=>{
            let documentosSeleccionados = $refs.dxgrid.instance.getSelectedRowsData();
            selectedDocuments = documentosDetails.filter(x=>(documentosSeleccionados.some(y=>y.headerID==x.headerID))  )
        }">
        <q-card>
            <DxDataGrid
                ref="dxgridListaRetenciones"
                key="maindatagridListaRetenciones"
                height="250"
                column-resizing-mode="widget"
                :data-source="selectedDocuments"
                :allow-column-resizing="true" 
                :allow-column-reordering="true"
                :show-borders="true"
                :show-column-lines="userTableLinesDXcols"
                :show-row-lines="userTableLinesDXrows"
                key-expr="rowID"
                >
                <DxScrolling mode="virtual"  rowRenderingMode="virtual" columnRenderingMode="virtual" :useNative="true" showScrollbar="always" />
                <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="false" /><!--:deferred="false" hace que el customTotalCalculate busque por key-->
                <DxPaging :enabled="false" /> 
                <DxColumn  caption="Documento" data-field="numeroDoc" name="numeroDoc" :allow-editing="false" alignment="left" :minWidth="50" width="50%"  :visible="true"  />
                <DxColumn  caption="Sustento" data-field="sustentoShortName" name="sustentoShortName" :allow-editing="false" alignment="left" :minWidth="50" :width="250"  :visible="true"  />
                <DxColumn caption="Subtotal" data-field="totalUntaxed" name="totalUntaxed" data-type="number" :allow-editing="false" alignment="right" :minWidth="50" :width="90" :visible="true" :format="userMoneyFormat" />
            </DxDataGrid>
            <q-card-actions align="around">
                <q-btn icon="fas fa-plus" label="Agregar Líneas" no-caps color="primary" @click="addDialogSelectedLines" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</q-card>
</template>
<script>
import selectSearchable from '../selectSearchable/selectSearchable.vue'
import { DxDataGrid, DxColumn, DxSelection, DxEditing, DxLookup, DxScrolling, DxValueFormat, DxFormat, DxPaging, DxSummary, DxTotalItem } from 'devextreme-vue/data-grid';
import { date } from 'quasar';

export default ({
    components: {
        selectSearchable
        ,DxDataGrid, DxColumn, DxSelection, DxEditing, DxLookup, DxScrolling, DxValueFormat, DxFormat, DxPaging, DxSummary, DxTotalItem
    },
    props: {
        parametersData: { type: Object, required: false },
    },
    data(){
        return {
            step: 1
            ,dialogAddRetencionLines: false, selectedDocuments: []
            ,headerDate: null
            ,lookup_sys_companies_locations: []
            ,lookup_sys_companies_locations_pos: []
            ,lookup_partners: []
            ,lookup_taxes: []
            ,lookup_accounts: []
            ,sys_location_id: 0
            ,sys_location_pos_id: 0
            ,payment_account_id: 0
            ,numeroDoc: ''
            ,ambiente: 0
            ,partnerID: 0
            ,retentionsDetails: []
            //selection and Lookups data
            ,documentos: []
            ,documentosDetails: []
            ,lookup_sustentos: []
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
    created(){
        //Asigna Fecha Actual para Nuevo Asiento
        const yourDate = new Date();
        this.headerDate = (yourDate.toISOString().split('T')[0]).replace(/-/g,'/');
        
        this.loadBasicData();
    },
    methods:{
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            }
            )
        },
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
        nextSaveButtonClick(){
            if(this.step < 3){
                if(this.step==1){
                    if(this.$refs.dxgrid){
                        this.$refs.dxgrid.instance.clearSelection();
                    }
                }
                this.$refs.stepper.next()
            }else{
                //console.dir(this.documentos)
                //console.dir(this.retentionsDetails)
                if(this.retentionsDetails.length>0){
                    this.saveData();
                }else{
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "No hay nada por guardar. Usted no ha registrado retenciones."
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white', } ]
                    })
                }
            }
        },
        loadBasicData(){
            this.$q.loading.show()
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spAccRetOutAssistant',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    //editMode: this.editStatus.editMode=='create'?true:false
                }
            }).then((response) => {
                this.lookup_sys_companies_locations = JSON.parse(response.data[0].lookup_sys_companies_locations)
                this.lookup_sys_companies_locations_pos = JSON.parse(response.data[0].lookup_sys_companies_locations_pos)
                this.lookup_partners = JSON.parse(response.data[0].lookup_partners)
                this.lookup_taxes = JSON.parse(response.data[0].lookup_taxes)
                this.lookup_accounts = JSON.parse(response.data[0].lookup_accounts)
                //Pre-Selecciona los primeros registros de ESTABLECIMIENTO y PUNTOEMISION
                if(this.lookup_sys_companies_locations.filter(e=>e.estado).length > 0){
                    this.sys_location_id = this.lookup_sys_companies_locations.filter(e=>e.estado)[0].value//preselecciono el primero
                    if(this.lookup_sys_companies_locations_pos.find(x=>x.sys_location_id==this.sys_location_id&&x.estado)){
                        this.sys_location_pos_id = this.lookup_sys_companies_locations_pos.find(x=>x.sys_location_id==this.sys_location_id&&x.estado).value
                        //recupera el número sugerido del POS
                        this.numeroDoc = this.lookup_sys_companies_locations_pos.find(x=>x.sys_location_id==this.sys_location_id).suggestedNumberRetencion
                        //trata de incrementar la secuencia
                        if(!isNaN(this.numeroDoc)){
                            this.numeroDoc = '0000000000' + (parseInt(this.numeroDoc)+1).toString();
                            this.numeroDoc = this.numeroDoc.slice(-9)
                        }
                    }
                }
                if(this.parametersData&&this.parametersData.editData&&this.parametersData.editData.basic&&this.parametersData.editData.basic.partnerID){
                    this.partnerID = this.parametersData.editData.basic.partnerID;
                    this.payment_account_id = this.lookup_partners.find(x=>x.value==this.partnerID).accPaymentOutcomeAdvance;
                }
                this.$q.loading.hide()
                this.loadPartnerDocuments();
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
        loadPartnerDocuments(){
            if(this.partnerID&&this.partnerID>0){
                this.$q.loading.show()
                this.$axios({
                    method: 'GET',
                    url: this.apiURL + 'spAccRetOutAssistantDocsByPartner',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        userLanguage: 'es',
                        partnerID: this.partnerID,
                    }
                }).then((response) => {
                    this.documentos = JSON.parse(response.data[0].documentos);
                    this.documentosDetails = JSON.parse(response.data[0].documentosDetails);
                    this.lookup_sustentos = JSON.parse(response.data[0].lookup_sustentos);
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
        onSelectionChanged(e) {
            //encera variable global
            this.retentionsDetails = []
            //Recupera Filas Seleccionadas
            e.component.refresh(true);
            let selectedRows = e.component.getSelectedRowsData();
            //GetMaxId
            let max_id = 0
            let temp = null
            if(this.retentionsDetails.length > 0){
                temp = this.getMax(this.retentionsDetails, "lineID");
                max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
            }
            //Barre filas seleccionadas e inserta las líneas de los sustentos correspondientes
            let numeroDocCompleto = this.lookup_sys_companies_locations.find(x=>x.value==this.sys_location_id).location_code
            numeroDocCompleto = numeroDocCompleto + this.lookup_sys_companies_locations_pos.find(x=>x.sys_location_id==this.sys_location_id&&x.value==this.sys_location_pos_id).pos_code
            numeroDocCompleto = numeroDocCompleto + this.numeroDoc

            selectedRows.map(selectedRow=>{
                this.documentosDetails.filter(x=>x.headerID==selectedRow.headerID).map(lineaSustento=>{
                    max_id++;
                    let nuevo = {
                        partnerID: this.partnerID
                        ,sys_location_id: this.sys_location_id
                        ,sys_location_pos_id: this.sys_location_pos_id
                        ,headerDate: this.headerDate
                        ,numeroDoc: this.numeroDoc
                        ,numeroDocCompleto: numeroDocCompleto
                        ,ambiente: this.lookup_sys_companies_locations_pos.find(x=>x.sys_location_id==this.sys_location_id&&x.value==this.sys_location_pos_id).ambiente
                        ,accAPheaderID: lineaSustento.headerID
                        ,accAPheaderDate: lineaSustento.headerDate
                        ,accAPdocumentType: selectedRow.tipoComprobanteName
                        ,accAPnumeroDoc: selectedRow.numeroDoc
                        ,lineID: max_id
                        ,sustentoID: lineaSustento.sustentoID
                        ,sustentoShortName: lineaSustento.sustentoShortName
                        ,taxID: 0
                        ,tax_account_id: 0//va al HABER (normalmente es una cuenta [Retención de IVA, Retennción de Fuente] )
                        ,paymentOutcome_account_id: this.payment_account_id//selectedRow.accPaymentOutcomeAdvance//va al DEBE (normalmente es una cuenta [Anticipo a Proveedores])
                        ,factor: 0
                        ,factor_base: 0
                        ,printName: ''
                        ,lineSubtotal: lineaSustento.totalUntaxed
                        ,baseImponible: 0
                        ,valorRetenido: 0
                    }
                    this.retentionsDetails.push(nuevo)
                })
            })
        },
        deleteFromRetentionsDetails(){
            let selectedRows = this.$refs.dxgridFinal.instance.getSelectedRowsData();
            this.retentionsDetails = this.retentionsDetails.filter(x=> !(selectedRows.some(y=>y.lineID==x.lineID))  );//Devuelve  [TODO lo NO seleccionado]
        },
        addDialogSelectedLines(){
            //Recupera Filas Seleccionadas
            let selectedRows = this.$refs.dxgridListaRetenciones.instance.getSelectedRowsData();
                //GetMaxId
                let max_id = 0
                let temp = null
                if(this.retentionsDetails.length > 0){
                    temp = this.getMax(this.retentionsDetails, "lineID");
                    max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
                }
                //Barre filas seleccionadas e inserta las líneas de los sustentos correspondientes
                let numeroDocCompleto = this.lookup_sys_companies_locations.find(x=>x.value==this.sys_location_id).location_code
                numeroDocCompleto = numeroDocCompleto + this.lookup_sys_companies_locations_pos.find(x=>x.sys_location_id==this.sys_location_id&&x.value==this.sys_location_pos_id).pos_code
                numeroDocCompleto = numeroDocCompleto + this.numeroDoc
                        
                        //accAPdocumentType accAPnumeroDoc

                selectedRows.map(selectedRow=>{
                    //this.documentosDetails.filter(x=>x.headerID==selectedRow.headerID).map(lineaSustento=>{
                    this.documentosDetails.filter(x=>x.rowID==selectedRow.rowID).map(lineaSustento=>{
                        max_id++;
                        let nuevo = {
                            partnerID: this.partnerID
                            ,sys_location_id: this.sys_location_id
                            ,sys_location_pos_id: this.sys_location_pos_id
                            ,headerDate: this.headerDate
                            ,numeroDoc: this.numeroDoc
                            ,numeroDocCompleto: numeroDocCompleto
                            ,ambiente: this.lookup_sys_companies_locations_pos.find(x=>x.sys_location_id==this.sys_location_id&&x.value==this.sys_location_pos_id).ambiente
                            ,accAPheaderID: lineaSustento.headerID
                            ,accAPheaderDate: lineaSustento.headerDate
                            ,accAPdocumentType: selectedRow.tipoComprobanteName
                            ,accAPnumeroDoc: selectedRow.numeroDoc
                            ,lineID: max_id
                            ,sustentoID: lineaSustento.sustentoID
                            ,sustentoShortName: lineaSustento.sustentoShortName
                            ,taxID: 0
                            ,tax_account_id: 0//va al HABER (normalmente es una cuenta [Retención de IVA, Retennción de Fuente] )
                            //,paymentOutcome_account_id: selectedRow.accPaymentOutcomeAdvance//va al DEBE (normalmente es una cuenta [Anticipo a Proveedores])
                            ,paymentOutcome_account_id: this.payment_account_id//selectedRow.accPaymentOutcomeAdvance//va al DEBE (normalmente es una cuenta [Anticipo a Proveedores])
                            ,factor: 0
                            ,factor_base: 0
                            ,printName: ''
                            ,lineSubtotal: lineaSustento.totalUntaxed
                            ,baseImponible: 0
                            ,valorRetenido: 0
                        }
                        this.retentionsDetails.push(nuevo)
                    })
                })

                this.dialogAddRetencionLines = false;
        },
        saveData(){
            //en allDocs, no debe existir ningún registro que amountPending sea menor a 0 (no importa si es factura o pago)
            try{
                this.$q.loading.show()

                let nuevaData = {
                    //,conciliaciones: this.nuevosPagos
                    retentionsDetails: this.retentionsDetails
                }

                //POST data to server
                //this.$axios.post( this.apiURL + 'spAccRETAsistantUpdate', {
                this.$axios.post( this.apiURL + 'spAccRetOutAsistantUpdate', {    
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        row_id: 0,
                        editRecord: JSON.stringify(nuevaData),
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
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        userTableLinesDXcols: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='vertical'){ result = true }
                return result
            } 
        },
        userTableLinesDXrows: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='horizontal'){ result = true }
                return result
            } 
        },
    }
})
</script>