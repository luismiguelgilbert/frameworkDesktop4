<template>
<q-layout container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px);">
    <!--<q-header>
        <q-toolbar :class="toolbarComponentClass">
            <q-btn color="primary" flat stretch icon="fas fa-chevron-left"  @click="onPrev" />
            <q-btn color="primary" flat stretch :label="title" />
            <q-btn color="primary" flat stretch icon="fas fa-chevron-right" @click="onNext" />
            <q-space />
            <q-btn color="primary" flat no-caps no-wrap stretch icon="fas fa-sync" label="Actualizar" @click="loadData" />
        </q-toolbar>

        <q-separator color="grey-4" />
    </q-header>-->

    <q-page-container>
        <DxScheduler
            :data-source="ensEvents"
            startDateExpr="startDateTime"
            endDateExpr="EndDate"
            textExpr="eventName"
            descriptionExpr="eventPlace"
            :views="['month']"
            height="calc(100vh - 51px)"
            :start-day-hour="9"
            current-view="month"
            
            appointment-template="appointmentTemplate"
            appointment-tooltip-template="appointmentTooltipTemplate"
            :on-appointment-form-opening="onAppointmentFormOpening"
            :on-appointment-updating="onAppointmentUpdating"
            >
            <!-- :on-appointment-adding="onAppointmentAdding" -->
            <DxResource
                :dataSource="ensEventsTypes"
                fieldExpr="eventTypeID" 
                label="Tipo"
            />
            <!--fieldExpr es el campo del datasource principal del DxScheduler (tipo lookup field). En el DxResource, siempre deben ir los campos como "id" , "text" , "color"-->
            <!--label es el título que se muestra al editar un evento-->

            <template #appointmentTemplate="{ data }">
                <div>{{data.appointmentData.displayText}}</div>
            </template>
            <template #appointmentTooltipTemplate="{ data }">
                <q-item>
                    <q-item-section>
                        <q-item-label class="text-subtitle2 text-left">{{data.appointmentData.eventName}}</q-item-label>
                        <q-item-label class="text-left" caption>Tipo: {{data.appointmentData.eventTypeName}}</q-item-label>
                        <q-item-label class="text-left" caption>Lugar: {{data.appointmentData.eventPlace}}</q-item-label>
                        <q-item-label class="text-left" caption>Inicio: {{data.appointmentData.startDateName}} {{data.appointmentData.startTimeName}}</q-item-label>
                        <q-item-label class="text-left" caption>{{data.appointmentData.eventComments}}</q-item-label>
                    </q-item-section>
                </q-item>
            </template>
            
        </DxScheduler>

    </q-page-container>

    <q-dialog v-model="dialogVisible" v-if="currentData" >
        <q-card style="min-width: 900px;">
            <q-tabs dense v-model="tab" align="justify" class="bg-primary text-white shadow-2">
                <q-tab name="info" icon="fas fa-info-circle" label="Evento" no-caps />
                <q-tab name="user" icon="fas fa-user" label="Particpantes" no-caps />
            </q-tabs>
            <q-separator />
            <q-card-section class="no-padding">
                <q-tab-panels v-model="tab" animated  >
                    <q-tab-panel name="info" style="height: calc(100vh - 170px);">
                        <div class="row">
                            <q-select class="col-10 q-pa-xs"  filled label="Tipo" :options="ensEventsTypes" v-model="currentData.eventTypeID" option-value="id" option-label="text" option-disable="disabled" map-options emit-value 
                                :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)" >
                                <template v-slot:prepend><q-icon name="fas fa-users" /></template>
                            </q-select>
                            <q-toggle class="col-2 q-pa-xs" v-model="currentData.estado" left-label label="Estado" color="primary" />
                            <q-input class="col-12 q-pa-xs"  filled v-model="currentData.eventName" label="Asunto" 
                                :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)">
                                <template v-slot:prepend><q-icon name="fas fa-book" /></template>
                            </q-input>
                            <q-input class="col-12 q-pa-xs"  filled v-model="currentData.eventPlace" label="Lugar" 
                                :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)">
                                <template v-slot:prepend><q-icon name="fas fa-map-marked-alt" /></template>
                            </q-input>
                            <q-input
                                 class="col-6 q-pa-xs" ref="fecha" mask="date" 
                                :rules="['date']" hide-bottom-space
                                placeholder="Ingrese la fecha de Inicio (aaaa/mm/dd)" label="Fecha de Inicio (aaaa/mm/dd) (*)" filled
                                v-model="currentData.startDate"
                                :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)"
                                >
                                <template v-slot:append>
                                    <q-icon name="event" class="cursor-pointer">
                                        <q-popup-proxy ref="qDateProxy_fecha" transition-show="scale" transition-hide="scale" disable>
                                        <!--cuando se cambia la fecha de inicio, también se cambia la fecha de fin-->
                                        <q-date :locale="myQDateLocale" minimal v-model="currentData.startDate" 
                                            @input="currentData.EndDateName = currentData.startDate"
                                            :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)"  >
                                            <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                            </div>
                                        </q-date>
                                        </q-popup-proxy>
                                    </q-icon>
                                </template>
                                <template v-slot:prepend><q-icon name="fas fa-calendar-check" /></template>
                            </q-input>
                            <q-input 
                                class="col-6 q-pa-xs"  v-model="currentData.startTimeName" mask="time" 
                                :rules="['time']" hide-bottom-space
                                placeholder="Ingrese la hora de Inicio (HH:MM)" label="Hora de Inicio (HH:MM) (*)" filled 
                                :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)" >
                                <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-time v-model="currentData.startTimeName" 
                                        :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)"  >
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
                                class="col-6 q-pa-xs" ref="fecha" mask="date"
                                :rules="['date']" hide-bottom-space
                                placeholder="Ingrese la fecha de Fin (aaaa/mm/dd)" label="Fecha de Fin (aaaa/mm/dd) (*)" filled
                                v-model="currentData.EndDateName"
                                :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)"
                                >
                                <template v-slot:append>
                                    <q-icon name="event" class="cursor-pointer">
                                        <q-popup-proxy ref="qDateProxy_fecha" transition-show="scale" transition-hide="scale" disable>
                                        <q-date :locale="myQDateLocale" minimal v-model="currentData.EndDateName"  
                                            :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)"  >
                                            <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                            </div>
                                        </q-date>
                                        </q-popup-proxy>
                                    </q-icon>
                                </template>
                                <template v-slot:prepend><q-icon name="fas fa-calendar-times" /></template>
                            </q-input>
                            <q-input 
                                class="col-6 q-pa-xs" v-model="currentData.EndTimeName" mask="time" 
                                :rules="['time']" hide-bottom-space
                                placeholder="Ingrese la hora de Fin (HH:MM)" label="Hora de Fin (HH:MM) (*)" filled 
                                :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)" >
                                <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-time v-model="currentData.EndTimeName" 
                                        :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)"  >
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary" flat />
                                        </div>
                                    </q-time>
                                    </q-popup-proxy>
                                </q-icon>
                                </template>
                                <template v-slot:prepend><q-icon name="fas fa-clock" /></template>
                            </q-input>
                            <q-input class="col-12 q-pa-xs"  dense filled v-model="currentData.eventComments" label="Comentarios" type="textarea" 
                                :readonly="(currentData.eventID>0&&currentData.eventTypeID==1&&allow_meeting_team==false) || (currentData.eventID>0&&currentData.eventTypeID==2&&allow_meeting_pilot==false) || (currentData.eventID>0&&currentData.eventTypeID==3&&allow_meeting_work==false) || (currentData.eventID>0&&currentData.eventTypeID==4&&allow_meeting_event==false)">
                                <template v-slot:prepend><q-icon name="fas fa-comment" /></template>
                            </q-input>
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="user" style="height: calc(100vh - 170px);">
                        <div>
                            <DxDataGrid
                                ref="mainviewtableDxDataGrid"
                                height="calc(100vh - 190px)"
                                column-resizing-mode="widget"
                                :data-source="(currentData.eventTypeID==3||currentData.eventTypeID==4)?lookup_users:lookup_users.filter(x=>x.tipo==1)"
                                :allow-column-resizing="true" 
                                :allow-column-reordering="true"
                                :show-borders="true"
                                :show-column-lines="true"
                                :show-row-lines="true"
                                key-expr="sys_user_code"
                                :selected-row-keys.sync="selectedRowKeys"
                                >
                                <DxSearchPanel :visible="true" :highlight-case-sensitive="true" />
                                <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
                                <DxPaging :enabled="true" :page-size="100" />
                                <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
                                <DxPager :visible="false" :show-page-size-selector="false" :allowed-page-sizes="allowedPageSizes" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="false" :showPageSizeSelector="false" />
                                <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
                                <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="multiple" />
                                <DxColumn caption="Nombres" data-field="sys_user_name" alignment="left" />
                                <DxColumn caption="Apellidos" data-field="sys_user_lastname" alignment="left" />
                                <DxColumn caption="Espos@" data-field="relatedName" alignment="left" />
                                <DxColumn caption="Equipo" data-field="teamName" alignment="left" />
                                <DxColumn caption="Servicios" data-field="servicios" alignment="left" />
                            </DxDataGrid>
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </q-card-section>
            <q-card-actions align="around" >
                <q-btn color="primary" label="Cancelar" icon="fas fa-times" flat @click="dialogVisible=false" />
                <q-btn color="primary" label="Guardar" icon="fas fa-save" @click="saveMeeting" />
            </q-card-actions>
        </q-card>
    </q-dialog>


    

