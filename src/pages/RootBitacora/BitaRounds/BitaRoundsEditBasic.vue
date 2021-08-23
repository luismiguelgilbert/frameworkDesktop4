<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <q-toggle
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    <q-input 
        ref="label" :readonly="!allow_edit&&!allow_insert" 
        placeholder="Ingrese el nombre de la ronds (*)" label="Nombre de la Ronda (*)" filled
        v-model="label"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-route" /></template>
    </q-input>
    
    <q-select 
        label="Punto de Control (*)" placeholder="Seleccione el punto de control al que pertenece esta ruta" emit-value map-options filled
        :options="lookup_bitaPlaces" :readonly="!allow_edit&&!allow_insert"
        @input="clearRouteID"
        v-model="placeID"
        ref="placeID"
        :rules="[
          val => !!val || '* Requerido',
          val => val > 0 || 'Debe escoger un perfil',
        ]">
        <template v-slot:prepend><q-icon name="fas fa-map-marked-alt" /></template>
    </q-select>

    <q-select :disable="!(placeID>0)"
        label="Ruta GPS (*)" placeholder="Seleccione la ruta GPS a realizar" emit-value map-options filled
        :options="lookup_bitaRoutes.filter(x=>x.placeID == placeID)" :readonly="!allow_edit&&!allow_insert"
        v-model="routeID"
        ref="routeID"
        :rules="[
          val => !!val || '* Requerido',
          val => val > 0 || 'Debe escoger una ruta',
        ]">
        <template v-slot:prepend><q-icon name="fas fa-road" /></template>
    </q-select>

    <q-input filled v-model="startDate" mask="date"
        placeholder="Ingrese la fecha de inicio de la ronda (*)" label="Fecha de Inicio de Ronda(*)"
        :rules="[
                'date' || 'Fecha',
                val => !!val || '* Requerido'
        ]"
        >
      <template v-slot:prepend>
        <q-icon name="fas fa-calendar" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale" class="q-pa-md" >
            <q-date v-model="startDate" @input="() => $refs.qDateProxy.hide()" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input filled v-model="startTime" mask="time"
        placeholder="Ingrese la hora de inicio de la ronda (*)" label="Hora de Inicio de Ronda (*)"
        :rules="[
                'time' || 'Hora',
                val => !!val || '* Requerido'
        ]"
        >
      <template v-slot:prepend>
        <q-icon name="fas fa-clock" class="cursor-pointer">
          <q-popup-proxy ref="qTimeProxy" transition-show="scale" transition-hide="scale" class="q-pa-md" >
            <q-time v-model="startTime" @input="() => $refs.qTimeProxy.hide()" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-field filled 
        label="Frecuencia" stack-label
        v-model="freq"
        :rules="[
          val => !!val || '* Requerido',
          val => val > 0 || 'Debe escoger una ruta',
        ]"
        >
        <template v-slot:control>
            <q-option-group
                v-model="freq" inline
                :options="lookup_bitaRoundsFreq"
                color="primary"
            />
        </template>
    </q-field>

    <div class="row items-start q-gutter-xs" v-if="freq==2">
        <q-field filled >
            <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">Repetir cada:</div>
            </template>
        </q-field>
        <q-input filled v-model="freqTime" type="number" :min="1"
            v-if="freq==2"
            :rules="[
                    val => !!val || '* Requerido',
                    val => val > 0 || 'Debe ser mayor a 0'
            ]"
        />
        <q-select 
            emit-value map-options filled
            :options="lookup_bitaRoundsFreqCycle"
            :readonly="!allow_edit&&!allow_insert"
            v-model="freqCycle" 
            ref="freqCycle"
        />
        <q-input filled v-model="freqEnd" mask="date" clearable
            placeholder="Seleccione una Fecha hasta que estará vigente esta ronda recurrente" label="Fecha Límite"
            >
        <template v-slot:prepend>
            <q-icon name="fas fa-calendar" class="cursor-pointer">
            <q-popup-proxy ref="qfreqEndProxy" transition-show="scale" transition-hide="scale" class="q-pa-md" >
                <q-date v-model="freqEnd" @input="() => $refs.qfreqEndProxy.hide()" />
            </q-popup-proxy>
            </q-icon>
        </template>
        </q-input>
        
    </div>

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este pedido" filled
        type="textarea" :readonly="!allow_edit&&!allow_insert"
        v-model="comments"
        />
    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
    data () {
        return {
            moduleName: "BitaRounds"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        clearRouteID(){
            this.routeID = null
        }
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
        allow_disable: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_disable').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        label: { 
            get () { return this.$store.state[this.moduleName].editData.basic.label }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'label', value: val}) }  
        },
        placeID: { 
            get () { return this.$store.state[this.moduleName].editData.basic.placeID }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'placeID', value: val}) }  
        },
        routeID: { 
            get () { return this.$store.state[this.moduleName].editData.basic.routeID }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'routeID', value: val}) }  
        },
        startDate: { 
            get () { return this.$store.state[this.moduleName].editData.basic.startDate }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'startDate', value: val}) }  
        },
        startTime: { 
            get () { return this.$store.state[this.moduleName].editData.basic.startTime }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'startTime', value: val}) }  
        },
        estado: { 
            get () { return this.$store.state[this.moduleName].editData.basic.estado }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }  
        },
        freq: { 
            get () { return this.$store.state[this.moduleName].editData.basic.freq }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'freq', value: val}) }  
        },
        freqCycle: { 
            get () { return this.$store.state[this.moduleName].editData.basic.freqCycle }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'freqCycle', value: val}) }  
        },
        freqTime: { 
            get () { return this.$store.state[this.moduleName].editData.basic.freqTime }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'freqTime', value: val}) }  
        },
        freqEnd: { 
            get () { return this.$store.state[this.moduleName].editData.basic.freqEnd }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'freqEnd', value: val}) }  
        },
        comments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.comments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }  
        },
        lookup_bitaPlaces: { 
            get () { return this.$store.state[this.moduleName].editData.lookup_bitaPlaces }, 
        },
        lookup_bitaRoutes: { 
            get () { return this.$store.state[this.moduleName].editData.lookup_bitaRoutes }, 
        },
        lookup_bitaRoundsFreq: { 
            get () { return this.$store.state[this.moduleName].editData.lookup_bitaRoundsFreq }, 
        },
        lookup_bitaRoundsFreqCycle: { 
            get () { return this.$store.state[this.moduleName].editData.lookup_bitaRoundsFreqCycle }, 
        },
        
    },
})
</script>