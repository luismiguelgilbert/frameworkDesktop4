<template>
<q-card square style="min-width: calc(80vw)" v-if="partnerID>0">
    <q-toolbar class="q-pr-none bg-primary text-white">
        <div class="q-mr-lg text-h6 text-ellipsis ellipsis">Nuevo Pago : {{lookup_partners.find(x=>x.value==partnerID).label}}</div>
        <q-space />
        <q-btn flat stretch icon="fas fa-times" @click="closeDialog(false)" />
    </q-toolbar>
    <q-card-section>
        <div class="row q-col-gutter-md">
            <q-select v-model="payment_method_id" label="Medio de Pago" class="col-12 col-md-8"  filled dense
                :options="lookup_payment_methods" map-options emit-value @input="payment_method_changed" >
                <template v-slot:prepend><q-icon name="fas fa-money-check-alt" /></template>
            </q-select>
            <q-input v-model="numeroDoc" label="# Documento / # Referencia" class="col-12 col-md-4" filled dense >
                <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
            </q-input>
            <q-input v-model="printName" label="Nombre a Imprimir en Documento" class="col-12 col-md-8" filled dense >
                <template v-slot:prepend><q-icon name="fas fa-user" /></template>
            </q-input>
            <q-input
                ref="headerDate" dense
                mask="date" :rules="['date']"  class="col-12 col-md-4" hide-bottom-space
                placeholder="Ingrese la fecha contable del Documento (aaaa/mm/dd)" label="Fecha Contable de Documento (aaaa/mm/dd) (*)" filled
                v-model="headerDate" :title="dateName(headerDate)"
                >
                <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
                    <q-date :locale="myQDateLocale" minimal v-model="headerDate" >
                        <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                        </div>
                    </q-date>
                    </q-popup-proxy>
                </q-icon>
                </template>
                <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
            </q-input>
            <q-input v-model="comments" label="Comentarios" class="col-12 col-md-8" filled dense />
            <q-input
                ref="printDate"  dense
                mask="date" :rules="['date']" class="col-12 col-md-4" hide-bottom-space
                placeholder="Ingrese la fecha a imprimir en Documento (aaaa/mm/dd)" label="Fecha a Imprimir en Documento (aaaa/mm/dd) (*)" filled
                v-model="printDate" :title="dateName(printDate)"
                >
                <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy_printDate" transition-show="scale" transition-hide="scale">
                    <q-date :locale="myQDateLocale" minimal v-model="printDate" >
                        <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                        </div>
                    </q-date>
                    </q-popup-proxy>
                </q-icon>
                </template>
                <template v-slot:prepend><q-icon name="fas fa-print" /></template>
            </q-input>
        </div>
    </q-card-section>
    <q-separator />
    <q-card-section class="no-padding">
        <q-toolbar class="no-padding">
            <div class="q-pl-md text-primary text-subtitle2">Detalle del Pago:</div>
            <q-space />
            <q-btn title="Nueva Línea" icon="fas fa-plus" stretch flat no-caps color="primary" @click="addLine" />
        </q-toolbar>
        <q-separator />
        <DxDataGrid
            ref="dxgrid"
            key="maindatagrid"
            height="150px"
            width="100%"
            :data-source="lines"
            column-resizing-mode="widget" :allow-column-resizing="true"  :allow-column-reordering="true"
            :show-borders="true"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            key-expr="lineID"
            >
            <DxEditing :allow-updating="true" :allow-deleting="true" :confirmDelete="false" mode="cell" :useIcons="true" :select-text-on-edit-start="true" start-edit-action="click" /> <!-- me gustan: cell, row, popup, batch mejora rendimiento pero NO calcula en línea y muestra un toolbar extra -->
            <DxScrolling mode="standard" :useNative="true" showScrollbar="always" /> <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
            <!--<DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" :deferred="true" />-->
            <DxPaging :enabled="false" /> 
                <DxColumn caption="# Posición" data-field="lineID" name="lineID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :visible="false" />
                <DxColumn caption="Cuenta Contable" data-field="account_id" name="account_id" data-type="number" :allow-editing="true" alignment="left" :minWidth="350" :width="350" calculate-display-value="account_name"
                    :editor-options="{ opened: true }"
                    :set-cell-value="setAccountValue"> <!--calculate-display-value hace que DxLookup NO se use mientras no se esté editando la celda, y eso mejora rendimiento según devexpress-->
                    <DxLookup value-expr="value" display-expr="label" :data-source="lookup_accounts_paginated" />
                </DxColumn>
                <DxColumn caption="Comentario" data-field="comments" name="comments" data-type="string" :allow-editing="true" alignment="left" :width="300" />
                <DxColumn caption="Monto" data-field="amount" name="amount" data-type="number" :allow-editing="true" alignment="right" :minWidth="150" :width="150" :format="userMoneyFormat" />
            />
            <DxSummary>
                <DxTotalItem column="amount" summary-type="sum" />
            </DxSummary>
        </DxDataGrid>
        <q-toolbar>
            <q-space />
            <q-btn label="Agregar Pago" icon="fas fa-plus" color="primary" @click="closeDialog(true)" />
        </q-toolbar>
    </q-card-section>
</q-card>
</template>
<script>
import { date } from 'quasar';
//import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import selectSearchable from '../selectSearchable/selectSearchable.vue'
import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser } from 'devextreme-vue/data-grid';

