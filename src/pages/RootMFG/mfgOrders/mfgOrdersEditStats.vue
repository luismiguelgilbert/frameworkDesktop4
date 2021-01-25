<template>
<div style="margin: -16px;">
    <q-table
        ref="mainTable"
        :data="lookup_mfgLines"
        table-style="min-height: calc(100vh - 140px); max-height: calc(100vh - 140px);"
        row-key="lineID"
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        hide-bottom dense flat
        :virtual-scroll="true"
        :class="tableLastLine"
        :columns="[
            //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
            { name: 'invID', required: true, label: 'Materia Prima', align: 'left', field: row => row.invID, sortable: true },
            { name: 'qtyIN', required: true, label: 'Pedido de Insumos', align: 'right', field: row => row.qtyIN, sortable: true },
            { name: 'qtyINReal', required: true, label: 'Insumos Recibidos', align: 'right', field: row => row.qtyINReal, sortable: true },
            { name: 'qtyOUT', required: true, label: 'Devolución Insumos', align: 'right', field: row => row.qtyOUT, sortable: true },
            { name: 'qtyOUTReal', required: true, label: 'Insumos Devueltos', align: 'right', field: row => row.qtyOUTReal, sortable: true },
            { name: 'final', required: true, label: 'Real', align: 'right', field: row => row.final, sortable: true },
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
                <q-td key="qtyIN" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.qtyIN" type="number" :min="0" readonly
                        dense item-aligned borderless input-class="text-right"
                        @focus="$event.target.select()"
                        />
                </q-td>
                <q-td key="qtyINReal" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.qtyINReal" type="number" :min="0" readonly
                        dense item-aligned borderless input-class="text-right"
                        @focus="$event.target.select()"
                        />
                </q-td>
                <q-td key="qtyOUT" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.qtyOUT" type="number" :min="0" readonly
                        dense item-aligned borderless input-class="text-right"
                        @focus="$event.target.select()"
                        />
                </q-td>
                <q-td key="qtyOUTReal" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.qtyOUTReal" type="number" :min="0" readonly
                        dense item-aligned borderless input-class="text-right"
                        @focus="$event.target.select()"
                        />
                </q-td>
                <q-td key="final" :props="props">
                    <q-input class="no-padding" style="height: 20px !important;"
                        :value="props.row.qtyINReal -  props.row.qtyOUTReal" type="number" :min="0" readonly
                        dense item-aligned borderless input-class="text-right"
                        @focus="$event.target.select()"
                        />
                </q-td>
                
                
                
                <!--<q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" key="lineUntaxed" :props="props">
                    {{ props.row.lineUntaxed.toFixed(userMoneyFormat) }}
                </q-td>-->
            </q-tr>
         </template>
        
    </q-table>
</div>
</template>
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
            myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            }
        }
    },
    mounted(){
        //this.$refs.formulario.validate()
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
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
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
        lookup_mfgLines: {
            get () { return this.$store.state[this.moduleName].editData.lookup_mfgLines },
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
    },
})
</script>
