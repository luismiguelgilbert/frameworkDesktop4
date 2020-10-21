<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div>
      <q-toggle
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el Nombre de la Forma de Pago (*)" label="Nombre de Forma de Pago (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-money-check" /></template>
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
            moduleName: "Payterms"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
      changeParent(){
        if(this.parent_id){
          let temporal = this.lookup_accounts.find(x=>x.value == this.parent_id)
          this.code_es = temporal.code_es + '.xxx'
          this.account_type_root = temporal.account_type_root
          this.account_level = temporal.account_level?parseInt(temporal.account_level+1):1
        }else{
          this.code_es = ''
          this.account_type_root = 1
          this.account_level = 0
        }

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
    },
})
</script>
