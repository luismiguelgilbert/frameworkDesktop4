<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div class="row">
      <q-toggle class="col-4"
        tabindex="-1"
        v-model="estado" icon="fas fa-check" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>

    <!--caseID-->
    <selectSearchable 
        prependIcon="fas fa-folder-open"
        labelText="Caso (*)" labelSearchText="Buscar Caso"
        :optionsList="this.lookup_cases"
        rowValueField="value" optionsListLabel="label" optionsListCaption="customerName"
        optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="false"
        :initialValue="caseID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Caso', field: 'label', align: 'left'}
                ,{ name: 'customerName', label: 'Cliente', field: 'customerName', align: 'left'}
                ,{ name: 'customerShortName', label: 'Nombre Comercial', field: 'customerShortName', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.caseID = row.value;
            }"
        />
    <!--<q-input
        ref="caseName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione el Caso (*)" label="Caso (*)" filled
        :value="caseName"
        @keyup.keyCodes.113="openSearchCase('caseID','caseName',caseID)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-folder-open" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchCase('caseID','caseName',caseID)"/></template>
    </q-input>-->
    
    <!--taskType-->
    <selectSearchable 
        prependIcon="fas fa-tasks"
        labelText="Tipo de Actividad (*)" labelSearchText="Buscar Tipo de Actividad"
        :optionsList="this.lookup_taskTypes"
        rowValueField="value" optionsListLabel="label" optionsListCaption="short_name_es"
        optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="false"
        :initialValue="taskTypeID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Tipo de Actividad', field: 'label', align: 'left'}
                ,{ name: 'short_name_es', label: 'Abreviado', field: 'short_name_es', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.taskTypeID = row.value;
            }"
        />
    <!--<q-input
        ref="taskTypeName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione el Tipo de Actividad (*)" label="Tipo de Actividad (*)" filled
        :value="taskTypeName"
        @keyup.keyCodes.113="openSearchTaskType('taskTypeID','taskTypeName',taskTypeID)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-tasks" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchTaskType('taskTypeID','taskTypeName',taskTypeID)"/></template>
    </q-input>-->

    <q-input
        ref="taskDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        mask="date" :rules="['date']"
        placeholder="Ingrese la Fecha de la Actividad" label="Fecha de Actividad" filled
        v-model="taskDate"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_taskDate" transition-show="scale" transition-hide="scale">
              <q-date v-model="taskDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
    </q-input>

    <q-editor
        v-model="comments" placeholder="Ingrese sus Comentarios de la actividad que realizó"
        :toolbar="[['bold', 'italic', 'strike', 'underline'],['quote', 'unordered', 'ordered', 'outdent', 'indent'],]"
        />

    <q-input
        ref="taskLength" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba la Duración de la Actividad en Horas o fracción (*)" label="Duración en Horas (*)" filled
        v-model="taskLength" type="number" :min=0
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-clock" /></template>
    </q-input>

    <div class="row q-mt-none q-mb-md" >
      <q-toggle 
        v-model="taskBillable" icon="fas fa-check" color="positive" label="Facturable?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>

    <br><br>

</q-form>
</template>
<script>
/*
import Vue from 'vue';
import Vuex from 'vuex';
*/
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import mainLookup from '../../../components/mainLookup/mainLookup.vue'

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        selectSearchable:selectSearchable
        ,mainLookup: mainLookup
    },
    data () {
        return {
            isSearchDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,isSearchTaskTypeDialog: false
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        openSearchCase(UpdateFieldValueName, UpdateFieldLabelName, predefinedValue){
            this.mainLookupUpdateFieldValueName = UpdateFieldValueName
            this.mainLookupUpdateFieldLabelName = UpdateFieldLabelName
            this.mainLookupPredefinedValue = predefinedValue
            this.isSearchDialog = true
        },
        openSearchTaskType(UpdateFieldValueName, UpdateFieldLabelName, predefinedValue){
            this.mainLookupUpdateFieldValueName = UpdateFieldValueName
            this.mainLookupUpdateFieldLabelName = UpdateFieldLabelName
            this.mainLookupPredefinedValue = predefinedValue
            this.isSearchTaskTypeDialog = true
        },
        updateValues(selectedRows, lookupValueField, lookupLabelField){
            this[this.mainLookupUpdateFieldValueName] = selectedRows[0][lookupValueField]
            this[this.mainLookupUpdateFieldLabelName] = selectedRows[0][lookupLabelField]
            this.isSearchDialog = false
            this.isSearchTaskTypeDialog = false
        },
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
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        caseID: {
            get () { return this.$store.state[this.moduleName].editData.basic.caseID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'caseID', value: val}) }
        },
        caseName: {
            get () { return this.$store.state[this.moduleName].editData.basic.caseName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'caseName', value: val}) }
        },
        taskTypeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.taskTypeID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'taskTypeID', value: val}) }
        },
        taskTypeName: {
            get () { return this.$store.state[this.moduleName].editData.basic.taskTypeName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'taskTypeName', value: val}) }
        },
        taskDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.taskDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'taskDate', value: val}) }
        },
        taskLength: {
            get () { return this.$store.state[this.moduleName].editData.basic.taskLength },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'taskLength', value: val}) }
        },
        taskBillable: {
            get () { return this.$store.state[this.moduleName].editData.basic.taskBillable },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'taskBillable', value: val}) }
        },
        nextDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.nextDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'nextDate', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        nextDateComments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.nextDateComments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'nextDateComments', value: val}) }
        },
        lookup_cases: {
            get () { return this.$store.state[this.moduleName].editData.lookup_cases },
        },
        lookup_taskTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taskTypes },
        },
    },
})
</script>
