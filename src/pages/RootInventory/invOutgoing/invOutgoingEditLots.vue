<template>
<div class="row">
    <div class="col-auto">
        <q-list bordered separator class="scroll" style="height: calc(100vh - 180px); min-width: 300px;">
            <q-toolbar class="bg-primary text-white" >
                <q-toolbar-title>Productos por Lote</q-toolbar-title>
            </q-toolbar>
            <q-item clickable v-ripple v-for="line in lines.filter(x=>x.systemType==4 && x.newQuantity>0)" :key="line.lineID" @click="selectedColumn = line"
                :class="selectedColumn==line?'bg-blue-5 text-white':undefined">
                <q-item-section>
                    <q-item-label>{{line.invName}}</q-item-label>
                    <q-item-label caption>
                        Entregar: {{line.newQuantity}}
                        // Lotes: {{lots.filter(x=>x.lineID==line.lineID).reduce(function(acc,record){return acc + parseFloat(record.quantity) },0)}}
                    </q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-icon color="red" name="fas fa-exclamation" 
                        v-if="line.newQuantity != lots.filter(x=>x.lineID==line.lineID).reduce(function(acc,record){return acc + parseFloat(record.quantity) },0)" />
                    <q-icon v-else color="positive" name="fas fa-check" />
                </q-item-section>
            </q-item>
            <q-separator />
        </q-list>
    </div>

    <div class="col">
        <q-card flat style="height: calc(100vh - 180px)" class="q-pa-sm" v-if="selectedColumn">
            <q-toolbar>
                <q-space />
                <q-btn v-if="editMode" color="primary" icon="fas fa-plus" label="Entrega" no-caps title="Agregar Entrega" @click="newLineDialog=true" />
            </q-toolbar>
            <q-card-section>
                <q-list bordered separator class="scroll" style="height: calc(100vh - 255px);" >
                    <q-item v-for="line in lots.filter(x=>x.lineID==selectedColumn.lineID)" :key="line.rowID">
                        <q-item-section>
                            <q-item-label>Lote: {{line.name_es}}</q-item-label>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>
                                <q-input 
                                    filled dense stack-label label="Cantidad" :readonly="!editMode"
                                    :value="line.quantity" type="number" :min="0" :max="selectedColumn.newQuantity"
                                    debounce="1000" @input="(value)=>{updateRow(value,'quantity',line)}"
                                    />
                            </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn v-if="editMode" dense flat round color="red" icon="fas fa-trash-alt" @click="lots=lots.filter(x=>x.rowID!=line.rowID)" />
                        </q-item-section>
                    </q-item>
                    <q-separator />
                </q-list>
            </q-card-section>
            
        </q-card>
    </div>

    <q-dialog v-model="newLineDialog">
        <mainLookup v-if="selectedColumn"
            titleBar="Buscar Lotes"
            :data="this.lookup_lots.filter(x=>x.estado && x.invID == selectedColumn.invID)"
            :dataRowKey="'lotID'"
            :selectionMode="'single'"
            :columns="[
                    //{ name: 'value', required: true, label: 'Código', align: 'left', field: row => row.short_name_es , sortable: true }
                    { name: 'name_es', required: true, label: '# Lote', align: 'left', field: row => row.name_es, sortable: false,    }
                    ,{ name: 'expirationDate', required: true, label: 'Fecha Expiración', align: 'left', field: row => row.expirationDate, sortable: false}
                    //{ name: 'warrantyDate', required: true, label: 'Fecha Garantía', align: 'left', field: row => row.warrantyDate, sortable: false,    }
                    ,{ name: 'quantityAvailable', required: true, label: 'Cantidad Disponible', align: 'right', field: row => row.quantityAvailable, sortable: false, style: 'max-width: 75px;', }
                    ]"
            @onCancel="newLineDialog=false"
            @onSelect="(selectedRows)=>{addRow(selectedRows)}"
        />
    </q-dialog>
</div>
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
            moduleName: "invOutgoing", selectedColumn: null, newLineDialog: false
            //: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
        }
    },
    mounted(){
        //this.$refs.formulario.validate()
    },
    methods:{
        getMax(arr, prop) {
            var max;
            for (var i=0 ; i<arr.length ; i++) {
                if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                    max = arr[i];
            }
            return max;
        },
        addRow(selectedRows){
            let newRows = JSON.parse(JSON.stringify(this.lots))
            
            let max_id = 1
            if(this.lots.length > 0){
                let temp = this.getMax(this.lots, "rowID");
                max_id = parseInt(temp.rowID) + parseInt(1);
            }

            selectedRows.map(x=>{
                newRows.push({
                     rowID: max_id
                    ,lineID: this.selectedColumn.lineID
                    ,invID: this.selectedColumn.invID
                    ,lotID: x.lotID
                    ,name_es: x.name_es
                    ,quantity: x.quantityAvailable
                })
            })
            this.lots = newRows
            this.newLineDialog = false
            
        },
        updateRow(newVal, colName, row){
            try{
                //Actualiza las líneas
                let newRows = JSON.parse(JSON.stringify(this.lots))
                newRows.find(x=>x.rowID==row.rowID)[colName] = parseFloat(newVal);
                this.lots = newRows
            }catch(ex){
                console.error(ex)
            }
        },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
        partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerName', value: val}) }
        },
        moveDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.moveDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'moveDate', value: val}) }
        },
        whID: {
            get () { return this.$store.state[this.moduleName].editData.basic.whID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'whID', value: val}) }
        },
        invDocTypeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.invDocTypeID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'invDocTypeID', value: val}) }
        },
        invDocNumber:  {
            get () { return this.$store.state[this.moduleName].editData.basic.invDocNumber },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'invDocNumber', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_partners: {
            get () { return this.$store.state[this.moduleName].editData.lookup_partners },
        },
        lookup_wh: {
            get () { return this.$store.state[this.moduleName].editData.lookup_wh },
        },
        lookup_invDocTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_invDocTypes },
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        lots: {
            get () { return this.$store.state[this.moduleName].editData.lots },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLots', val) }
        },
        lookup_lots: {
            get () { return this.$store.state[this.moduleName].editData.lookup_lots },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLookupLots', val) }
        },
    },
})
</script>
