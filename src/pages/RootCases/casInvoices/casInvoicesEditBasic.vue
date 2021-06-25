<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div class="row">
      <q-toggle class="col-4"
        tabindex="-1"
        v-model="voided" icon="fas fa-disable" color="red" label="Anulada?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    
    <selectSearchable 
        prependIcon="fas fa-handshake"
        labelText="Cliente (*)" labelSearchText="Buscar Cliente"
        :optionsList="this.lookup_customers"
        rowValueField="value" optionLabelField="label" optionsListCaption="partner_ruc" optionsListLabel="label" 
        optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(editStatus.editMode=='edit')"
        :initialValue="customerID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Cliente', field: 'label', align: 'left'}
                ,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
                ,{ name: 'short_name_es', label: 'Nombre Comercial', field: 'short_name_es', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.customerID = row.value;
                this.loadPendingInv();
            }"
        />

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



    <br><br>
</q-form>
</template>
<script>
/*
import Vue from 'vue';
import Vuex from 'vuex';
*/

import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        selectSearchable
    },
    data () {
        return {
            mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,isCustomerDialog: false
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
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
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
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
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
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
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_payterms', value: val}) }
        },
    },
})
</script>
