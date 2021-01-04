<template>
<div>
    <selectSearchable 
        prependIcon="fas fa-hand-holding-usd"
        labelText="Tipo de Pago (*)" labelSearchText="Buscar Tipo de Pago"
        :optionsList="this.lookup_voucherInitialTypes"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="initialTypeID"
        :tableSearchColumns="[
                { name: 'label', label: 'Origen', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.initialTypeID = row.value
                this.clearLines()
            }"
        />
    <q-table
            ref="mainTable"
            :data="lines"
            :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
            table-style="min-height: calc(100vh - 300px); max-height: calc(100vh - 300px)"
            row-key="lineID"
            :separator="userTableLines"
            :rows-per-page-options="[0]"
            hide-bottom dense
            selection="multiple" :selected.sync="selected"
            :filter="filterString"
            :columns="[
            /*{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },*/
            { name: 'line_account_id', required: true, label: 'Cuenta Conable', align: 'left', field: row => row.line_account_id, sortable: true, },
            { name: 'amount', required: true, label: 'Monto', align: 'right', field: row => row.amount, sortable: true, },
            { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true, style:'min-width:200px' },
            { name: 'prjID', required: true, label: 'Obra/Proyecto', align: 'left', field: row => row.prjID, sortable: true },
            //{ name: 'whID', required: true, label: 'Bodega', align: 'right', field: row => row.whID, sortable: true },
            //{ name: 'prjID', required: true, label: 'Centro de Costo?', align: 'right', field: row => row.prjID, sortable: true },
            //{ name: 'transportTypeID', required: true, label: 'Entrega?', align: 'right', field: row => row.transportTypeID, sortable: true },
            ]"
        >

        <template v-slot:body="props">
        <q-tr :props="props" >
            <q-td auto-width>
                <q-checkbox v-model="props.selected" size="md" dense :title="props.row.lineID" />
            </q-td>
            <!--<q-td key="lineID" :props="props">
                {{props.row.lineID}}
            </q-td>-->
            <q-td key="line_account_id" :props="props">
                {{lookup_accounts.filter(x=>x.value==props.row.line_account_id).map(y => {return y.code_es + " - " + y.label}).join("")}}
            </q-td>
            <q-td key="amount" :props="props" class="no-padding" :tabindex="(props.key*10)+2">
                <q-input class="no-padding" style="height: 20px !important;"
                    :value="props.row.amount" type="number" :readonly="(editMode==false)"
                    :min="0" :max="props.row.maxValue?props.row.maxValue:undefined"
                    dense item-aligned borderless input-class="text-right"
                    :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                    debounce="1000" @input="(value)=>{updateRow(value,'amount',props.row)}" />
            </q-td>
            <q-td key="comments" :props="props">
                <q-input class="no-padding" style="height: 20px !important;"
                    :value="props.row.comments" debounce="1000"
                    dense item-aligned borderless
                    @input="(value)=>{updateRow(value,'comments',props.row)}" />
            </q-td>
            <q-td key="prjID" :props="props">{{ props.row.prjName }}</q-td>
        </q-tr>
        </template>
        <template v-slot:top >
            <q-btn :label="$q.screen.gt.sm?'Agregar':''" title="Agregar Cuenta" @click="()=>{isItemsBatchDialog=true}" icon="fas fa-plus" color="primary"  no-caps />
            <q-btn v-if="initialTypeID==1" :label="$q.screen.gt.sm?'Documentos':''" title="Agregar Documentos por Pagar" @click="()=>{isDialogDocs=true}" icon="fas fa-file-invoice-dollar" color="primary" class="q-ml-md"  no-caps />
            <q-btn :label="$q.screen.gt.sm?'Quitar':''" title="Quitar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" class="q-ml-md"  no-caps />
            <!--<q-btn :label="$q.screen.gt.sm?'Centro de Costos':''" title="Cambiar Centro de Costo a líneas seleccionadas" @click="isPrjDialog=true" icon="bookmarks" color="primary" class="q-ml-md" no-caps :disable="selected.length<=0" />-->
            <!--<q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Buscar':''" title="Agregar Varios Servicios" @click="addBatch" icon="fas fa-search-plus" color="primary" no-caps  class="q-ml-sm"/>-->
            
        </template>
        <template v-slot:bottom-row>
            <q-tr>
                <q-td class="text-right text-subtitle2 text-primary">
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary" >
                    Suma:
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary">
                    {{lines.reduce((total,item)=>{return total + item.amount}, 0).toFixed(userMoneyFormat)}}
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary">
                </q-td>
                <q-td></q-td>
            </q-tr>
            <q-tr></q-tr>
        </template>
    </q-table>
    <!--<isAccountComponent v-if="initialTypeID==1||initialTypeID==3" ref="isAccountComponent" @onAccMoveCompute="updateAccountMove" />
    <isDocumentComponent v-if="initialTypeID==2" ref="isDocumentComponent" @onAccMoveCompute="updateAccountMove" />
    -->

    <q-dialog v-model="isItemsBatchDialog" >
        <q-card style="minWidth: 900px;">
            <selectSearchable class="col-12"
                prependIcon="account_tree" autofocus
                labelText="Cuenta Contable (*)" labelSearchText="Buscar Cuenta Contable"
                :optionsList="lookup_accounts"
                rowValueField="value" optionLabelField="label" optionsListCaption="code_es" optionsListLabel="label" 
                optionDisableField="estado"
                :isRequired="false" 
                :isDisable="false" 
                :isReadonly="false"
                :initialValue="account_id_advance"
                :showSelectButton="true"
                :tableSearchColumns="[
                    { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                    ,{ name: 'label', label: 'Cuenta Contable', field: 'label', align: 'left'}
                    ]"
                @onItemSelected="(row)=>{
                    this.addRow(row)
                    }"
            />
        </q-card>
    </q-dialog>

    <q-dialog v-model="isDialogDocs" @show="loadPendingDocs" >
        <q-card style="minWidth: 900px;">
            <q-bar class="bg-primary text-white">
                Buscar Documentos
                <q-space />
                <q-input input-class="text-white" borderless dense debounce="300" autofocus v-model="isDialogDocsFilter" placeholder="Buscar">
                <template v-slot:append>
                    <q-icon v-if="!isDialogDocsFilter" name="fas fa-search" flat round size="xs" color="white" />
                    <q-btn v-if="isDialogDocsFilter" @click="isDialogDocsFilter=''" flat round icon="fas fa-times" size="xs" color="white" />
                </template>
                </q-input>
            </q-bar>
            <q-card-section class="no-padding">
                <q-table
                    ref="itemsSearchTable"
                    :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
                    table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
                    @keydown.native.keyCodes.115="addInvoices(documentsBatchDialogSelected)"
                    :data="lookup_accAP"
                    :columns="[
                        { name: 'tipoComprobanteName', required: true, label: 'Tipo Comprobante', align: 'left', field: row => row.tipoComprobanteName, sortable: true, style: 'max-width: 20px;' },
                        { name: 'numeroDoc', required: true, label: '# Documento', align: 'left', field: row => row.numeroDoc, sortable: true, style: 'min-width: 250px;', },
                        { name: 'headerDate', required: true, label: 'Fecha Documento', align: 'left', field: row => row.headerDate, sortable: true, style: 'min-width: 50px;', },
                        { name: 'amountTotal', required: true, label: 'TOTAL', align: 'right', field: row => row.amountTotal, sortable: true, style: 'min-width: 50px;'},
                        { name: 'amountUnpaid', required: true, label: 'Pendiente', align: 'right', field: row => row.amountUnpaid, sortable: true, style: 'min-width: 50px;'},
                        //{ name: 'amountNew', required: true, label: 'Pagar', align: 'right', field: row => row.amountNew, sortable: true, style: 'min-width: 50px;'},
                    ]"
                    row-key="headerID"
                    :rows-per-page-options="[0]"
                    hide-bottom dense
                    selection="multiple" :selected.sync="documentsBatchDialogSelected"
                    :filter="isDialogDocsFilter"
                    >
                    <template v-slot:body="props">
                        <q-tr :props="props" >
                            <q-td auto-width>
                                <q-checkbox v-model="props.selected" size="md" dense :title="props.row.headerID" />
                            </q-td>
                            <q-td key="tipoComprobanteName" :props="props">
                                {{ props.row.tipoComprobanteName }}
                            </q-td>
                            <q-td key="numeroDoc" :props="props">
                                {{ props.row.numeroDoc }}
                            </q-td>
                            <q-td key="headerDate" :props="props">
                                {{ props.row.headerDate }}
                            </q-td>
                            <q-td key="amountTotal" :props="props">
                                {{ props.row.amountTotal.toFixed(userMoneyFormat) }}
                            </q-td>
                            <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'"  key="amountUnpaid" :props="props">
                                {{ props.row.amountUnpaid.toFixed(userMoneyFormat) }}
                            </q-td>
                        </q-tr>
                    </template>

                    <template v-slot:bottom-row>
                        <q-tr>
                            <q-td>
                            </q-td>
                            <q-td>
                            </q-td>
                            <q-td>
                            </q-td>
                            <q-td class="text-right text-subtitle2 text-primary" >
                                Suma:
                            </q-td>
                            <q-td class="text-right text-subtitle2 text-primary">
                                {{lookup_accAP.reduce((total,item)=>{return total + item.amountTotal}, 0).toFixed(userMoneyFormat)}}
                            </q-td>
                            <q-td class="text-right text-subtitle2 text-primary">
                                {{lookup_accAP.reduce((total,item)=>{return total + item.amountUnpaid}, 0).toFixed(userMoneyFormat)}}
                            </q-td>
                        </q-tr>
                        <q-tr></q-tr>
                    </template>

                </q-table>
            </q-card-section>
            <q-card-actions align="around">
                <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar (F4)" no-caps color="primary" 
                :disable="documentsBatchDialogSelected.length<=0" 
                @click="addInvoices(documentsBatchDialogSelected)" ></q-btn>
            </q-card-actions>
            
            <q-inner-loading :showing="isDialogDocsBusy" style="z-index: 10" >
                <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
        </q-card>
    </q-dialog>

    <!--<q-dialog v-model="isPrjDialog" >
        <q-card style="min-width: 700px;" > 
        <q-bar class="bg-primary text-white">
            Centro de Costo
            <q-space />
            <q-input input-class="text-white" borderless dense debounce="300" autofocus v-model="prjDialogFilter" placeholder="Buscar">
            <template v-slot:append>
                <q-icon v-if="!prjDialogFilter" name="fas fa-search" flat round size="xs" color="white" />
                <q-btn v-if="prjDialogFilter" @click="prjDialogFilter=''" flat round icon="fas fa-times" size="xs" color="white" />
            </template>
            </q-input>
        </q-bar>
        <q-card-section class="no-padding" >
            <q-select
                label="Centro de Costo (*)" placeholder="Seleccione el Centro de Costo que desea utilizar (*)" emit-value map-options filled
                :options="lookup_prj.filter(x=>x.parent==null&&x.estado)" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                :option-disable="opt => !opt.estado" clearable
                v-model="rootPrjIDSelected"
                ref="rootPrjIDSelected"
                
                >
                <template v-slot:prepend><q-icon name="bookmarks" /></template>
            </q-select>
            <q-separator />
            <q-table
                ref="prjSearchTable" square
                :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
                table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
                @keydown.native.keyCodes.115="prjDialogSelectAction(prjDialogSelected)"
                :data="lookup_prj.filter(x=>x.rootID == rootPrjIDSelected)"
                :columns="[
                    //{ name: 'prjID', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
                    { name: 'code_es', required: true, label: 'Código', align: 'left', field: row => row.code_es, sortable: false, style: 'max-width: 75px;', },
                    { name: 'label', required: true, label: 'Descripción', align: 'left', field: row => row.label, sortable: false, style: 'min-width: 250px;', },
                    //{ name: 'row_has_children', required: true, label: 'row_has_children', align: 'left', field: row => row.row_has_children, sortable: true },
                    //{ name: 'row_level', required: true, label: 'row_level', align: 'left', field: row => row.row_level, sortable: false },
                    { name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false },
                ]"
                row-key="value"
                virtual-scroll :rows-per-page-options="[0]"
                hide-bottom dense
                selection="single" :selected.sync="prjDialogSelected"
                :filter="prjDialogFilter"
                >
                <template v-slot:body-cell-label="props">
                    <q-td :props="props">
                    <div :class="props.row.row_has_children?'text-bold':''">{{ '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(props.row.row_level) + props.value }}</div>
                    </q-td>
                </template>
                <template v-slot:body-cell-estado="props">
                    <q-td :props="props">
                    <q-checkbox :value="props.value" color="primary" dense size="sm" />
                    </q-td>
                </template>
            </q-table>
        </q-card-section>
        <q-card-actions align="around">
            <q-btn  flat label="Cancelar (ESC)" no-caps color="primary" @click="isPrjDialog=false" />
            <q-btn icon-right="fas fa-check-circle" label="Seleccionar (F4)" no-caps color="primary" 
            :disable="(prjDialogSelected.length<=0||prjDialogSelected[0].row_has_children||prjDialogSelected[0].estado==false)" 
            @click="prjDialogSelectAction(prjDialogSelected)"
            />
        </q-card-actions>
        </q-card>
    </q-dialog>-->
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
//import isAccountComponent from './accVoucherOutEditLinesAccounts'
//import isDocumentComponent from './accVoucherOutEditLinesDocs'
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    components: {
        selectSearchable: selectSearchable
        /*isAccountComponent: isAccountComponent
        ,isDocumentComponent: isDocumentComponent*/
    },
    data () {
        return {
            moduleName: "accVoucherOut"
            ,selected: [], filterString: ''
            ,isItemsBatchDialog: false
            ,isPrjDialog: false, prjDialogFilter: '', prjDialogSelected: [], prjDialogTableBusy: false, rootPrjIDSelected: null, prjIDSelected: null
            ,isDialogDocs: false, isDialogDocsBusy: false, isDialogDocsFilter: '', documentsBatchDialogSelected: []
            //,isPartnerDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            //,xmlFile: null
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
    mounted(){
        //this.$refs.formulario.validate()
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
        addRow(row){
            try{
                if(row&&row.value){
                    this.$q.loading.show()
                    let newLineID = 0
                    if(this.lines.length > 0){
                        let temp = this.getMax(this.lines, "lineID");
                        newLineID = parseInt(temp.lineID);
                    }
                    let newRows = JSON.parse(JSON.stringify(this.lines))
                    newLineID++;
                    let nuevaFila = {
                         lineID: newLineID
                        ,line_account_id: row.value
                        ,amount: 0
                        ,comments: ''
                        ,prjID: 0
                        //dummy for informative docs
                        ,initialAccTypeID: null
                        ,initialAccTypeName: null
                        ,initialAccHeaderID: null
                        ,maxValue: null
                        //,docAccTypeID: null
                        //,docHeaderID: null
                        //,docAmountTotal: null
                        //,docAmountUnpaid: null
                        //,docDate: null
                        //,docNum: null
                        //,docComporbante: null
                    }
                    newRows.push(nuevaFila)
                    this.lines = newRows
                    this.isItemsBatchDialog=false;
                    this.$q.loading.hide()
                    this.$emit('onAccMoveCompute')
                }    
            }catch(ex){
                console.dir(ex)
                this.$q.loading.hide()  
            }
        },
        updateRow(newVal, colName, row){
            try{
            this.$q.loading.show()
            let newRows = JSON.parse(JSON.stringify(this.lines))
            let newReconciliation = JSON.parse(JSON.stringify(this.reconciliation))
            let newReconciliationLines = JSON.parse(JSON.stringify(this.reconciliationLines))
            newRows.filter(x=>x.lineID==row.lineID).map(result=>{
                if(colName=="amount"){
                result[colName] = parseFloat(newVal);
                }else{
                result[colName] = newVal;
                }
                return result
            })
            newReconciliation.filter(x=>x.detailsLineID==row.lineID).map(result=>{
                if(colName=="amount"){
                    result[colName] = parseFloat(newVal);
                }else{
                    result[colName] = newVal;
                }
                return result
            })
            newReconciliationLines.map(result=>{
                result.amount = newReconciliation.find(m=>m.headerID==result.headerID).amount
                return result
            })
            
            this.lines = newRows;
            this.reconciliation = newReconciliation;
            this.reconciliationLines = newReconciliationLines;

            this.$q.loading.hide()
            this.$emit('onAccMoveCompute')
            }catch(ex){
            console.error(ex)
            this.$q.loading.hide()
            }
        },
        removeRows(){
            if(this.selected.length > 0){
                this.$q.dialog({ 
                    title: 'Confirmación'
                    ,message: 'Desea quitar las líneas seleccionadas?'
                    ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true }
                    ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
                }
                ).onOk(() => {
                    //Líneas
                    let newRows = JSON.parse(JSON.stringify(this.lines))
                    let newReconciliation = JSON.parse(JSON.stringify(this.reconciliation))
                    let newReconciliationLines = JSON.parse(JSON.stringify(this.reconciliationLines))
                    this.selected.map(row=>{
                        newRows = newRows.filter(x=>x.lineID!=row.lineID);
                        newReconciliation = newReconciliation.filter(x=>x.detailsLineID!=row.lineID)
                    })
                    
                    newReconciliationLines = newReconciliationLines.filter(x=> newReconciliation.some(y=>y.headerID==x.headerID))
                    
                    this.lines = newRows;
                    this.reconciliation = newReconciliation;
                    this.reconciliationLines = newReconciliationLines;

                    this.selected = []//limpia selección para evitar problema de referencia a filas que no existan
                    this.$emit('onAccMoveCompute')
                })
            }
        },
        loadPendingDocs(){
            this.isDialogDocsBusy = true
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spAccvoucherOutSelectaccAP',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    partnerID: this.partnerID
                }
            }).then((response) => {
                this.lookup_accAP = response.data
                this.isDialogDocsBusy = false;
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
                this.isDialogDocsBusy = false;
            })
        },
        addInvoices(rows){
            try{
                this.$q.loading.show()
                let newLineID = 0
                if(this.lines.length > 0){
                    let temp = this.getMax(this.lines, "lineID");
                    newLineID = parseInt(temp.lineID);
                }
                let newReconciliationID = 0
                if(this.reconciliation.length > 0){
                    let temp = this.getMax(this.reconciliation, "headerID");
                    newReconciliationID = parseInt(temp.headerID);
                }
                let newRows = JSON.parse(JSON.stringify(this.lines))
                let newReconciliations = JSON.parse(JSON.stringify(this.reconciliation))
                let newReconciliationLines = JSON.parse(JSON.stringify(this.reconciliationLines))
                rows.map(row=>{
                    if(!(newRows.some(x=>x.initialAccHeaderID==row.headerID&&x.initialAccTypeID==row.accTypeID))){//compara si ya existe la factura en este pago
                        newLineID++;
                        newReconciliationID++;
                        console.dir('row')
                        console.dir(row)
                        //Agrega Líneas al Documento
                        let nuevaFila = {
                             lineID: newLineID
                            ,line_account_id: row.account_id
                            ,amount: row.amountUnpaid
                            ,comments: row.tipoComprobanteName + ' ' + row.numeroDoc
                            ,prjID: 0
                            ,initialAccTypeID: row.accTypeID
                            ,initialAccTypeName: row.accTypeName
                            ,initialAccHeaderID: row.headerID
                            ,maxValue: row.amountUnpaid
                        }
                        newRows.push(nuevaFila)

                        //#region Agrega Conciliaciones
                            //Build Date
                            let fecha = new Date()
                            let fechaTimeOffset = (fecha.getTimezoneOffset())
                            if(fechaTimeOffset>0){//positivo entonces resto
                                fecha = date.subtractFromDate(fecha, {minutes: fechaTimeOffset} )
                            }else{//negativo entonces sumo
                                fecha = date.addToDate(fecha, {minutes: (fechaTimeOffset*-1)} )
                            }
                            let nuevaConciliacion = {
                                uploaded: false
                                ,headerID: newReconciliationID
                                ,headerDate: date.formatDate(fecha,'YYYY/MM/DD')//get current date in user pc (exact date no matter timezone)
                                ,headerUser: this.userName + ' ' + this.userLastName
                                ,amount: row.amountUnpaid
                                ,voided: false
                                ,detailsLineID: newLineID//para poder tener una sincronización entre las líneas y las conciliaciones
                            }
                            newReconciliations.push(nuevaConciliacion)

                            let tempAccHeaderNumeroDoc = ''
                            this.lookup_accPaymentMethods.filter(x=>x.value==this.methodID).map(y=> {
                                tempAccHeaderNumeroDoc = y.label + ' - ' + this.numeroDoc;
                            })
                            //Agrega Detalle de Conciliaciones (Este Pago)
                            newReconciliationLines.push({
                                headerID: newReconciliationID
                                ,lineID: 1//va quemado
                                ,accTypeID: 3//va quemado 3=Pago
                                ,accHeaderID: this.editRecord&&this.editRecord.row&&this.editRecord.row.headerID_ux?this.editRecord.row.headerID_ux:0//nuevo pago, pero debería ir el ID
                                ,accHeaderNumeroDoc: tempAccHeaderNumeroDoc
                                ,account_id: row.account_id//aquí viene la cuenta del Documento que se está conciliando
                                ,amount: row.amountUnpaid
                                ,isDebit_isCredit: false//true=Debit, false=Credit > como es la línea del Pago (plata que sale)
                            })
                            //Agrega Detalle de Conciliaciones (Documento)
                            newReconciliationLines.push({
                                headerID: newReconciliationID
                                ,lineID: 2
                                ,accTypeID: row.accTypeID//accTypeID del documento de la Cuenta x Pagar
                                ,accHeaderID: row.headerID//headerID del documento de la Cuenta x Pagar
                                ,accHeaderNumeroDoc: row.tipoComprobanteName + ' ' + row.numeroDoc
                                ,account_id: row.account_id
                                ,amount: row.amountUnpaid
                                ,isDebit_isCredit: true//true=Debit, false=Credit > como es la línea del Documento (plata que entra)
                            })
                        //#endregion
                    }
                })
                this.lines = newRows;
                this.reconciliation = newReconciliations;
                this.reconciliationLines = newReconciliationLines;
                this.isDialogDocs=false;
                this.$q.loading.hide()
                this.selected = []
                this.$emit('onAccMoveCompute')
            }catch(ex){
                console.dir(ex)
                this.$q.loading.hide()  
            }
        },
        updateAccountMove(){
            //como este componente "contiene" a 2 subcomponentes
            //entonces simplemente re-emite el evento hacia accVoucherOutEdit
            //que es donde SÍ se actualiza asiento contable
            this.$emit('onAccMoveCompute')
        },
        clearLines(){
            this.lines = []
            this.reconciliation = []
            this.reconciliationLines = []
            this.$emit('onAccMoveCompute')
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userCompanies: { get () { return this.$store.state.main.userCompanies } },
        userName: { get () { return this.$store.state.main.userName } },
        userLastName: { get () { return this.$store.state.main.userLastName } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        editRecord: {
            get () { return this.$store.state[this.moduleName].editRecord },
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
        },
        methodID: {
            get () { return this.$store.state[this.moduleName].editData.basic.methodID },
        },
        initialTypeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.initialTypeID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'initialTypeID', value: val}) }
        },
        account_id_advance: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id_advance },
        },
        reconciliation: {
          get () { return this.$store.state[this.moduleName].editData.reconciliation },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataReconciliation', val) }
        },
        reconciliationLines: {
          get () { return this.$store.state[this.moduleName].editData.reconciliationLines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataReconciliationLines', val) }
        },
        lookup_accAP: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accAP },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData_lookup_accAP', val) }
        },
        numeroDoc: {
            get () { return this.$store.state[this.moduleName].editData.basic.numeroDoc },
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        lookup_prj: {
            get () { return this.$store.state[this.moduleName].editData.lookup_prj },
        },
        lookup_accTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accTypes },
        },
        lookup_accPaymentMethods: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accPaymentMethods },
        },
        lookup_voucherInitialTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_voucherInitialTypes },
        },
    },
})
</script>
