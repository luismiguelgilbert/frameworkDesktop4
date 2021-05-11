<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    
    <q-select class="q-mt-lg"
        label="Equipo (*)" placeholder="Seleccione su equipo (*)" emit-value map-options filled
        :options="lookup_teams" readonly
        v-model="teamID"
        ref="teamID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-users" color="primary" /></template>
    </q-select>

    <q-input
        ref="meetingDate" 
        mask="date" :rules="['date']"
        placeholder="Ingrese la Fecha de la Reunión (aaaa/mm/dd)" label="Fecha de Reunión (aaaa/mm/dd)" filled
        v-model="meetingDate" :title="dateName(meetingDate)"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_meetingDate" transition-show="scale" transition-hide="scale">
              <q-date :locale="myQDateLocale" minimal v-model="meetingDate" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-calendar-day" color="primary" /></template>
    </q-input>

    <DxAutocomplete
        :dataSource="lookup_places"
        v-model:value="meetingPlace"
        placeholder="Lugar de Reunión (*)"
        :deferRendering="true"
        :readOnly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        stylingMode="filled" height="60px"
        :openOnFieldClick="true"
        :minSearchLength="0"
        >
        <!-- @value-changed="(e) =>{ console.dir('pruebas') }" -->
        <DxAutocompleteButton location="before" name="lookup_places_names_autocomplete" :options="{ icon: 'fas fa-home', type: 'default', stylingMode: 'text', }" />
        <DxAutocompleteButton location="after" name="lookup_places_names_autocomplete_txt" :options="{ text: 'Lugar de Reunión', type: 'default', stylingMode: 'text', disabled: true }" />
    </DxAutocomplete>

    
    <q-select class="q-mt-lg"
        label="Duración en Horas (*)" placeholder="Seleccione la Duración en Horas de la Reunión (*)" emit-value map-options filled
        :options="lookup_meetingLengths" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="meetingLength"
        ref="meetingLength"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-stopwatch" color="primary" /></template>
    </q-select>
    

   
    <q-input
        label="Comentarios para el Movimiento" placeholder="Ingrese comentarios, avisos, o mensajes importantes que desee informar al Movimiento" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="meetingComments" class="q-mt-md"
        />

    <q-toggle v-model="estado" color="positive" label="Activa?" />


    <br><br>
</q-form>
</template>
<script>
import { date } from 'quasar';
import { DxAutocomplete, DxButton as DxAutocompleteButton } from 'devextreme-vue/autocomplete';
import { DxTextBox, DxButton as DxTextBoxButton } from 'devextreme-vue/text-box';

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxAutocomplete, DxAutocompleteButton, DxTextBox, DxTextBoxButton
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
    methods: {
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            }
        )},
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
        teamID: {
            get () { return this.$store.state[this.moduleName].editData.basic.teamID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'teamID', value: val}) }
        },
        meetingDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.meetingDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'meetingDate', value: val}) }
        },
        meetingPlace: {
            get () { return this.$store.state[this.moduleName].editData.basic.meetingPlace },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'meetingPlace', value: val}) }
        },
        meetingLength: {
            get () { return this.$store.state[this.moduleName].editData.basic.meetingLength },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'meetingLength', value: val}) }
        },
        meetingComments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.meetingComments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'meetingComments', value: val}) }  
        },
        lookup_places: {
            get () { return [...new Set(this.$store.state[this.moduleName].editData.lookup_places.map(row=>row.name))]  },
        },
        lookup_teams: {
            get () {  return this.$store.state[this.moduleName].editData.lookup_teams }, 
        },
        lookup_meetingLengths: {
            get () {  return this.$store.state[this.moduleName].editData.lookup_meetingLengths }, 
        },
    }
})
</script>
