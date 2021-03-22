<template>
    <div style="margin: -16px;">
        <q-toolbar class="no-padding">
            <q-btn v-if="tabRecord.tabConfig.insertAllowed && tabRecord.tabConfig.insertType=='form' && ( (editStatus.editMode=='edit'&&allow_edit) || (editStatus.editMode=='create'&&allow_insert) )" flat stretch label="Nuevo" color="primary" icon="fas fa-plus" @click="addForm" />
            <q-btn v-if="tabRecord.tabConfig.insertAllowed && tabRecord.tabConfig.insertType=='list' && ( (editStatus.editMode=='edit'&&allow_edit) || (editStatus.editMode=='create'&&allow_insert) )" flat stretch label="Nuevo" color="primary" icon="fas fa-plus" @click="addList" />
            <q-btn v-if="tabRecord.tabConfig.deleteAllowed && ( (editStatus.editMode=='edit'&&allow_edit) || (editStatus.editMode=='create'&&allow_insert) )" flat stretch label="Eliminar" color="red" icon="fas fa-trash-alt" :disable="!selectedRowKeys.length>0" @click="deleteSelectedRows" />
        </q-toolbar>
        <q-separator />
        <DxDataGrid
            ref="mainviewtableDxDataGrid"
            height="calc(100vh - 170px)"
            width="100%"
            column-resizing-mode="widget"
            :data-source="gridData"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="false"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            :key-expr="tabRecord.tabConfig.keyColumn"
            :selected-row-keys="selectedRowKeys" @selection-changed="onSelectionChanged"
            @row-updating="onRowUpdating"
            >
            <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
            <DxPaging :enabled="true" :page-size="userRowsPerPage" />
            <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
            <DxPager :visible="true" :show-page-size-selector="false" :allowed-page-sizes="allowedPageSizes" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="false" :showPageSizeSelector="false" />
            <DxStateStoring :enabled="true" type="localStorage" :storage-key="(moduleName + '_' + tabRecord.tabConfig.dataName)" :savingTimeout="500" />
            <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
            <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />
            <DxColumnFixing :enabled="true" :texts="{fix:'Fijar', unfix: 'Soltar'}" />
            <DxColumn v-for="columna in tabRecord.tabConfig.columns.filter(x=>x.dataField)" :key="columna.dataField"
                :caption="columna.caption"
                :data-field="columna.dataField"
                :data-type="columna.dataType=='textArea'?'string':columna.dataType"
                :visible="columna.visible"
                :allow-editing="columna.allowEditing"
                :format="columna.format?columna.format:undefined"
                alignment="left"
                >
                <DxLookup v-if="columna.lookupOptions"
                        value-expr="value" display-expr="label"
                        :data-source="columna.lookupOptions"
                />
            </DxColumn>
            <DxEditing 
                :allow-updating="( (editStatus.editMode=='edit'&&allow_edit) || (editStatus.editMode=='create'&&allow_insert) )" 
                mode="cell" :select-text-on-edit-start="true" start-edit-action="click" /> <!-- me gustan: cell, row, popup -->
        
      />
        </DxDataGrid>

        <!--Dialog para cuando es Formulario-->
        <q-dialog v-model="isFormDialog" square @show="formDialogShow">
            <q-card style="minWidth: calc(50%)">
                <q-bar class="bg-primary text-white">
                    Nuevo
                    <q-space />
                    <q-btn dense flat icon="close" v-close-popup />
                </q-bar>
                <q-card-section style="height: calc(50vh); overflow-y: scroll;">
                    <q-form autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" class="q-gutter-md">
                        <div v-for="campo in tabRecord.tabConfig.columns" :key="campo.dataField">
                            <q-input v-if="campo.dataType=='number'&&campo.allowEditing&&!(campo.lookupOptions)" v-model="formDialogData[campo.dataField]" filled stack-label :label="campo.caption" type="number" />
                            <q-select v-if="campo.dataType=='number'&&campo.allowEditing&&(campo.lookupOptions)" v-model="formDialogData[campo.dataField]" filled stack-label :label="campo.caption" :options="campo.lookupOptions" map-options emit-value />
                            <q-input v-if="campo.dataType=='string'&&campo.allowEditing" v-model="formDialogData[campo.dataField]" filled stack-label :label="campo.caption" />
                            <q-checkbox v-if="campo.dataType=='boolean'&&campo.allowEditing" v-model="formDialogData[campo.dataField]" :label="campo.caption" />
                            <q-input v-if="campo.dataType=='date'&&campo.allowEditing" v-model="formDialogData[campo.dataField]" :ref="campo.dataField" mask="date" :rules="['date']" filled stack-label :label="campo.caption">
                                <template v-slot:append>
                                    <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                                        <q-date v-model="formDialogData[campo.dataField]">
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                        </div>
                                        </q-date>
                                    </q-popup-proxy>
                                    </q-icon>
                                </template>
                                <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
                            </q-input>
                            <q-input v-if="campo.dataType=='textArea'&&campo.allowEditing" v-model="formDialogData[campo.dataField]" type="textarea" filled stack-label :label="campo.caption" />
                        </div>
                    </q-form>
                </q-card-section>
                <q-separator />
                <q-card-actions align="around" >
                    <q-btn icon="fas fa-save" flat color="primary" label="Agregar" @click="formSave" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!--Dialog para cuando es Lista-->
        <DxPopup
            :visible.sync="isListDialog"
            :drag-enabled="true"
            :close-on-outside-click="true"
            :show-title="true"
            width="calc(85vw)"
            height="calc(75vh)"
            >
                <DxToolbarItem text="Seleccionar registros" location="before"></DxToolbarItem>
                <DxToolbarItem location="after" widget="dxTextBox" :options="dxdialogSearchBoxOptions"></DxToolbarItem>

                <q-separator />
                
                <div style="margin: -16px;">
                    <DxDataGrid
                        ref="dxGridSearchList"
                        height="calc(75vh - 110px)"
                        width="100%"
                        :data-source="listData"
                        :show-borders="true"
                        :key-expr="tabRecord.tabConfig.listKeyColumn"
                        :selected-row-keys="listSelectedRowKeys" @selection-changed="onListSelectionChanged"
                        >
                        
                        <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
                        <DxPaging :enabled="true" :page-size="0" />
                        <DxPager :visible="false" />
                        <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />
                        <DxColumn v-for="columna in tabRecord.tabConfig.columns.filter(x=>x.listDataField)" :key="columna.dataField"
                            :caption="columna.caption"
                            :data-field="columna.listDataField"
                            :data-type="columna.dataType"
                            :visible="columna.visible"
                            alignment="left"
                            :min-width="columna.minWidth?columna.minWidth:undefined"
                            />
                        <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
                        <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
                        <!--<DxSearchPanel :visible="true" :width="240" placeholder="Buscar..." /> -->
                    </DxDataGrid>

                    <q-separator />
                    
                    <q-card-actions align="around">
                        <q-btn icon="fas fa-save" flat color="primary" label="Agregar" @click="listSave" :disable="!listSelectedRowKeys.length>0" />
                    </q-card-actions>
                </div>
        </DxPopup>

    </div>
