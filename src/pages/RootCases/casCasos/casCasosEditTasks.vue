<template>
<div>
  <q-table
        :data="tasks"
        :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
        table-style="min-height: 150px; max-height: calc(100vh - 225px)"
        row-key="contactID"
        :virtual-scroll="tasks.length>25?true:false"
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        hide-bottom dense
        :filter="filterString"
        :columns="[
          { name: 'uploaded', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: false},
          { name: 'taskDate', required: true, label: 'Fecha', align: 'left', field: row => row.taskDate, sortable: false },
          { name: 'taskTypeName', required: true, label: 'Actividad', align: 'left', field: row => row.taskTypeName, sortable: true },
          { name: 'taskLength', required: true, label: 'Duración', align: 'right', field: row => row.taskLength, sortable: true },
          { name: 'sys_user_fullname', required: true, label: 'Usuario', align: 'left', field: row => row.sys_user_fullname, sortable: true },
          { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true, style: 'min-width: 300px;' },
        ]"


  >
    <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="uploaded" :props="props">
              <q-btn dense flat round size="xs" color="red" icon="fas fa-trash-alt" v-if="!(props.row.uploaded)" title="Quitar este registro" @click="tasks=tasks.filter(x=>x.value!=props.row.value)" />
            </q-td>
            <q-td key="taskDate" :props="props">
              {{ props.row.taskDate }}
            </q-td>
            <q-td key="taskTypeName" :props="props">
              {{ props.row.taskTypeName }}
            </q-td>
            <q-td key="taskLength" :props="props">
              {{ props.row.taskLength }}
            </q-td>
            <q-td key="sys_user_fullname" :props="props">
              {{ props.row.sys_user_fullname }}
            </q-td>
            <q-td key="comments" :props="props">
              <!--{{ props.row.comments }}-->
              <span v-html="props.row.comments"></span>
            </q-td>
            
          </q-tr>
    </template>
    <template v-slot:top>
        <!--SOLAMENTE cuando se está editando un caso, Y si perfil de usuario tiene permisos, entonces se pueden agregar actividades-->
        <q-btn v-if="!editMode&&allow_tasks" label="Agregar Actividad" @click="dialogOpen=true" icon="fas fa-plus" color="primary" no-caps />
        <q-space />
        <q-input borderless dense v-model="filterString" placeholder="Buscar...">
          <template v-slot:append>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>
    </template>
    <template v-slot:bottom-row >
      <q-tr></q-tr>
    </template>
  </q-table>

  <q-dialog v-model="dialogOpen" @show="activityShow">
    <q-card  style="min-width: 900px;">
      <q-toolbar :class="'q-pr-none text-subtitle2 '+(sys_user_color=='blackDark'?'text-white':'text-primary')">
          <q-toolbar-title class="text-weight-bolder">Nueva Actividad</q-toolbar-title>
          <q-space />
          <q-btn label="Cancelar" :color="userColor=='blackDark'?'white':'primary'" flat icon="fas fa-arrow-circle-left" stretch @click="dialogOpen=false" />
          <q-btn v-if="!editMode" label="Guardar" color="positive" title="Crear" flat icon="fas fa-save" stretch @click="addRow" />
      </q-toolbar>
      <q-separator />
      <q-splitter
        v-model="splitterModel"
        style="height: calc(100vh - 140px);" unit="px"
        >
        <template v-slot:before>
          <q-list>
            <q-item clickable @click="tab='basic'" :active="tab=='basic'" active-class="bg-primary text-white" >
                <q-item-section side>
                    <q-icon name="fas fa-info-circle" :color="tab=='basic'?'white':'grey-7'" />
                </q-item-section>
                <q-item-section v-if="$q.screen.gt.xs">
                    <q-item-label :class="'text-subtitle2 '+(tab=='basic'?'text-white':'text-grey-7')">Información de la Actividad</q-item-label>
                </q-item-section>
            </q-item>
                    
            <q-item clickable @click="tab='next'" :active="tab=='next'" active-class="bg-primary text-white" >
                <q-item-section side>
                    <q-icon name="fas fa-calendar" :color="tab=='next'?'white':'grey-7'" />
                </q-item-section>
                <q-item-section v-if="$q.screen.gt.xs">
                    <q-item-label :class="'text-subtitle2 '+(tab=='next'?'text-white':'text-grey-7')">Próxima Actividad</q-item-label>
                </q-item-section>
            </q-item>
          </q-list>
        </template>

        <template v-slot:after>
          <q-tab-panels
              v-model="tab" keep-alive
              animated
              vertical
              transition-prev="jump-up"
              transition-next="jump-up"
              >
              <q-tab-panel name="basic"> 
                <q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
                  
                  <selectSearchable 
                    prependIcon="fas fa-tasks"
                    labelText="Tipo de Actividad (*)" labelSearchText="Buscar Tipo de Actividad"
                    :optionsList="lookup_taskTypes"
                    rowValueField="value" optionsListLabel="label" optionsListCaption="short_name_es"
                    optionDisableField="estado"
                    :isRequired="true" 
                    :isDisable="false" 
                    :isReadonly="false"
                    :initialValue="taskTypeID"
                    :tableSearchColumns="[
                            { name: 'label', label: 'Tipo de Actividad', field: 'label', align: 'left'}
                            ,{ name: 'short_name_es', label: 'Abreviado', field: 'short_name_es', align: 'left'}
                        ]"
                    @onItemSelected="(row)=>{ updateTaskTypeID(row) }"
                  />
                  
                  <q-input
                    ref="taskDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                    mask="date" :rules="['date']"
                    placeholder="Ingrese la Fecha de la Actividad" label="Fecha de Actividad (aaaa/mm/dd)" filled
                    v-model="taskDate"
                    >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="qDateProxy_taskDate" transition-show="scale" transition-hide="scale">
                          <q-date v-model="taskDate">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                    <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
                  </q-input>

                  <q-editor
                      v-model="comments" placeholder="Ingrese sus Comentarios de la actividad que realizó"
                      :toolbar="[['bold', 'italic', 'strike', 'underline'],['quote', 'unordered', 'ordered', 'outdent', 'indent'],]"
                      :rules="[val => !!val || 'Requerido']"
                      />

                  <q-input
                      ref="taskLength" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                      placeholder="Escriba la Duración de la Actividad en Horas o fracción (*)" label="Duración en Horas (*)" filled
                      v-model="taskLength" type="number" :min=0
                      :rules="[
                              val => !!val || '* Requerido',
                      ]"
                      >
                      <template v-slot:prepend><q-icon name="fas fa-clock" /></template>
                  </q-input>

                  <div class="row q-mt-none q-mb-md" >
                    <q-toggle 
                      v-model="taskBillable" icon="fas fa-check" color="positive" label="Facturable?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                      />
                  </div>
                
                  <br><br>
                </q-form>
              </q-tab-panel>
              <q-tab-panel name="next">
                <q-form ref="formularioNext" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
                  <q-input
                    ref="nextDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                    mask="date" :rules="['date']"
                    placeholder="Ingrese la Fecha de la Próxima Actividad" label="Próxima Actividad (aaaa/mm/dd)" filled
                    v-model="nextDate" 
                    >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="qDateProxy_nextDate" transition-show="scale" transition-hide="scale">
                          <q-date v-model="nextDate">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                    <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
                </q-input>

                <q-editor
                    v-model="nextDateComments" placeholder="Comentarios de la Próxima Actividad"
                    :toolbar="[['bold', 'italic', 'strike', 'underline'],['quote', 'unordered', 'ordered', 'outdent', 'indent'],]"
                    />
                </q-form>
              </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
      <q-form>
        
       
      </q-form>
    </q-card>
  </q-dialog>
