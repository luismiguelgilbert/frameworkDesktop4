<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div>
      <q-toggle
        tabindex="-1"
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre del Grupo (*)" label="Nombre del Grupo (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-users" /></template>
    </q-input>

    <q-input
        ref="nivel_0" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la ciudad Ciudad a la que pertenece el equipo" label="Ciudad" filled
        v-model="nivel_0"
        >
        <template v-slot:prepend><q-icon name="fas fa-city" /></template>
    </q-input>

    <q-input
        ref="nivel_1" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el Sector al que pertenece el equipo" label="Sector" filled
        v-model="nivel_1"
        >
        <template v-slot:prepend><q-icon name="fas fa-building" /></template>
    </q-input>

    <q-input
        ref="nivel_2" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la Provincia a la que pertenece el equipo" label="Provincia" filled
        v-model="nivel_2"
        >
        <template v-slot:prepend><q-icon name="fas fa-map" /></template>
    </q-input>

    <q-input
        ref="nivel_3" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la Región a la que pertenece el equipo" label="Región" filled
        v-model="nivel_3"
        >
        <template v-slot:prepend><q-icon name="fas fa-map-marked" /></template>
    </q-input>

    <q-input
        ref="nivel_4" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el País al que pertenece el equipo" label="País" filled
        v-model="nivel_4"
        >
        <template v-slot:prepend><q-icon name="fas fa-flag" /></template>
    </q-input>

    <q-input
        ref="nivel_5" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la Súper Región a la que pertenece el equipo" label="Súper Región" filled
        v-model="nivel_5"
        >
        <template v-slot:prepend><q-icon name="fas fa-globe-americas" /></template>
    </q-input>

    <q-input
        ref="nivel_6" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la Zona a la que pertenece el equipo" label="Zona" filled
        v-model="nivel_6"
        >
        <template v-slot:prepend><q-icon name="fas fa-globe" /></template>
    </q-input>
    

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
    components:{
        selectSearchable,
    },
    mounted(){
        this.$refs.formulario.validate()
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
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        nivel_0: {
            get () { return this.$store.state[this.moduleName].editData.basic.nivel_0 },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'nivel_0', value: val}) }
        },
        nivel_1: {
            get () { return this.$store.state[this.moduleName].editData.basic.nivel_1 },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'nivel_1', value: val}) }
        },
        nivel_2: {
            get () { return this.$store.state[this.moduleName].editData.basic.nivel_2 },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'nivel_2', value: val}) }
        },
        nivel_3: {
            get () { return this.$store.state[this.moduleName].editData.basic.nivel_3 },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'nivel_3', value: val}) }
        },
        nivel_4: {
            get () { return this.$store.state[this.moduleName].editData.basic.nivel_4 },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'nivel_4', value: val}) }
        },
        nivel_5: {
            get () { return this.$store.state[this.moduleName].editData.basic.nivel_5 },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'nivel_5', value: val}) }
        },
        nivel_6: {
            get () { return this.$store.state[this.moduleName].editData.basic.nivel_6 },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'nivel_6', value: val}) }
        },
        lookup_cities: {
            get () { return this.$store.state[this.moduleName].editData.lookup_cities },
        },
        lookup_sectores: {
            get () { return this.$store.state[this.moduleName].editData.lookup_sectores },
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },

    },
})
</script>
