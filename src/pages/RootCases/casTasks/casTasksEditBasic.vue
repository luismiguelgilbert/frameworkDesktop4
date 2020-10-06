<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
      <q-toggle class="col-4"
        v-model="estado" icon="fas fa-check" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>

    <!--caseID-->
    <q-input
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
    </q-input>
    
    <!--taskType-->
    <q-input
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
    </q-input>

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

    <q-input
        ref="nextDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        mask="date" :rules="['date']"
        placeholder="Ingrese la Fecha de la Próxima Actividad" label="Próxima Actividad" filled
        v-model="nextDate" 
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_nextDate" transition-show="scale" transition-hide="scale">
              <q-date v-model="nextDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
    </q-input>

    <div class="text-primary text-bolder">Comentarios:</div>
    <q-editor
        v-model="comments"
        :toolbar="[['bold', 'italic', 'strike', 'underline'],['quote', 'unordered', 'ordered', 'outdent', 'indent'],]"
        />
    <!--<q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Socio" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />-->

    <br><br>

    <!--Dialog Casos-->
    <q-dialog v-model="isSearchDialog">
        <mainLookup 
            titleBar="Buscar Caso"
            :data="this.lookup_cases"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :predefinedValue="mainLookupPredefinedValue"
            :columns="[
                    ,{ name: 'label', required: true, label: 'Nombre del Caso', align: 'left', field: row => `${'     '.repeat(row.account_level) + row.label} `, sortable: false,    }
                    ,{ name: 'caseTypeName', required: true, label: 'Tipo de Caso', align: 'left', field: row => row.caseTypeName , sortable: false, style: 'min-width: 200px; max-width: 200px;' }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            @onCancel="isSearchDialog=false"
            @onSelect="(selectedRows)=>{updateValues(selectedRows, 'value', 'label')}"
        />
    </q-dialog>

    <!--Dialog Casos-->
    <q-dialog v-model="isSearchTaskTypeDialog">
        <mainLookup 
            titleBar="Buscar Caso"
            :data="this.lookup_taskTypes"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :predefinedValue="mainLookupPredefinedValue"
            :columns="[
                    ,{ name: 'label', required: true, label: 'Nombre del Caso', align: 'left', field: row => `${'     '.repeat(row.account_level) + row.label} `, sortable: false,    }
                    ,{ name: 'caseTypeName', required: true, label: 'Tipo de Caso', align: 'left', field: row => row.caseTypeName , sortable: false, style: 'min-width: 200px; max-width: 200px;' }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            @onCancel="isSearchTaskTypeDialog=false"
            @onSelect="(selectedRows)=>{updateValues(selectedRows, 'value', 'label')}"
        />
    </q-dialog>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import mainLookup from '../../../components/mainLookup/mainLookup.vue'

export default ({
    components: {
        mainLookup: mainLookup
    },
    data () {
        return {
            moduleName: "casTasks"
            ,isSearchDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
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
            this[this.mainLookupUpdateFieldValueName] = selectedRows[0].[lookupValueField]
            this[this.mainLookupUpdateFieldLabelName] = selectedRows[0].[lookupLabelField]
            this.isSearchDialog = false
            this.isSearchTaskTypeDialog = false
        },
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
        lookup_cases: {
            get () { return this.$store.state[this.moduleName].editData.lookup_cases },
        },
        lookup_taskTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taskTypes },
        },
    },
})
</script>
