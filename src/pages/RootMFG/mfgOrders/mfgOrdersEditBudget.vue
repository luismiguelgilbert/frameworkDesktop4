<template>
<div style="margin: -16px;">
    <!--:class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"-->
    <q-table
        ref="mainTable"
        :data="budget"
        table-style="min-height: calc(100vh - 189px); max-height: calc(100vh - 189px);"
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
            { name: 'price', required: true, label: 'Costo', align: 'right', field: row => row.price, sortable: true },
            //{ name: 'lineDiscntPrcnt', required: true, label: 'Dcto. %', align: 'right', field: row => row.lineDiscntPrcnt, sortable: true },
            //{ name: 'lineDiscntAmount', required: true, label: 'Dcto. $', align: 'right', field: row => row.lineDiscntAmount, sortable: true },
            { name: 'lineUntaxed', required: true, label: 'Total', align: 'right', field: row => row.lineUntaxed, sortable: true },
            { name: 'uploaded', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
        ]"
        >
        <template v-slot:top >
                <q-btn :disable="blockUserEdit" :label="$q.screen.gt.sm?'Agregar':''" title="Agregar Varios Ítems" @click="itemsBatchDialogSelected=[];isItemsBatchDialog=true" icon="fas fa-plus" color="primary" no-caps />
                <!--<q-btn :label="$q.screen.gt.sm?'Nueva Línea':''"  title="Agregar Nueva Línea" @click="addRow" icon="fas fa-plus" color="primary" no-caps />-->
                <q-btn :disable="blockUserEdit" :label="$q.screen.gt.sm?'Lista de Materiales (BoM)':''"  title="Agregar masivamente Lista de Materia Prima basado en una Lista de Materiales (BoM)" @click="addBoM" icon="fas fa-boxes" color="primary" no-caps class="q-ml-sm" />
                <q-btn :disable="(blockUserEdit || selected.length<=0)" :label="$q.screen.gt.sm?'Actualizar Costos':''"  title="Actualizar Costos de los registros seleccionados usando precio promedio actual en plataforma" @click="updateCosts" icon="fas fa-calculator" color="primary" no-caps class="q-ml-sm" />
                <q-space />
                <div style="max-width: 45%;" class="text-primary ellipsis">Lista de Materiales requeridos para producir esta orden</div>
        </template>
        <template v-slot:body="props">
            <q-tr :props="props" >
                <q-td auto-width>
                    <q-checkbox v-model="props.selected" size="md" dense :title="props.row.lineID" />
                </q-td>
                <q-td key="hasError" :props="props" class="no-padding">
                    <q-icon 
                        size="xs" name="fas fa-exclamation-triangle" color="red" flat dense
                        v-if="rowValidation(props.row, true)"
                        :title="rowValidation(props.row, false)"
                        />
                </q-td>
                <q-td key="invID" :props="props" :title="dateName(props.row.stopDate)">
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
                        :value="props.row.quantity" type="number" :min="0" 
                        dense item-aligned borderless input-class="text-right"
                        :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                        @focus="$event.target.select()"
                        debounce="1000" @input="(value)=>{updateRow(value,'quantity',props.row)}" />
                </q-td>
                <q-td key="price" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.price" type="number" :min="0" 
                        dense item-aligned borderless input-class="text-right"
                        :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                        @focus="$event.target.select()"
                        debounce="1000" @input="(value)=>{updateRow(value,'price',props.row)}" />
                </q-td>
                <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" key="lineUntaxed" :props="props">
                    {{ props.row.lineUntaxed.toFixed(userMoneyFormat) }}
                </q-td>
                <q-td key="uploaded" :props="props" :title="dateName(props.row.stopDate)">
                    <q-btn size="xs" icon="fas fa-trash-alt" color="red" flat dense @click="deleteRow(props.row)" />
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
                    {{budget.reduce((total,item)=>{return total + item.lineUntaxed}, 0).toFixed(userMoneyFormat)}}
                </q-td>
                <q-td>
                </q-td>
            </q-tr>
            <q-tr></q-tr>
        </template>
    </q-table>


    <q-dialog v-model="isItemsBatchDialog">
        <q-card style="min-width: 95%;" > 
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
                { name: 'lastPrice', required: true, label: 'Precio P. Actual', align: 'right', field: row => row.lastPrice, format: val => `$${val}`, sortable: true, style: 'min-width: 50px;'},
                //{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: true, style: 'min-width: 50px;'},
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
        <q-card style="min-width: 800px;" >
            <q-card-section class="no-padding" >
                <selectSearchable class="col-12"
                    prependIcon="fas fa-boxes"
                    labelText="Listas de Materiales Disponibles para el Producto de la Orden(*)" labelSearchText="Buscar Lista de Materiales"
                    :optionsList="lookup_mfgBudget.filter(x=>x.invID==this.invID)"
                    rowValueField="value" optionLabelField="label" optionsListCaption="code_es" optionsListLabel="label" optionDisableField="estado"
                    :isRequired="false" 
                    :isDisable="false" 
                    :isReadonly="false"
                    
                    :tableSearchColumns="[
                        { name: 'mfgTypeName', label: 'Tipo', field: 'mfgTypeName', align: 'left'}
                        ,{ name: 'invName', label: 'Producto', field: 'invName', align: 'left'}
                        ,{ name: 'quantity', label: 'Cantidad', field: 'quantity', align: 'right'}
                        ,{ name: 'comments', label: 'Comentarios', field: 'comments', align: 'left'}
                        ]"
                    @onItemSelected="(row)=>{
                            this.BoMDialogSelection = row.value
                        }"
                    />
            </q-card-section>
            <q-card-section class="no-padding">
                <q-table 
                    :data="lookup_mfgBudgetLines.filter(x=>x.value==this.BoMDialogSelection)"
                    table-style="min-height: calc(100vh - 189px); max-height: calc(100vh - 189px);"
                    row-key="lineID"
                    :separator="userTableLines"
                    :rows-per-page-options="[0]"
                    hide-bottom dense flat
                    :virtual-scroll="true"
                    :class="tableLastLine"
                    :columns="[
                        //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
                        { name: 'invName', required: true, label: 'Materia Prima', align: 'left', field: row => row.invName, sortable: true },
                        { name: 'internal_code', required: true, label: 'Código', align: 'left', field: row => row.internal_code, sortable: true },
                        { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true },
                        { name: 'price', required: true, label: 'Costo', align: 'right', field: row => row.price, sortable: true },
                        //{ name: 'lineDiscntPrcnt', required: true, label: 'Dcto. %', align: 'right', field: row => row.lineDiscntPrcnt, sortable: true },
                        //{ name: 'lineDiscntAmount', required: true, label: 'Dcto. $', align: 'right', field: row => row.lineDiscntAmount, sortable: true },
                        { name: 'lineUntaxed', required: true, label: 'Total', align: 'right', field: row => row.lineUntaxed, sortable: true },
                    ]"
                    >
                    <template v-slot:bottom-row >
                        <q-tr>
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
                                <div v-if="BoMDialogSelection">
                                    {{lookup_mfgBudgetLines.filter(x=>x.value==BoMDialogSelection).reduce((total,item)=>{return total + item.lineUntaxed}, 0).toFixed(userMoneyFormat)}}
                                </div>
                            </q-td>
                        </q-tr>
                        <q-tr></q-tr>
                    </template>
                </q-table>
            </q-card-section>
            <q-card-actions align="around">
                <q-btn  flat label="Cancelar (ESC)" no-caps color="primary" @click="isBoMDialogOpen=false" />
                <q-btn icon-right="fas fa-check-circle" label="Seleccionar" no-caps color="primary" 
                :disable="BoMDialogSelection==null" @click="appendRows"
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
    //.q-table td{ border-bottom-width: 1px }
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
             selected: [], isBoMDialogOpen: false, BoMDialogSelection: null
            ,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: []
            ,myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            }
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
        dateName(value){
            let resultado = '...'
            try{
                resultado = date.formatDate(value, this.userDateFormat,
                    {
                    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                    daysShort: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'],
                    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                    monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                    }
                )
            }catch(ex){console.dir(ex)}
            return resultado;
        },
        addRows(){
            if(this.itemsBatchDialogSelected.length>0){
                try{
                this.$q.loading.show()

                //GetMaxId
                let max_id = 0
                let temp = null
                if(this.budget.length > 0){
                    temp = this.getMax(this.budget, "lineID");
                    max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
                }
                
                //get Current Data
                let newRows = JSON.parse(JSON.stringify(this.budget))
                
                
                //Iterate Selected Rows
                this.itemsBatchDialogSelected.map(invRow => {
                    
                    if(invRow.systemType!=3){ //3=Kit > Cuando es Kit, agrega la lista de materiales
                        max_id++; //increase lineID

                        //Append Line
                        newRows.push({
                            lineID: max_id
                            ,invID: invRow.value
                            ,debit_account_id: invRow.debit_account_id
                            ,credit_account_id: invRow.credit_account_id
                            ,quantity: 1
                            ,price: invRow.lastPrice
                            ,lineSubtotal: 1 * invRow.lastPrice
                            ,lineDiscntPrcnt: 0
                            ,lineDiscntAmount: 0
                            ,lineUntaxed: 1 * invRow.lastPrice
                            ,whID: this.defaultWhID
                            ,prjID: 0
                            ,transportTypeID: this.defaultTransportID
                            ,estado: true
                            ,uploaded: false
                        })
                        
                    }

                    if(invRow.systemType==3){ //3=Kit > Entonces busco los materiales y recorro el resulto para irlos agregagando
                        this.lookup_items_kits.filter(x=>x.invID==invRow.value).map(material=>{//material es el item que debo agregar
                            this.lookup_items.filter(item=>item.value==material.materialID).map(item=>{//busco el código del material en los items
                            
                            max_id++; //increase lineID

                            //Append Line
                            newRows.push({
                                lineID: max_id
                                ,invID: item.value
                                ,debit_account_id: item.debit_account_id
                                ,credit_account_id: item.credit_account_id
                                ,quantity: 1
                                ,price: item.lastPrice
                                ,lineSubtotal: 1 * item.lastPrice
                                ,lineDiscntPrcnt: 0
                                ,lineDiscntAmount: 0
                                ,lineUntaxed: 1 * item.lastPrice
                                ,whID: this.defaultWhID
                                //,prjID: 0
                                //,transportTypeID: this.defaultTransportID
                                ,estado: true
                                ,uploaded: false
                            })
                            })
                        })
                    }

                })

                //Update Data
                this.budget = newRows
                this.$q.loading.hide()  
                this.isItemsBatchDialog = false
                }catch(ex){
                console.dir(ex)
                this.$q.loading.hide()  
                }
            }
        },
        /*addRow(){
            try{
                this.$q.loading.show()
                let newLineID = 0
                if(this.budget.length > 0){
                    let temp = this.getMax(this.budget, "lineID");
                    newLineID = parseInt(temp.lineID);
                }
                let newRows = JSON.parse(JSON.stringify(this.budget))
                newLineID++;
                let nuevaFila = {
                     lineID: newLineID//
                    ,invID: 0
                    ,quantity: 0
                    ,price: 0
                    ,lineDiscntPrcnt: 0
                    ,lineDiscntAmount: 0
                    ,lineUntaxed: 0
                    ,uploaded: false
                }
                newRows.push(nuevaFila)
                this.budget = newRows
                this.$q.loading.hide()
                //this.$emit('onAccMoveCompute')
            }catch(ex){
                console.dir(ex)
                this.$q.loading.hide()  
            }
        },*/
        addBoM(){
            this.BoMDialogSelection = null
            this.isBoMDialogOpen = true;
        },
        deleteRow(currentRow){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.budget));
                newRows = newRows.filter(x=>x.lineID!=currentRow.lineID);
                this.budget = newRows;
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
                let newRows = JSON.parse(JSON.stringify(this.budget))
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
                this.budget = newRows;
                this.$q.loading.hide()
                //this.$emit('onAccMoveCompute')
            }catch(ex){
                console.error(ex)
                this.$q.loading.hide()
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
        appendRows(){
            if(this.BoMDialogSelection!=null){
                this.$q.loading.show()
                let newLineID = 0
                if(this.budget.length > 0){
                    let temp = this.getMax(this.budget, "lineID");
                    newLineID = parseInt(temp.lineID);
                }
                let newRows = JSON.parse(JSON.stringify(this.budget))

                this.lookup_mfgBudgetLines.filter(x=>x.value==this.BoMDialogSelection).map(x=>{
                    //console.dir(x)
                    newLineID++;
                    let nuevaFila = {
                        lineID: newLineID//
                        ,invID: x.invID
                        ,quantity: x.quantity
                        ,price: x.price
                        ,lineSubtotal: x.lineSubtotal
                        ,lineDiscntPrcnt: x.lineDiscntPrcnt
                        ,lineDiscntAmount: x.lineDiscntAmount
                        ,lineUntaxed: x.lineUntaxed
                        ,uploaded: false
                    }
                    newRows.push(nuevaFila);
                })
                this.budget = newRows;
                this.$q.loading.hide();
                this.isBoMDialogOpen=false;
            }
        },
        updateCosts(){
            this.$q.loading.show()
            let newRows = JSON.parse(JSON.stringify(this.budget));
            newRows.filter(x=>this.selected.some(y=>y.lineID==x.lineID)).map(row=>{
                let newCost = row.price;
                try{ newCost = this.lookup_items.find(r=>r.value==row.invID).lastPrice }catch(ex){}
                row.price = newCost;
                row.lineSubtotal = row.price * row.quantity;
                row.lineDiscntAmount = (row.price * row.quantity) * (row.lineDiscntPrcnt / 100);
                row.lineUntaxed = (row.price * row.quantity) - (row.price * row.quantity) * (row.lineDiscntPrcnt / 100);
            })
            this.budget = newRows;
            this.$q.loading.hide()
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
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
        },
        invID: {
            get () { return this.$store.state[this.moduleName].editData.basic.invID },
        },
        budget: {
            get () { return this.$store.state[this.moduleName].editData.budget },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'budget', value: val}) }
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
        lookup_items_kits: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items_kits },
        },
        lookup_mfgBudget: {
            get () { return this.$store.state[this.moduleName].editData.lookup_mfgBudget },
        },
        lookup_mfgBudgetLines: {
            get () { return this.$store.state[this.moduleName].editData.lookup_mfgBudgetLines },
        },
        blockUserEdit: {
            get () { return this.$store.state[this.moduleName].editData.basic.blockUserEdit },
        },
    }
})

</script>