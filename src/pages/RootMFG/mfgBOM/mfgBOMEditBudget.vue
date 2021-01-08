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
                <q-btn :label="$q.screen.gt.sm?'Nueva Línea':''"  title="Agregar Nueva Línea" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
                <q-btn :label="$q.screen.gt.sm?'Actualizar Costos':''"  title="Actualizar Costos de los registros seleccionados usando precio promedio actual en plataforma" @click="updateCosts" icon="fas fa-calculator" color="primary" no-caps class="q-ml-sm" :disable="selected.length<=0" />
                <q-space />
                <div style="max-width: 45%;" class="text-primary ellipsis">Lista de Materiales requeridos para producir este producto</div>
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
                        :isRequired="true" :isDisable="false" :isReadonly="false"
                        :isInline="true" :isDense="true"
                        :tableSearchColumns="[
                             { name: 'label', label: 'Línea de Producción', field: 'label', align: 'left'}
                            ,{ name: 'internal_code', label: 'Código', field: 'internal_code', align: 'left'}
                            ,{ name: 'uomName', label: 'Unidad', field: 'uomName', align: 'left'}
                            ,{ name: 'lastPrice', label: 'Precio Actual', field: 'lastPrice', align: 'left'}
                            ,{ name: 'systemTypeName', label: 'Tipo', field: 'systemTypeName', align: 'left'}
                        ]"
                        :initialValue="props.row.invID"
                        @onItemSelected="(row)=>{
                            updateRow(row.value,'invID',props.row)
                            updateRow(row.lastPrice,'price',props.row)
                            }"
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
                </q-td>
                <q-td key="price" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.price" type="number" :min="0" 
                        dense item-aligned borderless input-class="text-right"
                        :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                        @focus="$event.target.select()"
                        debounce="1000" @input="(value)=>{updateRow(value,'price',props.row)}" />
                    </q-td>
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
             selected: []
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
        addRow(){
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
            if(currentRow.quantity==null||currentRow.quantity==undefined||currentRow.quantity<0){
                return (returnType?true:'Debe corregir la celda: Cantidad')
            }
            if(currentRow.lineUntaxed==null||currentRow.lineUntaxed==undefined||currentRow.lineUntaxed<0){
                return (returnType?true:'Debe verificar todas las celdas por un error en: Total')
            }
            return false
        }
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
        budget: {
            get () { return this.$store.state[this.moduleName].editData.budget },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'budget', value: val}) }
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
    }
})

</script>