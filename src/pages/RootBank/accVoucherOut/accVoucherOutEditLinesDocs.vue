<template>
<div>
    <q-table
            ref="mainTable"
            :data="lines"
            :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
            table-style="min-height: calc(100vh - 230px); max-height: calc(100vh - 230px)"
            row-key="lineID"
            :separator="userTableLines"
            :rows-per-page-options="[0]"
            hide-bottom dense
            selection="multiple" :selected.sync="selected"
            :filter="filterString"
            :columns="[
                { name: 'delete', required: true, label: '', align: 'left', field: row => null, sortable: true },
                { name: 'docComprobante', required: true, label: 'Tipo Comprobante', align: 'left', field: row => row.docComprobante, sortable: true, },
                { name: 'docNum', required: true, label: '# Documento', align: 'left', field: row => row.docNum, sortable: true,  },
                { name: 'docDate', required: true, label: 'Fecha Documento', align: 'left', field: row => row.docDate, sortable: true, },
                { name: 'docAmountTotal', required: true, label: 'TOTAL', align: 'right', field: row => row.docAmountTotal, sortable: true, },
                { name: 'docAmountUnpaid', required: true, label: 'Pendiente', align: 'right', field: row => row.docAmountUnpaid, sortable: true, },
                { name: 'amount', required: true, label: 'Pagar', align: 'right', field: row => row.amount, sortable: true, style: 'min-width: 150px;'},
                { name: 'openAmount', required: true, label: 'Saldo', align: 'right', field: row => row.openAmount, sortable: true, style: 'min-width: 100px;' },
                { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true, style: 'min-width: 300px;' },
                
            ]"
        >

        <template v-slot:body="props">
            <q-tr :props="props" >
                <q-td auto-width>
                    <q-checkbox v-model="props.selected" size="md" dense :title="props.row.lineID" />
                </q-td>
                <q-td key="delete" :props="props" >
                    <q-btn color="red" icon="fas fa-trash-alt" flat dense size="sm" @click="deleteRow(props.row)" />
                </q-td>
                <q-td key="docComprobante" :props="props" >
                    {{props.row.docComprobante}}
                </q-td>
                <q-td key="docNum" :props="props" >
                    {{props.row.docNum}}
                </q-td>
                <q-td key="docDate" :props="props" :title="dateName(props.row.docDate)" >
                    {{props.row.docDate}}
                </q-td>
                <q-td key="docAmountTotal" :props="props">
                    <!--{{ props.row.amountTotal.toFixed(userMoneyFormat) }}-->
                    {{ props.row.docAmountTotal }}
                </q-td>
                <q-td  key="docAmountUnpaid" :props="props">
                    {{ props.row.docAmountUnpaid }}
                </q-td>
                <q-td key="amount" :props="props" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :tabindex="(props.key*10)+2">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.amount" type="number" :min="0" :readonly="(editMode==false)"
                        dense item-aligned borderless input-class="text-right"
                        :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                        min="0" :max="props.row.docAmountUnpaid"
                        debounce="1000" @input="(value)=>{updateRow(value,'amount',props.row)}" />
                </q-td>
                <q-td  key="openAmount" :props="props">
                    {{ parseFloat(props.row.docAmountTotal - props.row.amount).toFixed(6) }}
                </q-td>
                <q-td key="comments" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.comments" debounce="1000"
                        dense item-aligned borderless
                        @input="(value)=>{updateRow(value,'comments',props.row)}" />
                </q-td>
            </q-tr>
        </template>
        <template v-slot:top >
            <q-btn :label="$q.screen.gt.sm?'Documentos':''" title="Agregar Documentos por Pagar" @click="()=>{isDialogDocs=true}" icon="fas fa-file-invoice-dollar" color="primary"  no-caps />
            <q-btn :label="$q.screen.gt.sm?'Pagar':''" title="Paga completamente líneas seleccionadas" @click="paySelectedRows" icon="far fa-check-square" color="primary" class="q-ml-md"  no-caps :disable="selected.length<=0" />
            <q-btn :label="$q.screen.gt.sm?'Limpiar':''" title="Resetea a $0 líneas seleccionadas" @click="clearSelectedRows" icon="fas fa-broom" color="primary" class="q-ml-md"  no-caps :disable="selected.length<=0" />
            <!--<q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Buscar':''" title="Agregar Varios Servicios" @click="addBatch" icon="fas fa-search-plus" color="primary" no-caps  class="q-ml-sm"/>-->
            
        </template>
        <template v-slot:bottom-row>
            <q-tr>
                <q-td>
                </q-td>
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
                    {{lines.reduce((total,item)=>{return total + item.docAmountTotal}, 0).toFixed(userMoneyFormat)}}
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary">
                    {{lines.reduce((total,item)=>{return total + item.docAmountUnpaid}, 0).toFixed(userMoneyFormat)}}
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary">
                    {{lines.reduce((total,item)=>{return total + item.amount}, 0).toFixed(userMoneyFormat)}}
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary">
                </q-td>
                <q-td>
                </q-td>
                
            </q-tr>
            <q-tr></q-tr>
        </template>
    </q-table>

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
                    @keydown.native.keyCodes.115="addRows(documentsBatchDialogSelected)"
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
                    virtual-scroll :rows-per-page-options="[0]"
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

                </q-table>
            </q-card-section>
            <q-card-actions align="around">
                <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar (F4)" no-caps color="primary" 
                :disable="documentsBatchDialogSelected.length<=0" 
                @click="addRows(documentsBatchDialogSelected)" ></q-btn>
            </q-card-actions>
            
            <q-inner-loading :showing="isDialogDocsBusy" style="z-index: 10" >
                <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
        </q-card>
    </q-dialog>
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';

