<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
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
    
    <selectSearchable 
        autocomplete="off"
        prependIcon="fas fa-city"
        labelText="Ciudad (*)" labelSearchText="Buscar Ciudad"
        :optionsList="lookup_cities"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="cityID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Ciudad', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.cityID=row.value;
            }"
        />

    <selectSearchable 
        class="q-mt-lg"
        autocomplete="off"
        prependIcon="fas fa-map-marker-alt"
        labelText="Sector (*)" labelSearchText="Buscar Sector"
        :optionsList="lookup_sectores"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="sectorID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Sector', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.sectorID=row.value;
            }"
        />

     <selectSearchable 
        class="q-mt-lg"
        autocomplete="off"
        prependIcon="fas fa-user-tie"
        labelText="Monitor 1 (*)" labelSearchText="Buscar Monitor"
        :optionsList="lookup_users"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="monitor_user_code_1"
        :tableSearchColumns="[
                 { name: 'label', label: 'Sector', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.monitor_user_code_1=row.value;
            }"
        />

    <selectSearchable 
        class="q-mt-lg"
        autocomplete="off"
        prependIcon="fas fa-user-tie"
        labelText="Monitor 2 (*)" labelSearchText="Buscar Monitor"
        :optionsList="lookup_users"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="monitor_user_code_2"
        :tableSearchColumns="[
                 { name: 'label', label: 'Sector', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.monitor_user_code_2=row.value;
            }"
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
        cityID: {
            get () { return this.$store.state[this.moduleName].editData.basic.cityID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'cityID', value: val}) }
        },
        sectorID: {
            get () { return this.$store.state[this.moduleName].editData.basic.sectorID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sectorID', value: val}) }
        },
        monitor_user_code_1: {
            get () { return this.$store.state[this.moduleName].editData.basic.monitor_user_code_1 },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'monitor_user_code_1', value: val}) }
        },
        monitor_user_code_2: {
            get () { return this.$store.state[this.moduleName].editData.basic.monitor_user_code_2 },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'monitor_user_code_2', value: val}) }
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
