<template>
<div class="row">
    <div class="col-auto">
        <q-list bordered separator class="scroll" style="height: calc(100vh - 180px); min-width: 300px;">
            <q-toolbar class="bg-primary text-white" >
                <q-toolbar-title>Productos por Lote</q-toolbar-title>
            </q-toolbar>
            <q-item clickable v-ripple v-for="line in lines.filter(x=>x.systemType==4 && (x.newQuantity>0||x.quantityRcvd>0) )" :key="line.stockID" @click="selectedColumn = line"
                :class="selectedColumn==line?'bg-blue-5 text-white':undefined">
                <q-item-section>
                    <q-item-label>{{line.invName}}</q-item-label>
                    <q-item-label caption>
                        <div v-if="editStatus.editMode=='create'">
                            Recibir: {{line.newQuantity.toFixed(2)}}
                            // Lotes: {{lots.filter(x=>x.stockID==line.stockID).reduce(function(acc,record){return acc + parseFloat(record.quantity) },0).toFixed(2) }}
                        </div>
                        <div v-if="editStatus.editMode=='edit'">
                            Recibido: {{line.quantityRcvdThisMove.toFixed(2)}}
                            // Lotes: {{lots.filter(x=>x.stockID==line.stockID).reduce(function(acc,record){return acc + parseFloat(record.quantity) },0).toFixed(2)}}
                        </div>
                    </q-item-label>
                    <!--Antes // Lotes: {{lots.filter(x=>x.lineID==line.lineID).reduce(function(acc,record){return acc + parseFloat(record.quantity) },0)}}-->
                </q-item-section>
                <q-item-section side v-if="editStatus.editMode=='create'">
                    <q-icon color="red" name="fas fa-exclamation" 
                        v-if="line.newQuantity != lots.filter(x=>x.stockID==line.stockID).reduce(function(acc,record){return acc + parseFloat(record.quantity) },0)" />
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
                <q-btn v-if="editStatus.editMode=='create'" color="primary" icon="fas fa-barcode" label="Registrar Nuevo Lote" no-caps class="q-mr-md" title="Registrar Nuevo Lote" @click="addNewLot" />
                <q-btn v-if="editStatus.editMode=='create'" color="primary" icon="fas fa-list" label="Seleccionar Lote" no-caps title=" Seleccionar lotes recibidos anteriormente" @click="newLineDialog=true" />
            </q-toolbar>
            <q-card-section>
                <q-list bordered separator class="scroll" style="height: calc(100vh - 255px);" >
                    <q-item v-for="line in lots.filter(x=>x.stockID==selectedColumn.stockID)" :key="line.rowID">
                        <q-item-section>
                            <q-item-label>Lote: {{line.name_es}}</q-item-label>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>
                                <q-input 
                                    filled dense stack-label label="Cantidad" :readonly="editStatus.editMode=='edit'"
                                    :value="line.quantity" type="number" :min="0" :max="selectedColumn.newQuantity"
                                    debounce="1000" @input="(value)=>{updateRow(value,'quantity',line)}"
                                    />
                            </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn side v-if="editStatus.editMode=='create'" dense flat round color="red" icon="fas fa-trash-alt" @click="lots=lots.filter(x=>x.rowID!=line.rowID)" />
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
                    ,{ name: 'lastRcvdDate', required: true, label: 'Última Movimiento', align: 'left', field: row => row.lastRcvdDate, sortable: false}
                    //{ name: 'warrantyDate', required: true, label: 'Fecha Garantía', align: 'left', field: row => row.warrantyDate, sortable: false,    }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
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
    props: {
        moduleName: { type: String , required: true },
    },   
    components: {
        mainLookup: mainLookup
    },
    data () {
        return {
            selectedColumn: null, newLineDialog: false
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
                    ,stockID: this.selectedColumn.stockID//este StockID es único porque viene de la tabla invKardexOrders donde campo StockID es primaryKey
                    ,invID: this.selectedColumn.invID
                    ,lotID: x.lotID
                    ,name_es: x.name_es
                    ,quantity: this.selectedColumn.newQuantity
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
        addNewLot(){
            this.$q.dialog({
                title: 'Nuevo Lote',
                message: 'Escriba el número del nuevo lote',
                prompt: { model: '', type: 'text'},
                cancel: true,
                persistent: false
            }).onOk(data => {
                if(data.length>0){
                    if(!(this.lookup_lots.filter(t=>t.invID==this.selectedColumn.invID).some(x=>x.name_es.toUpperCase()==data.toUpperCase()))){
                        if(!(this.lots.filter(t=>t.invID==this.selectedColumn.invID).some(x=>x.name_es.toUpperCase()==data.toUpperCase()))){
                            this.addRow([{
                                 lotID: 0
                                ,name_es: data.toUpperCase()
                            }])
                        }
                    }else{
                        this.$q.notify({message: 'Número ya existe', color: 'red'})
                    }
                    /*
                    console.dir(this.lots)
                    console.dir(this.lookup_lots)
                    console.dir(data)
                    */
                }
                
                // console.log('>>>> OK, received', data)
            })
        },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
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
        allow_disable: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_disable').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        //editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        editStatus: {
          get () { return this.$store.state[this.moduleName].editStatus },
        },
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
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lots', value: val}) }
        },
        lookup_lots: {
            get () { return this.$store.state[this.moduleName].editData.lookup_lots },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_lots', value: val}) }
        },
    },
})
</script>
