<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    
    <div>
      <q-toggle
        tabindex="-1"
        v-model="priest" color="primary" label="El consiliario asistió a la reunión?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        checked-icon="fas fa-check"
        />
    </div>
    <div>
      <q-toggle
        tabindex="-1"
        v-model="priestOntime" color="primary" label="El consiliario asistió puntualmente?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        checked-icon="fas fa-clock"
        />
    </div>
    <div>
      <q-toggle
        tabindex="-1"
        v-model="priestAgape" color="primary" label="El consiliario participó del Ágape?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        checked-icon="fas fa-utensils"
        />
    </div>
    <div>
      <q-toggle
        tabindex="-1"
        v-model="priestOracion" color="primary" label="El consiliario participó de la Oración?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        checked-icon="fas fa-pray"
        />
    </div>
    <div>
      <q-toggle
        tabindex="-1"
        v-model="priestTema" color="primary" label="El consiliario participó del Tema de Estudio?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        checked-icon="fas fa-book"
        />
    </div>
    <div>
      <q-toggle
        tabindex="-1"
        v-model="priestParticipacion" color="primary" label="El consiliario participó de la Participación?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        checked-icon="fas fa-comment"
        />
    </div>
    <div>
      <q-toggle
        tabindex="-1"
        v-model="priestPuestaComun" color="primary" label="El consiliario participó de la Puesta en Común?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        checked-icon="fas fa-comments"
        />
    </div>
    
    
    <q-input
        label="Comentarios sobre participación del consiliario" placeholder="Ingrese comentarios sobre la participación o asistencia del Consiliario" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="priestComments"
        />


    <br><br>
</q-form>
</template>
<script>
import { date } from 'quasar';

export default ({
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
        priest: {
            get () { return this.$store.state[this.moduleName].editData.basic.priest },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'priest', value: val}) }
        },
        priestOntime: {
            get () { return this.$store.state[this.moduleName].editData.basic.priestOntime },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'priestOntime', value: val}) }
        },
        priestAgape: {
            get () { return this.$store.state[this.moduleName].editData.basic.priestAgape },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'priestAgape', value: val}) }
        },
        priestOracion: {
            get () { return this.$store.state[this.moduleName].editData.basic.priestOracion },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'priestOracion', value: val}) }
        },
        priestTema: {
            get () { return this.$store.state[this.moduleName].editData.basic.priestTema },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'priestTema', value: val}) }
        },
        priestParticipacion: {
            get () { return this.$store.state[this.moduleName].editData.basic.priestParticipacion },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'priestParticipacion', value: val}) }
        },
        priestPuestaComun: {
            get () { return this.$store.state[this.moduleName].editData.basic.priestPuestaComun },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'priestPuestaComun', value: val}) }
        },
        priestComments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.priestComments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'priestComments', value: val}) }  
        },
        /*lookup_cities: {
            get () { return this.$store.state[this.moduleName].editData.lookup_cities },
        },*/
    },
})
</script>
