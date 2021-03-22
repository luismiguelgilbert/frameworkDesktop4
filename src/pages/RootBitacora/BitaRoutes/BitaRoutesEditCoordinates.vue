<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <q-splitter
        v-model="splitterModel" class="no-padding"
        style="height: calc(100vh - 140px);" unit="%"
        >
            <template v-slot:before>
                <googlemaps-map
                    style="height: calc(100vh - 140px);"
                    :center.sync="center"
                    :zoom.sync="zoom"
                    @click="onMapClick"
                    >
                    <googlemaps-marker
                        v-for="(m,index) in coordenadasParsed" :key="index"
                        :position.sync="m.location"
                        :clickable="false"
                        :draggable="true"
                        @dragend="(e)=>onDragEnd(e, m)"
                        :title="'ID: ' + m.coordinateID + '\n' + 'Orden: ' + m.position + '\n' + m.comments"
                        :icon="m.selected?'http://maps.google.com/mapfiles/ms/icons/red-dot.png':'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'"
                        :label="{

                                text: 'Punto ' + m.coordinateID.toString()
                            }"
                        >
                    </googlemaps-marker>
                </googlemaps-map>
            </template>
            <template v-slot:after>
                <center class="q-pt-md">
                    <q-btn color="primary" icon="fas fa-crosshairs" label="Definir ubicación actual como Inicial" size="sm" no-caps @click="setAsInitial" />
                    <br><br><q-list  separator class="scroll" style="height: calc(100vh - 203px);">
                        <q-item-label header>Lista de Coordenadas ({{coordenadasParsed.length}})</q-item-label>
                        <q-item v-for="(coordenada, index) in coordenadasParsed" :key="index"
                            clickable @click="select(coordenada)"
                            title="Probando"
                            :active="coordenada.selected" :active-class="userColor=='blackDark'?'bg-white text-black':'bg-blue-5 text-white'">
                            <q-item-section side>
                                <q-btn icon="fas fa-trash-alt" title="Quitar" color="red" flat size="sm" round @click.stop="remove(coordenada)" />
                            </q-item-section>
                            <q-item-section :title="coordenada.comments">
                                <q-item-label>Punto {{coordenada.coordinateID}}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <div style="display: inline-block;">
                                    <q-btn icon="fas fa-arrow-up" flat color="primary" size="sm" dense round :disable="index==0" @click="moveUp(coordenada, index)" />
                                    <q-btn icon="fas fa-arrow-down" flat color="primary" size="sm" dense round :disable="index==coordenadasParsed.length-1" @click="moveDown(coordenada, index)" />
                                </div>
                            </q-item-section>
                        </q-item>

                    </q-list>
                </center>


            </template>
    </q-splitter>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

//Google Maps
import 'vue-googlemaps/dist/vue-googlemaps.css'
import VueGoogleMaps from 'vue-googlemaps'


Vue.use(VueGoogleMaps, {
  load: {
    apiKey: this.$q.sessionStorage.getItem('Google_API_key')
    //,libraries: "places"//necessary for places input
    ,useBetaRenderer: false// Use new renderer
  },
})

