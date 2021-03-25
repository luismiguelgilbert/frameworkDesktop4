<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <q-toolbar class="no-padding no-margin">
        <q-toggle
            v-model="is_critical" color="orange" checked-icon="fas fa-exclamation" label="Crítico?" :disable="record_id > 0"
            />
        <q-space />
        <q-toggle v-if="record_id > 0"
            v-model="anulado" color="red" checked-icon="fas fa-trash-alt" label="Anular?" left-label
            />
    </q-toolbar>
    
    <q-select 
        v-model="placeID"
        :options="lookup_places"
        emit-value map-options readonly
        option-value="placeID" option-label="name_es"
        placeholder="Seleccione Punto de Control" label="Punto de Control" filled
        >
        <template v-slot:prepend><q-icon name="fas fa-map-marked-alt" /></template>
    </q-select>
    <q-select 
        v-model="sys_user_code"
        :options="lookup_users"
        emit-value map-options readonly
        placeholder="Seleccione Usuario" label="Usuario" filled
        >
        <template v-slot:prepend><q-icon name="fas fa-user" /></template>
    </q-select>
    <q-input
        ref="fecha" 
        mask="date" readonly
        :rules="['date']" hide-bottom-space
        placeholder="Ingrese la fecha de Evento (aaaa/mm/dd)" label="Fecha de Evento (aaaa/mm/dd) (*)" filled
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
        placeholder="Ingrese la hora de Evento (aaaa/mm/dd)" label="Hora de Evento (HH:MM) (*)" filled >
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
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este pedido" filled
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
            },
        }
    },
    mounted(){
        this.$refs.formulario.validate()
        if(!(this.placeID>0)){
            this.placeID = this.editStatus.placeID
        }
    },
    methods:{
        /*isFieldErrorBG(fieldName) {
            console.dir('isFieldErrorBG: '+fieldName)
            console.dir(this.$refs.length)
            if(Object.keys(this.$refs).length>0){//espera que existan datos 
                return this.$refs[fieldName].hasError?'red':undefined
            }
        },
        isFieldErrorText(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos 
                return this.$refs[fieldName].hasError?'text-white':undefined
            }
        },
        isFieldErrorLabel(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos 
                return this.$refs[fieldName].hasError?'white':undefined
            }
        },*/
        
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
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
        record_id: { 
            get () { return this.$store.state[this.moduleName].editData.basic.record_id }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'record_id', value: val}) }  
        },
        anulado: { 
            get () { return this.$store.state[this.moduleName].editData.basic.anulado }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'anulado', value: val}) }  
        },
        is_critical: { 
            get () { return this.$store.state[this.moduleName].editData.basic.is_critical }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'is_critical', value: val}) }  
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



        marca: { 
            get () { return this.$store.state[this.moduleName].editData.basic.marca }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'marca', value: val}) }  
        },
        modelo: { 
            get () { return this.$store.state[this.moduleName].editData.basic.modelo }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'modelo', value: val}) }  
        },
        color: { 
            get () { return this.$store.state[this.moduleName].editData.basic.color }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'color', value: val}) }  
        },
        comments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.comments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }  
        },
    },
})
</script>