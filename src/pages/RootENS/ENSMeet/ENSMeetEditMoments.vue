<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    
    <q-input
        ref="momentOracionComments" 
        placeholder="Ingrese el Pasaje Bíblico usado en el Momento de Oración" label="Oración Comunitaria - Pasaje Bíblico" filled
        v-model="momentOracionComments" 
        >
        <template v-slot:prepend><q-icon name="fas fa-pray" color="primary" /></template>
    </q-input>
    <q-field filled label="Nivel de participación de la Oración Comunitaria" stack-label>
        <template v-slot:control>
          <q-rating
                size="md"
                v-model="momentOracionRating"
                icon="fas fa-star"
                color="amber-5"
            />
        </template>
    </q-field>



    <q-input class="q-mt-xl"
        ref="momentPuestaComunComments" 
        placeholder="Comentarios sobre la Puesta en Común" label="Puesta en Común" filled
        v-model="momentPuestaComunComments" 
        >
        <template v-slot:prepend><q-icon name="fas fa-comments" color="primary" /></template>
    </q-input>
    <q-field filled label="Nivel de participación de la Puesta en Común" stack-label>
    <template v-slot:control>
        <q-rating
            size="md"
            v-model="momentPuestaComunRating"
            icon="fas fa-star"
            color="amber-5"
        />
    </template>
    </q-field>


    <selectSearchable  class="q-mt-xl"
        prependIcon="fas fa-book"
        labelText="Libro / Tema de Estudio" labelSearchText="Buscar Libro"
        :optionsList="lookup_books"
        rowValueField="value" optionsListLabel="label" optionsListCaption="comments"
        :isRequired="false"
        :isDisable="false" 
        :isReadonly="false"
        :initialValue="temaEstudiolibroID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Tipo', field: 'label', align: 'left'}
                ,{ name: 'comments', label: 'Comentarios', field: 'comments', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.temaEstudiolibroID=row.value;
                //this.$emit('onAccMoveCompute')
            }"
        />
        
    <q-input
        ref="temaEstudioCapitulo" 
        placeholder="Ingrese el Capítulo del Tema de Estudio" label="Capítulo" filled
        v-model="temaEstudioCapitulo" 
        >
        <template v-slot:prepend><q-icon name="fas fa-bookmark" color="primary" /></template>
    </q-input>

    


    <q-card class="q-mt-xl">
        <q-toolbar>
            <q-toolbar-title class="text-primary">Participación del Equipo (Puntos Concretos de Esfuerzo)</q-toolbar-title>
        </q-toolbar>
        <q-card-section>
            <q-field borderless label="1 - Lectura Asidua de la Palabra" stack-label  >
                <template v-slot:control>
                    <q-slider v-model="momentParticipRatingLectura" markers :min="0" :max="5" label label-always class="q-ma-lg"  color="amber-5"  />
                </template>
            </q-field>
            <q-field borderless label="2 - Oración Personal" stack-label  >
                <template v-slot:control>
                    <q-slider v-model="momentParticipRatingOracionPersonal" markers :min="0" :max="5" label label-always class="q-ma-lg"  color="amber-5"  />
                </template>
            </q-field>
            <q-field borderless label="3 - Oración Conyugal y Familiar" stack-label  >
                <template v-slot:control>
                    <q-slider v-model="momentParticipRatingOracionConyugal" markers :min="0" :max="5" label label-always class="q-ma-lg"  color="amber-5"  />
                </template>
            </q-field>
            <q-field borderless label="4 - Retiro Anual" stack-label  >
                <template v-slot:control>
                    <q-slider v-model="momentParticipRatingRetiro" markers :min="0" :max="5" label label-always class="q-ma-lg"  color="amber-5"  />
                </template>
            </q-field>
            <q-field borderless label="5 - Regla de Vida" stack-label  >
                <template v-slot:control>
                    <q-slider v-model="momentParticipRatingReglaVida" markers :min="0" :max="5" label label-always class="q-ma-lg"  color="amber-5"  />
                </template>
            </q-field>
            <q-field borderless label="6 - Diálogo Conyugal" stack-label  >
                <template v-slot:control>
                    <q-slider v-model="momentParticipRatingSentada" markers :min="0" :max="5" label label-always class="q-ma-lg"  color="amber-5"  />
                </template>
            </q-field>
        </q-card-section>
    </q-card>

        
    

   
    
    <q-input
        label="Qué ayudó a mejorar al equipo?" placeholder="Ingrese qué ayudó al equipo a mejorar el cumplimiento de los Puntos Concretos de Esfuerzo" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="momentParticipCommentsGood"
        />

    <q-input
        label="Qué dificultades afectó al equipo ?" placeholder="Ingrese qué dificultó al equipo a cumplir los Puntos Concretos de Esfuerzo" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="momentParticipCommentsBad"
        />


    <br><br>
</q-form>
</template>
<script>
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
        momentOracionComments: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentOracionComments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentOracionComments', value: val}) }
        },
        momentOracionRating: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentOracionRating },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentOracionRating', value: val}) }
        },
        momentPuestaComunRating: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentPuestaComunRating },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentPuestaComunRating', value: val}) }
        },
        momentPuestaComunComments: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentPuestaComunComments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentPuestaComunComments', value: val}) }
        },
        momentParticipRatingLectura: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentParticipRatingLectura },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentParticipRatingLectura', value: val}) }
        },
        momentParticipRatingOracionPersonal: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentParticipRatingOracionPersonal },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentParticipRatingOracionPersonal', value: val}) }
        },
        momentParticipRatingOracionConyugal: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentParticipRatingOracionConyugal },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentParticipRatingOracionConyugal', value: val}) }
        },
        momentParticipRatingRetiro: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentParticipRatingRetiro },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentParticipRatingRetiro', value: val}) }
        },
        momentParticipRatingReglaVida: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentParticipRatingReglaVida },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentParticipRatingReglaVida', value: val}) }
        },
        momentParticipRatingSentada: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentParticipRatingSentada },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentParticipRatingSentada', value: val}) }
        },
        momentParticipCommentsGood: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentParticipCommentsGood },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentParticipCommentsGood', value: val}) }
        },
        momentParticipCommentsBad: {
            get () { return this.$store.state[this.moduleName].editData.basic.momentParticipCommentsBad },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'momentParticipCommentsBad', value: val}) }
        },
        temaEstudiolibroID: {
            get () { return this.$store.state[this.moduleName].editData.basic.temaEstudiolibroID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'temaEstudiolibroID', value: val}) }
        },
        temaEstudioCapitulo: {
            get () { return this.$store.state[this.moduleName].editData.basic.temaEstudioCapitulo },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'temaEstudioCapitulo', value: val}) }
        },
        lookup_books: {
            get () { return this.$store.state[this.moduleName].editData.lookup_books },
        },
    },
})
</script>