</template>

<script>
import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxPager, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup /*, DxSearchPanel*/ } from 'devextreme-vue/data-grid';
import DxPopup, { DxToolbarItem  } from 'devextreme-vue/popup';
import DxTextBox from 'devextreme-vue/text-box';

export default ({
    name: 'editFormGrid',
    props: {
        moduleName: { type: String, required: true },
        tabRecord: { type: Object },
    },
    data () {
        return {
            selectedRowKeys: [], isFormDialog: false, formDialogData: {}, isListDialog: false, listSelectedRowKeys: [],
            searchTextBox: null,
            dxdialogSearchBoxOptions:{
                placeholder: "Buscar...",
                showClearButton: true,
                onContentReady: (e)=>{
                    this.searchTextBox = e;
                    setTimeout(()=>{ 
                        this.searchTextBox.component.focus();
                    }, 500);
                },
                onInput: (e)=>{
                    this.$refs['dxGridSearchList'].instance.searchByText(e.component.option('text'));
                }
            }
        }
    },
    components: {
        DxDataGrid,
        DxColumn,
        DxColumnFixing,
        DxScrolling,
        DxPager,
        DxStateStoring,
        DxSorting,
        DxPaging,
        DxHeaderFilter,
        DxSelection,
        DxEditing,
        DxPopup,
        DxLookup,
        DxToolbarItem,
        DxTextBox
        //DxSearchPanel
    },
    methods: {
        getMax(arr, prop) {
            var max;
            for (var i=0 ; i<arr.length ; i++) {
                if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                    max = arr[i];
            }
            return max;
        },
        onSelectionChanged({ selectedRowKeys, selectedRowsData }) {
            this.selectedRowKeys = selectedRowKeys;
        },
        deleteSelectedRows(){
            if(this.selectedRowKeys.length > 0){
                this.$q.dialog({ 
                    title: 'Confirmación'
                    ,persistent: false
                    ,message: 'Desea eliminar las líneas seleccionadas?'
                    ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true, color: 'red', flat: true }
                    ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
                }
                ).onOk(() => {
                    let newRows = JSON.parse(JSON.stringify(this.gridData.filter(x=>!this.selectedRowKeys.some(y=>y==x[this.tabRecord.tabConfig.keyColumn]))))
                    this.gridData = newRows;
                    this.selectedRowKeys = []//limpia selección para evitar problema de referencia a filas que no existan
                })
            }
        },
        onRowUpdating(e){
            try{
                e.cancel = true; //evita cambios
                e.component.cancelEditData(); //cancela cambios para que no quede ícono de revertir del dxdatagrid
                let newRows = JSON.parse(JSON.stringify(this.gridData)) //copia
                //toma nueva data y la "sobrepone" sobre la fila (assign sirve para "sobreponer" la data)
                newRows.filter(x=>x[this.tabRecord.tabConfig.keyColumn]==e.key).map(fila=>{
                    fila = Object.assign(fila, e.newData)
                    return fila
                })
                this.gridData = newRows;
            }catch(ex){
                console.error(ex.message)
            }
        },
        addForm(){
            this.isFormDialog = true
        },
        addList(){
            this.isListDialog = true
        },
        formSave(){
            let hasError = false;
            let errorFields = [];
            let newRow = {};
            //Agrega índice
            let newKeyValue = 1;
            if(this.gridData.length > 0){
                let temp = this.getMax(this.gridData, this.tabRecord.tabConfig.keyColumn);
                newKeyValue = parseInt(temp[this.tabRecord.tabConfig.keyColumn]) + parseInt(1);
            }
            newRow[this.tabRecord.tabConfig.keyColumn] = newKeyValue;
            //Agrega valores (excepto columna key) y además valida si el campo es requerido (y NO es boolean)
            this.tabRecord.tabConfig.columns.filter(y=>y.dataField!=this.tabRecord.tabConfig.keyColumn).map(x=>{
                if(x.dataType!='boolean'&&x.isDataRequired&&!(this.formDialogData[x.dataField])){
                    hasError = true;
                    errorFields.push(x.caption)
                }
                if(x.dataType=='string'){ newRow[x.dataField] = this.formDialogData[x.dataField] }
                if(x.dataType=='textArea'){ newRow[x.dataField] = this.formDialogData[x.dataField] }
                if(x.dataType=='date'){ newRow[x.dataField] = this.formDialogData[x.dataField] }
                if(x.dataType=='number'){ newRow[x.dataField] = this.formDialogData[x.dataField] ? parseInt(this.formDialogData[x.dataField]) : 0 }
                if(x.dataType=='boolean'){ newRow[x.dataField] = this.formDialogData[x.dataField] ? this.formDialogData[x.dataField] : true}
            })
            //Add Data
            if(hasError){
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Existen errores en los campos:<br/>- " +  errorFields.join('<br/>- ')
                    ,timeout: 3000, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }else{
                let newGridData = JSON.parse(JSON.stringify(this.gridData));
                newGridData.push(newRow);
                this.gridData = newGridData;
                this.isFormDialog = false;
            }
        },
        formDialogShow(){
            let initialFormDialogData = {};
            this.tabRecord.tabConfig.columns.map(col=>{
                if(col.defaultValue){
                    initialFormDialogData[col.dataField] = col.defaultValue;
                }else{
                    initialFormDialogData[col.dataField] = null;
                }
            })
            this.formDialogData = initialFormDialogData
        },
        onListSelectionChanged({ selectedRowKeys, selectedRowsData }) {
            this.listSelectedRowKeys = selectedRowKeys;
        },
        listSave(){
            let newGridData = JSON.parse(JSON.stringify(this.gridData));
            //Iterate selected Items
            this.listData.filter(x=>this.listSelectedRowKeys.some(y=>y==x[this.tabRecord.tabConfig.listKeyColumn])).map(row=>{
                //Check if selectedItem value already exists
                if(!newGridData.some(z=>z[this.tabRecord.tabConfig.keyColumn]==row[this.tabRecord.tabConfig.listKeyColumn])){//valida si ya existe en la lista
                    //If NOT exists then ADD item to list, haciendo una conversión de datos (entre lista lookup y lista de datos, porque no siempre los nombres de las columnas son iguales)
                    let newRow =  {}
                    //this.tabRecord.tabConfig.columns.filter(z=>z.listDataField).map(col=>{
                    this.tabRecord.tabConfig.columns.map(col=>{
                        if(row[col.listDataField]){
                            newRow[col.dataField] = row[col.listDataField]
                        }else{//no existe en el lookupList, entonces si tiene un campo x default lo agrego
                            if(!(col.defaultValue==undefined)){
                                newRow[col.dataField] = col.defaultValue
                            }
                        }
                        
                    })
                    newGridData.push(newRow)
                }
            })
            this.gridData = newGridData;
            this.isListDialog = false
        }

    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        gridData: {
            get () { return this.$store.state[this.moduleName].editData[this.tabRecord.tabConfig.dataName] },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: this.tabRecord.tabConfig.dataName, value: val}) }
        },
        listData: {
            get () { return this.$store.state[this.moduleName].editData[this.tabRecord.tabConfig.insertList] },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: this.tabRecord.tabConfig.dataName, value: val}) }
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
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
        },
    }
})
</script>