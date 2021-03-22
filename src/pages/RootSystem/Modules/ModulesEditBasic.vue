<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
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
        placeholder="Ingrese el nombre de la ruta (*)" label="Nombre del Módulo (*)" filled
        v-model="link_name"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-link" /></template>
    </q-input>

    <selectSearchable 
        prependIcon="fas fa-table"
        labelText="Tabla Principal (*)" labelSearchText="Buscar Tabla"
        :optionsList="this.lookup_tables"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="db_table"
        :tableSearchColumns="[
                 { name: 'label', label: 'Tabla', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.db_table=row.value;
            }"
        />

    <!--<q-select
        label="Tabla Principal (*)" placeholder="Ingrese el nombre de la tabla principal (*)" emit-value map-options filled
        :options="lookup_tables"
        :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="db_table"
        ref="db_table"
        :rules="[
          val => !!val || '* Requerido'
        ]">
        <template v-slot:prepend><q-icon name="fas fa-table" /></template>
    </q-select>-->

    <selectSearchable 
        prependIcon="fas fa-key"
        labelText="Campo Primario (*)" labelSearchText="Buscar nombre de la columna principal"
        :optionsList="this.lookup_cols.filter(x=>x.table_name==db_table)"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="primary_key"
        :tableSearchColumns="[
                 { name: 'label', label: 'Columna', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.primary_key=row.value;
            }"
        />
    <!--<q-select
        label="Campo Primario (*)" placeholder="Ingrese el nombre de la columna principal (*)" emit-value map-options filled
        :options="lookup_cols.filter(x=>x.table_name==db_table)"
        :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="primary_key"
        ref="primary_key"
        :rules="[
          val => !!val || '* Requerido'
        ]">
        <template v-slot:prepend><q-icon name="fas fa-key" /></template>
    </q-select>-->
    <q-toggle
        v-model="is_company_filtered" color="positive" label="La tabla se filtra por compañía?"
        />

    <selectSearchable 
        prependIcon="fas fa-sort"
        labelText="Orden Inicial (*)" labelSearchText="Buscar nombre de la columna inicial para ordenar"
        :optionsList="this.lookup_cols.filter(x=>x.table_name==db_table)"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="sortBy"
        :tableSearchColumns="[
                 { name: 'label', label: 'Columna', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.sortBy=row.value;
            }"
        />
    <!--<q-select
        label="Orden Inicial (*)" placeholder="Ingrese el nombre de la columna inicial para ordenar datos (*)" emit-value map-options filled
        :options="lookup_cols.filter(x=>x.table_name==db_table)"
        :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="sortBy"
        ref="sortBy"
        :rules="[
          val => !!val || '* Requerido'
        ]">
        <template v-slot:prepend><q-icon name="fas fa-sort" /></template>
    </q-select>-->
    <q-select
        label="Sentido" placeholder="Seleccione el sentido para ordenar datos" emit-value map-options filled
        :options="[{value: 'asc', label: 'ascendente'},{value: 'desc', label: 'descendente'}]"
        :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="orderBy"
        ref="orderBy"
        :rules="[
          val => !!val || '* Requerido'
        ]">
        <template v-slot:prepend><q-icon name="fas fa-sort-alpha-up-alt" /></template>
    </q-select>
    <q-input
        label="Filtro Adicional" placeholder="Ingrese sentencia SQL para filtrar datos. Ejemplo: and A.caseID in (select caseID from casCasesUsers z1 where z1.sys_company_id = @sys_company_id and z1.sys_user_code = @sys_user_code)" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="extraFilter"
        />
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
        extraFilter: {
            get () { return this.$store.state[this.moduleName].editData.basic.extraFilter },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'extraFilter', value: val}) }
        },
        lookup_tables: {
            get () { return this.$store.state[this.moduleName].editData.lookup_tables },
        },
        lookup_cols: {
            get () { return this.$store.state[this.moduleName].editData.lookup_cols },
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_color', value: val}) }
        },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    },
})
</script>
