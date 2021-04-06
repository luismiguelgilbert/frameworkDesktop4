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
                            Entregar: {{line.newQuantity.toFixed(6)}}
                            // Lotes: {{lots.filter(x=>x.stockID==line.stockID).reduce(function(acc,record){return acc + parseFloat(record.quantity) },0).toFixed(6) }}
                        </div>
                        <div v-if="editStatus.editMode=='edit'">
                            Entregado: {{line.quantityRcvdThisMove}}
                            // Lotes: {{lots.filter(x=>x.stockID==line.stockID).reduce(function(acc,record){return acc + parseFloat(record.quantity) },0).toFixed(6) }}
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

    <!--
    <q-dialog v-model="newLineDialog">
        <mainLookup v-if="selectedColumn"
            titleBar="Buscar Lotes"
            :data="this.lookup_lots.filter(x=>x.estado && x.invID == selectedColumn.invID)"
            :dataRowKey="'lotID'"
            :selectionMode="'single'"
            :columns="[
                    //{ name: 'value', required: true, label: 'Código', align: 'left', field: row => row.short_name_es , sortable: true }
                     { name: 'name_es', required: true, label: '# Lote', align: 'left', field: row => row.name_es, sortable: false,    }
                    ,{ name: 'expirationDate', required: true, label: 'Fecha Expiración', align: 'left', field: row => row.expirationDate, sortable: true}
                    ,{ name: 'firstRcvdDate', required: true, label: 'Primer Movimiento', align: 'left', field: row => row.firstRcvdDate, sortable: true}
                    ,{ name: 'lastRcvdDate', required: true, label: 'Último Movimiento', align: 'left', field: row => row.lastRcvdDate, sortable: true}
                    //{ name: 'warrantyDate', required: true, label: 'Fecha Garantía', align: 'left', field: row => row.warrantyDate, sortable: false,    }
                    ,{ name: 'quantityAvailable', required: true, label: 'Cantidad Disponible', align: 'right', field: row => row.quantityAvailable, sortable: true, style: 'max-width: 75px;', }
                    ]"
            @onCancel="newLineDialog=false"
            @onSelect="(selectedRows)=>{addRow(selectedRows)}"
        />
    </q-dialog>
    -->

    <DxPopup
      :visible.sync="newLineDialog"
      :drag-enabled="true"
      :close-on-outside-click="false"
      :show-title="true"
      width="calc(85vw)"
      height="calc(75vh)"
      @shown="listGridShown"
      >
        <DxToolbarItem text="Seleccionar registros" location="before" :options="{ class: 'text-primary' }"></DxToolbarItem>
        <q-separator />
        <div style="margin: -15px;">
            <DxDataGrid
                ref="dxGridSearchList"
                height="calc(75vh - 115px)"
                width="100%"
                column-resizing-mode="widget"
                :data-source="computedLookupLots"
                :allow-column-resizing="true" 
                :allow-column-reordering="true"
                :show-borders="false"
                :show-column-lines="userTableLinesDXcols"
                :show-row-lines="userTableLinesDXrows"
                key-expr="lotID"
                :selected-row-keys.sync="selectedRows"
                >
                <!-- 
                    
                    :data-source="lookup_lots.filter(x=>x.estado && x.invID == selectedColumn.invID)"
                -->
                <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
                <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />

                <DxColumn caption="# Lote" data-field="name_es" name="name_es" data-type="string" alignment="left" :visible="true" />
                <DxColumn caption="Fecha Expiración" data-field="expirationDate" name="expirationDate" data-type="date" alignment="left" :visible="false" format="dd MMM yyyy" />
                <DxColumn caption="Primer Movimiento" data-field="firstRcvdDate" name="firstRcvdDate" data-type="date" alignment="left" :visible="true" format="dd MMM yyyy" />
                <DxColumn caption="Último Movimiento" data-field="lastRcvdDate" name="lastRcvdDate" data-type="date" alignment="left" :visible="false" format="dd MMM yyyy" />
                <DxColumn caption="Disponible" data-field="quantityAvailable" name="quantityAvailable" data-type="number" alignment="left" :visible="true" />
                    
            </DxDataGrid>
            <q-separator />
            <q-card-actions align="around">
                <q-btn icon="fas fa-save" no-caps flat color="primary" label="Agregar más antiguos primero (Primer Movimiento)" :disable="selectedRows==null||selectedRows.length<=0" @click="addRow(selectedRows,0)" />
                <q-btn icon="fas fa-save" no-caps flat color="primary" label="Agregar más recientes primero (Primer Movimiento)" :disable="selectedRows==null||selectedRows.length<=0" @click="addRow(selectedRows,1)" />
            </q-card-actions>
        </div>
        
    </DxPopup>
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import mainLookup from '../../../components/mainLookup/mainLookup.vue'
import DxPopup, { DxToolbarItem  } from 'devextreme-vue/popup';
import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxLookup, DxValueFormat } from 'devextreme-vue/data-grid';
import { parseDate } from 'app/node_modules/devextreme/localization';

