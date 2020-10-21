<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div>
      <q-toggle
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <q-select clearable
        label="Pertenece al Grupo" placeholder="Seleccione el grupo al que pertenece" emit-value map-options filled
        :options="lookup_types" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="parent"
        ref="parent" @input="changeParent"
        >
        <template v-slot:prepend><q-icon name="fas fa-folder-open" /></template>
    </q-select>
    <q-input
        ref="code_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" class="q-pt-md"
        placeholder="Complete el código del grupo (*)" label="Código de Grupo (*)" filled
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
        placeholder="Ingrese el código del Punto de Control (*)" label="Nombre de Grupo (*)" filled
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
        placeholder="Nivel (*)" label="Nivel de Grupo (*)" filled
        v-model="account_level"
        >
        <template v-slot:prepend><q-icon name="fas fa-indent" /></template>
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
    data () {
        return {
            moduleName: "InvTypes"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
      changeParent(){
        if(this.parent){
          let temporal = this.lookup_types.find(x=>x.value == this.parent)
          this.code_es = temporal.code_es + '.xxx'
          this.account_level = temporal.account_level?parseInt(temporal.account_level+1):1
        }else{
          this.code_es = ''
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
        parent: {
            get () { return this.$store.state[this.moduleName].editData.basic.parent },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'parent', value: val}) }
        },
        code_es:  {
            get () { return this.$store.state[this.moduleName].editData.basic.code_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'code_es', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        comments: {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        account_level: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_level },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_level', value: val}) }
        },
        lookup_types: {
            get () { return this.$store.state[this.moduleName].editData.lookup_types },
        },
    },
})
</script>
