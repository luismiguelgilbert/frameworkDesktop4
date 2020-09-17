<template>
<div>
  <q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
      <q-btn label="Agregar Experiencia" icon="fas fa-plus" no-caps color="primary" @click="addRow" />
      <q-list bordered separator class="scroll" style="min-height: 200px; height: calc(100vh - 258px);">
        <q-item clickable v-ripple v-for="job in jobs" :key="job.recordID" @click="openDialog(job)">
          <q-item-section >
            <q-item-label overline class="text-primary text-subtitle2">{{job.companyName}}</q-item-label>
            <q-item-label>{{job.jobPosition}}</q-item-label>
            <q-item-label class="text-primary text-subtitle2"></q-item-label>
          </q-item-section>

          <!--<q-item-label caption lines="2"></q-item-label>-->
          <q-item-section side top>
            <q-item-label caption>Desde: {{job.jobStartDate}}</q-item-label>
            <q-item-label caption>Años: {{ getAge(job.jobStartDate, job.jobStopDate) }}</q-item-label>
          </q-item-section>
          <!--<q-item-section>{{job}}</q-item-section>-->
        </q-item>

      </q-list>
      <br><br>
  </q-form>
  <q-dialog v-model="isDialogOpen" v-if="currentRow">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section>
        <q-form ref="formularioJob" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
          <div class="row">

          <q-input class="col-6"
                ref="companyName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                placeholder="Ingrese el nombre de la compañía (*)" label="Compañía (*)" filled
                :value="currentRow.companyName" @input="(value)=>{updateRow(value,'companyName',currentRow)}"
                :rules="[
                        val => val.length > 1 || 'Campo debe tener al menos 2 carateres',
                ]"
                >
                <template v-slot:prepend><q-icon name="fas fa-building" /></template>
            </q-input>
          <q-input class="col-6 q-pl-sm"
                ref="jobPosition" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                placeholder="Ingrese el nombre del cargo (*)" label="Cargo (*)" filled
                :value="currentRow.jobPosition" @input="(value)=>{updateRow(value,'jobPosition',currentRow)}"
                :rules="[
                        val => val.length > 1 || 'Campo debe tener al menos 2 carateres',
                ]"
                >
                <template v-slot:prepend><q-icon name="fas fa-id-card" /></template>
            </q-input>

          <q-input class="col-6"
              ref="jobStartDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
              mask="date" :rules="['date']"
              placeholder="Ingrese la fecha de Inicio" label="Fecha de Inicio" filled
              v-model="currentRow.jobStartDate"
              >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy_jobStartDate" transition-show="scale" transition-hide="scale">
                    <q-date :value="currentRow.jobStartDate" @input="(value)=>{updateRow(value,'jobStartDate',currentRow)}">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:prepend><q-icon name="fas fa-calendar-plus" /></template>
          </q-input>
          <q-input class="col-6 q-pl-sm"
              ref="jobStopDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
              mask="date" :rules="['date']"
              placeholder="Ingrese la fecha de Salida" label="Fecha de Salida" filled
              v-model="currentRow.jobStopDate"
              >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy_jobStopDate" transition-show="scale" transition-hide="scale">
                    <q-date :value="currentRow.jobStopDate" @input="(value)=>{updateRow(value,'jobStopDate',currentRow)}">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:prepend><q-icon name="fas fa-calendar-check" /></template>
          </q-input>

          <q-input class="col-12"
                ref="jobPlaces" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                placeholder="Ingrese cobertura" label="Cobertura (*)" filled
                :value="currentRow.jobPlaces" @input="(value)=>{updateRow(value,'jobPlaces',currentRow)}"
                >
                <template v-slot:prepend><q-icon name="fas fa-map-marker-alt" /></template>
            </q-input>

          </div>
          <q-editor
            :value="currentRow.jobSkills" @input="(value)=>{updateRow(value,'jobSkills',currentRow)}"
            :toolbar="[['bold', 'italic', 'strike', 'underline'],['quote', 'unordered', 'ordered', 'outdent', 'indent'],]"
            />

          <q-toggle label="Activo?" :value="currentRow.estado" dense @input="updateRow(!currentRow.estado,'estado',currentRow)" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';

export default ({
    data () {
        return {
            moduleName: "SCHPersona", isDialogOpen: false, currentRow: null
        }
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
      addRow(){
        let max_id = 1
        if(this.jobs.length > 0){
            let temp = this.getMax(this.jobs, "phoneID");
            max_id = parseInt(temp.phoneID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.jobs))
        newRows.push({
           recordID: max_id
          ,companyName: 'Compañía'
          ,jobPosition: 'Cargo'
          ,jobStartDate: ''
          ,jobStopDate: ''
          ,jobSkills: ''
          ,jobPlaces: ''
          ,estado: true
        })
        this.jobs = newRows
      },
      updateRow(newVal, colName, row){
        let newRows = JSON.parse(JSON.stringify(this.jobs))
        newRows.find(x=>x.recordID==row.recordID)[colName] = newVal
        this.currentRow[colName] = newVal
        this.jobs = newRows
      },
      openDialog(job){
        this.currentRow = {...job}
        this.isDialogOpen = true
      },
      getAge(fechaInicio, fechaFin){
        return date.getDateDiff(fechaFin, fechaInicio, 'years')
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
        jobs: {
            get () { return this.$store.state[this.moduleName].editData.jobs },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataJobs', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
    },
})
</script>
