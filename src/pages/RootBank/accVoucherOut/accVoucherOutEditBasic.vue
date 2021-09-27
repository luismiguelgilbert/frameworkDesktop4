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
                //console.dir(row)
                this.partnerID=row.value;
                this.printName=row.label;
                this.partnerName=row.label;//usado en el asiento contable, en la línea de proveedor (campo comentario), 
                this.payment_account_id=row.account_id_advance;
                //this.account_id_invoice=row.account_id_invoice;
                //this.partner_account_id=row.account_id
                //this.$emit('onAccMoveCompute')
                this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
            }"
        />

    <selectSearchable 
        prependIcon="fas fa-sign-in-alt fa-rotate-180"
        labelText="Cuenta del Pago ó Anticipo (*)" labelSearchText="Cuenta Contable del Pago ó Anticipo"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false) || (allow_accounting == false)"
        :initialValue="payment_account_id"
        :tableSearchColumns="[
                { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                //console.dir(row)
                //this.account_id_invoice=row.account_id_invoice;
                this.payment_account_id=row.value;
                //this.$emit('onAccMoveCompute')
                this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
            }"
        />
    
    
    <selectSearchable 
        prependIcon="fas fa-sign-out-alt"
        labelText="Medio de Pago (*)" labelSearchText="Buscar Medio de Pago"
        :optionsList="this.lookup_accPaymentMethods"
        rowValueField="value" optionsListLabel="label" optionsListCaption="account_name"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="methodID"
        :tableSearchColumns="[
                { name: 'label', label: 'Origen', field: 'label', align: 'left'}
                ,{ name: 'paymentTypeName', label: 'Medio de Pago', field: 'paymentTypeName', align: 'left'}
                ,{ name: 'numberTypeName', label: 'Secuencial', field: 'numberTypeName', align: 'left'}
                ,{ name: 'lastNumber', label: 'Último Documento', field: 'lastNumber', align: 'left'}
                ,{ name: 'account_name', label: 'Cuenta Contable', field: 'account_name', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.numberType = row.numberType
                this.numeroDoc = isNaN(row.lastNumber)?0:(parseInt(row.lastNumber)+1);
                this.account_id = row.account_id//asigna la cuenta contable asociada al [Medio de Pago]
                this.methodID=row.value;
                //this.$emit('onAccMoveCompute')
                this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
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
        debounce="650"
        @input="()=>{   
            //this.$emit('onAccMoveCompute')  
            this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
        }"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    <q-input
        ref="amountTotal" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        placeholder="Monto del Pago (*)" label="Monto del Pago (*)" filled
        v-model="amountTotal" :min="0" :max="amountTotal"
        :disable="false"
        type="number" class="q-pb-md"
        debounce="650"
        @input="()=>{   
            //this.$emit('onAccMoveCompute')  
            this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
        }"
        :rules="[
                val => !!val || '* Requerido',
                val => val > 0 || '* Incorrecto',
        ]"

        >
        <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
    </q-input>
    

    

    
    
    
    <q-input
        ref="headerDate" 
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha del Documento usado para contabilizar asiento (aaaa/mm/dd)" label="Fecha de Documento (aaaa/mm/dd) (*)" filled
        v-model="headerDate" :title="dateName(headerDate)"
        debounce="650"
        @input="()=>{   
            //this.$emit('onAccMoveCompute')  
            this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
        }"
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
        debounce="650"
        @input="()=>{   
            //this.$emit('onAccMoveCompute')  
            this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
        }"
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
        updateAccountMove(){
            this.$q.loading.show()
            let internalAccountLines = [];

            //let newAccLineID = 1 //porque empieza en 2 por la autosuma de cada línea, y la #1 es la del HABER para el proveedor
            //let totalCreditAmount = 0

            

            try{
                //#region DEBE (Items)
                    //this.internalLines.map(row=>{
                    //newAccLineID++;
                    //totalCreditAmount = parseFloat(totalCreditAmount) + parseFloat(parseFloat(row.amount).toFixed(6))
                    //totalCreditAmount = parseFloat(this.amountTotal)
                    internalAccountLines.push({
                        //accLineID: newAccLineID
                        accLineID: 1
                        //,lineID: row.lineID
                        ,lineID: 1
                        ,taxLineID: 0
                        //,account_id: row.line_account_id
                        ,account_id: this.payment_account_id
                        ,partnerID: this.partnerID
                        //,debit: row.amount
                        ,debit: this.amountTotal
                        ,credit: 0
                        ,invID: 0
                        ,prjID: 0
                        ,stockID: 0
                        ,mktLineID: 0
                        //,comments: this.partnerName + ' - ' + row.comments
                        ,comments: this.lookup_accPaymentMethods.filter(x=>x.value == this.methodID).map(z=>z.label).join(', ') + ' #' +  this.numeroDoc
                        ,mktTypeID: 0
                        ,headerID: 0
                    })
                //#endregion DEBE (Items)
                
                //#region HABER
                internalAccountLines.push({
                    accLineID: 2
                    ,lineID: 2
                    ,taxLineID: 0
                    ,account_id: this.account_id
                    ,partnerID: this.partnerID
                    ,debit: 0
                    //,credit: parseFloat(parseFloat(totalCreditAmount).toFixed(6))
                    ,credit: parseFloat(parseFloat(this.amountTotal).toFixed(6))
                    ,invID: 0
                    ,prjID: 0
                    ,stockID: 0
                    ,mktLineID: 0
                    //,comments: this.lookup_accPaymentMethods.filter(x=>x.value == this.methodID).map(z=>z.paymentTypeName).join(', ') + ' #' +  this.numeroDoc
                    ,comments: this.lookup_accPaymentMethods.filter(x=>x.value == this.methodID).map(z=>z.label).join(', ') + ' #' +  this.numeroDoc
                    ,mktTypeID: 0
                    ,headerID: 0
                    ,lineID: 0
                })
                //#endregion HABER*/
                this.accountLines = internalAccountLines
                this.$q.loading.hide()
            }catch(ex){
                console.dir('Se presentó error')
                console.dir(ex)
                this.$q.loading.hide()
            }

        },
    },
    computed:{
        console: () => console,
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
        allow_accounting: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_accounting').map(y=>{
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
        /*account_id_invoice: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id_invoice },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_id_invoice', value: val}) }
        },*/
        payment_account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.payment_account_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'payment_account_id', value: val}) }
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
                this.$store.commit((this.moduleName)+'/updateEditData', {section: 'accountHeader', key: 'accMoveDateNew', value: val}) //actualiza también nueva fecha de asiento
                this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'printDate', value: val}) //actualiza campo de impresión (pero el de impresión NO cambia éste)
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
        accountLines: {
            get () { return this.$store.state[this.moduleName].editData.accountLines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'accountLines', value: val}) }
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
        lookup_accounts: {
          get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
      },
    },
})
</script>
