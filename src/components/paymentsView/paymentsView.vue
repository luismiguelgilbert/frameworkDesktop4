<template>
<div>
    <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
        <q-toolbar-title class="text-weight-bolder">Conciliaciones</q-toolbar-title>
        <q-space />
        <q-btn v-if="allowPayment" :label="$q.screen.gt.sm?'Crear Nuevo Pago':''" title="Nuevo Pago" icon="fas fa-money-check-alt" color="primary" no-caps @click="openPaymentDialog"/>
    </q-toolbar>
    <q-table
        :data="reconciliation"
        table-style="min-height: calc(100vh - 450px); max-height: calc(100vh - 450px)"
        row-key="headerID"
        dense hide-bottom
        selection="single"
        :selected.sync="selectedRows"
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        :columns="[
          { name: 'headerID', required: true, label: '# Conciliación', align: 'left', field: row => row.headerID, sortable: true, style: 'minWidth: 35px; maxWidth: 35px; width: 35px;' },
          { name: 'headerDate', required: true, label: 'Fecha de Conciliación', align: 'left', field: row => row.headerDate, sortable: true, style: 'minWidth: 45px; maxWidth: 45px; width: 45px;' },
          { name: 'headerUser', required: true, label: 'Responsable', align: 'left', field: row => row.headerUser, sortable: true },
          { name: 'amount', required: true, label: 'Monto', align: 'right', field: row => row.amount, sortable: true },
          { name: 'uploaded', required: true, label: 'Anular', align: 'center', field: row => row.uploaded, sortable: true , style: 'minWidth: 60px; maxWidth: 60px; width: 60px;' },
        ]"
    >
        <!--<template v-slot:top>
            
            <div class="text-primary text-h5">Historial de Conciliaciones</div>
            <q-space />
            <q-select 
                v-model="initialLookupValue" map-options emit-value
                :options="lookup_status" borderless dense item-aligned
                />
        </template>-->
        <template v-slot:body="props">
            <q-tr :props="props" >
                <q-td auto-width>
                    <q-checkbox v-model="props.selected" size="md" dense :title="props.row.lineID" />
                </q-td>
                <q-td key="headerID" :props="props" >
                    {{ props.row.headerID}}
                </q-td>
                <q-td key="headerDate" :props="props" :title="dateName(props.row.headerDate)">
                    <!--{{ props.row.headerDate}}-->
                    <q-input
                        ref="headerDate" 
                        mask="date" 
                        dense borderless readonly class="no-padding" style="height: 20px !important;"
                        :value="props.row.headerDate" :title="dateName(props.row.headerDate)"
                        >
                        <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" size="xs">
                            <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
                            <q-date :locale="myQDateLocale" minimal 
                                :value="props.row.headerDate"
                                @input="(value)=>{updateRow(value,'headerDate',props.row)}"
                                >
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                </div>
                            </q-date>
                            </q-popup-proxy>
                        </q-icon>
                        </template>
                    </q-input>
                </q-td>
                <q-td key="headerUser" :props="props" >
                    {{ props.row.headerUser}}
                </q-td>
                <q-td key="amount" :props="props" >
                    {{ props.row.amount.toFixed(userMoneyFormat) }}
                </q-td>
                <q-td key="uploaded" :props="props" >
                    <!--Permitir Anular SI es que reconciliation está ya en la base-->
                    <q-toggle :value="props.row.voided" v-if="props.row.uploaded" color="red" icon="fas fa-ban" flat dense size="sm" @input="updateRow(!props.row.voided,'voided',props.row)"/>
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
                    {{reconciliation.reduce((total,item)=>{return total + item.amount}, 0).toFixed(userMoneyFormat)}}
                </q-td>
                <q-td>
                </q-td>
            </q-tr>
            <q-tr></q-tr>
        </template>
    </q-table>

    <div v-if="selectedRows&&selectedRows.length>0" class="text-h6 text-primary q-pl-sm q-pt-md">Detalle de Conciliación {{selectedRows[0].headerID}}</div>
    <div v-if="selectedRows.length==0" class="text-h6 text-primary q-pl-sm q-pt-md">Selecciona una Conciliación </div>
    <q-table v-if="selectedRows&&selectedRows.length>0"
        :data="reconciliationLines.filter(x=>x.headerID==selectedRows[0].headerID)"
        table-style="min-height: calc(100vh - 450px); max-height: calc(100vh - 450px)"
        row-key="lineID"
        dense hide-bottom
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        :columns="[
          //{ name: 'lineID', required: true, label: 'lineID', align: 'left', field: row => row.lineID, sortable: true },
          //{ name: 'accTypeID', required: true, label: 'Documento', align: 'left', field: row => row.accTypeID, sortable: true },
          //{ name: 'accTypeName', required: true, label: 'Documento', align: 'left', field: row => row.accTypeName, sortable: true },
          //{ name: 'accHeaderID', required: true, label: 'ID', align: 'left', field: row => row.accHeaderID, sortable: true },
          { name: 'account_id', required: true, label: 'Cuenta Contable', align: 'left', field: row => row.account_id, sortable: true },
          { name: 'accHeaderNumeroDoc', required: true, label: '# Documento', align: 'left', field: row => row.accHeaderNumeroDoc, sortable: true },
          { name: 'amount', required: true, label: 'Monto Aplicado', align: 'right', field: row => row.amount, sortable: true },
        ]"
    >
        <template v-slot:body="props">
            <q-tr :props="props" >
                <!--<q-td key="lineID" :props="props">
                    {{props.row.lineID}}
                </q-td>
                <q-td key="accTypeID" :props="props">
                    {{props.row.accTypeID}}
                </q-td>
                <q-td key="accHeaderID" :props="props">
                    {{props.row.accHeaderID}}
                </q-td>-->
                <q-td key="account_id" :props="props">
                    {{lookup_accounts.filter(x=>x.value==props.row.account_id).map(y => {return y.code_es + " - " + y.label}).join("")}}
                </q-td>
                <q-td key="accHeaderNumeroDoc" :props="props">
                    {{props.row.accHeaderNumeroDoc}}
                </q-td>
                <q-td key="amount" :props="props">
                    {{props.row.amount}}
                </q-td>
            </q-tr>
        </template>

        <template v-slot:bottom-row>
            <q-tr></q-tr>
        </template>

       
    </q-table>

    <q-dialog v-model="isPaymentDialogOpen">
        <q-card class="no-padding" style="min-height: 200px; height: calc(100vh - 50px); overflow-y: hidden; min-width: calc(100vw - 50px);">
            <!--<accVoucherEdit :dialogMode="true" :initialPartnerID="initialPartnerID" :initialLines="initialInvoiceLines" :amountUnpaid="amountUnpaid" />-->
        </q-card>
    </q-dialog>
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
//import accVoucherEdit from '../../pages/RootBank/accVoucherOut/accVoucherOutEdit'