</q-layout>
</template>
<style>
/*.dx-overlay-wrapper {
    z-index: 999999 !important;
}*/
</style>
<script>
import Vue from 'vue'
//import Plugin from '@quasar/quasar-ui-qcalendar'
//import '@quasar/quasar-ui-qcalendar/dist/index.css'
//Vue.use(Plugin)

import { date } from 'quasar'
import { DxAutocomplete, DxButton as DxAutocompleteButton } from 'devextreme-vue/autocomplete';
import { DxTextBox, DxButton as DxTextBoxButton } from 'devextreme-vue/text-box';
import DxScheduler, { DxResource } from 'devextreme-vue/scheduler';
import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxPager, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxLookup, DxSearchPanel } from 'devextreme-vue/data-grid';


export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxAutocomplete, DxAutocompleteButton, DxTextBox, DxTextBoxButton, DxScheduler, DxResource
        ,DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxPager, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxLookup, DxSearchPanel
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
            router: this.$router,
            ensEvents: [],
            ensEventsTypes: [],
            groups: ["eventTypeID"],
            dialogVisible: false,
            currentData: null,
            selectedRowKeys: [],
            tab: 'info',
            myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            },
            lookup_users: [],
            security: [],
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
                this.ensEventsTypes = JSON.parse(response.data[0].ensEventsTypes)
                this.security = JSON.parse(response.data[0].security)
                this.lookup_users = JSON.parse(response.data[0].lookup_users)
            }).catch((error) => {
                console.dir(error)
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
                this.loadingData = false
            })
        },
        onAppointmentFormOpening(e){
            ////////////////////////////////////
            //Limpia Selección, y Vuelve a Seleccionar los registros guardados de la orden. Luego reubica en tab inicial, y cancel devextreme popup
            ////////////////////////////////////
            this.selectedRowKeys = [];
            try{
                this.selectedRowKeys = e.appointmentData.users.split(',');
            }catch(ex){}
            this.tab = 'info';
            e.cancel = true
            ////////////////////////////////////
            //Aplica valores iniciales
            ////////////////////////////////////
            if(e.appointmentData.eventTypeID){//EDITANDO
                this.currentData = {
                    eventID:  e.appointmentData.eventID
                    ,estado:  e.appointmentData.estado
                    ,startDateTime: e.appointmentData.startDateTime
                    ,eventTypeID: e.appointmentData.eventTypeID
                    ,eventName: e.appointmentData.eventName
                    ,eventPlace: e.appointmentData.eventPlace
                    ,startDate: e.appointmentData.startDate
                    ,startTimeName: e.appointmentData.startTimeName
                    ,EndDateName: e.appointmentData.EndDateName
                    ,EndTimeName: e.appointmentData.EndTimeName
                    ,eventComments: e.appointmentData.eventComments
                }
            }else{
                this.currentData = {
                    eventID: 0
                    ,estado:  true
                    ,startDateTime: e.appointmentData.startDateTime
                    ,eventTypeID: null
                    ,eventName: ''
                    ,eventPlace: ''
                    ,startDate: e.appointmentData.startDateTime.substring(0,10).replace(/-/g,'/')
                    ,startTimeName: '19:00'
                    ,EndDateName: e.appointmentData.startDateTime.substring(0,10).replace(/-/g,'/')
                    ,EndTimeName: '22:00'
                    ,eventComments: ''
                }
            }
            this.dialogVisible = true
        },
        onAppointmentUpdating(e){
            //console.dir('onAppointmentUpdating')
            //console.dir(e)
            if( 
                    (e.oldData.eventTypeID==1&&this.allow_meeting_team==false)  //Tipo 1 = Reunión de Equipo > NO permitido entonces bloquear todo
                || (e.oldData.eventTypeID==2&&this.allow_meeting_pilot==false) //Tipo 2 = Reunión de Pilotaje > NO permitido entonces bloquear todo
                || (e.oldData.eventTypeID==3&&this.allow_meeting_work==false)  //Tipo 3 = Reunión de Trabajo > NO permitido entonces bloquear todo
                || (e.oldData.eventTypeID==4&&this.allow_meeting_event==false)  //Tipo 4 = Evento ENS > NO permitido entonces bloquear todo
            ){
                e.cancel=true;
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no puede editar registro"
                    ,timeout: 1500, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }else{
                this.currentData = {
                    eventID:  e.newData.eventID
                    ,estado:  e.newData.estado
                    ,startDateTime: e.newData.startDateTime
                    ,eventTypeID: e.newData.eventTypeID
                    ,eventName: e.newData.eventName
                    ,eventPlace: e.newData.eventPlace
                    ,startDate: e.newData.startDateTime.substring(0,10).replace(/-/g,'/')
                    ,startTimeName: e.newData.startTimeName
                    ,EndDateName: e.newData.EndDate.substring(0,10).replace(/-/g,'/')
                    ,EndTimeName: e.newData.EndTimeName
                    ,eventComments: e.newData.eventComments
                }
                this.selectedRowKeys = e.newData.users;
                this.saveMeeting()
            }
        },
        saveMeeting(){
            //console.dir(this.currentData)
            //console.dir(this.selectedRowKeys)
            if(
                !(
                    (this.currentData.eventID>0&&this.currentData.eventTypeID==1&&this.allow_meeting_team==false) || 
                    (this.currentData.eventID>0&&this.currentData.eventTypeID==2&&this.allow_meeting_pilot==false) || 
                    (this.currentData.eventID>0&&this.currentData.eventTypeID==3&&this.allow_meeting_work==false) || 
                    (this.currentData.eventID>0&&this.currentData.eventTypeID==4&&this.allow_meeting_event==false)
                )
                
            ){
                try{
                    let newEditData = this.currentData;
                    newEditData.basic = JSON.stringify(this.currentData);
                    newEditData.users = JSON.stringify(this.selectedRowKeys);
                    this.$q.loading.show({ delay: 0, message: 'Guardando..', spinner: 'QSpinnerIos', messageColor: 'white', spinnerColor: 'white' })
                    this.$axios.post(this.apiURL+'spEnsEventsUpdate',
                        {
                            userCode: this.userCode,
                            userCompany: this.userCompany,
                            row_id: this.currentData.eventID?this.currentData.eventID:0,
                            "editRecord": JSON.stringify(newEditData),
                        }
                    , {headers: { 'Authorization': "Bearer " + this.$q.sessionStorage.getItem('jwtToken') }}
                    ).then((response) => {
                        this.dialogVisible = false;
                        this.$q.loading.hide()
                        this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                        this.loadData();
                    }).catch((error) => {
                        console.error(error)
                        this.$q.loading.hide()
                        let mensaje = ''
                        if(error.message){ mensaje = error.message }
                        if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                        if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                        mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                        this.$q.notify({ html: true, multiLine: false, color: 'red'
                            ,message: "Lo sentimos, no se pudo realizar acción.<br/>" + mensaje
                            ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                            ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                        })
                    })
                }catch(ex){
                    this.$q.loading.hide()
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo realizar acción.<br/>" + ex.message
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                }
            }else{
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no puede editar registro"
                    ,timeout: 1500, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }
            
        },
    },
    computed:{
        console: () => console,
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
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
        allow_meeting_team: { get () { 
            let resultado = false;
            this.security.filter(x=>x.label=='allow_meeting_team').map(y=>{
                resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_meeting_pilot: { get () { 
            let resultado = false;
            this.security.filter(x=>x.label=='allow_meeting_pilot').map(y=>{
                resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_meeting_work: { get () { 
            let resultado = false;
            this.security.filter(x=>x.label=='allow_meeting_work').map(y=>{
                resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_meeting_event: { get () { 
            let resultado = false;
            this.security.filter(x=>x.label=='allow_meeting_event').map(y=>{
                resultado = y.value;  
            }).value; 
            return resultado }, 
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