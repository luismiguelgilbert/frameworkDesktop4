<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <q-banner inline-actions class="text-white bg-red" tabindex="-1">
        
      Los porcentajes no deberían modificarse. Si necesita un nuevo porcentaje, debe crear otro impuesto
    </q-banner>

    <div class="row">
      <q-toggle class="col-12 col-md-4"
        tabindex="-1"
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
      />
      <q-toggle class="col-12 col-md-4"
        tabindex="-1"
        v-model="es_retencion" color="positive" label="Retención?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
      />
      <q-toggle class="col-12 col-md-4"
        tabindex="-1"
        v-model="isPercent" color="positive" :label="isPercent?'Porcentaje':'Valor Fijo'" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
      />
      

    </div>

    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre del impuesto (*)" label="Nombre (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 1 || 'Campo debe tener al menos 2 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-id-card" /></template>
    </q-input>

    
    <q-input class="q-pb-md"
        ref="factor_base" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Factor para calcular la base imponible del impuesto (*)" label="Base (*)" filled type="number"
        v-model="factor_base"
        @focus="$event.target.select()"
        >
        <template v-slot:prepend><q-icon name="fas fa-calculator" /></template>
    </q-input>

    <q-input class="q-pb-md"
        ref="factor" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Factor para calcular impuesto (*)" label="Factor (*)" filled type="number"
        v-model="factor"
        @focus="$event.target.select()"
        >
        <template v-slot:prepend><q-icon name="fas fa-percent" /></template>
    </q-input>
    
    

    <q-card-section>
        <div class="text-h6 text-primary">Configuración para ATS:</div>
    </q-card-section>

    <selectSearchable 
        prependIcon="fas fa-code" class="q-pb-md"
        labelText="Tipo de Impuesto en ATS (IVA o Retención de IVA)" labelSearchText="Buscar Tipo de Impuesto en ATS (IVA o Retención de IVA)"
        :optionsList="lookup_atsTipoImpuesto.filter(x=>x.esRetencion==this.es_retencion)"
        rowValueField="value" optionsListLabel="label" optionsListCaption="atsName"
        :isRequired="false" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="atsTipoImpuesto"
        :tableSearchColumns="[
                 { name: 'label', label: 'Tipo de Impuesto', field: 'label', align: 'left'}
                ,{ name: 'atsName', label: 'Nombre del campo en ATS', field: 'atsName', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.atsTipoImpuesto=row.value;
            }"
        />

    <q-card-section>
        <div class="text-h6 text-primary">Configuración para Documentos Electrónicos:</div>
    </q-card-section>

     <selectSearchable 
        prependIcon="fas fa-file-code"
        labelText="Tipo de Impuesto en Documentos Electrónicos (*)" labelSearchText="Buscar Tipo de Impuesto en Documentos Electrónicos"
        :optionsList="lookup_docElecTipo.filter(x=>x.esRetencion==this.es_retencion)"
        rowValueField="value" optionsListLabel="label" optionsListCaption="tipoCodigo"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="electronicoCodigoTipo"
        :tableSearchColumns="[
                 { name: 'label', label: 'Tipo de Impuesto', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.electronicoCodigoTipo=row.value;
            }"
        />

    <selectSearchable 
        prependIcon="fas fa-file-code"
        labelText="Código del Impuesto en Documentos Electrónicos (*)" labelSearchText="Buscar Código del Impuesto en Documentos Electrónicos"
        :optionsList="electronicoCodigoTipo?lookup_docElecCodigo.filter(x=>x.tipoID==electronicoCodigoTipo):[]"
        rowValueField="value" optionsListLabel="label" optionsListCaption="codigo"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="electronicoCodigoImpuesto"
        :tableSearchColumns="[
                 { name: 'label', label: 'Tipo de Impuesto', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.electronicoCodigoImpuesto=row.value;
            }"
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
        selectSearchable: selectSearchable
    },
    data () {
        return {
            moduleName: "TaxesMaster"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        /*isFieldErrorBG(fieldName) {
            console.dir('isFieldErrorBG: '+fieldName)
            console.dir(this.$refs.length)
            if(Object.keys(this.$refs).length>0){//espera que existan datos
                return this.$refs[fieldName].hasError?'red':undefined
            }
        },
        isFieldErrorText(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos
                return this.$refs[fieldName].hasError?'text-white':undefined
            }
        },
        isFieldErrorLabel(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos
                return this.$refs[fieldName].hasError?'white':undefined
            }
        },*/

    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        es_retencion: {
            get () { return this.$store.state[this.moduleName].editData.basic.es_retencion },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'es_retencion', value: val}) }
        },
        isPercent: {
            get () { return this.$store.state[this.moduleName].editData.basic.isPercent },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'isPercent', value: val}) }
        },
        factor: {
            get () { return this.$store.state[this.moduleName].editData.basic.factor },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'factor', value: val}) }
        },
        factor_base: {
            get () { return this.$store.state[this.moduleName].editData.basic.factor_base },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'factor_base', value: val}) }
        },
        atsTipoImpuesto: {
            get () { return this.$store.state[this.moduleName].editData.basic.atsTipoImpuesto },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'atsTipoImpuesto', value: val}) }
        },
        electronicoCodigoTipo: {
            get () { return this.$store.state[this.moduleName].editData.basic.electronicoCodigoTipo },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'electronicoCodigoTipo', value: val}) }
        },
        electronicoCodigoImpuesto: {
            get () { return this.$store.state[this.moduleName].editData.basic.electronicoCodigoImpuesto },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'electronicoCodigoImpuesto', value: val}) }
        },
        lookup_atsTipoImpuesto: {
            get () { return this.$store.state[this.moduleName].editData.lookup_atsTipoImpuesto },
        },
        lookup_docElecTipo: {
            get () { return this.$store.state[this.moduleName].editData.lookup_docElecTipo },
        },
        lookup_docElecCodigo: {
            get () { return this.$store.state[this.moduleName].editData.lookup_docElecCodigo },
        },
        
    },
})
</script>
