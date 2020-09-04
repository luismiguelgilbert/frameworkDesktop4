<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">    
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
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        sys_user_hash: { 
            get () { return this.$store.state[this.moduleName].editData.password }, 
            set (val) { 
                this.$store.commit((this.moduleName)+'/updateEditDataPassword', val) 
            }
        },
    }
})

</script>