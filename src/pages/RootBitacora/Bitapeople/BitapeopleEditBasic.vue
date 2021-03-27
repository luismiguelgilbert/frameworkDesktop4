<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">

    <q-toggle v-if="record_id > 0"
        v-model="anulado" color="red" checked-icon="fas fa-trash-alt" label="Anular?" left-label
        />

    <div class="text-primary text-subtitle2">Fecha de Visita:</div>
    <q-input
        ref="fecha" 
        mask="date" readonly
        :rules="['date']" hide-bottom-space
        placeholder="Ingrese la fecha de Visita (aaaa/mm/dd)" label="Fecha de Visita (aaaa/mm/dd) (*)" filled
        v-model="fecha"
        >
        <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_fecha" transition-show="scale" transition-hide="scale" disable>
            <q-date :locale="myQDateLocale" minimal v-model="fecha" disable  >
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
        v-model="hora" mask="time" 
        :rules="['time']" hide-bottom-space
        :readonly="record_id > 0"
        placeholder="Ingrese la hora de Ingreso (HH:MM)" label="Hora de Ingreso (HH:MM) (*)" filled >
        <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-time v-model="hora" :disable="record_id > 0">
                <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
            </q-time>
            </q-popup-proxy>
        </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-clock" /></template>
    </q-input>


    <q-separator  class="q-mt-lg q-mb-lg" />

    <div class="text-primary text-subtitle2">Visitante:</div>
    <q-select 
        v-model="reason_id"
        :options="lookup_reasons"
        emit-value map-options
        :readonly="record_id > 0"
        placeholder="Motivo de Visita" label="Motivo de Visita" filled
        >
        <template v-slot:prepend><q-icon name="fas fa-list-ul" color="primary" /></template>
    </q-select>
    <DxAutocomplete
        :data-source="lookup_visitors_names"
        v-model:value="visitor_name"
        placeholder="Nombre del Visitante"
        :deferRendering="true"
        :readOnly="record_id > 0"
        stylingMode="filled" height="60px"
        :inputAttr="{ autofocus: true }" :maxItemCount="5"
        @selection-changed="(e) =>{ 
            if( lookup_visitors.some(x=>x.name==e.selectedItem) ){
                visitor_number = lookup_visitors.find(x=>x.name==e.selectedItem).num
                visitor_company = lookup_visitors.find(x=>x.name==e.selectedItem).comp
            }
        }"
        >
        <!-- @value-changed="(e) =>{ console.dir('pruebas') }" -->
        <DxAutocompleteButton location="before" name="lookup_visitors_names_autocomplete" :options="{ icon: 'fas fa-user', type: 'default', stylingMode: 'text', }" />
        <DxAutocompleteButton location="after" name="lookup_visitors_names_autocomplete_txt" :options="{ text: 'Nombre del Visitante', type: 'default', stylingMode: 'text', disabled: true }" />
    </DxAutocomplete>
    <DxAutocomplete
        :data-source="lookup_visitors_numbers"
        v-model:value="visitor_number"
        placeholder="Número de Identificación del Visitante"
        :deferRendering="true"
        :readOnly="record_id > 0"
        stylingMode="filled" height="60px"
        @selection-changed="(e) =>{ 
            if( lookup_visitors.some(x=>x.num==e.selectedItem) ){
                visitor_name = lookup_visitors.find(x=>x.num==e.selectedItem).name
                visitor_company = lookup_visitors.find(x=>x.num==e.selectedItem).comp
            }
        }"
        >
        <DxAutocompleteButton location="before" name="lookup_visitors_numbers_autocomplete" :options="{ icon: 'fas fa-hashtag', type: 'default', stylingMode: 'text', tabindex:-1 }" />
        <DxAutocompleteButton location="after" name="lookup_visitors_names_autocomplete_txt" :options="{ text: 'Número de Identificación del Visitante', type: 'default', stylingMode: 'text', disabled: true }" />
    </DxAutocomplete>
    <DxTextBox
        v-model:value="visitor_company"
        placeholder="Compañía del Visitante"
        stylingMode="filled" height="60px"
        :readOnly="record_id > 0"
        >
        <DxTextBoxButton location="before" name="lookup_visitors_numbers_autocomplete" :options="{ icon: 'fas fa-building', type: 'default', stylingMode: 'text', }" />
        <DxAutocompleteButton location="after" name="lookup_visitors_names_autocomplete_txt" :options="{ text: 'Compañía del Visitante', type: 'default', stylingMode: 'text', disabled: true }" />
    </DxTextBox>

    <q-separator  class="q-mt-lg q-mb-lg" />
    
    <div class="text-primary text-subtitle2">Vehículo:</div>
    <DxAutocomplete
        :data-source="lookup_placas"
        v-model:value="vehiculo_placa"
        placeholder="Placa del Vehículo"
        :deferRendering="true"
        stylingMode="filled" height="60px"
        :inputAttr="{ autofocus: true }" :maxItemCount="5"
        :readOnly="record_id > 0"
        @selection-changed="(e) =>{ 
            if( lookup_cars.some(x=>x.pl==e.selectedItem) ){
                vehiculo_name = lookup_cars.find(x=>x.pl==e.selectedItem).na
            }
        }"
        >
        <DxAutocompleteButton location="before" name="lookup_visitors_placa_autocomplete" :options="{ icon: 'fas fa-car', type: 'default', stylingMode: 'text' }" />
        <DxAutocompleteButton location="after" name="lookup_visitors_names_autocomplete_txt" :options="{ text: 'Placa', type: 'default', stylingMode: 'text', disabled: true }" />
    </DxAutocomplete>
    <DxAutocomplete
        :data-source="lookup_modelos"
        v-model:value="vehiculo_name"
        placeholder="Modelo del Vehículo"
        :deferRendering="true"
        stylingMode="filled" height="60px"
        :readOnly="record_id > 0"
        @selection-changed="(e) =>{ 
            if( lookup_cars.some(x=>x.na==e.selectedItem) ){
                vehiculo_placa = lookup_cars.find(x=>x.na==e.selectedItem).pl
            }
        }"
        >
        <DxAutocompleteButton location="before" name="lookup_visitors_numbers_autocomplete" :options="{ icon: 'fas fa-car-side', type: 'default', stylingMode: 'text', }" />
        <DxAutocompleteButton location="after" name="lookup_visitors_names_autocomplete_txt" :options="{ text: 'Modelo', type: 'default', stylingMode: 'text', disabled: true }" />
    </DxAutocomplete>

    <q-separator  class="q-mt-lg q-mb-lg" />

    <div class="text-primary text-subtitle2">Visita a:</div>
    <DxAutocomplete
        :data-source="lookup_visited_name"
        v-model:value="visited_name"
        placeholder="Pregunta por"
        :deferRendering="true"
        stylingMode="filled" height="60px"
        :readOnly="record_id > 0"
        :inputAttr="{ autofocus: true }" :maxItemCount="5"
        @selection-changed="(e) =>{ 
            if( lookup_visited.some(x=>x.na==e.selectedItem) ){
                visited_area = lookup_visited.find(x=>x.na==e.selectedItem).ar
            }
        }"
        >
        <DxAutocompleteButton location="before" name="lookup_visited_name_autocomplete" :options="{ icon: 'fas fa-street-view', type: 'default', stylingMode: 'text' }" />
        <DxAutocompleteButton location="after" name="lookup_visitors_names_autocomplete_txt" :options="{ text: 'Pregunta por', type: 'default', stylingMode: 'text', disabled: true }" />
    </DxAutocomplete>
    <DxAutocomplete
        :data-source="lookup_visited_area"
        v-model:value="visited_area"
        placeholder="Area que visita"
        :deferRendering="true"
        stylingMode="filled" height="60px"
        :readOnly="record_id > 0"
        >
        <DxAutocompleteButton location="before" name="lookup_visited_area_autocomplete" :options="{ icon: 'fas fa-car-side', type: 'default', stylingMode: 'text', }" />
        <DxAutocompleteButton location="after" name="lookup_visitors_names_autocomplete_txt" :options="{ text: 'Area que visita', type: 'default', stylingMode: 'text', disabled: true }" />
    </DxAutocomplete>

    <q-separator  class="q-mt-lg q-mb-lg" />

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre esta Visita" filled
        type="textarea" 
        :readonly="record_id > 0"
        v-model="comments" autofocus
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
            lookup_visitors_names: null,
            lookup_visitors_numbers: null,
            lookup_visitors_companies: null,
            lookup_placas: null,
            lookup_modelos: null,
            lookup_visited_name: null,
            lookup_visited_area: null,
        }
    },
    mounted(){
        this.$refs.formulario.validate()
        if(!(this.placeID>0)){
            this.placeID = this.editStatus.placeID
        }
        //this.lookup_visitors_search = this.lookup_visitors.map(row=>row.name);
        this.lookup_visitors_search = this.lookup_visitors;
        this.lookup_visitors_names = [...new Set(this.lookup_visitors.map(row=>row.name))];
        this.lookup_visitors_numbers = [...new Set(this.lookup_visitors.map(row=>row.num))];
        this.lookup_placas = [...new Set(this.lookup_cars.map(row=>row.pl))];
        this.lookup_modelos = [...new Set(this.lookup_cars.map(row=>row.na))];
        this.lookup_visited_name = [...new Set(this.lookup_visited.map(row=>row.na))];
        this.lookup_visited_area = [...new Set(this.lookup_visited.map(row=>row.ar))];
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
        lookup_places: {
            get () { return this.$store.state[this.moduleName].editData.lookup_places },
        },
        sys_user_code: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_code }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_code', value: val}) }  
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },
        fecha: { 
            get () { return this.$store.state[this.moduleName].editData.basic.fecha }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'fecha', value: val}) }  
        },
        hora: { 
            get () { return this.$store.state[this.moduleName].editData.basic.hora }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'hora', value: val}) }  
        },
        reason_id: { 
            get () { return this.$store.state[this.moduleName].editData.basic.reason_id }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'reason_id', value: val}) }  
        },
        visitor_name: { 
            get () { return this.$store.state[this.moduleName].editData.basic.visitor_name }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'visitor_name', value: val}) }  
        },
        visitor_number: { 
            get () { return this.$store.state[this.moduleName].editData.basic.visitor_number }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'visitor_number', value: val}) }  
        },
        visitor_company: { 
            get () { return this.$store.state[this.moduleName].editData.basic.visitor_company }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'visitor_company', value: val}) }  
        },
        vehiculo_placa: { 
            get () { return this.$store.state[this.moduleName].editData.basic.vehiculo_placa }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'vehiculo_placa', value: val}) }  
        },
        vehiculo_name: { 
            get () { return this.$store.state[this.moduleName].editData.basic.vehiculo_name }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'vehiculo_name', value: val}) }  
        },
        visited_name: { 
            get () { return this.$store.state[this.moduleName].editData.basic.visited_name }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'visited_name', value: val}) }  
        },
        visited_area: { 
            get () { return this.$store.state[this.moduleName].editData.basic.visited_area }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'visited_area', value: val}) }  
        },
        comments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.comments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }  
        },
        lookup_reasons: {
            get () { return this.$store.state[this.moduleName].lookup_reasons },
        },
        lookup_visitors: {
            get () { return this.$store.state[this.moduleName].lookup_visitors },
        },
        lookup_cars: {
            get () { return this.$store.state[this.moduleName].lookup_cars },
        },
        lookup_visited: {
            get () { return this.$store.state[this.moduleName].lookup_visited },
        },
    },
})
</script>