export default ({
    props: {
        moduleName: { type: String , required: true },
    },   
    components: {
        mainLookup: mainLookup
        ,DxPopup: DxPopup
        ,DxToolbarItem: DxToolbarItem
        ,DxDataGrid: DxDataGrid
        ,DxColumn: DxColumn
        ,DxColumnFixing: DxColumnFixing
        ,DxScrolling: DxScrolling
        ,DxPaging: DxPaging
        ,DxStateStoring: DxStateStoring
        ,DxSorting: DxSorting
        ,DxHeaderFilter: DxHeaderFilter
        ,DxSelection: DxSelection
        ,DxLookup: DxLookup
        ,DxValueFormat: DxValueFormat
    },
    data () {
        return {
            selectedColumn: null, newLineDialog: false, selectedRows: null
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
        addRow(selectedRows,rowOrderTake){
            //rowOrderTake == 0 => desde primer movimiento hacia último movimiento
            //rowOrderTake == 1 => desde último movimiento hacia primer movimiento
            let newRows = JSON.parse(JSON.stringify(this.lots))
            let selectedRowsData = this.lookup_lots.filter(x=> selectedRows.some(y=> x.lotID==y));
            let matchQty = this.selectedColumn.newQuantity
            let rowQty = 0
            

            let max_id = 1
            if(this.lots.length > 0){
                let temp = this.getMax(this.lots, "rowID");
                //max_id = parseInt(temp.rowID) + parseInt(1);
                max_id = parseInt(temp.rowID);
            }

            //rowOrderTake == 0 => desde primer movimiento hacia último movimiento
            if(rowOrderTake==0){
                selectedRowsData.sort((a, b) => new Date(a.firstRcvdDate) - new Date(b.firstRcvdDate) )
            }
            //rowOrderTake == 1 => desde último movimiento hacia primer movimiento
            if(rowOrderTake==1){
                selectedRowsData.sort((a, b) => new Date(b.firstRcvdDate) - new Date(a.firstRcvdDate) )
            }
            

            selectedRowsData.map(x=>{
                max_id++;
                rowQty = matchQty > x.quantityAvailable ? x.quantityAvailable.toFixed(6) : matchQty.toFixed(6)
                if(x.quantityAvailable > 0 && rowQty > 0){
                    newRows.push({
                        rowID: max_id
                        ,lineID: this.selectedColumn.lineID
                        ,stockID: this.selectedColumn.stockID//este StockID es único porque viene de la tabla invKardexOrders donde campo StockID es primaryKey
                        ,invID: this.selectedColumn.invID
                        ,lotID: x.lotID
                        ,name_es: x.name_es
                        //,quantity: x.quantityAvailable
                        //,quantity: (this.selectedColumn.newQuantity>x.quantityAvailable)?x.quantityAvailable:this.selectedColumn.newQuantity//si cantidad x recibir excede disponible, entonces pongo disponible
                        ,quantity: rowQty
                    })
                    matchQty = matchQty - rowQty;
                }
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
        listGridShown(){
            this.selectedRows = null;
        }
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
        editStatus: {
          get () { return this.$store.state[this.moduleName].editStatus },
        },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        userTableLinesDXcols: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='vertical'){ result = true }
                return result
            } 
        },
        userTableLinesDXrows: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='horizontal'){ result = true }
                return result
            } 
        },
        userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage }  },
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
        computedLookupLots:{
            get() {
                let results = []
                if(this.selectedColumn&&this.selectedColumn.invID){
                    results = this.lookup_lots.filter(x=>x.estado && x.invID == this.selectedColumn.invID)
                }
                return results
            }
        }
     
    },
})
</script>
