<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
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

    <q-editor
        v-model="nextDateComments" placeholder="Comentarios de la Próxima Actividad"
        :toolbar="[['bold', 'italic', 'strike', 'underline'],['quote', 'unordered', 'ordered', 'outdent', 'indent'],]"
        />
    
   

    <br><br>

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
