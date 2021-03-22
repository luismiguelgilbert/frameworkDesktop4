<template>
<div style="margin: -16px;">
  <q-toolbar class="no-padding">
      <q-btn v-if="(allow_tasks)" flat stretch label="Nueva Actividad" color="primary" icon="fas fa-plus" @click="dialogOpen=true" />
      <q-btn v-if="(allow_tasks)" flat stretch label="Editar Actividad" color="primary" icon="fas fa-edit" @click="editDialogOpen=true" :disable="selectedRowKeys.length<=0" />
  </q-toolbar>
  <q-separator />
  <DxDataGrid
    ref="mainviewtableDxDataGrid"
    height="calc(100vh - 170px)"
    width="100%"
    column-resizing-mode="widget"
    :data-source="tasks"
    :allow-column-resizing="true" 
    :allow-column-reordering="true"
    :show-borders="false"
    :show-column-lines="userTableLinesDXcols"
    :show-row-lines="userTableLinesDXrows"
    key-expr="value"
    @selection-changed="onSelectionChanged"
    @row-dbl-click="onRowDoubleClick"
    >
    <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
    <DxPaging :enabled="true" :page-size="userRowsPerPage" />
    <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
    <DxPager :visible="true" :show-page-size-selector="false" :allowed-page-sizes="allowedPageSizes" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="false" :showPageSizeSelector="false" />
    <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
    <DxSelection select-all-mode="allPages" show-check-boxes-mode="always" mode="single" />

    <DxColumn caption="Fecha" data-field="taskDate" data-type="date" :visible="true" :allow-editing="false" format="dd-MMM-yyyy" width="150" />
    <DxColumn caption="Actividad" data-field="taskTypeID" :visible="true" :allow-editing="false" width="120" >
      <DxLookup value-expr="value" display-expr="label" :data-source="lookup_taskTypes" />
    </DxColumn>
    <DxColumn caption="Duración" data-field="taskLength" data-type="number" :visible="true" :allow-editing="false" width="120" />
    <DxColumn caption="Usuario" data-field="sys_user_fullname" data-type="string" :visible="true" :allow-editing="false" width="150" />
    <DxColumn caption="Comentario" data-field="comments" data-type="string" :visible="true" :allow-editing="false" width="350" :encodeHtml="false" />
    <DxColumn caption="Próxima Actividad" data-field="nextDate" data-type="date" :visible="true" :allow-editing="false" format="dd-MMM-yyyy" width="120" />
    <DxColumn caption="Próxima Actividad 1" data-field="nextDateComments" data-type="string" :visible="true" :allow-editing="false" width="300" />

  </DxDataGrid>

  <q-dialog v-model="dialogOpen" @show="activityShow">
    <q-card  style="min-width: 900px;">
      <q-toolbar :class="'q-pr-none text-subtitle2 '+(sys_user_color=='blackDark'?'text-white':'text-primary')">
          <q-toolbar-title class="text-weight-bolder">Nueva Actividad</q-toolbar-title>
          <q-space />
          <q-btn label="Cerrar" :color="userColor=='blackDark'?'white':'primary'" flat icon="fas fa-times" stretch @click="dialogOpen=false" />
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
                    @onItemSelected="(row)=>{taskTypeID=row.value}"
                  />
                  <!--@onItemSelected="(row)=>{ updateTaskTypeID(row) }"-->
                  
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

  <q-dialog v-model="editDialogOpen">
    <q-card  style="min-width: 900px;">
      <q-toolbar :class="'q-pr-none text-subtitle2 '+(sys_user_color=='blackDark'?'text-white':'text-primary')">
          <q-toolbar-title class="text-weight-bolder">Editar Actividad</q-toolbar-title>
          <q-space />
          <q-btn label="Cancelar" :color="userColor=='blackDark'?'white':'primary'" flat icon="fas fa-arrow-circle-left" stretch @click="editDialogOpen=false" />
          <q-btn v-if="!editMode" label="Guardar" color="positive" title="Crear" flat icon="fas fa-save" stretch @click="updateLine" />
      </q-toolbar>
      <q-separator />
      <q-splitter
        v-model="splitterModel"
        style="height: calc(100vh - 140px);" unit="px"
        >
        <template v-slot:before>
          <q-list>
            <q-item clickable @click="tabEdit='basic'" :active="tabEdit=='basic'" active-class="bg-primary text-white" >
                <q-item-section side>
                    <q-icon name="fas fa-info-circle" :color="tabEdit=='basic'?'white':'grey-7'" />
                </q-item-section>
                <q-item-section v-if="$q.screen.gt.xs">
                    <q-item-label :class="'text-subtitle2 '+(tabEdit=='basic'?'text-white':'text-grey-7')">Información de la Actividad</q-item-label>
                </q-item-section>
            </q-item>
                    
            <q-item clickable @click="tabEdit='next'" :active="tabEdit=='next'" active-class="bg-primary text-white" >
                <q-item-section side>
                    <q-icon name="fas fa-calendar" :color="tabEdit=='next'?'white':'grey-7'" />
                </q-item-section>
                <q-item-section v-if="$q.screen.gt.xs">
                    <q-item-label :class="'text-subtitle2 '+(tabEdit=='next'?'text-white':'text-grey-7')">Próxima Actividad</q-item-label>
                </q-item-section>
            </q-item>
          </q-list>
        </template>

        <template v-slot:after>
          <q-tab-panels
              v-model="tabEdit" keep-alive
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
                    :initialValue="editRecord.taskTypeID"
                    :tableSearchColumns="[
                            { name: 'label', label: 'Tipo de Actividad', field: 'label', align: 'left'}
                            ,{ name: 'short_name_es', label: 'Abreviado', field: 'short_name_es', align: 'left'}
                        ]"
                    @onItemSelected="(row)=>{ editRecord.taskTypeID=row.value }"
                  />
                  
                  <q-input
                    ref="taskDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                    mask="date" :rules="['date']"
                    placeholder="Ingrese la Fecha de la Actividad" label="Fecha de Actividad (aaaa/mm/dd)" filled
                    v-model="editRecord.taskDate"
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
                      v-model="editRecord.comments" placeholder="Ingrese sus Comentarios de la actividad que realizó"
                      :toolbar="[['bold', 'italic', 'strike', 'underline'],['quote', 'unordered', 'ordered', 'outdent', 'indent'],]"
                      :rules="[val => !!val || 'Requerido']"
                      />

                  <q-input
                      ref="taskLength" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
                      placeholder="Escriba la Duración de la Actividad en Horas o fracción (*)" label="Duración en Horas (*)" filled
                      v-model="editRecord.taskLength" type="number" :min=0
                      :rules="[
                              val => !!val || '* Requerido',
                      ]"
                      >
                      <template v-slot:prepend><q-icon name="fas fa-clock" /></template>
                  </q-input>

                  <div class="row q-mt-none q-mb-md" >
                    <q-toggle 
                      v-model="editRecord.taskBillable" icon="fas fa-check" color="positive" label="Facturable?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
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
                    v-model="editRecord.nextDate" 
                    >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="qDateProxy_editRecordNextDate" transition-show="scale" transition-hide="scale">
                          <q-date v-model="editRecord.nextDate">
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
                    v-model="editRecord.nextDateComments" placeholder="Comentarios de la Próxima Actividad"
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

