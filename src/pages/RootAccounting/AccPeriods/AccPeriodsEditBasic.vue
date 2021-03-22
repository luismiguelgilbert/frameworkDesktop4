<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div>
      <q-toggle
        tabindex="-1"
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <q-input
        ref="fiscalYear" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" class="q-pt-md"
        placeholder="Escriba el año del periodo contable (*)" label="Año (*)" filled type="number"
        v-model="fiscalYear"
        @focus="$event.target.select()"
        @input="changeYear"
        :rules="[
                val => !!val || '* Requerido',
                val => val > 2000 || 'Campo debe ser mayor al 2000',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-calendar-alt" /></template>
    </q-input>
    <q-select
        label="Mes (*)" placeholder="Seleccione el mes correspondiente (*)" emit-value map-options filled
        :options="lookup_months" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="fiscalMonth"
        ref="fiscalMonth" 
        @input="changeMonth"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="far fa-calendar-alt" /></template>
    </q-select>
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre del Periodo Contable (*)" label="Nombre del Periodo Contable (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-print" /></template>
    </q-input>
    <br><br>
</q-form>
</template>
<script>
/*
import Vue from 'vue';
import Vuex from 'vuex';
*/


export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    mounted(){
        this.$refs.formulario.validate()
        if(this.name_es==null||this.name_es.length<=0){
            this.changeYear();
        }
    },
    methods:{
        changeYear(){
            try{
                this.name_es = this.lookup_months[this.fiscalMonth].label + ' ' + this.fiscalYear
            }catch(ex){
                this.name_es = ''
            }
            
        },
        changeMonth(){
            try{
                this.name_es = this.lookup_months[this.fiscalMonth].label + ' ' + this.fiscalYear
            }catch(ex){
                this.name_es = ''
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
        fiscalYear: {
            get () { return this.$store.state[this.moduleName].editData.basic.fiscalYear },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'fiscalYear', value: val}) }
        },
        fiscalMonth:  {
            get () { return this.$store.state[this.moduleName].editData.basic.fiscalMonth },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'fiscalMonth', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        lookup_months: {
            get () { return this.$store.state[this.moduleName].editData.lookup_months },
        },
    },
})
</script>
