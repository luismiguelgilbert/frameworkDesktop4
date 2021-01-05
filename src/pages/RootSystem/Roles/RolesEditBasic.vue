<template>
<q-form ref="formulario" greedy autofocus no-error-focus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">    
    <q-toggle
        tabindex="-1"
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    <q-input 
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el Nombre del rol (*)" label="Nombre del Rol(*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-id-card" /></template>
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
            moduleName: "Roles"
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
    },
})
</script>