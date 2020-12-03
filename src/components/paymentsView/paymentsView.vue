<template>
<div>
    <q-table
        :data="payments"
        table-style="min-height: calc(100vh - 255px); max-height: calc(100vh - 255px)"
        row-key="lineID"
        dense
        :rows-per-page-options="[0]"
        hide-bottom
        :columns="[
          { name: 'accTypeName', required: true, label: 'Documento', align: 'left', field: row => row.accTypeName, sortable: true },
          { name: 'docNumber', required: true, label: 'Número', align: 'left', field: row => row.docNumber, sortable: true },
          { name: 'docDate', required: true, label: 'Fecha del Documento', align: 'left', field: row => row.docDate, sortable: true },
          { name: 'accMoveDate', required: true, label: 'Fecha Contable', align: 'left', field: row => row.accMoveDate, sortable: true },
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
                <q-td key="accTypeName" :props="props" >
                    {{ props.row.accTypeName}}
                </q-td>
                <q-td key="docNumber" :props="props" >
                    {{ props.row.docNumber}}
                </q-td>
                <q-td key="accMoveDate" :props="props" :title="showDateName(props.row.accMoveDate)">
                    {{ props.row.accMoveDate }}
                </q-td>
                <q-td key="docDate" :props="props" :title="showDateName(props.row.docDate)">
                    {{ props.row.docDate }}
                </q-td>
                <q-td key="amount" :props="props" >
                    {{ props.row.amount.toFixed(userMoneyFormat) }}
                </q-td>
            </q-tr>
        </template>

        <template v-slot:bottom-row>
            <q-tr>
                <q-td class="text-subtitle2 text-primary" >
                    Pagos aplicados: {{payments.filter(x=>x.voided==false).length}}
                </q-td>
                <q-td> </q-td>
                <q-td> </q-td>
                <q-td> </q-td>
                <q-td class="text-right text-subtitle2 text-primary">
                    Suma: {{payments.filter(x=>x.voided==false).reduce((total,item)=>{return total + item.amount}, 0).toFixed(userMoneyFormat)}}
                </q-td>
            </q-tr>
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
        }
    },
    methods:{
        showDateName(value){
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
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        payments: {
          get () { return this.$store.state[this.moduleName].editData.payments },
        },
    }
})
</script>