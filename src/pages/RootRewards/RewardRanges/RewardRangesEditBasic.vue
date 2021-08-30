<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div class="row">
        <q-toggle class="col-12 col-md-12"
            tabindex="-1"
            v-model="estado" icon="fas fa-check" color="positive" label="Estado" 
            />
    </div>

    <q-input
        ref="name_es" :readonly="(editStatus.editMode==false) || (allow_edit==false && allow_insert==false)"
        placeholder="Ingrese Descripción de la Tabla de Rangos (*)" label="Descripción (*)" filled
        v-model="name_es" counter
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>


    <!--rewTables-->
    <!--optionsListCaption="partner_ruc"-->
    <selectSearchable 
        prependIcon="fas fa-table"
        labelText="Tabla de Cálculo (*)" labelSearchText="Tabla de Cálculo"
        :optionsList="lookup_rewTables"
        rowValueField="value" optionsListLabel="label"  optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(editStatus.editMode==false) || (allow_edit==false && allow_insert==false)"
        :initialValue="rewTableID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Proveedor', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                //this.$emit('onRunMethod',{tabName: 'lines', methodName: 'clearRows'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
                this.rewTableID=row.value;
            }"
        />

    <selectSearchable 
        prependIcon="fas fa-calculator"
        labelText="Tipo Resultado (*)" labelSearchText="Tipo Resultado"
        :optionsList="lookup_rewRangesResultTypes"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(editStatus.editMode==false) || (allow_edit==false && allow_insert==false) "
        :initialValue="rangeTableResultType"
        :tableSearchColumns="[
                 { name: 'label', label: 'Proveedor', field: 'label', align: 'left'}
                //,{ name: 'code_es', label: '# Identificación', field: 'code_es', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.rangeTableResultType=row.value;
                //this.$emit('onRunMethod',{tabName: 'lines', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
            }"
        />
    
 
    
    <!--<q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Pedido" filled
        type="textarea" :readonly="(!editStatus.editMode&&!allow_edit)||(editStatus.editMode&&!allow_insert)"
        v-model="comments"
        />-->
    <br><br>

</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import xml2js from 'xml2js'
//import computeFunctions from './computeFunctions.js'

export default ({
    components: {
        selectSearchable: selectSearchable
        //,computeFunctions: computeFunctions
        //,partnersEdit: () => import('../../../pages/RootMaster/Partners/PartnersEdit.vue')
    },
    data () {
        return {
            moduleName: "RewardRanges"

            ,isPartnerDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,xmlFile: null
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{

    },
    computed:{
        console: () => console,
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userCompanies: { get () { return this.$store.state.main.userCompanies } },
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
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        rewTableID:  {
            get () { return this.$store.state[this.moduleName].editData.basic.rewTableID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'rewTableID', value: val}) }
        },
        rangeTableResultType:  {
            get () { return this.$store.state[this.moduleName].editData.basic.rangeTableResultType },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'rangeTableResultType', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_rewTables: {
            get () { return this.$store.state[this.moduleName].editData.lookup_rewTables },
        },
        lookup_rewRangesResultTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_rewRangesResultTypes },
        },
            /*lines: {
                get () { return this.$store.state[this.moduleName].editData.lines },
                set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
            },*/
    },
})
</script>