export default ({
    components: {
        selectSearchable
        ,DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser
    },
    props: {
        partnerID: { type: Number, required: true, },
        lookup_partners: { type: Array, required: true, },
        lookup_accounts: { type: Array, required: true, },
        lookup_payment_methods: { type: Array, required: true, },
        initialAmount: { type: Number, required: false, },
    },
    data(){
        return {
            router: this.$router
            ,printName: ''
            ,payment_method_id: null
            ,numeroDoc: ''
            ,headerDate: ''
            ,printDate: ''
            ,comments: '' 
            ,lines: []
            ,lookup_accounts_paginated: null
            ,currentPartnerData: null
            ,currentPartnerAccountData: null
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
    mounted(){
        this.lookup_accounts_paginated = { store: { type: 'array', data: this.lookup_accounts.filter(x=>x.account_has_children==false).map(y=> { return { value: y.value , label: y.code_es + ' - ' + y.label } }), key: 'value' }, pageSize: 10, paginate: true    }
        try{ this.printName = this.lookup_partners.find(x=>x.value==this.partnerID).label } catch(ex){ }
        try{ this.payment_method_id = this.lookup_payment_methods[0].value } catch(ex){ }
        try{ this.numeroDoc = this.lookup_payment_methods[0].lastNumber } catch(ex){ }
        const yourDate = new Date();
        this.headerDate = (yourDate.toISOString().split('T')[0]).replace(/-/g,'/');
        this.printDate = (yourDate.toISOString().split('T')[0]).replace(/-/g,'/');
        this.currentPartnerData = this.lookup_partners.find(x=>x.value==this.partnerID);
        this.currentPartnerAccountData = this.lookup_accounts.find(z=>z.value==this.currentPartnerData.accPaymentOutcomeAdvance)
        if(this.initialAmount > 0){
            this.lines.push({
                lineID: 1
                ,account_id: this.currentPartnerData.accPaymentOutcomeAdvance
                ,account_name: this.currentPartnerAccountData.code_es + ' - ' + this.currentPartnerAccountData.label
                ,comments: ''
                ,amount: this.initialAmount
            })
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
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            }
            )
        },
        payment_method_changed(newValue){
            try{ this.numeroDoc = this.lookup_payment_methods.find(x=>x.value==newValue).lastNumber } catch(ex){ }
        },
        addLine(){
            //GetMaxId
            let max_id = 1
            let temp = null
            if(this.lines.length > 0){
                temp = this.getMax(this.lines, "lineID");
                max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
            }

            max_id++;
            this.lines.push({
                lineID: max_id
                ,account_id: this.currentPartnerData.accPaymentOutcomeAdvance
                ,account_name: this.currentPartnerAccountData.code_es + ' - ' + this.currentPartnerAccountData.label
                ,comments: ''
                ,amount: 0
            })
            
        },
        closeDialog(addRecord){
            let newPaymentData = null
            if(addRecord){
                let sumaPago = this.lines.reduce((total, row)=>{return total + row.amount },0)
                if(sumaPago > 0){//como SI se está grabando, entonces valida que al menos exista monto
                    //se podría agregar otras validaciones aquí..
                    newPaymentData = {
                        partnerID: this.partnerID
                        ,printName: this.printName
                        ,payment_method_id: this.payment_method_id
                        ,numeroDoc: this.numeroDoc
                        ,headerDate: this.headerDate
                        ,printDate: this.printDate
                        ,printName: this.printName
                        ,comments: this.comments
                        ,lines: this.lines
                        /*
                        ,lineID: max_id
                        ,line_account_id: this.currentPartnerData.accPaymentOutcomeAdvance
                        ,line_account_name: this.currentPartnerAccountData.code_es + ' - ' + this.currentPartnerAccountData.label
                        ,line_comments: this.comments
                        ,amount: 0
                        */
                    }
                    this.$emit('onClose', newPaymentData)
                }else{
                    this.$q.notify({ html: true, multiLine: false, color: 'red', message: "No ha registrado montos" ,timeout: 1000, progress: true , icon: "fas fa-exclamation-circle"})
                }
                
            }else{
                this.$emit('onClose', newPaymentData)
            }
            
        },
        setAccountValue(newData, value, currentRowData){
            const accountSelected = this.lookup_accounts.find(x=>x.value==value)
            newData.account_id = value;
            newData.account_name =  accountSelected.code_es + ' - ' + accountSelected.label;
        },
    },
    watch: {
        headerDate: function(newValue, oldValue) {
            this.printDate = newValue
        }
    },
    computed:{
      console: () => console,
      userMoneyFormat: { get () { 
        let resultado ="#0.000000";
        if(this.$store.state.main.userMoneyFormat==0){ resultado = "#0" }
        if(this.$store.state.main.userMoneyFormat==1){ resultado = "#0.0" }
        if(this.$store.state.main.userMoneyFormat==2){ resultado = "#0.00" }
        if(this.$store.state.main.userMoneyFormat==3){ resultado = "#0.000" }
        if(this.$store.state.main.userMoneyFormat==4){ resultado = "#0.0000" }
        if(this.$store.state.main.userMoneyFormat==5){ resultado = "#0.00000" }
        if(this.$store.state.main.userMoneyFormat==6){ resultado = "#0.000000" }
        return resultado }
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
    }

})
</script>