export default ({
    components: {
    },
    data () {
        return {
             moduleName: "accVoucherOut"
            ,selected: [], filterString: ''
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
        updateRow(newVal, colName, row){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.lines))
                newRows.filter(x=>x.lineID==row.lineID).map(result=>{
                    if(colName=="amount"){
                        if(result.docAmountUnpaid < parseFloat(newVal))
                        {
                            result.amount = parseFloat(result.docAmountUnpaid)
                        }else{
                            result[colName] = parseFloat(newVal);
                        }
                    }else{
                        result[colName] = newVal;
                    }
                    return result
                })
                this.lines = newRows;
                this.$q.loading.hide()
                this.$emit('onAccMoveCompute')
            }catch(ex){
                console.error(ex)
                this.$q.loading.hide()
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
        addRows(rows){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.lines))
                rows.map(row=>{
                    if(!(newRows.some(x=>x.docHeaderID==row.headerID))){//compara si ya existe la factura en este pago
                        let nuevaFila = {
                             lineID: row.headerID
                            ,account_id: row.partner_account_id
                            ,amount: 0
                            ,comments: row.tipoComprobanteName + ' ' + row.numeroDoc
                            ,prjID: 0
                            //dummy for informative docs
                            ,docAccTypeID: row.accTypeID
                            ,docAccTypeName: row.accTypeName
                            ,docHeaderID: row.headerID
                            ,docAmountTotal: row.amountTotal
                            ,docAmountUnpaid: row.amountUnpaid
                            ,docDate: row.headerDate
                            ,docNum: row.numeroDoc
                            ,docComprobante: row.tipoComprobanteName
                        }
                        newRows.push(nuevaFila)
                    }
                })
                this.lines = newRows
                this.isDialogDocs=false;
                this.$q.loading.hide()
                this.selected = []
                this.$emit('onAccMoveCompute')
            }catch(ex){
                console.dir(ex)
                this.$q.loading.hide()  
            }
        },
        paySelectedRows(){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.lines))
                newRows.filter(x=> this.selected.some(y=> y.lineID==x.lineID ) ).map(res=>{
                    res.amount = res.docAmountUnpaid
                    return res
                })
                this.lines = newRows
                this.$emit('onAccMoveCompute')
            }catch(ex){
                console.dir(ex)
                this.$q.loading.hide()
                this.$emit('onAccMoveCompute')
            }
        },
        clearSelectedRows(){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.lines))
                newRows.filter(x=> this.selected.some(y=> y.lineID==x.lineID ) ).map(res=>{
                    res.amount = 0
                    return res
                })
                this.lines = newRows
                this.$emit('onAccMoveCompute')
            }catch(ex){
                console.dir(ex)
                this.$q.loading.hide()
                this.$emit('onAccMoveCompute')
            }
        },
        deleteRow(row){
            this.$q.dialog({ 
                title: 'Confirmación'
                ,message: 'Desea quitar las líneas seleccionadas?'
                ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
            }
            ).onOk(() => {
                //Líneas
                let newRows = JSON.parse(JSON.stringify(this.lines))
                //this.selected.map(row=>{
                newRows = newRows.filter(x=>x.lineID!=row.lineID);
                //})
                this.lines = newRows
                this.selected = []//limpia selección para evitar problema de referencia a filas que no existan
                this.$emit('onAccMoveCompute')                    
            })
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userCompanies: { get () { return this.$store.state.main.userCompanies } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        isAccount: {
            get () { return this.$store.state[this.moduleName].editData.basic.isAccount },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'isAccount', value: val}) }
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
        },
        lookup_accAP: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accAP },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData_lookup_accAP', val) }
        },
    },
})
</script>
