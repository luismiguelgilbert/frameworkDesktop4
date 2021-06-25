<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div class="row">
        <q-toggle class="col-12 col-md-4"
            tabindex="-1"
            v-model="estado" icon="fas fa-check" color="positive" label="Estado" disable
            />
    </div>
    
    <selectSearchable 
        prependIcon="fas fa-clipboard-list"
        labelText="Orden de Producción (*)" labelSearchText="Buscar Orden de Producción"
        :optionsList="this.lookup_mfgOrders"
        rowValueField="value" optionLabelField="label" optionsListCaption="mfgProduct" optionsListLabel="label" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="((allow_edit==false && allow_insert==false)||editMode==false)"
        :initialValue="mfg_orderID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Orden', field: 'label', align: 'left'}
                ,{ name: 'invName', label: 'Producto', field: 'invName', align: 'left'}
                ,{ name: 'quantity', label: 'Cantidad Estimada', field: 'quantity', align: 'right'}
                ,{ name: 'uomName', label: 'Unidad', field: 'uomName', align: 'left'}
                ,{ name: 'value', label: 'ID', field: 'value', align: 'right'}
            ]"
        @onItemSelected="(row)=>{
                this.mfg_orderID=row.value;
                this.loadMfgOrder();
                //this.$emit('onAccMoveCompute')
            }"
        />
    <selectSearchable 
        prependIcon="fas fa-warehouse"
        labelText="Entrega a Bodega (*)" labelSearchText="Buscar Bodega"
        :optionsList="this.lookup_wh"
        rowValueField="value" optionLabelField="label" optionsListCaption="mfgProduct" optionsListLabel="label" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="((allow_edit==false && allow_insert==false)||editMode==false)"
        :initialValue="whID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Orden', field: 'label', align: 'left'}
                ,{ name: 'invName', label: 'Producto', field: 'invName', align: 'left'}
                ,{ name: 'quantity', label: 'Cantidad Estimada', field: 'quantity', align: 'right'}
                ,{ name: 'uomName', label: 'Unidad', field: 'uomName', align: 'left'}
                ,{ name: 'value', label: 'ID', field: 'value', align: 'right'}
            ]"
        @onItemSelected="(row)=>{
                this.whID=row.value;
                this.updateRow();
                //this.$emit('onAccMoveCompute')
            }"
        />

    <q-select
        label="Usuario que Entrega (*)" placeholder="Seleccione el usuario (*)" emit-value map-options filled
        :options="lookup_users" :readonly="true"
        v-model="headerUser"
        ref="headerUser"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="far fa-user" /></template>
    </q-select>

    <q-input
        ref="headerDate" :readonly="true"
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha de Entrega" label="Fecha de Entrega" filled
        v-model="headerDate" :title="dateName(headerDate)"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
              <q-date v-model="headerDate" :readonly="true" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
    </q-input>

    

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Tipo de Caso" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />

    <br><br>
</q-form>
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
        this.$refs.formulario.validate()
        //this.loadMfgOrder();
    },
    methods:{
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                }
            )
        },
        loadMfgOrder(){
            if(this.mfg_orderID&&this.mfg_orderID>0){
                this.$q.loading.show()
                this.$axios({
                    method: 'GET',
                    url: this.apiURL + 'spMktPRDSelectPending',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        userLanguage: 'es',
                        row_id: this.mfg_orderID
                    }
                }).then((response) => {
                    try{
                        this.$q.loading.show();

                        this.lookup_mfgOrders_details = [];
                        this.lookup_mfgOrders_details = response.data[0];
                        this.lines = [];
                    
                        let newLine = [];
                        let selectedOrder = this.lookup_mfgOrders_details;
                        newLine.push({
                            lineID: selectedOrder.lineID
                            ,invID: selectedOrder.invID
                            ,debit_account_id: selectedOrder.debit_account_id
                            ,credit_account_id: selectedOrder.credit_account_id
                            ,quantity: selectedOrder.quantity
                            ,price: selectedOrder.price
                            ,lineSubtotal: selectedOrder.lineSubtotal
                            ,lineDiscntPrcnt: selectedOrder.lineDiscntPrcnt
                            ,lineDiscntAmount: selectedOrder.lineDiscntAmount
                            ,lineUntaxed: selectedOrder.lineUntaxed
                            ,whID: this.whID
                            ,estado: selectedOrder.estado
                            ,comments: selectedOrder.comments
                        })
                        this.lines = newLine;
                        this.$q.loading.hide();
                    }catch(ex){
                        console.dir(ex)
                        this.$q.loading.hide()
                    }
                    
                    
                    this.$q.loading.hide()
                }).catch((error) => {
                    console.dir(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.$q.loading.hide()
                })
            }

            
            /*console.dir('loadMfgOrder')
            console.dir('mfg_orderID')
            console.dir(this.mfg_orderID)
            this.lines = [];
            if(this.mfg_orderID && this.mfg_orderID > 0){
                console.dir('loadMfgOrder 1')
                if(this.whID && this.whID > 0){
                    console.dir('loadMfgOrder 2')
                    
                }
            }*/
        },
        updateRow(){
            console.dir('pendiente')
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        allow_view: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_view').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
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
        allow_report: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_report').map(y=>{
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
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
        },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        mfg_orderID: {
            get () { return this.$store.state[this.moduleName].editData.basic.mfg_orderID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'mfg_orderID', value: val}) }
        },
        headerUser: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerUser },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerUser', value: val}) }
        },
        headerDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerDate', value: val}) }
        },
        whID: {
            get () { return this.$store.state[this.moduleName].editData.basic.whID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'whID', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
        },
        lookup_mfgOrders: {
            get () { return this.$store.state[this.moduleName].editData.lookup_mfgOrders },
        },
        lookup_mfgOrders_details: {
            get () { return this.$store.state[this.moduleName].editData.lookup_mfgOrders_details },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_mfgOrders_details', value: val}) }
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },
        
        lookup_wh: {
            get () { return this.$store.state[this.moduleName].editData.lookup_wh },
        },
        
    },
})
</script>
