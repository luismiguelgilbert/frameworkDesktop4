<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div>
      <q-toggle
        tabindex="-1"
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <selectSearchable 
        prependIcon="fas fa-id-card"
        labelText="Tipo de Medio de Pago/Cobro (*)" labelSearchText="Buscar Medio de Pago/Cobro"
        :optionsList="this.lookup_paymentTypes"
        rowValueField="value" optionsListLabel="label" optionsListCaption="directionName" 
        optionLabelField="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="paymentTypeID"
        :tableSearchColumns="[
                 { name: 'value', label: 'Código', field: 'value', align: 'left'}
                ,{ name: 'label', label: 'Tipo', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                if(row){
                    this.paymentTypeID=row.value;
                }
            }"
        />
    
    <q-select
        v-if="paymentTypeID==1"
        v-model="formatID"
        :options="lookup_payment_formats"
        map-options emit-value
        label="Formato de Impresión del Documento (*)" filled
        class="q-mb-md"
        >
        <template v-slot:prepend><q-icon name="fas fa-print" /></template>
    </q-select>
    
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la Descripción del Medio de Pago/Cobro (*)" label="Descripción (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-book" /></template>
    </q-input>
    <selectSearchable 
        prependIcon="fas fa-list-ol"
        labelText="Manejo de Secuenciales (*)" labelSearchText="Buscar Manejo de Secuenciales"
        :optionsList="this.lookup_PaymentNumberTypes"
        rowValueField="value" optionsListLabel="label"
        optionLabelField="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="numberType"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                if(row){
                    this.numberType=row.value;
                }
            }"
        />
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Último Número" label="Último Número" filled type="number" min="0"
        v-model="lastNumber"
        @focus="$event.target.select()"
        :rules="[
                val => val >= 0 || 'Campo debe ser 0 o superior',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    
    <selectSearchable 
        prependIcon="fas fa-book"
        labelText="Cuenta Contable (*)" labelSearchText="Buscar Cuenta Contable"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="account_id"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                if(row){
                    this.account_id=row.value;
                }
            }"
        />
    <q-input
        ref="position" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la Ubicación de este medio en listas (*)" label="Ubicación en Listas (*)" filled type="number" min="0"
        v-model="position"
        @focus="$event.target.select()"
        :rules="[
                val => !!val || '* Requerido',
                val => val >= 0 || 'Campo debe ser 0 o superior',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-sort-numeric-down" /></template>
    </q-input>

    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        selectSearchable: selectSearchable
    },
    data () {
        return {
            temp: null
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
      changeParent(){
        if(this.parent_id){
          let temporal = this.lookup_accounts.find(x=>x.value == this.parent_id)
          this.code_es = temporal.code_es + '.xxx'
          this.account_type_root = temporal.account_type_root
          this.account_level = temporal.account_level?parseInt(temporal.account_level+1):1
        }else{
          this.code_es = ''
          this.account_type_root = 1
          this.account_level = 0
        }

      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_view').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
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
        allow_report: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_report').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_disable: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_disable').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        paymentTypeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.paymentTypeID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'paymentTypeID', value: val}) }
        },
        formatID: {
            get () { return this.$store.state[this.moduleName].editData.basic.formatID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'formatID', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        numberType: {
            get () { return this.$store.state[this.moduleName].editData.basic.numberType },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'numberType', value: val}) }
        },
        account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_id', value: val}) }
        },
        lastNumber: {
            get () { return this.$store.state[this.moduleName].editData.basic.lastNumber },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'lastNumber', value: val}) }
        },
        position: {
            get () { return this.$store.state[this.moduleName].editData.basic.position },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'position', value: val}) }
        },
        lookup_paymentTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_paymentTypes },
        },
        lookup_PaymentNumberTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_PaymentNumberTypes },
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        lookup_payment_formats: {
            get () { return this.$store.state[this.moduleName].editData.lookup_payment_formats },
        },
    },
})
</script>
