<template>
<div style="margin: -16px;">
    <DxDataGrid
        ref="dxgrid"
        height="calc(100vh - 119px)"
        column-resizing-mode="widget"
        :data-source="lookup_mfgLines"
        :allow-column-resizing="true" 
        :allow-column-reordering="true"
        :show-borders="true"
        :show-column-lines="userTableLinesDXcols"
        :show-row-lines="userTableLinesDXrows"
        :stateStoring="{ ignoreColumnOptionNames: [] }"
        key-expr="invID"
        >
        <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />
        <DxColumnChooser  mode="select" />
        <DxColumnFixing :enabled="true" :texts="{fix:'Fijar', unfix: 'Soltar'}" />
        <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
        <DxEditing :allow-updating="true" mode="cell" :select-text-on-edit-start="true"  /> <!-- me gustan: cell, row, popup -->
        <DxScrolling mode="virtual" :useNative="false" showScrollbar="always" /> <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
        
        <DxColumn caption="Item" data-field="invID" name="invID" data-type="number" :allow-editing="false" alignment="left" :minWidth="200">
            <DxLookup value-expr="value" display-expr="label" :data-source="lookup_items" />
        </DxColumn>
        <DxColumn caption="Orden #" data-field="orderID" name="orderID" data-type="number" :allow-editing="true" alignment="right" :width="100"  :editor-options="{ min: 0 }" />
        <DxColumn caption="Pedido de Insumos" data-field="qtyIN" name="qtyIN" data-type="number" :allow-editing="true" alignment="right" :width="100"  :editor-options="{ min: 0 }" />
        <DxColumn caption="Insumos Recibidos" data-field="qtyINReal" name="qtyINReal" data-type="number" :allow-editing="true" alignment="right" :width="100" :editor-options="{ min: 0 }" />
        <DxColumn caption="Devolución de Insumos" data-field="qtyOUT" name="qtyOUT" data-type="number" :allow-editing="true" alignment="right" :width="100"  :editor-options="{ min: 0 }" />
        <DxColumn caption="Insumos Devueltos" data-field="qtyOUTReal" name="qtyOUTReal" data-type="number" :allow-editing="true" alignment="right" :width="100" :editor-options="{ min: 0 }" />
        <DxColumn caption="Real" data-field="final" name="final" data-type="number" :allow-editing="true" alignment="right" :width="100" :editor-options="{ min: 0 }" :cssClass="userColor=='default'?'bg-grey-2':'bg-grey-9'"/>
        <DxSummary >
            <DxTotalItem column="invID" summary-type="count"/>
            <DxTotalItem column="qtyIN" summary-type="sum" cssClass="q-mr-none" > <DxValueFormat type="#.00" /> </DxTotalItem>
            <DxTotalItem column="qtyINReal" summary-type="sum" > <DxValueFormat type="#.00" /> </DxTotalItem>
        </DxSummary>
        >
        
    </DxDataGrid>
    
</div>
</template>
<script>
/*
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
*/
import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser } from 'devextreme-vue/data-grid';


export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxDataGrid,
        DxColumn,
        DxColumnFixing,
        DxScrolling,
        DxStateStoring,
        DxSorting,
        DxPaging,
        DxHeaderFilter,
        DxSelection,
        DxEditing,
        DxLookup,
        DxSummary,
        DxTotalItem,
        DxValueFormat,
        DxColumnChooser,
    },
    data () {
        return {
            /*myQDateLocale: {
                // starting with Sunday
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            }*/
        }
    },
    methods:{
      dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            }
        )
    },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
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
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        },
        lookup_mfgLines: {
            get () { return this.$store.state[this.moduleName].editData.lookup_mfgLines },
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
    },
})
</script>