<template>
<q-layout container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px);">
    <q-header>
        <q-toolbar :class="toolbarComponentClass">
            <!--<q-btn label="Nueva Reunión"  icon="fas fa-calendar-plus" color="primary" flat stretch no-caps @click="initializeFormData(null)" />-->
            
            <q-btn color="primary" flat stretch icon="fas fa-chevron-left"  @click="onPrev" />
            <q-btn color="primary" flat stretch :label="title" />
            <q-btn color="primary" flat stretch icon="fas fa-chevron-right" @click="onNext" />
            <q-space />
            <q-btn color="primary" flat no-caps no-wrap stretch icon="fas fa-sync" label="Actualizar" @click="loadData" />
        </q-toolbar>
        <!--<q-toolbar >
            <q-btn color="primary" stretch flat no-caps no-wrap icon="fas fa-calendar-plus" label="Agendar Reunión" />
            <q-space />
            
        </q-toolbar>-->

        <q-separator color="grey-4" />
    </q-header>

    <q-page-container>
        <q-calendar
            ref="calendar"
            v-model="selectedDate"
            view="month"
            locale="es-ec"
            height="250" bordered animated
            enable-outside-days
            :selected-dates="selectedDates"
            @change="onChange"
            >
            <template #day="{ timestamp }">
                <template v-for="(event, index) in ensEvents.filter(x => x.startDate.replaceAll('/','-')==timestamp.date)">
                    <q-btn color="primary" no-caps size="sm" @click.stop="openMeeting(event)" >
                        <span class="q-pl-sm">{{ event.eventName }}</span>
                        <br>
                        <span class="q-pl-sm">{{ event.eventPlace }}</span>
                    </q-btn>
                </q-badge>
                </template>
            </template>
        </q-calendar>
    </q-page-container>

    <q-dialog v-model="dialogVisible" @hide="hideDialog" >
        <q-card style="min-height: 500px;">
            <q-toolbar>
                <q-toolbar-title class="text-primary">Agendar Reunión de Equipo</q-toolbar-title>
            </q-toolbar>
            <q-card-section>
                <q-form >
                    
                    <q-input
                        ref="startDate" 
                        mask="date" :rules="['date']"
                        placeholder="Ingrese la fecha de la Próxima Reunión (*)" label="Fecha de Próxima Reunión (*)" filled
                        v-model="currentData.startDate"
                        >
                        <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy  ref="qDateProxy_startDate" transition-show="scale" transition-hide="scale">
                            <q-date v-model="currentData.startDate">
                                <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                </div>
                            </q-date>
                            </q-popup-proxy>
                        </q-icon>
                        </template>
                        <template v-slot:prepend><q-icon name="fas fa-calendar" color="primary" /></template>
                    </q-input>

                    <q-input class="q-mb-md"
                        v-model="currentData.startTime" mask="time" 
                        :rules="['time']" hide-bottom-space
                        placeholder="Ingrese la hora de Próxima Reunión (HH:MM)" label="Hora de Próxima Reunión (HH:MM) (*)" filled >
                        <template v-slot:append>
                        <q-icon name="access_time" class="cursor-pointer">
                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-time v-model="currentData.startTime">
                                <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                            </q-time>
                            </q-popup-proxy>
                        </q-icon>
                        </template>
                        <template v-slot:prepend><q-icon name="fas fa-clock" color="primary" /></template>
                    </q-input>

                    
                    <DxAutocomplete
                        :data-source="lookup_places"
                        v-model:value="currentData.eventPlace"
                        placeholder="Lugar de la Próxima Reunión"
                        :deferRendering="true"
                        stylingMode="filled" height="60px"
                        :maxItemCount="10" :minSearchLength="0"
                        :openOnFieldClick="true"
                        >
                        <!-- @value-changed="(e) =>{ console.dir('pruebas') }" -->
                        <DxAutocompleteButton location="before" name="lookup_visitors_names_autocomplete" :options="{ icon: 'fas fa-home', type: 'default', stylingMode: 'text', }" />
                        <DxAutocompleteButton location="after" name="lookup_visitors_names_autocomplete_txt" :options="{ text: 'Lugar de Próxima Reunión', type: 'default', stylingMode: 'text', disabled: true }" />
                    </DxAutocomplete>

                    

                    <DxAutocomplete
                        :data-source="lookup_books" style="margin-top: 20px;"
                        v-model:value="currentData.eventName"
                        placeholder="Tema de Estudio de Próxima Reunión"
                        :deferRendering="true"
                        stylingMode="filled" height="60px"
                        :maxItemCount="10" :minSearchLength="0"
                        :openOnFieldClick="true"
                        >
                        <!-- @value-changed="(e) =>{ console.dir('pruebas') }" -->
                        <DxAutocompleteButton location="before" name="lookup_books_names_autocomplete" :options="{ icon: 'fas fa-book', type: 'default', stylingMode: 'text', }" />
                        <DxAutocompleteButton location="after" name="lookup_books_names_autocomplete_txt" :options="{ text: 'Tema de Estudio de Próxima Reunión', type: 'default', stylingMode: 'text', disabled: true }" />
                    </DxAutocomplete>

                    
                    <q-input
                        label="Comentarios para Próxima Reunión" placeholder="Ingrese comentarios, para Próxima Reunión" filled
                        type="textarea"  autogrow
                        v-model="currentData.eventComments" class="q-mt-md"
                        />
                </q-form>
            </q-card-section>
            <q-card-actions align="around">
                <q-btn v-if="!currentData.isNew" color="red" label="Eliminar" icon="fas fa-trash-alt" @click="deleteMeeting" />
                <q-btn color="primary" label="Guardar" icon="fas fa-calendar-plus" @click="saveMeeting" 
                     />
            </q-card-actions>
        </q-card>
    </q-dialog>

