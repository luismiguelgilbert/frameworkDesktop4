<template>
<q-form ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
      <q-toggle class="col-4"
        tabindex="-1"
        v-model="estado" icon="fas fa-check" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>

    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba Nombre Descriptivo del Contrato (*)" label="Nombre del Contrato (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-file-contract" /></template>
    </q-input>

    <q-input
        ref="startDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha de inicio" label="Fecha de Inicio" filled
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
    
    
    <q-select
        label="Frecuencia de Facturación (*)" placeholder="Seleccione Frecuencia de Facturación (*)" emit-value map-options filled
        :options="[{value: 1, label: 'Mensual'},{value: 2, label: 'Anual'}]" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="frequency"
        ref="frequency"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-undo" /></template>
    </q-select>

    <q-input
        ref="amount" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el valor a facturar periódicamente (*)" label="Monto a Facturar (*)" filled
        v-model="amount" type="number" :min="0"
        :rules="[
                val => !!val || '* Requerido',
                val => val > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
    </q-input>
    

    

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Contrato" filled
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
    data () {
        return {
            moduleName: "casContracts"
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
        startDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.startDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'startDate', value: val}) }
        },
        frequency: {
            get () { return this.$store.state[this.moduleName].editData.basic.frequency },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'frequency', value: val}) }
        },
        amount: {
            get () { return this.$store.state[this.moduleName].editData.basic.amount },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'amount', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
    },
})
</script>
