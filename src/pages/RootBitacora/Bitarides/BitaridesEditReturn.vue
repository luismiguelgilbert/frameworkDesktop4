<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">

    <q-toggle v-if="record_id > 0"
        v-model="anulado" color="red" checked-icon="fas fa-trash-alt" label="Anular?" left-label
        />

    <q-select 
        :value="editStatus.navigateToRecord"
        :options="lookup_cars"
        emit-value map-options readonly
        placeholder="Vehículo" label="Vehículo" filled autofocus
        >
        <template v-slot:prepend><q-icon name="fas fa-car" color="primary" /></template>
    </q-select>

    <q-select 
        v-model="reason_id"
        :options="lookup_reasons"
        emit-value map-options
        :readonly="record_id > 0"
        placeholder="Motivo de Visita" label="Motivo de Visita" filled
        >
        <template v-slot:prepend><q-icon name="fas fa-list-ul" color="primary" /></template>
    </q-select>

    <!-- :inputAttr="{ autofocus: true }" -->
    <DxAutocomplete
        :data-source="lookup_chofer_names"
        v-model:value="out_responsable"
        placeholder="Nombre del Responsable"
        :deferRendering="true"
        :readOnly="record_id > 0"
        stylingMode="filled" height="60px"
        :maxItemCount="5"
        >
        <DxAutocompleteButton location="before" name="lookup_visitors_names_autocomplete" :options="{ icon: 'fas fa-user', type: 'default', stylingMode: 'text', }" />
        <DxAutocompleteButton location="after" name="lookup_visitors_names_autocomplete_txt" :options="{ text: 'Nombre del Responsable', type: 'default', stylingMode: 'text', disabled: true }" />
    </DxAutocomplete>

    <q-input
        label="Kilometraje al salir" placeholder="Kilometraje al salir" filled
        :readonly="record_id > 0" type="number" :min="0"
        v-model="out_km" 
        >
        <template v-slot:prepend><q-icon name="fas fa-tachometer-alt" color="primary" /></template>
    </q-input>

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre esta Visita" filled
        type="textarea" 
        :readonly="record_id > 0"
        v-model="comments"
        />
    <br><br>

</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

import { DxAutocomplete, DxButton as DxAutocompleteButton } from 'devextreme-vue/autocomplete';
import { DxTextBox, DxButton as DxTextBoxButton } from 'devextreme-vue/text-box';




export default ({
    components: {
        DxAutocomplete, DxAutocompleteButton, DxTextBox, DxTextBoxButton
    },
    props: {
      moduleName: { type: String , required: true },
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
            },
            lookup_chofer_names: null
        }
    },
    mounted(){
        this.$refs.formulario.validate()
        if(!(this.placeID>0)){
            this.placeID = this.editStatus.placeID
        }
        this.carID = this.editStatus.navigateToRecord
        this.lookup_chofer_names = this.lookup_chofer.map(row=>row.name);
    },
    methods:{
        filterByName(val, update, abort) {
            update(() => {
                const needle = val.toLocaleLowerCase()
                this.lookup_visitors_search = this.lookup_visitors.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
            })
        },
    },
    computed:{
        console: () => console,
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
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
        anulado: { 
            get () { return this.$store.state[this.moduleName].editData.basic.anulado }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'anulado', value: val}) }  
        },
        record_id: { 
            get () { return this.$store.state[this.moduleName].editData.basic.record_id }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'record_id', value: val}) }  
        },
        placeID: { 
            get () { return this.$store.state[this.moduleName].editData.basic.placeID }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'placeID', value: val}) }  
        },
        carID: { 
            get () { return this.$store.state[this.moduleName].editData.basic.carID }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'carID', value: val}) }  
        },
        lookup_places: {
            get () { return this.$store.state[this.moduleName].editData.lookup_places },
        },
        reason_id: { 
            get () { return this.$store.state[this.moduleName].editData.basic.reason_id }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'reason_id', value: val}) }  
        },
        out_responsable: {
            get () { return this.$store.state[this.moduleName].editData.basic.out_responsable }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'out_responsable', value: val}) }  
        },
        out_comments: {
            get () { return this.$store.state[this.moduleName].editData.basic.out_comments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'out_comments', value: val}) }  
        },
        out_km: { 
            get () { return this.$store.state[this.moduleName].editData.basic.out_km }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'out_km', value: val}) }  
        },
        comments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.comments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }  
        },
        lookup_cars: { 
            get () { return this.$store.state[this.moduleName].editData.lookup_cars }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'lookup_cars', value: val}) }  
        },
        lookup_reasons: {
            get () { return this.$store.state[this.moduleName].lookup_reasons },
        },
        lookup_chofer: {
            get () { return this.$store.state[this.moduleName].lookup_chofer },
        },
    },
})
</script>