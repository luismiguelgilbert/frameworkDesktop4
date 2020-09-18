<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div>
      <q-toggle
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
    <q-select
        label="Ciudad (*)" placeholder="Seleccione la Ciudad a la que pertenece el Grupo (*)" emit-value map-options filled
        :options="lookup_cities" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="cityID"
        ref="cityID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-city" /></template>
    </q-select>
    <q-select
        label="Sector (*)" placeholder="Seleccione el Sector a la que pertenece el Grupo (*)" emit-value map-options filled
        :options="lookup_sectores" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="sectorID"
        ref="sectorID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-map-marker-alt" /></template>
    </q-select>
    <q-select
        label="Monitor 1 (*)" placeholder="Seleccione el Primer Monitor del Grupo (*)" emit-value map-options filled
        :options="lookup_users" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="monitor_user_code_1"
        ref="monitor_user_code_1"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-user-tie" /></template>
    </q-select>
    <q-select
        label="Monitor 2 (*)" placeholder="Seleccione el Segundo Monitor del Grupo (*)" emit-value map-options filled
        :options="lookup_users" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :option-disable="opt => !opt.estado"
        v-model="monitor_user_code_2"
        ref="monitor_user_code_2"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-user-tie" /></template>
    </q-select>


    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
    data () {
        return {
            moduleName: "SCHGroups"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
      changeMonth(){
        /*if(this.parent_id){
          let temporal = this.lookup_accounts.find(x=>x.value == this.parent_id)
          this.code_es = temporal.code_es + '.xxx'
          this.account_type_root = temporal.account_type_root
          this.account_level = temporal.account_level?parseInt(temporal.account_level+1):1
        }else{
          this.code_es = ''
          this.account_type_root = 1
          this.account_level = 0
        }*/
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
