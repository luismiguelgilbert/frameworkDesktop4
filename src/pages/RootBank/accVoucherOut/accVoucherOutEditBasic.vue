<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    
    <div class="row">
        <q-toggle class="col-12 col-md-6 offset-col-md-2"
            tabindex="-1"
            v-if="dialogMode==false"
            v-model="voided" icon="fas fa-ban" color="red" label="Anulado?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
            />
    </div>

    <selectSearchable 
        prependIcon="fas fa-handshake"
        labelText="Proveedor(*)" labelSearchText="Buscar Proveedor"
        :optionsList="this.lookup_partners"
        rowValueField="value" optionsListLabel="label" optionsListCaption="partner_ruc"
        :isRequired="true" 
        :isDisable="dialogMode?true:false" 
        :isReadonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
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
    
    
    <selectSearchable 
        prependIcon="fas fa-money-check"
        labelText="Medio de Pago (*)" labelSearchText="Buscar Medio de Pago"
        :optionsList="this.lookup_accPaymentMethods"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="methodID"
        :tableSearchColumns="[
                { name: 'label', label: 'Origen', field: 'label', align: 'left'}
                ,{ name: 'paymentTypeName', label: 'Medio de Pago', field: 'paymentTypeName', align: 'left'}
                ,{ name: 'numberTypeName', label: 'Secuencial', field: 'numberTypeName', align: 'left'}
                ,{ name: 'lastNumber', label: 'Último Documento', field: 'lastNumber', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.numberType = row.numberType
                this.numeroDoc = isNaN(row.lastNumber)?0:(parseInt(row.lastNumber)+1);
                this.account_id = row.account_id//asigna la cuenta contable asociada al [Medio de Pago]
                this.methodID=row.value;
            }"
        />

    <q-input
        :disable="!(this.methodID)"
        ref="numeroDoc" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        placeholder="Ingrese el Número del Documento (*)" label="Número del Documento (*)" filled
        v-model="numeroDoc"
        :type="numberType&&numberType==1?'number':undefined"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    <q-input
        ref="amountTotal" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        placeholder="Monto del Pago (*)" label="Monto del Pago (*)" filled
        v-model="amountTotal" :min="0" :max="amountTotal"
        :disable="!dialogMode"
        type="number" class="q-pb-md"
        >
        <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
    </q-input>
    

    

    
    
    
    <q-input
        ref="headerDate" 
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha del Documento usado para contabilizar asiento (aaaa/mm/dd)" label="Fecha de Documento (aaaa/mm/dd) (*)" filled
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

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Pedido" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />

    
    <br/>
    <br/>
    <div class="text-subtitle2 text-primary">Datos para Imprimir</div>

    <q-input
        class="q-pb-md"
        ref="printName"
        placeholder="Nombre para Imprimir" label="Nombre para Imprimir" filled
        v-model="printName"
        >
        <template v-slot:prepend><q-icon name="fas fa-print" /></template>
    </q-input>

    

    <q-input
        ref="printDate" 
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha del Documento usado para imprimir (aaaa/mm/dd)" label="Fecha para Imprimir (aaaa/mm/dd) (*)" filled
        v-model="printDate" :title="dateName(printDate)"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_printDate" transition-show="scale" transition-hide="scale">
              <q-date :locale="myQDateLocale" minimal v-model="printDate" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-calendar-day" /></template>
    </q-input>
    
    <br><br>

    <!--<q-dialog v-model="isPartnerDialog">
        <q-card style="minWidth: 1000px; width: 1000px;">
            <partnersEdit />
        </q-card>
    </q-dialog>-->
    

</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import mainLookup from '../../../components/mainLookup/mainLookup.vue'
import xml2js from 'xml2js'
//import computeFunctions from './computeFunctions.js'

export default ({
    props: {
        dialogMode: { type: Boolean, default: false },
        amountUnpaid: { type: Number, default: 0 },
    },
    components: {
        mainLookup: mainLookup
        ,selectSearchable: selectSearchable
        //,computeFunctions: computeFunctions
        //,partnersEdit: () => import('../../../pages/RootMaster/Partners/PartnersEdit.vue')
    },
    created(){
        if(this.amountUnpaid && this.amountUnpaid >= 0){
            this.amount = this.amountUnpaid
        }
    },
    data () {
        return {
            moduleName: "accVoucherOut"
            ,isPartnerDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,xmlFile: null
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
        this.$refs.formulario.validate()
    },
    methods:{
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            }
            )
        },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userCompanies: { get () { return this.$store.state.main.userCompanies } },
        allow_edit: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_edit').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_insert: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_insert').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        reconciliation: {
          get () { return this.$store.state[this.moduleName].editData.reconciliation },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataReconciliation', val) }
        },
        reconciliationLines: {
          get () { return this.$store.state[this.moduleName].editData.reconciliationLines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataReconciliationLines', val) }
        },
        payments: {
            get () { return this.$store.state[this.moduleName].editData.payments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPayments', val) }
        },
        headerUser: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerUser },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerUser', value: val}) }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
        partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerName', value: val}) }
        },
        account_id_invoice: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id_invoice },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_id_invoice', value: val}) }
        },
        account_id_advance: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id_advance },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_id_advance', value: val}) }
        },
        account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_id', value: val}) }
        },
        methodID: {
            get () { return this.$store.state[this.moduleName].editData.basic.methodID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'methodID', value: val}) }
        },
        numberType: {
            get () { return this.$store.state[this.moduleName].editData.basic.numberType },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'numberType', value: val}) }
        },
        numeroDoc: {
            get () { return this.$store.state[this.moduleName].editData.basic.numeroDoc },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'numeroDoc', value: val}) }
        },
        voided: {
            get () { return this.$store.state[this.moduleName].editData.basic.voided },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'voided', value: val}) }
        },
        headerDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerDate },
            set (val) { 
                this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerDate', value: val}) //actualiza campo
                this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'printDate', value: val}) //actualiza campo de impresión (pero el de impresión NO cambia éste)
                this.$emit('onAccMoveCompute')
            }
        },
        printDate:  {
            get () { return this.$store.state[this.moduleName].editData.basic.printDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'printDate', value: val}) }
        },
        printName:  {
            get () { return this.$store.state[this.moduleName].editData.basic.printName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'printName', value: val}) }
        },
        amountTotal:  {
            get () { return this.$store.state[this.moduleName].editData.basic.amountTotal },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'amountTotal', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },
        lookup_partners: {
            get () { return this.$store.state[this.moduleName].editData.lookup_partners },
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