export default ({
    data () {
        return {
            moduleName: "BitaRoutes",
            splitterModel: 80,  center: null,
            coordenadasParsed:  []
        }
    },
    created(){
        if(this.lat && this.lng){
            this.center = {  lat: parseFloat(this.lat) ,lng: parseFloat(this.lng)  }
        }else{
            this.center = {  lat: -1.500 ,lng: -77.500  } //x default, Ecuador
            this.zoom = 7
        }
        if(this.$q.screen.lt.sm){this.splitterModel = 60}

        let newCoordinates = JSON.parse(JSON.stringify(this.coordinates))
        newCoordinates.map(x=>{
            x['location'] = {lat: parseFloat(x.lat), lng: parseFloat(x.lng)};
            this.coordenadasParsed.push(x)
        });
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        getMax(arr, prop) {
            var max;
            for (var i=0 ; i<arr.length ; i++) {
                if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                    max = arr[i];
            }
            return max;
        },
        setAsInitial(){
            this.lat = this.center.lat
            this.lng = this.center.lng
            this.zoom = this.zoom
        },
        onMapClick(e){
            let max_id = 1
            let max_position = 1
            if(this.coordenadasParsed.length > 0){ let temp = this.getMax(this.coordenadasParsed, "coordinateID"); max_id = parseInt(temp.coordinateID) + parseInt(1); }
            if(this.coordenadasParsed.length > 0){ let temp = this.getMax(this.coordenadasParsed, "position"); max_position = parseInt(temp.position) + parseInt(1); }
            this.coordenadasParsed.map(x=>x.selected=false);
            this.coordenadasParsed.push({
                 position: max_position
                ,lat: e.latLng.lat()
                ,lng: e.latLng.lng()
                ,location: {lat: parseFloat(e.latLng.lat()), lng: parseFloat(e.latLng.lng())}
                ,comments: ''
                ,coordinateID: max_id
                ,selected: true
            })
            let temp = JSON.parse(JSON.stringify(this.coordenadasParsed))
            this.coordinates = temp
        },
        select(coordenada){
            this.coordenadasParsed.map(x=> x.selected = false);
            this.coordenadasParsed.find(x=>x.coordinateID == coordenada.coordinateID).selected = true;
        },
        remove(coordenada){
            this.coordenadasParsed = this.coordenadasParsed.filter(x=>x.coordinateID != coordenada.coordinateID);
        },
        moveUp(coordenada, index){
            let cloneResult = JSON.parse(JSON.stringify(this.coordenadasParsed)) //clona
            let looperIndex = 0;
            cloneResult.map(x=>{ x['sortIndex']=looperIndex; looperIndex++; return x; })
            cloneResult[index].sortIndex=index-1;
            cloneResult[index-1].sortIndex=index;
            cloneResult = cloneResult.sort(function(a, b) { return a.sortIndex - b.sortIndex; });
            this.coordenadasParsed = cloneResult;
        },
        moveDown(coordenada, index){
            let cloneResult = JSON.parse(JSON.stringify(this.coordenadasParsed)) //clona
            let looperIndex = 0;
            cloneResult.map(x=>{ x['sortIndex']=looperIndex; looperIndex++; return x; })
            cloneResult[index].sortIndex=index+1;
            cloneResult[index+1].sortIndex=index;
            cloneResult = cloneResult.sort(function(a, b) { return a.sortIndex - b.sortIndex; });
            this.coordenadasParsed = cloneResult;
        },
        onDragEnd(newLocation, updatedPoint){
            updatedPoint.lat = newLocation.latLng.lat()
            updatedPoint.lng = newLocation.latLng.lng()
            updatedPoint.location = { lat: parseFloat(newLocation.latLng.lat()), lng: parseFloat(newLocation.latLng.lng()) }
            let cloneResult = JSON.parse(JSON.stringify(this.coordenadasParsed)) //clona
            cloneResult.filter(x => x.coordinateID == updatedPoint.coordinateID)[0] = updatedPoint
            this.coordinates = cloneResult;
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
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
        coordinates: {
            get () { return this.$store.state[this.moduleName].editData.coordinates },
            set (val) {
                console.dir('change to coordinates')
                console.dir(val)
                this.$store.commit((this.moduleName)+'/updateCoordinates', val)
            }
        },
    },
    watch: {
        /*coordenadasParsed: function (val) {
            console.dir('coordenadasParsed watch')
        },*/
        /*coordenadasParsed: {
            // This will let Vue know to look inside the array
            deep: true,

            // We have to move our method to a handler field
            handler(val){
                console.dir('coordenadasParsed watch')
                this.coordinates = val
            }
        }*/
    }
})
</script>
