<template>
<div style="margin: -16px;">
  <q-toolbar class="no-padding">
    <q-btn v-if="( (editStatus.editMode=='edit'&&allow_edit) || (editStatus.editMode=='create'&&allow_insert) )" label="Nueva Reunión"  icon="fas fa-upload" color="primary" flat stretch />
    <q-btn v-if="( (editStatus.editMode=='edit'&&allow_edit) || (editStatus.editMode=='create'&&allow_insert) )" flat stretch label="Eliminar" color="red" icon="fas fa-trash-alt"  />
  </q-toolbar>
  <q-separator />
  <!-- time-zone="America/Los_Angeles"
     -->
  <DxScheduler
    :views="views"
    height="calc(100vh - 170px)"
    :start-day-hour="8"
    :data-source="dataSource"
    :current-date="currentDate"
    current-view="month"
    :on-appointment-form-opening="onAppointmentFormOpening"
  />

  <q-dialog v-model="dialogVisible" @show="initializeFormData" square>
      <q-card>
          <q-toolbar>
              <q-toolbar-title class="text-primary">Nueva Reunión de Equipo</q-toolbar-title>
          </q-toolbar>
          <q-separator />
          <q-form>
              <q-select filled :options="lookup_ensEventsTypes" readonly>
              </q-select>
                <q-select class="q-mt-lg"
                    label="Duración en Horas (*) (*)" placeholder="Seleccione la Duración en Horas de la Reunión (*)" emit-value map-options filled
                    :options="lookup_ensEventsTypes" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                    v-model="meetingLength"
                    ref="meetingLength"
                    :rules="[
                            val => val!= null || '* Requerido',
                    ]"
                    >
                    <template v-slot:prepend><q-icon name="fas fa-stopwatch" color="primary" /></template>
                </q-select>
              lookup_ensEventsTypes : {{lookup_ensEventsTypes}}
              <br/>
              <br/>
          </q-form>
      </q-card>
  </q-dialog>

</div>

</template>


<script>
import DxScheduler from 'devextreme-vue/scheduler';

export default ({
    props: {
        moduleName: { type: String, required: true }
    },
    data () {
        return {
            filterString: '', 
            dialogVisible: false,
            views: ['day', 'week', 'workWeek', 'month'],
            currentDate: new Date(),
            dataSource: [],
            currentData: null
        }
    },
    components:{
        DxScheduler
    },
    methods:{
        onAppointmentFormOpening(data) {
          data.cancel = true;
          console.dir(data)
          this.currentData = data;
          this.dialogVisible = true
        },
        initializeFormData(){
            console.dir('initializeFormData')
            let newFormData = {
                eventID: 0
                ,startDate: (this.currentData&&Object.prototype.toString.call(this.currentData.startDate)==='[object Date]')?true:false
                ,endDate: (this.currentData&&Object.prototype.toString.call(this.currentData.endDate)==='[object Date]')?true:false
                ,eventTypeID: this.lookup_ensEventsTypes[0].value
                ,eventName: this.lookup_ensEventsTypes[0].label
                ,eventPlace: '' 
                ,eventComments: ''
            }
            console.dir(newFormData)
            this.currentData.apointm
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
        /*
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        */
    }
})
</script>