</q-layout>
</template>
<script>
import Vue from 'vue'
import Plugin from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/dist/index.css'
Vue.use(Plugin)

import { date } from 'quasar'
import { DxAutocomplete, DxButton as DxAutocompleteButton } from 'devextreme-vue/autocomplete';
import { DxTextBox, DxButton as DxTextBoxButton } from 'devextreme-vue/text-box';



export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxAutocomplete, DxAutocompleteButton, DxTextBox, DxTextBoxButton
    },
    mounted(){//NO debe ser created, porque aun NO estaría creado el componente editForm
        let newEditStatus = JSON.parse(JSON.stringify(this.editStatus));
        newEditStatus.editMode = 'edit';
        newEditStatus.navigateToRecord = this.userCode;
        this.editStatus = newEditStatus;
        this.loadData()
    },
    data () {
        return {
            //Confirmed
            router: this.$router,
            ensEvents: [],
            selectedDate: '',
            selectedDates: [],
            title: '',
            dialogVisible: false,
            currentData: {
                eventTypeID: 1
                ,startDate: ''
                ,startTime: ''
                ,eventPlace: ''
                ,eventName: ''
                ,eventComments: '' 
                ,isNew: true
            },
            lookup_places: [],
            lookup_books: [],
        }
    },
    methods:{
        loadData(){
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spEnsEventsSelect',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                }
            }).then((response) => {
                this.ensEvents = JSON.parse(response.data[0].basic)
                this.lookup_places = JSON.parse(response.data[0].lookup_places)
                this.lookup_books = JSON.parse(response.data[0].lookup_books)
            }).catch((error) => {
                console.dir(error)
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
                this.loadingData = false
            })
        },
        onPrev () {
            this.$refs.calendar.prev()
        },
        onNext () {
            this.$refs.calendar.next()
        },
        onChange ({ start }) {
            //le agrego 1 día para que el título del año/mes sea más consistente al navegar
            this.title = date.formatDate( date.addToDate(start.date, { days: 1 }) , 'MMMM-YYYY',
                {
                    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                    daysShort: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'],
                    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                    monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                }
            )
        },
        openMeeting(event){
            this.currentData = {
                value: event.value
                ,eventTypeID: event.eventTypeID
                ,startDate: event.startDate
                ,startTime: event.startTime
                ,eventPlace: event.eventPlace
                ,eventName: event.eventName
                ,eventComments: event.eventComments
                ,isNew: false
            }
            this.dialogVisible = true
        },
        hideDialog(){
            this.selectedDates = [];//para que visualmente se borre el cuadro pintado del día en qcalendar
        },
        saveMeeting(){
            if(this.currentData.isNew==true){
                let newEvents = JSON.parse(JSON.stringify(this.ensEvents))
                newEvents.push(this.currentData);
                this.ensEvents = newEvents;
            }else{
                let newEvents = JSON.parse(JSON.stringify(this.ensEvents))
                newEvents.map(x=>{
                    if(x.value==this.currentData.value){
                        x.value = x.value;
                        x.eventTypeID = x.eventTypeID;
                        x.startDate = this.currentData.startDate;
                        x.startTime = this.currentData.startTime;
                        x.eventPlace = this.currentData.eventPlace;
                        x.eventName = this.currentData.eventName;
                        x.eventComments = this.currentData.eventComments;
                        x.isNew = x.isNew
                    }
                });
                this.ensEvents = newEvents;
            }
            this.dialogVisible = false;
        },
        deleteMeeting(){
            let newEvents = JSON.parse(JSON.stringify(this.ensEvents))
            newEvents = newEvents.filter(x=>x.value != this.currentData.value);
            this.ensEvents = newEvents;
            this.dialogVisible = false;
        }
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
        editConfig: {
            get () { return this.$store.state[this.moduleName].editConfig },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editConfig', value: val})  }
        },
        editData: {
            get () { return this.$store.state[this.moduleName].editData },
        },
        toolbarComponentClass: { get () {
            let result = 'no-padding '
            if(this.$store.state.main.userColor=='default'){
                result=result + 'bg-white text-white'
            }
            if(this.$store.state.main.userColor=='blackDark'){
                result=result + 'bg-grey-10 text-white'
            }
            return result
        }},
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        userTableLinesDXcols: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='vertical'){ result = true }
                return result
            } 
        },
        userTableLinesDXrows: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='horizontal'){ result = true }
                return result
            } 
        },
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    },

})
</script>