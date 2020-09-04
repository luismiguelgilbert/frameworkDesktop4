<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">    
    <q-toggle
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    <q-input 
        ref="label" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" 
        placeholder="Ingrese el nombre de la ruta (*)" label="Nombre de la Ruta (*)" filled
        v-model="label"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-road" /></template>
    </q-input>
    
    <q-select 
        label="Punto de Control (*)" placeholder="Seleccione el punto de control al que pertenece esta ruta" emit-value map-options filled
        :options="lookup_bitaPlaces" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="placeID"
        ref="pruebas"
        :rules="[
          val => !!val || '* Requerido',
          val => val > 0 || 'Debe escoger un perfil',
        ]">
        <template v-slot:prepend><q-icon name="fas fa-map-marked-alt" /></template>
    </q-select>
    <q-input 
        ref="lat" readonly class="q-pb-md"
        placeholder="Latitud referencial para ubicar el mapa al abrir" label="Latitud Inicial" filled
        v-model="lat"
        >
        <template v-slot:prepend><q-icon name="far fa-dot-circle" /></template>
    </q-input>
    <q-input 
        ref="lng" readonly class="q-pb-md"
        placeholder="Longitud referencial para ubicar el mapa al abrir" label="Longitud Inicial" filled
        v-model="lng"
        >
        <template v-slot:prepend><q-icon name="far fa-dot-circle" /></template>
    </q-input>
    <q-input 
        ref="zoom" readonly class="q-pb-md"
        placeholder="Zoom inicial para ubicar el mapa al abrir" label="Zoom Inicial" filled
        v-model="zoom"
        >
        <template v-slot:prepend><q-icon name="fas fa-search-plus" /></template>
    </q-input>

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este pedido" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
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
            moduleName: "BitaRoutes"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
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
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        label: { 
            get () { return this.$store.state[this.moduleName].editData.basic.label }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'label', value: val}) }  
        },
        placeID: { 
            get () { return this.$store.state[this.moduleName].editData.basic.placeID }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'placeID', value: val}) }  
        },
        lat: { 
            get () { return this.$store.state[this.moduleName].editData.basic.lat }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'lat', value: val}) }  
        },
        lng: { 
            get () { return this.$store.state[this.moduleName].editData.basic.lng }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'lng', value: val}) }  
        },
        zoom: { 
            get () { return this.$store.state[this.moduleName].editData.basic.zoom }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'zoom', value: val}) }  
        },
        estado: { 
            get () { return this.$store.state[this.moduleName].editData.basic.estado }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }  
        },
        comments: { 
            get () { return this.$store.state[this.moduleName].editData.basic.comments }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }  
        },
        lookup_bitaPlaces: { 
            get () { return this.$store.state[this.moduleName].editData.lookup_bitaPlaces }, 
        },
    },
})
</script>