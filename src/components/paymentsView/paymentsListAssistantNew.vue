<template>
<q-card square style="min-width: calc(80vw)" v-if="partnerID>0">
    <q-toolbar class="q-pr-none bg-primary text-white">
        <div class="q-mr-lg text-h6 text-ellipsis ellipsis">Nuevo Pago : {{lookup_partners.find(x=>x.value==partnerID).label}}</div>
        <q-space />
        <q-btn flat stretch icon="fas fa-times" @click="closeDialog(false)" />
    </q-toolbar>
    <q-card-section>
        <div class="row q-col-gutter-sm">
            <selectSearchable  class="col-12 col-md-12"
                prependIcon="fas fa-sign-in-alt fa-rotate-180"
                labelText="Cuenta del Pago ó Anticipo (*)" labelSearchText="Cuenta Contable del Pago ó Anticipo"
                :optionsList="lookup_accounts"
                rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" optionDisableField="estado"
                :isRequired="false" 
                :isDisable="false" 
                :isDense="true" 
                :isReadonly="false"
                :initialValue="payment_account_id"
                :tableSearchColumns="[
                        { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                        ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                    ]"
                @onItemSelected="(row)=>{
                        //console.dir(row)
                        //this.account_id_invoice=row.account_id_invoice;
                        this.payment_account_id=row.value;
                        //let temp = this.lookup_accounts.find(x=>x.value==this.payment_account_id)
                        this.payment_account_name = row.code_es + ' - ' + row.label
                        //this.$emit('onAccMoveCompute')
                        //this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
                    }"
                />
            <selectSearchable class="col-12 col-md-12"
                prependIcon="fas fa-sign-out-alt"
                labelText="Medio de Pago (*)" labelSearchText="Buscar Medio de Pago"
                :optionsList="lookup_payment_methods"
                rowValueField="value" optionsListLabel="label" optionsListCaption="account_name"
                :isRequired="false" 
                :isDisable="false" 
                :isDense="true" 
                :isReadonly="false"
                :initialValue="payment_method_id"
                :tableSearchColumns="[
                        { name: 'label', label: 'Origen', field: 'label', align: 'left'}
                        ,{ name: 'paymentTypeName', label: 'Medio de Pago', field: 'paymentTypeName', align: 'left'}
                        ,{ name: 'numberTypeName', label: 'Secuencial', field: 'numberTypeName', align: 'left'}
                        ,{ name: 'lastNumber', label: 'Último Documento', field: 'lastNumber', align: 'left'}
                        ,{ name: 'account_name', label: 'Cuenta Contable', field: 'account_name', align: 'left'}
                    ]"
                @onItemSelected="(row)=>{
                        this.numberType = row.numberType
                        this.numeroDoc = isNaN(row.lastNumber)?0:(parseInt(row.lastNumber)+1);
                        this.account_id = row.account_id//asigna la cuenta contable asociada al [Medio de Pago]
                        this.payment_method_id=row.value;
                        //this.$emit('onAccMoveCompute')
                        //this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
                    }"
                />
            <q-input class="col-12 col-md-12"
                ref="numeroDoc" :readonly="false" dense
                placeholder="Ingrese el Número del Documento (*)" label="Número del Documento (*)" filled
                v-model="numeroDoc"
                :type="numberType&&numberType==1?'number':undefined"
                debounce="650"
                @input="()=>{   
                    //this.$emit('onAccMoveCompute')  
                    //this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
                }"
                >
                <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
            </q-input>
            <q-input class="col-12 col-md-12"
                ref="amountTotal" :readonly="false"  dense
                placeholder="Monto del Pago (*)" label="Monto del Pago (*)" filled
                v-model="amountTotal" :min="0" :max="amountTotal"
                :disable="false"
                type="number"
                @input="()=>{   
                    //this.$emit('onAccMoveCompute')  
                    //this.$emit('onRunMethod',{tabName: 'basic', methodName: 'updateAccountMove'});//emite hacia [editForm] y editForm dispara [runMethod] que ejecutará el método dentro del tab de los parámetros
                }"
                >
                <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
            </q-input>
            <q-input class="col-12 col-md-12"
                ref="headerDate" dense
                mask="date" :rules="['date']" hide-bottom-space
                placeholder="Ingrese la fecha del Documento usado para contabilizar asiento (aaaa/mm/dd)" label="Fecha de Documento (aaaa/mm/dd) (*)" filled
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
            <q-input class="col-12 col-md-12"
                v-model="comments" label="Comentarios" filled  dense
                />
            <q-input class="col-12 col-md-12"
                ref="printName" dense hide-bottom-space
                placeholder="Nombre para Imprimir" label="Nombre para Imprimir" filled
                v-model="printName"
                >
                <template v-slot:prepend><q-icon name="fas fa-print" /></template>
            </q-input>
            <q-input class="col-12 col-md-12"
                ref="printDate" dense
                mask="date" :rules="['date']" hide-bottom-space
                placeholder="Ingrese la fecha del Documento usado para imprimir (aaaa/mm/dd)" label="Fecha para Imprimir (aaaa/mm/dd) (*)" filled
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
                <template v-slot:prepend><q-icon name="fas fa-calendar-day" /></template>
            </q-input>
            
            <!--<q-select v-model="payment_method_id" label="Medio de Pago" class="col-12 col-md-12"  filled dense
                :options="lookup_payment_methods" map-options emit-value @input="payment_method_changed" >
                <template v-slot:prepend><q-icon name="fas fa-money-check-alt" /></template>
            </q-select>
            <q-input v-model="numeroDoc" label="# Documento / # Referencia" class="col-12 col-md-12" filled dense >
                <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
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
            <q-input v-model="printName" label="Nombre a Imprimir en Documento" class="col-12 col-md-8" filled dense >
                <template v-slot:prepend><q-icon name="fas fa-user" /></template>
            </q-input>
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
            -->
            
            
            
        <q-toolbar>
            <q-space />
            <q-btn label="Agregar Pago" icon="fas fa-plus" color="primary" @click="closeDialog(true)" />
        </q-toolbar>
        </div>
    </q-card-section>
    <q-separator />
    <!--
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
            <DxEditing :allow-updating="true" :allow-deleting="true" :confirmDelete="false" mode="cell" :useIcons="true" :select-text-on-edit-start="true" start-edit-action="click" /> 
            <DxScrolling mode="standard" :useNative="true" showScrollbar="always" />
            <DxPaging :enabled="false" /> 
                <DxColumn caption="# Posición" data-field="lineID" name="lineID" data-type="number" :allow-editing="false" alignment="left" :minWidth="50" :visible="false" />
                <DxColumn caption="Cuenta Contable" data-field="account_id" name="account_id" data-type="number" :allow-editing="true" alignment="left" :minWidth="350" :width="350" calculate-display-value="account_name"
                    :editor-options="{ opened: true }"
                    :set-cell-value="setAccountValue">
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
    -->
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
            ,account_id: null
            ,payment_account_id: null
            ,payment_account_name: ''
            ,payment_method_id: null
            ,numberType: null
            ,numeroDoc: ''
            ,amountTotal: 0
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
        //this.lookup_accounts_paginated = { store: { type: 'array', data: this.lookup_accounts.filter(x=>x.account_has_children==false).map(y=> { return { value: y.value , label: y.code_es + ' - ' + y.label } }), key: 'value' }, pageSize: 10, paginate: true    }

        const yourDate = new Date();
        this.headerDate = (yourDate.toISOString().split('T')[0]).replace(/-/g,'/');
        this.printDate = (yourDate.toISOString().split('T')[0]).replace(/-/g,'/');
        this.currentPartnerData = this.lookup_partners.find(x=>x.value==this.partnerID);
        this.currentPartnerAccountData = this.lookup_accounts.find(z=>z.value==this.currentPartnerData.accPaymentOutcomeAdvance)
        try{ 
            this.printName = this.lookup_partners.find(x=>x.value==this.partnerID).label 
        } catch(ex){ 
            console.dir('Error:')
            console.dir(ex)
        }
        try{ 
            this.payment_method_id = this.lookup_payment_methods[0].value 
            this.payment_account_id = this.lookup_partners[0].accPaymentOutcomeAdvance
            this.account_id = this.lookup_payment_methods.find(x=>x.value==this.payment_method_id).account_id
            let temp = this.lookup_accounts.find(x=>x.value==this.payment_account_id)
            this.payment_account_name = temp.code_es + ' - ' + temp.label
            this.numeroDoc = this.lookup_payment_methods[0].lastNumber
        } catch(ex){ 
            console.dir('Error:')
            console.dir(ex)
        }

        if(this.initialAmount > 0){
            this.amountTotal = this.initialAmount
            /*
            this.lines.push({
                lineID: 1
                ,account_id: this.currentPartnerData.accPaymentOutcomeAdvance
                ,account_name: this.currentPartnerAccountData.code_es + ' - ' + this.currentPartnerAccountData.label
                ,comments: ''
                ,amount: this.initialAmount
            })*/
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
        payment_method_changed(newValue){
            try{ this.numeroDoc = this.lookup_payment_methods.find(x=>x.value==newValue).lastNumber } catch(ex){ }
        },
        closeDialog(addRecord){
            let newPaymentData = null
            if(addRecord){
                //let sumaPago = this.lines.reduce((total, row)=>{return total + row.amount },0)
                let sumaPago = this.amountTotal
                /*
                console.dir('this.payment_account_id = ' + this.payment_account_id)
                console.dir('this.payment_account_name = ' + this.payment_account_name)
                console.dir('this.account_id = ' + this.account_id)
                console.dir('this.payment_method_id = ' + this.payment_method_id)
                console.dir('this.numeroDoc = ' + this.numeroDoc)
                console.dir('this.numeroDoc.length = ' + this.numeroDoc.length)
                console.dir('this.amountTotal = ' + this.amountTotal)
                console.dir('this.headerDate.length = ' + this.headerDate.length)
                console.dir('this.partnerID = ' + this.partnerID)
                */
                let isValid = true; let fieldError =  '';
                if(!(this.partnerID > 0)) { isValid = false; fieldError = 'Proveedor' }
                if(!(this.payment_account_id > 0)) { isValid = false; fieldError = 'Cuenta de Pago/Anticipo' }
                if(!(this.payment_method_id > 0)) { isValid = false; fieldError = 'Método de Pago' }
                if(!(this.account_id > 0)) { isValid = false; fieldError = 'Cuenta de Método de Pago' }
                if(!(this.amountTotal > 0)) { isValid = false; fieldError = 'Monto' }
                
                if(isNaN(this.numeroDoc)){
                    if(!(this.numeroDoc.length > 0)) { isValid = false; fieldError = 'Número de Documento' }
                }else{
                    if(!(this.numeroDoc > 0)) { isValid = false; fieldError = 'Número de Documento' }
                }
                if(!(this.headerDate.length == 10)) { isValid = false; fieldError = 'Fecha Documento' }
                if(isValid){
                    newPaymentData = {
                        partnerID: this.partnerID
                        ,payment_account_id: this.payment_account_id
                        ,payment_account_name: this.payment_account_name
                        ,payment_method_id: this.payment_method_id
                        ,account_id: this.account_id
                        ,numeroDoc: this.numeroDoc
                        ,amountTotal: this.amountTotal
                        ,headerDate: this.headerDate
                        ,comments: this.comments
                        ,printDate: this.printDate
                        ,printName: this.printName
                        //,lines: this.lines
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
                    this.$q.notify({ html: true, multiLine: false, color: 'red', message: "No ha registrado la información completa: " + fieldError ,timeout: 1000, progress: true , icon: "fas fa-exclamation-circle"})
                }
                
            }else{
                this.$emit('onClose', newPaymentData)
            }
            
        },
        /*
        getMax(arr, prop) {
            var max;
            for (var i=0 ; i<arr.length ; i++) {
                if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                    max = arr[i];
            }
            return max;
        }
        setAccountValue(newData, value, currentRowData){
            const accountSelected = this.lookup_accounts.find(x=>x.value==value)
            newData.account_id = value;
            newData.account_name =  accountSelected.code_es + ' - ' + accountSelected.label;
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
        */
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