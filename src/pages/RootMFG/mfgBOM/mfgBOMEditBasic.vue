<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div class="row">
        <q-toggle class="col-12 col-md-4"
            tabindex="-1"
            v-model="estado" icon="fas fa-check" color="positive" label="Estado" 
            />
    </div>
    
    <selectSearchable 
        prependIcon="fas fa-stream"
        labelText="Tipo (*)" labelSearchText="Buscar Tipo"
        :optionsList="this.lookup_mfgTypes"
        rowValueField="value" optionsListLabel="label" optionsListCaption="short_name_es"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="mfgTypeID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Tipo', field: 'label', align: 'left'}
                ,{ name: 'short_name_es', label: 'Abreviatura', field: 'short_name_es', align: 'left'}
                ,{ name: 'comments', label: 'Comentarios', field: 'comments', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.mfgTypeID=row.value;
                //this.$emit('onAccMoveCompute')
            }"
        />

    <selectSearchable 
        prependIcon="fas fa-box"
        labelText="Producto (*)" labelSearchText="Buscar Producto"
        :optionsList="this.lookup_items.filter(x=>x.is_sales)"
        rowValueField="value" optionsListLabel="label" optionsListCaption="internal_code"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="invID"
        :tableSearchColumns="[
            { name: 'value', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
            { name: 'label', required: true, label: 'Item', align: 'left', field: row => row.label, sortable: true, style: 'min-width: 250px;', },
            { name: 'systemTypeName', required: true, label: 'Tipo', align: 'left', field: row => row.systemTypeName, sortable: true, style: 'min-width: 50px;', },
            { name: 'internal_code', required: true, label: 'Código', align: 'left', field: row => row.internal_code, sortable: true, style: 'min-width: 50px;'},
            { name: 'uomName', required: true, label: 'Unidad de Medida', align: 'left', field: row => row.uomName, sortable: true, style: 'min-width: 50px;'},
            //{ name: 'groupName', required: true, label: 'Grupo Contable', align: 'left', field: row => row.groupName, sortable: true, style: 'min-width: 50px;'},
            { name: 'brandName', required: true, label: 'Marca', align: 'left', field: row => row.brandName, sortable: true, style: 'min-width: 50px;'},
            ]"
        @onItemSelected="(row)=>{
                this.invID=row.value;
                //this.$emit('onAccMoveCompute')
            }"
        />

    <q-input
        ref="quantity" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la Cantidad Planificada a Producir (*)" label="Cantidad Estimada a Producir (*)" filled type="number" min="0"
        v-model="quantity"
        @focus="$event.target.select()"
        :rules="[
                val => !!val || '* Requerido',
                val => val > 0 || 'Campo debe ser 0 o superior',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    <q-input
        ref="position" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la Ubicación de esta lista (*)" label="Ubicación en Listas (*)" filled type="number" min="0"
        v-model="position"
        @focus="$event.target.select()"
        :rules="[
                val => !!val || '* Requerido',
                val => val >= 0 || 'Campo debe ser 0 o superior',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-sort-numeric-down" /></template>
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
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        mfgTypeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.mfgTypeID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'mfgTypeID', value: val}) }
        },
        invID: {
            get () { return this.$store.state[this.moduleName].editData.basic.invID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'invID', value: val}) }
        },
        quantity: {
            get () { return this.$store.state[this.moduleName].editData.basic.quantity },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'quantity', value: val}) }
        },
        position: {
            get () { return this.$store.state[this.moduleName].editData.basic.position },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'position', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
        lookup_mfgTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_mfgTypes },
        },
    },
})
</script>
