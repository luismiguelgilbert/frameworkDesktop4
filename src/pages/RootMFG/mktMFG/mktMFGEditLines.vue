<template>
<div style="margin: -16px;">
    <q-table
        ref="mainTable"
        :data="lines"
        :table-style="editMode==true?'min-height: calc(100vh - 189px); max-height: calc(100vh - 189px);' : 'min-height: calc(100vh - 140px); max-height: calc(100vh - 140px);'"
        row-key="lineID"
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        hide-bottom dense flat
        selection="multiple" :selected.sync="selected"
        :virtual-scroll="true"
        :class="tableLastLine"
        :columns="[
            //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
            { name: 'hasError', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
            { name: 'invID', required: true, label: 'Materia Prima', align: 'left', field: row => row.invID, sortable: true },
            { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true },
            { name: 'price', required: true, label: '$ Costo', align: 'right', field: row => row.price, sortable: true },
            //{ name: 'lineDiscntPrcnt', required: true, label: 'Dcto. %', align: 'right', field: row => row.lineDiscntPrcnt, sortable: true },
            //{ name: 'lineDiscntAmount', required: true, label: 'Dcto. $', align: 'right', field: row => row.lineDiscntAmount, sortable: true },
            { name: 'lineUntaxed', required: true, label: '$ Total', align: 'right', field: row => row.lineUntaxed, sortable: true },
        ]"
        >
        <template v-slot:top v-if="editMode==true" >
            <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Agregar':''" title="Agregar Varios Ítems" @click="itemsBatchDialogSelected=[];isItemsBatchDialog=true" icon="fas fa-plus" color="primary" no-caps />
            <!--<q-btn :label="$q.screen.gt.sm?'Nueva Línea':''"  title="Agregar Nueva Línea" @click="addRow" icon="fas fa-plus" color="primary" no-caps />-->
            <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Presupuesto de Insumos':''"  title="Agregar masivamente Materia Prima basado en el Presupuesto de Insumos" @click="BoMDialogSelection=null; isBoMDialogOpen=true;" icon="fas fa-file-invoice-dollar" color="primary" no-caps class="q-ml-sm" />
            <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Quitar':''" title="Eliminar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0" />
            <q-space />
        </template>
        <template v-slot:body="props">
            <q-tr :props="props" >
                <q-td auto-width>
                    <q-checkbox v-model="props.selected" size="md" dense :title="props.row.lineID" />
                </q-td>
                <q-td key="hasError" :props="props" class="no-padding" >
                    <q-icon 
                        size="xs" name="fas fa-exclamation-triangle" color="red" flat dense
                        v-if="rowValidation(props.row, true)"
                        :title="rowValidation(props.row, false)"
                        />
                </q-td>
                <q-td key="invID" :props="props" >
                    <selectSearchable 
                        labelText="Materia Prima" 
                        labelSearchText="Buscar Materia Prima"
                        :optionsList="lookup_items.filter(x=>x.systemType!=3/*3=Kit*/)"
                        rowValueField="value" optionLabelField="label" optionsListCaption="internal_code" optionsListLabel="label" optionDisableField="estado"
                        :isRequired="true" :isDisable="false" :isReadonly="true"
                        :isInline="true" :isDense="true"
                        appendIcon="f"
                        :tableSearchColumns="[
                                { name: 'label', label: 'Línea de Producción', field: 'label', align: 'left'}
                            ,{ name: 'internal_code', label: 'Código', field: 'internal_code', align: 'left'}
                            ,{ name: 'uomName', label: 'Unidad', field: 'uomName', align: 'left'}
                            ,{ name: 'lastPrice', label: 'Precio P. Actual', field: 'lastPrice', align: 'left'}
                            ,{ name: 'systemTypeName', label: 'Tipo', field: 'systemTypeName', align: 'left'}
                        ]"
                        :tooltipColumns="[
                             { name: 'label', label: 'Item'}
                            ,{ name: 'internal_code', label: 'Código'}
                            ,{ name: 'uomName', label: 'Unidad'}
                            ,{ name: 'brandName', label: 'Marca'}
                        ]"
                        :initialValue="props.row.invID"
                        
                        />
                </q-td>
                <q-td key="quantity" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.quantity" type="number" :min="0" :readonly="(editMode==false)"
                        dense item-aligned borderless input-class="text-right"
                        :max="props.row.maxQuantity" 
                        :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                        @focus="$event.target.select()"
                        debounce="1000"  @input="(value)=>{updateRow(value,'quantity',props.row)}" />
                </q-td>
                <q-td key="price" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.price" type="number" :min="0" readonly
                        :title="(props.row.quantityRcvd>0)?'No se permite editar porque ya existe ingreso a bodega':undefined"
                        dense item-aligned borderless input-class="text-right"
                        :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                        @focus="$event.target.select()"
                        debounce="1000" @input="(value)=>{updateRow(value,'price',props.row)}" />
                </q-td>
                <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" key="lineUntaxed" :props="props">
                    {{ props.row.lineUntaxed.toFixed(userMoneyFormat) }}
                </q-td>
            </q-tr>
         </template>
        <template v-slot:bottom-row >
            <q-tr>
                <q-td>
                </q-td>
                <q-td>
                </q-td>
                <q-td>
                </q-td>
                <q-td>
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary" >
                    Suma:
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary">
                    {{lines.reduce((total,item)=>{return total + item.lineUntaxed}, 0).toFixed(userMoneyFormat)}}
                </q-td>
            </q-tr>
            <q-tr></q-tr>
        </template>
    </q-table>

    <q-dialog v-model="isItemsBatchDialog">
        <q-card style="min-width: 90%;" > 
        <q-bar class="bg-primary text-white">
            Buscar Items
            <q-space />
            <q-input input-class="text-white" borderless dense debounce="300" autofocus v-model="itemsBatchDialogFilter" placeholder="Buscar">
            <template v-slot:append>
                <q-icon v-if="!itemsBatchDialogFilter" name="fas fa-search" flat round size="xs" color="white" />
                <q-btn v-if="itemsBatchDialogFilter" @click="itemsBatchDialogFilter=''" flat round icon="fas fa-times" size="xs" color="white" />
            </template>
            </q-input>
        </q-bar>
        <q-card-section class="no-padding">
            <q-table
            ref="itemsSearchTable" flat square
            table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
            @keydown.native.keyCodes.115="addRows(itemsDialogSelected)"
            :data="lookup_items"
            :columns="[
                { name: 'value', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
                { name: 'label', required: true, label: 'Item', align: 'left', field: row => row.label, sortable: true, style: 'min-width: 250px;', },
                { name: 'systemTypeName', required: true, label: 'Tipo', align: 'left', field: row => row.systemTypeName, sortable: true, style: 'min-width: 50px;', },
                { name: 'internal_code', required: true, label: 'Código', align: 'left', field: row => row.internal_code, sortable: true, style: 'min-width: 50px;'},
                { name: 'uomName', required: true, label: 'Unidad de Medida', align: 'left', field: row => row.uomName, sortable: true, style: 'min-width: 50px;'},
                //{ name: 'groupName', required: true, label: 'Grupo Contable', align: 'left', field: row => row.groupName, sortable: true, style: 'min-width: 50px;'},
                { name: 'brandName', required: true, label: 'Marca', align: 'left', field: row => row.brandName, sortable: true, style: 'min-width: 50px;'},
                { name: 'lastPrice', required: true, label: 'Precio P. Actual', align: 'right', field: row => row.lastPrice, sortable: true, style: 'min-width: 50px;'},
                
            ]"
            row-key="value"
            virtual-scroll :rows-per-page-options="[0]"
            hide-bottom dense
            selection="multiple" :selected.sync="itemsBatchDialogSelected"
            :filter="itemsBatchDialogFilter"
            :class="tableLastLine"
            :separator="userTableLines"
            >
            <template v-slot:body-selection="scope">
                <q-checkbox v-if="scope.row.estado" v-model="scope.selected" dense :title="JSON.stringify(scope.row.estado)" :disable="!(scope.row.estado)" />
                <q-icon v-if="!(scope.row.estado)" name="fas fa-ban" color="red" style="margin-left: 2px;" title="Se encuentra Inactivo"/>
            </template>
            </q-table>
            <q-separator />
            
        </q-card-section>
        <q-card-actions align="around">
            <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar (F4)" no-caps color="primary" :disable="itemsBatchDialogSelected.filter(x=>x.estado).length<=0" @click="addRows(itemsBatchDialogSelected)" ></q-btn>
        </q-card-actions>
        </q-card>
    </q-dialog>

    <q-dialog v-model="isBoMDialogOpen">
        <q-card style="min-width: 95%;" >
            <q-bar class="bg-primary text-white">
                    Presupuesto de Insumos
                    <q-space />
                    <q-input 
                        ref="inputSearch"
                        input-class="text-white" borderless dense debounce="300" autofocus v-model="filterString" placeholder="Buscar"
                        >
                        <template v-slot:append>
                            <q-icon v-if="!filterString" name="fas fa-search" flat round size="xs" color="white" />
                            <q-btn v-if="filterString" @click="filterString=''" flat round icon="fas fa-times" size="xs" color="white" />
                        </template>
                    </q-input>
                </q-bar>
            <q-card-section class="no-padding">
                <q-table 
                    :data="default_orderBudget"
                    table-style="min-height: calc(100vh - 189px); max-height: calc(100vh - 189px);"
                    row-key="invID"
                    :separator="userTableLines"
                    :rows-per-page-options="[0]"
                    hide-bottom dense flat
                    :virtual-scroll="true"
                    :class="tableLastLine"
                    selection="multiple" :selected.sync="selectedBudgetRows"
                    :filter="filterString"
                    :columns="[
                        //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
                        { name: 'invName', required: true, label: 'Materia Prima', align: 'left', field: row => row.invName, sortable: true },
                        { name: 'internal_code', required: true, label: 'Código', align: 'left', field: row => row.internal_code, sortable: true },
                        { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true },
                        { name: 'uomName', required: true, label: 'Unidad', align: 'left', field: row => row.uomName, sortable: true },
                        { name: 'price', required: true, label: 'Costo', align: 'right', field: row => row.price, sortable: true },
                        //{ name: 'lineDiscntPrcnt', required: true, label: 'Dcto. %', align: 'right', field: row => row.lineDiscntPrcnt, sortable: true },
                        //{ name: 'lineDiscntAmount', required: true, label: 'Dcto. $', align: 'right', field: row => row.lineDiscntAmount, sortable: true },
                        { name: 'lineUntaxed', required: true, label: 'Total', align: 'right', field: row => row.lineUntaxed, sortable: true },
                        { name: 'quantityReal', required: true, label: 'Cantidad Consumida', align: 'right', field: row => row.quantityReal, sortable: true },
                        { name: 'lineUntaxedReal', required: true, label: 'Total Consumido', align: 'right', field: row => row.lineUntaxedReal, sortable: true },
                    ]"
                    >
                    <template v-slot:body="props">
                        <q-tr :props="props" >
                            <q-td auto-width>
                                <q-checkbox v-model="props.selected" size="md" dense :title="props.row.lineID" />
                            </q-td>
                            <q-td key="invName" :props="props">
                                {{props.row.invName}}                                
                            </q-td>
                            <q-td key="internal_code" :props="props" >
                                {{props.row.internal_code}}                                
                            </q-td>
                            <q-td key="quantity" :props="props">
                                {{ props.row.quantity.toFixed(userMoneyFormat) }}
                            </q-td>
                            <q-td key="uomName" :props="props" >
                                {{props.row.uomName}}                                
                            </q-td>
                            <q-td key="price" :props="props">
                                {{ props.row.price.toFixed(userMoneyFormat) }}
                            </q-td>
                            <q-td  key="lineUntaxed" :props="props">
                                {{ props.row.lineUntaxed.toFixed(userMoneyFormat) }}
                            </q-td>
                            <q-td key="quantityReal" :props="props" >
                                <q-linear-progress size="25px" :value="props.row.quantityRealProgress" 
                                    :color="props.row.quantityRealProgressColor" >
                                    <div class="absolute-full flex flex-center">
                                        <q-badge color="white" text-color="primary" :label="props.row.quantityReal.toFixed(userMoneyFormat)" />
                                    </div>
                                </q-linear-progress>
                            </q-td>
                            <q-td key="lineUntaxedReal" :props="props">
                                {{ props.row.lineUntaxedReal.toFixed(userMoneyFormat) }}
                            </q-td>
                        </q-tr>
                    </template>
                    <template v-slot:bottom-row >
                        <q-tr>
                            <q-td>
                            </q-td>
                            <q-td>
                            </q-td>
                            <q-td>
                            </q-td>
                            <q-td>
                            </q-td>
                            <q-td>
                            </q-td>
                            <q-td class="text-right text-subtitle2 text-primary" >
                                Suma:
                            </q-td>
                            <q-td class="text-right text-subtitle2 text-primary">
                                {{default_orderBudget.reduce((total,item)=>{return total + item.lineUntaxed}, 0).toFixed(userMoneyFormat)}}
                            </q-td>
                            <q-td>
                            </q-td>
                            <q-td class="text-right text-subtitle2 text-primary">
                                {{default_orderBudget.reduce((total,item)=>{return total + item.lineUntaxedReal}, 0).toFixed(userMoneyFormat)}}
                            </q-td>
                        </q-tr>
                        <q-tr></q-tr>
                    </template>
                </q-table>
            </q-card-section>
            <q-card-actions align="around">
                <q-btn  flat label="Cancelar (ESC)" no-caps color="primary" @click="isBoMDialogOpen=false" />
                <q-btn icon-right="fas fa-check-circle" label="Seleccionar" no-caps color="primary" 
                :disable="selectedBudgetRows.length<=0" @click="appendRows"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</div>