import { DxDataGrid, DxColumn, DxScrolling, DxPaging, DxPager, DxLookup, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxSummary, DxTotalItem } from 'devextreme-vue/data-grid';

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxDataGrid,
        DxColumn,
        DxScrolling,
        DxPager,
        DxLookup,
        DxSorting,
        DxPaging,
        DxHeaderFilter,
        DxSelection,
        DxEditing,
        DxSummary, 
        DxTotalItem,
        selectSearchable:selectSearchable
    },
    data () {
        return {
            selectedRowKeys: [],
            filterString: '', dialogOpen: false, splitterModel: 250, tab: 'basic',
            taskTypeID: null, taskTypeName: "", taskDate: "", comments: "", taskLength: 1, taskBillable: true, nextDate: "", nextDateComments: "",
            editDialogOpen: false, editRecord: null, tabEdit: 'basic',
            selectedRowKeys: []
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
            ,taskBillable: true
            ,estado: true
            ,uploaded: false
            ,edited: true
          })
          this.tasks = newRows
          this.dialogOpen = false
        }else{
          this.$q.notify({message: 'No ha registrado todos los campos obligatorios',color: 'red', timeout: 1000})
        }
        
      },
      editRow(row){
        this.tabEdit='basic';
        this.editRecord = JSON.parse(JSON.stringify(row));
        this.editDialogOpen = true;
      },
      updateLine(){
        let newRows = JSON.parse(JSON.stringify(this.tasks))
        newRows.filter(x=>x.value==this.editRecord.value).map(y=>{
          y.taskTypeID = this.editRecord.taskTypeID;
          y.taskDate = this.editRecord.taskDate;
          y.comments = this.editRecord.comments;
          y.taskLength = this.editRecord.taskLength;
          y.nextDate = this.editRecord.nextDate;
          y.nextDateComments = this.editRecord.nextDateComments;
          y.edited = true;
          //y.estado = this.editRecord.estado;
          //y.estado = this.editRecord.estado;
          y = this.editRecord;
          return y
        })
        this.tasks = newRows;
        this.editDialogOpen = false
      },
      activityShow(){
        this.tab='basic';
        this.comments='';
        this.nextDate=null;
        this.nextDateComments='';
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
      },
      onSelectionChanged({ selectedRowKeys, selectedRowsData }) {
        this.selectedRowKeys = selectedRowKeys;
        this.editRecord = JSON.parse(JSON.stringify(selectedRowsData[0]));
      },
      onRowDoubleClick(e){
        console.dir('onRowDoubleClick')
        this.editDialogOpen=true;
      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userName: { get () { return this.$store.state.main.userName }  },
        userLastName: { get () { return this.$store.state.main.userLastName }  },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        allow_view: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_view').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
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
        allow_report: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_report').map(y=>{
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
        allow_tasks: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_tasks').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
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
        //custom security
        allow_tasks: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_tasks').value }, },
        //custom security end
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        tasks: {
            get () { return this.$store.state[this.moduleName].editData.tasks },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditDataTasks', val) }
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'tasks', value: val}) }
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
