<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div class="row">
        <q-toggle class="col-12 col-md-4"
            tabindex="-1"
            v-model="voided" icon="fas fa-ban" color="red" label="Anulado?" :disable="(!editStatus.editMode&&!allow_edit)||(editStatus.editMode&&!allow_insert)"
            />
    </div>

    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba un nombre descriptivo del Cálculo de Comisiones, por ejemplo el Periodo (*)" label="Descripción del Cálculo de Comisiones (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-info-circle" /></template>
    </q-input>

    <selectSearchable 
        prependIcon="fas fa-database"
        labelText="Tabla de Datos (*)" labelSearchText="Tabla de Datos"
        :optionsList="this.lookup_rewTables"
        rowValueField="value" optionsListLabel="label" optionsListCaption="comments" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(editStatus.editMode==false) || (allow_edit==false && allow_insert==false)"
        :initialValue="rewTableID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Tabla de Datos', field: 'label', align: 'left'}
                ,{ name: 'comments', label: 'Comentarios', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                //this.$emit('onRunMethod',{tabName: 'lines', methodName: 'clearRows'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
                this.rewTableID=row.value;
                //this.partnerName=row.label;//usado en el asiento contable, en la línea de proveedor (campo comentario), 
                //this.$emit('onRunMethod',{tabName: 'lines', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
                this.loadTableData()
            }"
        />

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Cálculo de Comisiones" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />

    <br><br>
</q-form>
</template>
<script>
/*import Vue from 'vue';
import Vuex from 'vuex';
*/
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        selectSearchable: selectSearchable
        //,computeFunctions: computeFunctions
        //,partnersEdit: () => import('../../../pages/RootMaster/Partners/PartnersEdit.vue')
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        loadTableData(){
                this.$q.loading.show()
                this.$axios({
                    method: 'GET',
                    url: this.apiURL + 'spRewMasterTableDataSelect',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        userLanguage: 'es',
                        rewTableID: this.rewTableID,
                    }
                }).then((response) => {
                    this.lookup_fields = JSON.parse(response.data[0].lookup_fields)
                    this.lookup_ranges = JSON.parse(response.data[0].lookup_ranges)
                    this.lookup_operators = JSON.parse(response.data[0].lookup_operators)
                    this.lookup_data = JSON.parse(response.data[0].lookup_data)
                    this.$q.loading.hide()
                }).catch((error) => {
                    console.dir(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.$q.loading.hide()
                })
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
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
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
        },
        voided: {
            get () { return this.$store.state[this.moduleName].editData.basic.voided },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'voided', value: val}) }
        },
        rewTableID: {
            get () { return this.$store.state[this.moduleName].editData.basic.rewTableID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'rewTableID', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_rewTables: {
            get () { return this.$store.state[this.moduleName].editData.lookup_rewTables },
        },
        lookup_fields: {
            get () { return this.$store.state[this.moduleName].editData.lookup_fields },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_fields', value: val}) }
        },
        lookup_ranges: {
            get () { return this.$store.state[this.moduleName].editData.lookup_ranges },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_ranges', value: val}) }
        },
        lookup_operators: {
            get () { return this.$store.state[this.moduleName].editData.lookup_operators },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_operators', value: val}) }
        },
        lookup_data: {
            get () { return this.$store.state[this.moduleName].editData.lookup_data },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_data', value: val}) }
        },
    },
})
</script>
