<template>
<div>
    <q-table
        :data="payments"
        table-style="min-height: calc(100vh - 250px); max-height: calc(100vh - 250px)"
        row-key="lineID"
        dense hide-bottom
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        :columns="[
          { name: 'uploaded', required: true, label: 'Anular', align: 'left', field: row => row.uploaded, sortable: true },
          { name: 'accTypeName', required: true, label: 'Documento', align: 'left', field: row => row.accTypeName, sortable: true },
          { name: 'accHeaderNumeroDoc', required: true, label: '# Documento', align: 'left', field: row => row.accHeaderNumeroDoc, sortable: true },
          { name: 'reconciliationHeaderDate', required: true, label: 'Fecha Aplicación', align: 'left', field: row => row.reconciliationHeaderDate, sortable: true },
          { name: 'reconciliationHeaderID', required: true, label: '# Conciliación', align: 'left', field: row => row.reconciliationHeaderID, sortable: true },
          
          { name: 'reconciliationMoveID', required: true, label: 'Asiento de Conciliación', align: 'left', field: row => row.reconciliationMoveID, sortable: true },
          
          //{ name: 'docDate', required: true, label: 'Fecha del Documento', align: 'left', field: row => row.docDate, sortable: true },
          //{ name: 'accMoveDate', required: true, label: 'Fecha Contable', align: 'left', field: row => row.accMoveDate, sortable: true },
          { name: 'amount', required: true, label: 'Monto Aplicado', align: 'right', field: row => row.amount, sortable: true },
        ]"
    >
        <template v-slot:top>
            <div class="text-primary text-h5">Detalle de Pagos</div>
            <q-space />
            <q-select 
                v-model="initialLookupValue" map-options emit-value
                :options="lookup_status" borderless dense item-aligned
                />
        </template>
        <template v-slot:body="props">
            <q-tr :props="props" >
                <q-td key="uploaded" :props="props" >
                    <!--Permitir Anular SI es que reconciliation está ya en la base-->
                    <q-toggle :value="props.row.voided" v-if="props.row.uploaded" color="red" icon="fas fa-ban" flat dense size="sm" />
                </q-td>
                <q-td key="accTypeName" :props="props" >
                    {{ props.row.accTypeName}}
                </q-td>
                <q-td key="accHeaderNumeroDoc" :props="props" >
                    {{ props.row.accHeaderNumeroDoc}}
                </q-td>
                <q-td key="reconciliationHeaderDate" :props="props" :title="dateName(props.row.reconciliationHeaderDate)">
                    <!--{{ props.row.reconciliationHeaderDate}}-->
                    <q-input
                        ref="reconciliationHeaderDate" 
                        mask="date" :rules="['date']"
                        dense borderless readonly class="no-padding" style="height: 20px !important;"
                        :value="props.row.reconciliationHeaderDate" :title="dateName(props.row.reconciliationHeaderDate)"
                        >
                        <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" size="xs">
                            <q-popup-proxy ref="qDateProxy_reconciliationHeaderDate" transition-show="scale" transition-hide="scale">
                            <q-date :locale="myQDateLocale" minimal 
                                @input="(value)=>{updateRow(value,'reconciliationHeaderDate',props.row)}"
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

                <q-td key="reconciliationHeaderID" :props="props" >
                    {{ props.row.reconciliationHeaderID}}
                </q-td>
                
                <q-td key="reconciliationMoveID" :props="props" >
                    {{ props.row.reconciliationMoveID}}
                </q-td>
                
                <!--<q-td key="accMoveDate" :props="props" :title="showDateName(props.row.accMoveDate)">
                    {{ props.row.accMoveDate }}
                </q-td>
                <q-td key="docDate" :props="props" :title="showDateName(props.row.docDate)">
                    {{ props.row.docDate }}
                </q-td>-->
                <q-td key="amount" :props="props" >
                    {{ props.row.amount.toFixed(userMoneyFormat) }}
                </q-td>
            </q-tr>
        </template>

        <template v-slot:bottom-row>
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
                    {{payments.reduce((total,item)=>{return total + item.amount}, 0).toFixed(userMoneyFormat)}}
                </q-td>
            </q-tr>
            <q-tr></q-tr>
        </template>

       
    </q-table>
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';

export default ({
    props: {
        moduleName: { type: String, required: true },
    },
    data () {
        return {
            pagination: { rowsPerPage: 0 },
            lookup_status: [{value: 1, label: 'Pagos'},{value:0, label: 'Historial'}],
            initialLookupValue: 1,
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
    methods:{
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
        updateRow(newVal, colName, row){
            try{
                this.$q.loading.show()
                let newRows = JSON.parse(JSON.stringify(this.payments))
                console.dir('newRows')
                console.dir(newRows)
                newRows.filter(x=>x.lineID==row.lineID).map(result=>{
                    result[colName] = newVal;
                    /*if(colName=="amount"){
                    result[colName] = parseFloat(newVal);
                    }else{
                    }*/
                    return result
                })
                this.payments = newRows;
                this.$q.loading.hide()
                //this.$emit('onAccMoveCompute')
            }catch(ex){
                console.error(ex)
                this.$q.loading.hide()
            }
        },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        payments: {
          get () { return this.$store.state[this.moduleName].editData.payments },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPayments', val) }
        },
    }
})
</script>