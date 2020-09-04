<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm" >    
    
    <q-input filled v-model="date" mask="date"
        placeholder="Ingrese la fecha de la ronda (*)" label="Fecha (*)"
        :rules="[
                'date' || 'Fecha',
                val => !!val || '* Requerido'
        ]"
        >
      <template v-slot:prepend>
        <q-icon name="fas fa-calendar" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale" class="q-pa-md" >
            <q-date v-model="date" @input="() => $refs.qDateProxy.hide()" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-input filled v-model="time" mask="time"
        placeholder="Ingrese la hora de inicio de la ronda (*)" label="Hora (*)"
        :rules="[
                'time' || 'Hora',
                val => !!val || '* Requerido'
        ]"
        >
      <template v-slot:prepend>
        <q-icon name="fas fa-clock" class="cursor-pointer">
          <q-popup-proxy ref="qTimeProxy" transition-show="scale" transition-hide="scale" class="q-pa-md" >
            <q-time v-model="time" @input="() => $refs.qTimeProxy.hide()" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-select 
        label="Punto de Control" placeholder="Seleccione el punto de control" emit-value map-options filled
        :options="[{value: 1, label: 'Central Galapesca'},{value: 6, label: 'pruebas bitt 2'}]"
        :readonly="!allow_edit&&!allow_insert"
        v-model="puntoControl"
        ref="puntoControl"
        :rules="[
          val => !!val || '* Requerido'
        ]">
        <template v-slot:prepend><q-icon name="fas fa-map-marked-alt" /></template>
    </q-select>
    <q-select 
        label="Referencias GPS" placeholder="Seleccione la referencias de coordenadas que deben cumplirse" emit-value map-options filled
        :options="[{value: 1, label: 'Galapesca (Ronda Completa)'},{value: 2, label: 'Galapesca (Ronda Rápida)'}]"
        :readonly="!allow_edit&&!allow_insert"
        v-model="gpsTemplate"
        ref="gpsTemplate"
        :rules="[
          val => !!val || '* Requerido'
        ]">
        <template v-slot:prepend><q-icon name="fas fa-location-arrow" /></template>
    </q-select>
    <q-select 
        label="Responsable" placeholder="Seleccione el usuario que debe realizar esta ronda" emit-value map-options filled
        :options="[{value: 1, label: 'Luis Gilbert'},{value: 2, label: 'Guillermo Jara'}]"
        :readonly="!allow_edit&&!allow_insert"
        v-model="responsable" clearable
        ref="responsable"
        >
        <template v-slot:prepend><q-icon name="fas fa-user" /></template>
    </q-select>
    <q-option-group
        v-model="schedule" inline
        :options="[
            { label: 'Una sola vez', value: 1 },
            { label: 'Recurrente', value: 2 },
        ]"
        color="primary"
    />
    <div class="row items-start q-gutter-xs" v-if="schedule==2">
        <q-field filled >
            <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">Repetir cada:</div>
            </template>
        </q-field>
        <q-input filled v-model="repeatNumber" type="number" :min="1"
            v-if="schedule==2"
            :rules="[
                    val => !!val || '* Requerido',
                    val => val > 0 || 'Debe ser mayor a 0'
            ]"
        />
        <q-select 
            emit-value map-options filled
            :options="[{value: 1, label: 'Minuto(s)'},{value: 2, label: 'Hora(s)'},{value: 3, label: 'Día(s)'}]"
            :readonly="!allow_edit&&!allow_insert"
            v-model="repeatType" 
            ref="repeatType"
        />
        
    </div>
    
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
    data () {
        return {
            moduleName: "Bitaconsola", date: null, time: null, puntoControl: null, gpsTemplate: null, responsable: null, schedule: 1, repeatNumber: 1, repeatType: 2
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        showDatePicker(fieldName) {
            console.dir('isFieldErrorBG: '+fieldName)
            console.dir(this.$refs[fieldName])
            this.$refs[fieldName].show();
        },
        /*isFieldErrorText(fieldName) {
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
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        label: { 
            get () { return this.$store.state[this.moduleName].editData.basic.label }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'label', value: val}) }  
        },
        estado: { 
            get () { return this.$store.state[this.moduleName].editData.basic.estado }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }  
        },
        codigo: { 
            get () { return this.$store.state[this.moduleName].editData.basic.codigo }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'codigo', value: val}) }  
        },
        comments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.comments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }  
        },
    },
})
</script>