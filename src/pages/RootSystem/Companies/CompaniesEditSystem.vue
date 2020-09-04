<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">    
    <q-toggle
        v-model="obligado_contabilidad" color="positive" label="Lleva Contabilidad?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    <q-input 
        ref="logo_path" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la ruta donde se encuentra su logo a utilizar en los documentos" label="Logo" filled
        v-model="logo_path"
        :rules="[
                val => val.length > 4 || 'Campo debe tener al menos 5 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="far fa-file-image" /></template>
    </q-input>
    <q-input 
        ref="mail_logo_path" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la ruta donde se encuentra su logo a utilizar en la firma los correos electrónicos" label="Firma en Correos" filled
        v-model="mail_logo_path"
        :rules="[
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-envelope" /></template>
    </q-input>
    <q-select 
        label="Número Máximo de Decimales usado en campos numéricos (*)" placeholder="Número Máximo de Decimales usado en campos numéricos" emit-value map-options filled
        :options="[{value: 1, label: '1'},{value: 2, label: '2'},{value: 3, label: '3'},{value: 4, label: '4'},{value: 5, label: '5'}, {value: 6, label: '6'}]"
        :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="decimal_numbers"
        ref="pruebas"
        :rules="[
          val => !!val || '* Requerido',
          val => val > 0 || 'Debe escoger una opción',
        ]">
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-select>
    <q-select 
        label="Número Máximo de Decimales usado en campos de dinero (*)" placeholder="Número Máximo de Decimales usado en campos de dinero" emit-value map-options filled
        :options="[{value: 1, label: '1'},{value: 2, label: '2'},{value: 3, label: '3'},{value: 4, label: '4'},{value: 5, label: '5'}, {value: 6, label: '6'}]"
        :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="decimal_amount"
        ref="pruebas"
        :rules="[
          val => !!val || '* Requerido',
          val => val > 0 || 'Debe escoger una opción',
        ]">
        <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
    </q-select>
    <!--<q-input 
        label="Correo Electrónico" placeholder="Ingrese los apellidos del usuario"  filled class="q-mb-lg"
        v-model="sys_user_mail" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        >
        <template v-slot:prepend><q-icon name="fas fa-envelope" /></template>
    </q-input>
    <q-select 
        label="Color Preferido (*)" placeholder="Seleccione el color preferido" emit-value map-options filled
        :options="[ { label: 'Default', value: 'default' }, { label: 'Dark', value: 'blackDark' },]"
        v-model="sys_user_color" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :rules="[
                val => !!val || '* Requerido',
                val => (val == 'default' || val == 'blackDark') || 'Campo debe tener una opción válida',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-palette" /></template>
    </q-select>
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este pedido" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />
    <q-card>
        <q-toolbar>
            <q-toolbar-title>Abrir automáticamente al iniciar sesión</q-toolbar-title>
            <q-btn 
                v-if="sys_link_id"  :disable="!allow_edit&&!allow_insert"
                icon="fas fa-eraser" color="primary" label="Limpiar Selección" 
                @click="sys_link_id=null" />
        </q-toolbar>
        <q-separator />
        <q-tree
            class="q-ma-md" accordion
            :nodes="lookup_links"
            nodeKey="sys_link_id"
            :selected.sync="sys_link_id"
            selected-color="positive"
            :text-color="userColor=='blackDark'?'white':'grey-7'"
            />
        <br>
    </q-card>
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
            moduleName: "Companies"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        /*isFieldErrorBG(fieldName) {
            console.dir('isFieldErrorBG: '+fieldName)
            console.dir(this.$refs.length)
            if(Object.keys(this.$refs).length>0){//espera que existan datos 
                return this.$refs[fieldName].hasError?'red':undefined
            }
        },
        isFieldErrorText(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos 
                return this.$refs[fieldName].hasError?'text-white':undefined
            }
        },
        isFieldErrorLabel(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos 
                return this.$refs[fieldName].hasError?'white':undefined
            }
        },*/
        
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        obligado_contabilidad: { 
            get () { return this.$store.state[this.moduleName].editData.system.obligado_contabilidad }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'obligado_contabilidad', value: val}) }  
        },
        logo_path: { 
            get () { return this.$store.state[this.moduleName].editData.system.logo_path }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'logo_path', value: val}) }  
        },
        mail_logo_path: { 
            get () { return this.$store.state[this.moduleName].editData.system.mail_logo_path }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'mail_logo_path', value: val}) }  
        },
        decimal_numbers: { 
            get () { return this.$store.state[this.moduleName].editData.system.decimal_numbers }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'decimal_numbers', value: val}) }  
        },
        decimal_amount: { 
            get () { return this.$store.state[this.moduleName].editData.system.decimal_amount }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'decimal_amount', value: val}) }  
        },
        
        /*lookup_profiles: { 
            get () { return this.$store.state[this.moduleName].editData.lookup_profiles }, 
        },*/
        sys_user_color: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_color', value: val}) }  
        },
    },
})
</script>