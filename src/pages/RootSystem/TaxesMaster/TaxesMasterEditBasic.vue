<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <q-banner inline-actions class="text-white bg-red">
      Los porcentajes no deberían modificarse. Si necesita un nuevo porcentaje, debe crear otro impuesto
    </q-banner>

    <div class="col-sm-12 col-md-6">
      <q-toggle
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
      />
      <q-toggle
        v-model="es_retencion" color="positive" label="Retención?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
      />
      <q-toggle
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

    <q-input
        ref="factor" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Factor para calcular impuesto (*)" label="Factor (*)" filled type="number"
        v-model="factor"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-user" /></template>
    </q-input>
    <q-input
        ref="factor_base" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Factor para calcular la base del impuesto (*)" label="Base (*)" filled type="number"
        v-model="factor_base"
        :rules="[
                val => !!val || '* Requerido',
                val => val >= 0 || 'Campo debe ser mayor o igual a 0',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-user" /></template>
    </q-input>
    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
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
    },
})
</script>
