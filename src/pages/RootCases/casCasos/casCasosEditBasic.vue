<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
      <q-toggle class="col-12 col-md-4"
        v-model="estado" icon="fas fa-check" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>

    <!--customerID-->
    <selectSearchable 
        prependIcon="fas fa-handshake"
        labelText="Cliente (*)" labelSearchText="Buscar Cliente"
        :optionsList="this.lookup_customers"
        rowValueField="value" optionsListLabel="label"
        optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="false"
        :initialValue="customerID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Cliente', field: 'label', align: 'left'}
                ,{ name: 'short_name_es', label: 'Nombre Comercial', field: 'short_name_es', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.customerID = row.value;
            }"
        />
    <!--<q-input
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
    </q-input>-->
    
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el Nombre del Caso (*)" label="Nombre del Caso (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-folder-open" /></template>
    </q-input>

    <!--caseTypeID-->
    <selectSearchable 
        prependIcon="fas fa-file-invoice"
        labelText="Tipo de Caso (*)" labelSearchText="Buscar Tipo de Caso"
        :optionsList="this.lookup_casesTypes"
        rowValueField="value" optionsListLabel="label" optionsListCaption="short_name_es"
        optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="false"
        :initialValue="caseTypeID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Tipo de Caso', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.caseTypeID = row.value;
            }"
        />
    <!--<q-input
        ref="caseTypeName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione el Tipo de Caso (*)" label="Tipo de Caso (*)" filled
        :value="caseTypeName"
        @keyup.keyCodes.113="openSearch('caseTypeID','caseTypeName',caseTypeID)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-file-invoice" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearch('caseTypeID','caseTypeName',caseTypeID)"/></template>
    </q-input>-->


    <q-input
        ref="startDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        mask="date" :rules="['date']"
        placeholder="Ingrese la Fecha de Inicio" label="Fecha de Inicio" filled
        v-model="startDate"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_startDate" transition-show="scale" transition-hide="scale">
              <q-date v-model="startDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
    </q-input>

    <q-input class="q-pb-md"
        ref="referenceNumber" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el Número de Referencia del Caso" label="Número de Referencia" filled
        v-model="referenceNumber"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Socio" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />

    <br><br>

</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    components: {
        selectSearchable:selectSearchable
    },
    data () {
        return {
            moduleName: "casCasos"
            ,isSearchDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,isCustomerDialog: false
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        openSearch(UpdateFieldValueName, UpdateFieldLabelName, predefinedValue){
            this.mainLookupUpdateFieldValueName = UpdateFieldValueName
            this.mainLookupUpdateFieldLabelName = UpdateFieldLabelName
            this.mainLookupPredefinedValue = predefinedValue
            this.isSearchDialog = true
        },
        openSearchCustomer(UpdateFieldValueName, UpdateFieldLabelName, predefinedValue){
            this.mainLookupUpdateFieldValueName = UpdateFieldValueName
            this.mainLookupUpdateFieldLabelName = UpdateFieldLabelName
            this.mainLookupPredefinedValue = predefinedValue
            this.isCustomerDialog = true
        },
        updateValues(selectedRows, lookupValueField, lookupLabelField){
            this[this.mainLookupUpdateFieldValueName] = selectedRows[0].[lookupValueField]
            this[this.mainLookupUpdateFieldLabelName] = selectedRows[0].[lookupLabelField]
            this.isSearchDialog = false
            this.isCustomerDialog = false
        },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        referenceNumber: {
            get () { return this.$store.state[this.moduleName].editData.basic.referenceNumber },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'referenceNumber', value: val}) }
        },
        caseTypeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.caseTypeID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'caseTypeID', value: val}) }
        },
        caseTypeName: {
            get () { return this.$store.state[this.moduleName].editData.basic.caseTypeName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'caseTypeName', value: val}) }
        },
        customerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.customerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'customerID', value: val}) }
        },
        customerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.customerName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'customerName', value: val}) }
        },
        startDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.startDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'startDate', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_casesTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_casesTypes },
        },
        lookup_customers: {
            get () { return this.$store.state[this.moduleName].editData.lookup_customers },
        },



        
        
    },
})
</script>
