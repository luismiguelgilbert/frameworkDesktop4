<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
      <q-toggle class="col-4"
        v-model="voided" icon="fas fa-disable" color="red" label="Anulada?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>

    <q-input
        ref="customerName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione el Cliente (*)" label="Cliente (*)" filled
        :value="customerName"
        @keyup.keyCodes.113="openSearchCustomer('customerID','customerName',customerID)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-handshake" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchCustomer('customerID','customerName',customerID)"/></template>
    </q-input>

    <q-input
        ref="invoiceNumber" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba Número de Factura (*)" label="Número de Factura (*)" filled
        v-model="invoiceNumber"
        mask="### - ### - #########" unmasked-value
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    <q-input
        ref="invoiceDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha de factura" label="Fecha de Factura" filled
        v-model="invoiceDate"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_invoiceDate" transition-show="scale" transition-hide="scale">
              <q-date v-model="invoiceDate">
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
        ref="amount" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el valor de la Factura incluidos impuestos (*)" label="Monto de Factura (*)" filled
        v-model="amount" type="number" :min="0"
        :rules="[
                val => !!val || '* Requerido',
                val => val > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
    </q-input>
    

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Contrato" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />


    <q-dialog v-model="isCustomerDialog">
        <mainLookup 
            titleBar="Buscar Cliente"
            :data="this.lookup_customers"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :predefinedValue="mainLookupPredefinedValue"
            :columns="[
                     //{ name: 'value', required: true, label: 'Código', align: 'left', field: row => row.code_es , sortable: false, style: 'min-width: 100px; max-width: 100px;' }
                    ,{ name: 'label', label: 'Cliente', align: 'left', field: row => row.label, sortable: true,    }
                    ,{ name: 'partner_ruc', label: '# Identificación', align: 'left', field: row => row.partner_ruc, sortable: true,    }
                    
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            
            @onCancel="isCustomerDialog=false"
            @onSelect="(selectedRows)=>{updateValues(selectedRows, 'value', 'label')}"
        /><!--boldIfChildrenFielname="account_has_children"-->
    </q-dialog>

    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import mainLookup from '../../../components/mainLookup/mainLookup.vue'

export default ({
    components: {
        mainLookup: mainLookup
    },
    data () {
        return {
            moduleName: "casInvoices"
            ,mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,isCustomerDialog: false
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        changeMonth(){
            /*if(this.parent_id){
            let temporal = this.lookup_accounts.find(x=>x.value == this.parent_id)
            this.code_es = temporal.code_es + '.xxx'
            this.account_type_root = temporal.account_type_root
            this.account_level = temporal.account_level?parseInt(temporal.account_level+1):1
            }else{
            this.code_es = ''
            this.account_type_root = 1
            this.account_level = 0
            }*/
        },
        openSearchCustomer(UpdateFieldValueName, UpdateFieldLabelName, predefinedValue){
            this.mainLookupUpdateFieldValueName = UpdateFieldValueName
            this.mainLookupUpdateFieldLabelName = UpdateFieldLabelName
            this.mainLookupPredefinedValue = predefinedValue
            this.isCustomerDialog = true
        },
        updateValues(selectedRows, lookupValueField, lookupLabelField){
            this[this.mainLookupUpdateFieldValueName] = selectedRows[0][lookupValueField];
            this[this.mainLookupUpdateFieldLabelName] = selectedRows[0][lookupLabelField];
            this.isCustomerDialog = false
            this.loadPendingInv();
        },
        loadPendingInv(){
            if(this.customerID>0){
                this.$q.loading.show()
                this.$axios({
                    method: 'GET',
                    url: this.apiURL + 'spCasInvoicesSelectPending',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        userLanguage: 'es',
                        customerID: this.customerID,
                    }
                }).then((response) => {
                    this.lookup_payterms = [];
                    console.dir(response.data)
                    this.lookup_payterms = response.data;
                    this.$q.loading.hide()
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
                    this.$q.loading.hide()
                })
            }
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        voided: {
            get () { return this.$store.state[this.moduleName].editData.basic.voided },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'voided', value: val}) }
        },
        customerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.customerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'customerID', value: val}) }
        },
        customerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.customerName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'customerName', value: val}) }
        },
        invoiceNumber: {
            get () { return this.$store.state[this.moduleName].editData.basic.invoiceNumber },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'invoiceNumber', value: val}) }
        },
        invoiceDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.invoiceDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'invoiceDate', value: val}) }
        },
        amount: {
            get () { return this.$store.state[this.moduleName].editData.basic.amount },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'amount', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_customers: {
            get () { return this.$store.state[this.moduleName].editData.lookup_customers },
        },
        lookup_payterms: {
            get () { return this.$store.state[this.moduleName].editData.lookup_payterms },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLookupPayterms', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
    },
})
</script>