</template>
<style lang="scss">
  .q-table__bottom{ padding: 0px; padding-left: 10px; padding-right: 10px; }
  .q-virtual-scroll__padding{ visibility: hidden;}
  .q-table thead tr:first-child th{ position: sticky; top: 0; opacity: 1; z-index: 1; padding-left: 5px; font-weight: bolder; color: $primary; }
  .my-sticky-header-table{
    .q-table thead tr:first-child th{ background-color: white }
  }
  .my-sticky-header-table-LastLine{
    .q-table thead tr:first-child th{ background-color: white }
    .q-table .q-virtual-scroll__content td{ border-bottom-width: 1px }
  }
  .my-sticky-header-table-dark{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
  }
  .my-sticky-header-table-dark-LastLine{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
    .q-table td{ border-bottom-width: 1px }
  }
</style>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        selectSearchable: selectSearchable
    },
    data () {
        return {
             selected: []
            ,isBoMDialogOpen: false, BoMDialogSelection: null, selectedBudgetRows: [], filterString: ''
            ,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: []
        }
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
        addRows(){
            if(this.default_mfg_orderID&&this.default_mfg_orderID>0){
                if(this.itemsBatchDialogSelected.length>0){
                    try{
                        this.$q.loading.show()
                        let selectedOrderData = this.lookup_mfgOrders.find(x=>x.value==this.default_mfg_orderID)

                        //GetMaxId
                        let max_id = 0
                        let temp = null
                        if(this.lines.length > 0){
                            temp = this.getMax(this.lines, "lineID");
                            max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
                        }
                        
                        //get Current Data
                        let newRows = JSON.parse(JSON.stringify(this.lines))
                        
                        //Iterate Selected Rows
                        this.itemsBatchDialogSelected.map(invRow => {

                            if(invRow.systemType!=3){ //3=Kit > Cuando es Kit, agrega la lista de materiales
                                max_id++; //increase lineID

                                //Append Line
                                newRows.push({
                                    lineID: max_id
                                    ,mfg_orderID: this.default_mfg_orderID
                                    ,invID: invRow.value
                                    ,debit_account_id: selectedOrderData.accMfg      //aquí viene la cuenta del Producto a Fabricar (basado en la Orden de Producción) entonces de esta forma siempre se manejaría 1 misma cuenta para que se simplifique el asiento contable al sacar el producto terminado
                                    ,credit_account_id: invRow.credit_account_id    //como insumo sale, entonces se toma del item (accInventory, que es lo que viene del spmktMFGSelectEdit)
                                    ,quantity: 1
                                    ,price: invRow.lastPrice
                                    ,lineSubtotal: 1 * invRow.lastPrice
                                    ,lineDiscntPrcnt: 0
                                    ,lineDiscntAmount: 0
                                    ,lineUntaxed: 1 * invRow.lastPrice
                                    ,whID: this.defaultWhID
                                    ,prjID: 0
                                    //,transportTypeID: this.defaultTransportID
                                    //,estado: true
                                })

                            }

                            if(invRow.systemType==3){ //3=Kit > Entonces busco los materiales y recorro el resulto para irlos agregagando
                                this.lookup_items_kits.filter(x=>x.invID==invRow.value).map(material=>{//material es el item que debo agregar
                                    this.lookup_items.filter(item=>item.value==material.materialID).map(item=>{//busco el código del material en los items
                                    
                                        max_id++; //increase lineID

                                        //Append Line
                                        newRows.push({
                                            lineID: max_id
                                            ,mfg_orderID: this.default_mfg_orderID
                                            ,invID: item.value
                                            ,debit_account_id: selectedOrderData.accMfg      //aquí viene la cuenta del Producto a Fabricar (basado en la Orden de Producción) entonces de esta forma siempre se manejaría 1 misma cuenta para que se simplifique el asiento contable al sacar el producto terminado
                                            ,credit_account_id: invRow.credit_account_id    //como insumo sale, entonces se toma del item (accInventory, que es lo que viene del spmktMFGSelectEdit)
                                            ,quantity: 1
                                            ,price: item.lastPrice
                                            ,lineSubtotal: 1 * item.lastPrice
                                            ,lineDiscntPrcnt: 0
                                            ,lineDiscntAmount: 0
                                            ,lineUntaxed: 1 * item.lastPrice
                                            ,whID: this.defaultWhID
                                            ,prjID: 0
                                            //,transportTypeID: this.defaultTransportID
                                            //,estado: true
                                        })

                                    })
                                })
                            }
                            
                        })

                        //Update Data
                        this.lines = newRows
                        this.$q.loading.hide()  
                        this.isItemsBatchDialog = false
                    }catch(ex){
                        console.dir(ex)
                        this.$q.loading.hide()  
                    }
                }
            }
        },
        appendRows(){
            if(this.default_mfg_orderID&&this.default_mfg_orderID>0){
                if(this.selectedBudgetRows!=null&&this.selectedBudgetRows.length>0){
                    try{
                        this.$q.loading.show()
                        let selectedOrderData = this.lookup_mfgOrders.find(x=>x.value==this.default_mfg_orderID)

                        let newLineID = 0
                        if(this.lines.length > 0){
                            let temp = this.getMax(this.lines, "lineID");
                            newLineID = parseInt(temp.lineID);
                        }
                        let newRows = JSON.parse(JSON.stringify(this.lines))
        
                        this.selectedBudgetRows.map(x=>{
                            //console.dir(x)
                            newLineID++;
                            let nuevaFila = {
                                lineID: newLineID//
                                ,mfg_orderID: this.defaultWhID
                                ,invID: x.invID
                                ,quantity: x.quantityAvailable//agrega lo que está pendiente del presupuesto
                                ,price: x.price
                                ,lineSubtotal: x.quantityAvailable * x.price
                                ,lineDiscntPrcnt: 0
                                ,lineDiscntAmount: 0
                                ,lineUntaxed: x.quantityAvailable * x.price
                                ,debit_account_id: selectedOrderData.accMfg      //aquí viene la cuenta del Producto a Fabricar (basado en la Orden de Producción) entonces de esta forma siempre se manejaría 1 misma cuenta para que se simplifique el asiento contable al sacar el producto terminado
                                ,credit_account_id: x.credit_account_id    //como insumo sale, entonces se toma del item (accInventory, que es lo que viene del spmktMFGSelectEdit)
                                ,whID: this.defaultWhID
                                ,uploaded: false
                            }
                            newRows.push(nuevaFila);
                        })
                        this.lines = newRows;
                        this.$q.loading.hide();
                        this.isBoMDialogOpen=false;
                    }catch(ex){
                        console.dir(ex)
                        this.$q.loading.hide()  
                    }
                    
                }
            }
        },
        deleteRow(currentRow){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.lines));
                newRows = newRows.filter(x=>x.lineID!=currentRow.lineID);
                this.lines = newRows;
                this.$q.loading.hide()
                //this.$emit('onAccMoveCompute')
            }catch(ex){
                console.dir(ex)
                this.$q.loading.hide()  
            }
        },
        updateRow(newVal, colName, row){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.lines))
                newRows.filter(x=>x.lineID==row.lineID).map(result=>{
                    if(colName=="quantity"||colName=="price"||colName=="lineDiscntPrcnt"){
                        result[colName] = parseFloat(newVal);
                    }else{
                        result[colName] = newVal;
                    }
                    result.lineSubtotal = result.price * result.quantity;
                    result.lineDiscntAmount = (result.price * result.quantity) * (result.lineDiscntPrcnt / 100);
                    result.lineUntaxed = (result.price * result.quantity) - (result.price * result.quantity) * (result.lineDiscntPrcnt / 100);
                    return result
                })
                this.lines = newRows;
                this.$q.loading.hide()
                //this.$emit('onAccMoveCompute')
            }catch(ex){
                console.error(ex)
                this.$q.loading.hide()
            }
        },
        removeRows(){
            if(this.selected.length > 0){
                this.$q.dialog({ 
                title: 'Confirmación'
                ,message: 'Desea quitar las líneas seleccionadas?'
                ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
                }
                ).onOk(() => {
                //Líneas
                let newRows = JSON.parse(JSON.stringify(this.lines))
                this.selected.map(row=>{
                    newRows = newRows.filter(x=>x.lineID!=row.lineID);
                })
                this.lines = newRows

                this.selected = []//limpia selección para evitar problema de referencia a filas que no existan
                })
            }
        },
        rowValidation(currentRow, returnType){
            if(currentRow.invID==null||currentRow.invID==undefined||currentRow.invID<=0){
                return (returnType?true:'Debe corregir la celda: Materia Prima')
            }
            if(currentRow.quantity==null||currentRow.quantity==undefined||currentRow.quantity<=0){
                return (returnType?true:'Debe corregir la celda: Cantidad')
            }
            if(currentRow.lineUntaxed==null||currentRow.lineUntaxed==undefined||currentRow.lineUntaxed<0){
                return (returnType?true:'Debe verificar todas las celdas por un error en: Total')
            }
            return false
        },
        
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        allow_view: { get () { return true }, },
        allow_edit: { get () { return true }, },
        allow_insert: { get () { return true }, },
        allow_report: { get () { return true }, },
        allow_disable: { get () { return true }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        sys_user_color: { get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color }, },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        tableLastLine: {
            get () { 
                let resultado = ''
                if(this.userColor=='blackDark'){
                if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
                {
                    resultado = 'my-sticky-header-table-dark-LastLine bg-grey-10 '
                }else{
                    resultado = 'my-sticky-header-table-dark bg-grey-10 '
                }
                }
                if(this.userColor!='blackDark'){
                    if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
                    {
                        resultado = 'my-sticky-header-table-LastLine '
                    }else{
                        resultado = 'my-sticky-header-table '
                    }
                }
                return resultado
            }
        },
        //Module Specific
        defaultWhID: {
            get () { return this.$store.state[this.moduleName].editData.basic.defaultWhID },
        },
        default_mfg_orderID: {
            get () { return this.$store.state[this.moduleName].editData.basic.default_mfg_orderID },
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
        },
        default_orderBudget: {
            get () { return this.$store.state[this.moduleName].editData.default_orderBudget },
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
        lookup_items_kits: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items_kits },
        },
        lookup_mfgOrders: {
            get () { return this.$store.state[this.moduleName].editData.lookup_mfgOrders },
        },
    }
})

</script>