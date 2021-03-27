<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">

 

    <div class="text-primary text-subtitle2">Fecha de Visita:</div>
    <q-input
        readonly
        hide-bottom-space
        placeholder="Visitante" label="Visitante" filled
        v-model="visitor_name"
        >
        <template v-slot:prepend><q-icon name="fas fa-user" /></template>
    </q-input>
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
        readonly
        placeholder="Ingrese la hora de Ingreso (aaaa/mm/dd)" label="Hora de Ingreso (HH:MM) (*)" filled >
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

    <div class="text-primary text-subtitle2">Fecha de Salida:</div>
    <q-input
        ref="salidaFecha" 
        mask="date" 
        :rules="['date']" hide-bottom-space
        placeholder="Ingrese la fecha de Salida (aaaa/mm/dd)" label="Fecha de Salida (aaaa/mm/dd) (*)" filled
        v-model="salidaFecha"
        >
        <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_salidaFecha" transition-show="scale" transition-hide="scale" disable>
            <q-date :locale="myQDateLocale" minimal v-model="salidaFecha" disable  >
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
        v-model="salidaHora" mask="time" 
        :rules="['time']" hide-bottom-space
        placeholder="Ingrese la hora de Salida (HH:MM)" label="Hora de Ingreso (HH:MM) (*)" filled >
        <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-time v-model="salidaHora" :disable="record_id > 0">
                <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
            </q-time>
            </q-popup-proxy>
        </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-clock" /></template>
    </q-input>
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre la salida de esta visita" filled
        type="textarea" 
        v-model="comments_out" autofocus
        />
    <q-toggle v-if="record_id > 0"
        v-model="anulado" color="red" checked-icon="fas fa-trash-alt" label="Anular?" left-label
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
        fecha: { 
            get () { return this.$store.state[this.moduleName].editData.basic.fecha }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'fecha', value: val}) }  
        },
        hora: { 
            get () { return this.$store.state[this.moduleName].editData.basic.hora }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'hora', value: val}) }  
        },
        salidaFecha: { 
            get () { return this.$store.state[this.moduleName].editData.basic.salidaFecha }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'salidaFecha', value: val}) }  
        },
        salidaHora: { 
            get () { return this.$store.state[this.moduleName].editData.basic.salidaHora }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'salidaHora', value: val}) }  
        },
        comments_out: { 
            get () { return this.$store.state[this.moduleName].editData.basic.comments_out }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments_out', value: val}) }  
        },
        visitor_name:{
            get () { return this.$store.state[this.moduleName].editData.basic.visitor_name }, 
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