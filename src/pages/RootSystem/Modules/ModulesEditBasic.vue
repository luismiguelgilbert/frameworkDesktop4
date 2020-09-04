<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">    
    <!--<q-btn color="purple" label="Pruebas" @click="pruebasClick" />-->
    <q-input 
        ref="link_id" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el código único (ID) del registro(*)" label="Código (*)" filled
        v-model="link_id" type="number"
        :rules="[
                val => !!val || '* Requerido',
                val => val > 0 || 'Campo debe ser mayor a 0',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>
    <q-input 
        ref="link_name" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre del link (*)" label="Link (*)" filled
        v-model="link_name"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-link" /></template>
    </q-input>
    <q-input 
        ref="db_table" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre de la tabla principal (*)" label="Tabla Principal (*)" filled
        v-model="db_table"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-table" /></template>
    </q-input>
    <q-input 
        ref="primary_key" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre de la columna principal (*)" label="Columna Principal (*)" filled
        v-model="primary_key"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-columns" /></template>
    </q-input>
    <q-toggle
        v-model="is_company_filtered" color="positive" label="La tabla se filtra por compañía?"
        />
    <q-input 
        ref="sortBy" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" class="q-pt-md q-pb-md"
        placeholder="Ingrese el nombre de la columna inicial para ordenar datos" label="Ordenar Por" filled
        v-model="sortBy"
        
        >
        <template v-slot:prepend><q-icon name="fas fa-columns" /></template>
    </q-input>
    <q-select 
        label="Sentido" placeholder="Seleccione el sentido para ordenar datos" emit-value map-options filled
        :options="[{value: 'asc', label: 'ascendente'},{value: 'desc', label: 'descendente'}]"
        :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="orderBy"
        ref="orderBy"
        :rules="[
          val => !!val || '* Requerido'
        ]">
        <template v-slot:prepend><q-icon name="fas fa-sort" /></template>
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
            moduleName: "Modules"
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
        pruebasClick(){
            this.$axios.post( this.apiURL + 'ssrsLogin', {
                    "UserName": "noimporta",
                    "Password": "noimporta",
                    //"Domain": "noimporta",
                }
                , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
            ).then((response) => {
                this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                this.loadData = true;
                //3 lines, same as goback (without confirmation)
                this.editRecord = null;
                this.editMode = false;
                this.router.replace('/'+this.currentPathModule); //navigate to previous Main module
            }).catch((error) => {
                console.dir(error)
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
                this.loadingData = false
            })
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
        link_id: { 
            get () { return this.$store.state[this.moduleName].editData.basic.link_id }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'link_id', value: val}) }  
        },
        link_name: { 
            get () { return this.$store.state[this.moduleName].editData.basic.link_name }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'link_name', value: val}) }  
        },
        db_table: { 
            get () { return this.$store.state[this.moduleName].editData.basic.db_table }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'db_table', value: val}) }  
        },
        primary_key: { 
            get () { return this.$store.state[this.moduleName].editData.basic.primary_key }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'primary_key', value: val}) }  
        },
        is_company_filtered: { 
            get () { return this.$store.state[this.moduleName].editData.basic.is_company_filtered }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'is_company_filtered', value: val}) }  
        },
        sortBy: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sortBy }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sortBy', value: val}) }  
        },
        orderBy: { 
            get () { return this.$store.state[this.moduleName].editData.basic.orderBy }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'orderBy', value: val}) }  
        },

        sys_user_color: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_color', value: val}) }  
        },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    },
})
</script>