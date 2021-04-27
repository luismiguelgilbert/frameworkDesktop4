<template>
<div style="margin: -16px;">
    <q-toolbar class="no-padding">
        <!--<q-btn label="Nueva Reunión"  icon="fas fa-calendar-plus" color="primary" flat stretch no-caps @click="initializeFormData(null)" />-->
        
        <q-btn color="primary" flat stretch icon="fas fa-chevron-left"  @click="onPrev" />
        <q-btn color="primary" flat stretch :label="title" />
        <q-btn color="primary" flat stretch icon="fas fa-chevron-right" @click="onNext" />
        <q-space />
        Seleccione el día de Próxima Reunión de Equipo
    </q-toolbar>
     <q-separator />
  
    <q-calendar
        ref="calendar"
        v-model="selectedDate"
        view="month"
        locale="es-ec"
        height="250" bordered animated
        enable-outside-days
        :selected-dates="selectedDates"
        @change="onChange"
        @click:day2="onToggleDate"
        @click:date2="onToggleDate"
        >
        <template #day="{ timestamp }">
            <template v-for="(event, index) in ensEvents.filter(x => x.startDate.replaceAll('/','-')==timestamp.date)">
                <q-btn color="primary" no-caps size="sm" @click.stop="openMeeting(event)" >
                    <span class="q-pl-sm">{{ event.eventName }}</span>
                    <br>
                    <span class="q-pl-sm">{{ event.eventPlace }}</span>
                </q-btn>
            </template>
        </template>
    </q-calendar>

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
                    :disable="currentData.startDate.length!=10 || currentData.startTime.length!=5" />
            </q-card-actions>
        </q-card>
    </q-dialog>

  
</div>

</template>

<style>
.dx-overlay-wrapper {
    z-index: 50000 !important;
}

</style>
<script>
import Vue from 'vue'
import Plugin from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/dist/index.css'
import { date } from 'quasar'

import { DxAutocomplete, DxButton as DxAutocompleteButton } from 'devextreme-vue/autocomplete';
import { DxTextBox, DxButton as DxTextBoxButton } from 'devextreme-vue/text-box';

Vue.use(Plugin)



export default ({
    props: {
        moduleName: { type: String, required: true }
    },
    components:{
        DxAutocomplete, DxAutocompleteButton, DxTextBox, DxTextBoxButton
    },
    data () {
        return {
            filterString: '', 
            dialogVisible: false,
            selectedDate: '',
            selectedDates: [],
            title: '',
            currentData: {
                eventTypeID: 1
                ,startDate: ''
                ,startTime: ''
                ,eventPlace: ''
                ,eventName: ''
                ,eventComments: '' 
                ,isNew: true
            }
           
        }
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
        hideDialog(){
            this.selectedDates = [];//para que visualmente se borre el cuadro pintado del día en qcalendar
        },
        resetCurrentData(isNew){
            let max_id = 1
            let temp = null
            if(this.ensEvents.length > 0){
                temp = this.getMax(this.ensEvents, "value");
                max_id = parseInt(temp.value) + parseInt(1);
            }
            this.currentData = {
                value: max_id
                ,eventTypeID: 1
                ,startDate: ''
                ,startTime: ''
                ,eventPlace: ''
                ,eventName: ''
                ,eventComments: '' 
                ,isNew: isNew
            }
        },
        onToggleDate({ scope }){
            this.selectedDates.push(scope.timestamp.date);//para que visualmente se pinte el cuadro del día en qcalendar
            this.resetCurrentData(true);
            this.currentData.startDate = scope.timestamp.date.replaceAll('-','/');
            this.dialogVisible = true;
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
        deleteMeeting(){
            let newEvents = JSON.parse(JSON.stringify(this.ensEvents))
            newEvents = newEvents.filter(x=>x.value != this.currentData.value);
            this.ensEvents = newEvents;
            this.dialogVisible = false;
        }
    },
    computed:{
        console: () => console,
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
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
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
        /*files: {
            get () { return this.$store.state[this.moduleName].editData.files },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataFiles', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },*/
        files: {
            get () { return this.$store.state[this.moduleName].editData.files },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'files', value: val}) }
        },
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
        userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage }  },
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
        },
        lookup_ensEventsTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_ensEventsTypes },
        },
        lookup_places: {
            get () { return [...new Set(this.$store.state[this.moduleName].editData.lookup_places.map(row=>row.name))]  },
        },
        lookup_books: {
            get () { return [...new Set(this.$store.state[this.moduleName].editData.lookup_books.map(row=>row.label))]  },
        },
        isSmallScreen() {
            return this.$q.screen.lt.md?true:false
        },
        ensEvents: {
            get () { return this.$store.state[this.moduleName].editData.ensEvents },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'ensEvents', value: val}) }
        },
        
        /*
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        */
    }
})
</script>
