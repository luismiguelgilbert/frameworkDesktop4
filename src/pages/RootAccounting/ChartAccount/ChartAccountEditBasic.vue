<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div>
      <q-toggle
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <div>
      <q-toggle
        v-model="group_by_partner" color="positive" label="Asiento Apertura (Agrupar x Socio)" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <q-select clearable
        label="Pertenece al Grupo" placeholder="Seleccione la cuenta contable a la que pertenece" emit-value map-options filled
        :options="lookup_accounts" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="parent_id"
        ref="parent_id" @input="changeParent"
        >
        <template v-slot:prepend><q-icon name="fas fa-folder-open" /></template>
    </q-select>
    <q-select class="q-pt-md"
        label="Tipo de Cuenta" placeholder="Seleccione el tipo de cuenta a la que pertenece" emit-value map-options filled
        :options="lookup_accountsTypes" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="account_type_root"
        ref="account_type_root"
        >
        <template v-slot:prepend><q-icon name="fas fa-object-group" /></template>
    </q-select>
    <q-input
        ref="code_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" class="q-pt-md"
        placeholder="Complete el código de la cuenta contable (*)" label="Código de Cuenta (*)" filled
        v-model="code_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-barcode" /></template>
    </q-input>
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el código del Punto de Control (*)" label="Nombre de Cuenta (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-tag" /></template>
    </q-input>
    <q-input
        ref="account_level" :readonly="true" class="q-pt-md"
        placeholder="Nivel (*)" label="Nivel de Cuenta (*)" filled
        v-model="account_level"
        >
        <template v-slot:prepend><q-icon name="fas fa-indent" /></template>
    </q-input>

    <!--<q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este pedido" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />
        -->
    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
    data () {
        return {
            moduleName: "ChartAccount"
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
        parent_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.parent_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'parent_id', value: val}) }
        },
        code_es:  {
            get () { return this.$store.state[this.moduleName].editData.basic.code_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'code_es', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        account_type_root: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_type_root },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_type_root', value: val}) }
        },
        group_by_partner: {
            get () { return this.$store.state[this.moduleName].editData.basic.group_by_partner },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'group_by_partner', value: val}) }
        },
        account_level: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_level },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_level', value: val}) }
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        lookup_accountsTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accountsTypes },
        },
    },
})
</script>
