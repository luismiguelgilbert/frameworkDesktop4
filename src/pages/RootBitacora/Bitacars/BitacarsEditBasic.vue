<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <q-toggle
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    <q-input 
        ref="placa" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" 
        placeholder="Ingrese la Placa del vehículo (*)" label="Placa (*)" filled
        v-model="placa"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-car" /></template>
    </q-input>
    <q-input 
        ref="marca" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" class="q-pb-md"
        placeholder="Ingrese la Marca del Vehículo" label="Marca del Vehículo" filled
        v-model="marca"
        >
        <template v-slot:prepend><q-icon name="fas fa-car-alt" /></template>
    </q-input>
    <q-input 
        ref="modelo" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" class="q-pb-md"
        placeholder="Ingrese el Modelo del Vehículo" label="Modelo del Vehículo" filled
        v-model="modelo"
        >
        <template v-slot:prepend><q-icon name="fas fa-car-side" /></template>
    </q-input>
    <q-input 
        ref="color" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" class="q-pb-md"
        placeholder="Ingrese el Color del Vehículo" label="Color del Vehículo" filled
        v-model="color"
        >
        <template v-slot:prepend><q-icon name="fas fa-palette" /></template>
    </q-input>
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este pedido" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />
    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
    props: {
      moduleName: { type: String , required: true },
    },
    data () {
        return {
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
        placa: { 
            get () { return this.$store.state[this.moduleName].editData.basic.placa }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'placa', value: val}) }  
        },
        marca: { 
            get () { return this.$store.state[this.moduleName].editData.basic.marca }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'marca', value: val}) }  
        },
        modelo: { 
            get () { return this.$store.state[this.moduleName].editData.basic.modelo }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'modelo', value: val}) }  
        },
        color: { 
            get () { return this.$store.state[this.moduleName].editData.basic.color }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'color', value: val}) }  
        },
        comments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.comments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }  
        },
    },
})
</script>