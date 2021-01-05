<template>
<q-form ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">    
    <q-toggle
        tabindex="-1"
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    <q-input 
        ref="sys_user_id" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el login del usuario (*)" label="Login(*)" filled
        v-model="sys_user_id" 
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-id-card" /></template>
    </q-input>
    
    <q-input 
        ref="sys_user_name" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese los nombres del usuario (*)" label="Nombres(*)" filled
        v-model="sys_user_name"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-user" /></template>
    </q-input>
    <q-input 
        ref="sys_user_lastname" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese los apellidos del usuario (*)" label="Apellidos(*)" filled
        v-model="sys_user_lastname"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="far fa-user" /></template>
    </q-input>
    
    <selectSearchable 
        prependIcon="fas fa-user-shield"
        labelText="Perfil de Usuario (*)" labelSearchText="Buscar Perfil"
        :optionsList="this.lookup_profiles"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="sys_profile_id"
        :autofocus="false"
        :tableSearchColumns="[
                 { name: 'label', label: 'Perfil', field: 'label', align: 'left'}
                ,{ name: 'estado', label: 'Estado', field: 'estado', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.sys_profile_id=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />

    <q-input 
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
    <q-card class="q-mt-lg">
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
    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    components: {
        selectSearchable: selectSearchable
    },
    data () {
        return {
            moduleName: "Users"
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
        sys_user_id: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_id }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_id', value: val}) }  
        },
        estado: { 
            get () { return this.$store.state[this.moduleName].editData.basic.estado }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }  
        },
        sys_user_name: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_name }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_name', value: val}) }  
        },
        sys_user_lastname: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_lastname }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_lastname', value: val}) }  
        },
        sys_user_mail: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_mail }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_mail', value: val}) }  
        },
        sys_profile_id: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_profile_id }, 
            set (val) { 
                this.sys_link_id = ''//clear xq el nuevo perfil podría NO tener ese módulo activo
                this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_profile_id', value: val})
            }  
        },
        lookup_profiles: { 
            get () { return this.$store.state[this.moduleName].editData.lookup_profiles }, 
        },
        sys_user_color: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_color', value: val}) }  
        },
        comments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.comments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }  
        },
        sys_link_id: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_link_id }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_link_id', value: val}) }  
        },
        lookup_links: {
            get () { 
                let allLinks = this.$store.state[this.moduleName].editData.lookup_links
                let allowedLinks = [];
                let allowedID = []
                this.$store.state[this.moduleName].editData.lookup_profiles_links.filter(p=>p.sys_profile_id==this.sys_profile_id).map(item=>{
                    allowedID.push(item.sys_link_id.substring(0,2))
                    allowedID.push(item.sys_link_id.substring(0,4))
                })
                allowedID = Array.from(new Set(allowedID))
                allowedID.filter(x=>x.length==2).map(item=>{
                    let rootNode = allLinks.find(root => root.sys_link_id == item);
                    if(rootNode){//si NO existe es porque en algún momento se asignó algo que se eliminó, o se asignó manualmente, y esto generaría un error
                        rootNode['children'] = allLinks.filter(modules=> allowedID.filter(int=>int.length==4&&int.substring(0,2)==item).some(existe => existe==modules.sys_link_id) )
                        allowedLinks.push(rootNode)
                    }
                })
                return allowedLinks
            }
        }
    },
})
</script>