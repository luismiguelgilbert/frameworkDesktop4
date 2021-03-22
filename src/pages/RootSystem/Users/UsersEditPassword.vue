<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <q-input 
        ref="sys_user_id" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la nueva contraseña" label="Contraseña" filled
        v-model="sys_user_hash"
        :type="isPassword?'password':'text'"
        >
        <template v-slot:prepend><q-icon name="fas fa-key" /></template>
        <template v-slot:append>
          <q-icon
            :name="isPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"
            class="cursor-pointer"
            @click="isPassword = !isPassword"
          />
        </template>
        
    </q-input>

</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default ({
    data () {
        return {
            moduleName: "Users", isPassword: true
        }
    },
    methods:{
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
        sys_user_hash: { 
            get () { return this.$store.state[this.moduleName].editData.password },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'password', value: val}) }
        },
    }
})

</script>