export default ({
    components:{
        //accVoucherEdit: accVoucherEdit
    },
    props: {
        moduleName: { type: String, required: true },
        initialPartnerID: { type: Number, required: false, default: null },
        amountUnpaid: { type: Number, required: false, default: null },
        allowPayment: { type: Boolean, required: true, default: false },
        allowReconcile: { type: Boolean, required: true, default: false },
        
    },
    data () {
        return {
            pagination: { rowsPerPage: 0 },
            lookup_status: [{value: 1, label: 'Pagos'},{value:0, label: 'Historial'}],
            initialLookupValue: 1,
            selectedRows: [],
            myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            },
            isPaymentDialogOpen: false, initialInvoiceLines: []
        }
    },
    methods:{
        dateName(value){
            let resultado = '...'
            try{
                resultado = date.formatDate(value, this.userDateFormat,
                    {
                    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                    daysShort: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'],
                    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                    monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                    }
                )
            }catch(ex){console.dir(ex)}
            return resultado;
        },
        updateRow(newVal, colName, row){
            try{
                this.$q.loading.show()
                //let newRows = JSON.parse(JSON.stringify(this.payments))
                let newRows = JSON.parse(JSON.stringify(this.reconciliation))
                /*console.dir('newRows')
                console.dir(newRows)
                console.dir('newVal')
                console.dir(newVal)
                console.dir('colName')
                console.dir(colName)
                console.dir('row')
                console.dir(row)*/
                newRows.filter(x=>x.headerID==row.headerID).map(result=>{
                    result[colName] = newVal;
                    /*if(colName=="amount"){
                    result[colName] = parseFloat(newVal);
                    }else{
                    }*/
                    return result
                })
                //this.payments = newRows;
                this.reconciliation = newRows;
                this.$q.loading.hide()
                //this.$emit('onAccMoveCompute')
            }catch(ex){
                console.error(ex)
                this.$q.loading.hide()
            }
        },
        openPaymentDialog(){
            console.dir('openPaymentDialog')
            this.$store.commit('accVoucherOut/updateState', {key: 'editRecord', value: {value: 0, row: null} })//initialize as New
            this.$store.commit('accVoucherOut/updateState', {key: 'editMode', value: 1})//1 = New
            this.initialInvoiceLines.push({
                 lineID: 1
                ,line_account_id: 1//row.account_id
                ,amount: this.amountUnpaid
                ,comments: 'PENDIENTE'//row.tipoComprobanteName + ' ' + row.numeroDoc
                ,prjID: 0
                ,initialAccTypeID: 2//row.accTypeID
                ,initialAccTypeName: 'pendiente'//row.accTypeName
                ,initialAccHeaderID: 0//row.headerID
                ,maxValue: this.amountUnpaid
            })
            this.isPaymentDialogOpen=true
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        /*payments: {
          get () { return this.$store.state[this.moduleName].editData.payments },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPayments', val) }
        },*/
        reconciliation: {
          get () { return this.$store.state[this.moduleName].editData.reconciliation },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataReconciliation', val) }
        },
        reconciliationLines: {
          get () { return this.$store.state[this.moduleName].editData.reconciliationLines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataReconciliationLines', val) }
        },
    }
})
</script>