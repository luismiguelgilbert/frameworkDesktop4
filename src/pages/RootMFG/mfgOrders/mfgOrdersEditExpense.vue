<template>
<div style="margin: -16px;">
    <!--:class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"-->
    <q-table
        ref="mainTable"
        :data="expense"
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
            { name: 'comments', required: true, label: 'Descripción', align: 'left', field: row => row.comments, sortable: true },
            { name: 'expenseDate', required: true, label: 'Fecha (aaaa/mm/dd)', align: 'left', field: row => row.expenseDate, sortable: true },
            { name: 'lineSubtotal', required: true, label: 'Monto', align: 'right', field: row => row.lineSubtotal, sortable: true },
            { name: 'uploaded', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
        ]"
        >
        <template v-slot:top >
            <q-btn :label="$q.screen.gt.sm?'Nueva Línea':''"  title="Agregar Nueva Línea" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
            <q-space />
            <div class="text-primary">Línea(s) de producción que se usaron para producir esta orden</div>
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
                <q-td key="comments" :props="props" >
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.comments" 
                        dense item-aligned borderless input-class="text-left"
                        @focus="$event.target.select()"
                        debounce="1000" @input="(value)=>{updateRow(value,'comments',props.row)}" />
                </q-td>
                <q-td key="expenseDate" :props="props" :title="dateName(props.row.expenseDate)">
                    <q-input
                        ref="expenseDate" mask="date" 
                        dense borderless class="no-padding" style="height: 20px !important;" debounce="1000"
                        :value="props.row.expenseDate" 
                        @input="(value)=>{updateRow(value,'expenseDate',props.row)}"
                        >
                        <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" size="xs">
                            <q-popup-proxy ref="qDateProxy_expenseDate" transition-show="scale" transition-hide="scale">
                            <q-date :locale="myQDateLocale" minimal 
                                :value="props.row.expenseDate"
                                @input="(value)=>{updateRow(value,'expenseDate',props.row)}"
                                >
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                </div>
                            </q-date>
                            </q-popup-proxy>
                        </q-icon>
                        </template>
                    </q-input>
                </q-td>
                <q-td key="lineSubtotal" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.lineSubtotal" type="number" :min="0" 
                        dense item-aligned borderless input-class="text-right"
                        :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                        @focus="$event.target.select()"
                        debounce="1000" @input="(value)=>{updateRow(value,'lineSubtotal',props.row)}" />
                </q-td>
                <q-td key="uploaded" :props="props" :title="dateName(props.row.stopDate)">
                    <q-btn size="xs" icon="fas fa-trash-alt" color="red" flat dense @click="deleteRow(props.row)" />
                </q-td>
            </q-tr>
         </template>
        <template v-slot:bottom-row >
            <q-tr>
            </q-tr>
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

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        //selectSearchable: selectSearchable
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
                if(this.expense.length > 0){
                    let temp = this.getMax(this.expense, "lineID");
                    newLineID = parseInt(temp.lineID);
                }
                let newRows = JSON.parse(JSON.stringify(this.expense))
                newLineID++;
                let nuevaFila = {
                     lineID: newLineID//
                    ,comments: ''//
                    ,expenseDate: ''//
                    ,lineSubtotal: 0//
                    ,uploaded: false
                }
                newRows.push(nuevaFila)
                this.expense = newRows
                this.$q.loading.hide()
                //this.$emit('onAccMoveCompute')
            }catch(ex){
                console.dir(ex)
                this.$q.loading.hide()  
            }
        },
        deleteRow(currentRow){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.expense));
                newRows = newRows.filter(x=>x.lineID!=currentRow.lineID);
                this.expense = newRows;
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
                let newRows = JSON.parse(JSON.stringify(this.expense))
                newRows.filter(x=>x.lineID==row.lineID).map(result=>{
                    result[colName] = newVal;
                    return result
                })
                this.expense = newRows;
                this.$q.loading.hide()
                //this.$emit('onAccMoveCompute')
            }catch(ex){
                console.error(ex)
                this.$q.loading.hide()
            }
        },
        rowValidation(currentRow, returnType){
            if(currentRow.comments==null||currentRow.comments==undefined||currentRow.comments.length<=0){
                return (returnType?true:'Debe corregir la celda: Descripción')
            }
            if(currentRow.lineSubtotal==null||currentRow.lineSubtotal==undefined||currentRow.lineSubtotal<=0){
                return (returnType?true:'Debe corregir la celda: Monto')
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
        expense: {
            get () { return this.$store.state[this.moduleName].editData.expense },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'expense', value: val}) }
        },
    }
})

</script>