</div>
</template>
<style lang="sass">
.q-table__bottom
    padding: 0px
.my-sticky-header-usercompany
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: white

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2

.my-sticky-header-usercompany-dark
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: $grey-10

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2
</style>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    components: {
      selectSearchable:selectSearchable
    },
    data () {
        return {
            moduleName: "casCasos", filterString: '', dialogOpen: false, splitterModel: 250, tab: 'basic',
            taskTypeID: null, taskTypeName: "", taskDate: "", comments: "", taskLength: 1, taskBillable: true, nextDate: "", nextDateComments: ""
            //"2020/12/04"
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
      updateRow(newVal, colName, row){
        let newRows = JSON.parse(JSON.stringify(this.tasks))
        newRows.find(x=>x.value==row.value)[colName] = newVal
        this.tasks = newRows
      },
      updateTaskTypeID(row){
        this.taskTypeID = row.value
        this.taskTypeName = row.label
      },
      addRow(){
        if(this.taskTypeID&&this.taskTypeID>0&&this.taskDate&&this.taskDate.length==10&&this.comments.length>0){
          let max_id = 1
          if(this.tasks.length > 0){
              let temp = this.getMax(this.tasks, "value");
              max_id = parseInt(temp.value) + parseInt(1);
          }
          let newRows = JSON.parse(JSON.stringify(this.tasks))
          newRows.push({
            value: max_id
            ,taskTypeID: this.taskTypeID
            ,taskTypeName: this.taskTypeName
            ,taskDate: this.taskDate
            ,taskLength: this.taskLength
            ,sys_user_fullname: this.userName + " " + this.userLastName
            ,comments: this.comments
            ,nextDate: this.nextDate
            ,nextDateComments: this.nextDateComments
            ,estado: true
            ,uploaded: false
          })
          this.tasks = newRows
          this.dialogOpen = false
        }else{
          this.$q.notify({message: 'No ha registrado todos los campos obligatorios',color: 'red', timeout: 1000})
        }
        
      },
      activityShow(){
        try{
          this.taskTypeID = this.lookup_taskTypes[0].value
        }catch(ex){}
        try{
          let fecha = new Date()
          let fechaTimeOffset = (fecha.getTimezoneOffset())
          if(fechaTimeOffset>0){//positivo entonces resto
              fecha = date.subtractFromDate(fecha, {minutes: fechaTimeOffset} )
          }else{//negativo entonces sumo
              fecha = date.addToDate(fecha, {minutes: (fechaTimeOffset*-1)} )
          }
          this.taskDate = date.formatDate(fecha,'YYYY/MM/DD')//get current date in user pc (exact date no matter timezone)
        }catch(ex){}
      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userName: { get () { return this.$store.state.main.userName }  },
        userLastName: { get () { return this.$store.state.main.userLastName }  },
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        //custom security
        allow_tasks: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_tasks').value }, },
        //custom security end
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        tasks: {
            get () { return this.$store.state[this.moduleName].editData.tasks },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataTasks', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_taskTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taskTypes },
        },
    }
})
</script>
