<template>
<div style="margin: -16px;">
    <q-table
        ref="mainTable"
        :data="lines"
        :table-style="editMode==true?'min-height: calc(100vh - 140px); max-height: calc(100vh - 140px);' : 'min-height: calc(100vh - 140px); max-height: calc(100vh - 140px);'"
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
        updateRow(newVal, colName, row){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.lines))
                newRows.filter(x=>x.lineID==row.lineID).map(result=>{
                    if(colName=="quantity"){
                        result[colName] = parseFloat(newVal);
                    }else{
                        result[colName] = newVal;
                    }
                    result.lineSubtotal = result.lineUntaxed;
                    result.price = (result.lineUntaxed / result.quantity).toFixed(6);
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
            /*if(currentRow.mktPRD_headerID==null||currentRow.mktPRD_headerID<=0||currentRow.mktPRD_lineID==null||currentRow.mktPRD_lineID<=0){
                return (returnType?true:'Debe corregir la referencia a la Entrega de PT')
            }*/
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