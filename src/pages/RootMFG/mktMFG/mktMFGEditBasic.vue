<template>
<q-form ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
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
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="default_mfg_orderID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Orden', field: 'label', align: 'left'}
                ,{ name: 'invName', label: 'Producto', field: 'invName', align: 'left'}
                ,{ name: 'quantity', label: 'Cantidad Estimada', field: 'quantity', align: 'right'}
                ,{ name: 'uomName', label: 'Unidad', field: 'uomName', align: 'left'}
                ,{ name: 'value', label: 'ID', field: 'value', align: 'right'}
            ]"
        @onItemSelected="(row)=>{
                this.default_mfg_orderID=row.value;
                this.loadMfgOrder();
                //this.$emit('onAccMoveCompute')
            }"
        />

    <q-select
        label="Usuario que Pide (*)" placeholder="Seleccione el usuario (*)" emit-value map-options filled
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
        placeholder="Ingrese la fecha de Pedido" label="Fecha de Pedido" filled
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

    <q-select
        label="Bodega de Destino Predeterminada (*)" placeholder="Seleccione la bodega predeterminada donde desea recibir los ítems (*)" emit-value map-options filled
        :options="lookup_wh" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        :option-disable="opt => !opt.estado"
        v-model="defaultWhID"
        ref="defaultWhID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        @input="loadMfgOrder()"
        >
        <template v-slot:prepend><q-icon name="fas fa-warehouse" /></template>
    </q-select>

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
            //this.loadMfgOrder();
            this.lines=[];//clearSelectedLines
            alert('Cargar Presupuesto + Consumo + Basado en Bodega de: ' + this.defaultWhID + ' || ' + this.default_mfg_orderID)
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        default_mfg_orderID: {
            get () { return this.$store.state[this.moduleName].editData.basic.default_mfg_orderID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'default_mfg_orderID', value: val}) }
        },
        headerUser: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerUser },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerUser', value: val}) }
        },
        headerDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerDate', value: val}) }
        },
        defaultWhID: {
            get () { return this.$store.state[this.moduleName].editData.basic.defaultWhID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'defaultWhID', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },
        lookup_mfgOrders: {
            get () { return this.$store.state[this.moduleName].editData.lookup_mfgOrders },
        },
        lookup_wh: {
            get () { return this.$store.state[this.moduleName].editData.lookup_wh },
        },
        
    },
})
</script>
