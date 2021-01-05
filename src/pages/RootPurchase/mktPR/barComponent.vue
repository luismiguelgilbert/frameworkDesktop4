<template>
    <q-toolbar :class="userMainToolbarComponentClass">
        <q-input
            filled hide-bottom-space round
            :bg-color="userColor=='blackDark'?'grey-10':'primary'"
            :label-color="userColor=='blackDark'?'grey-9':'white'"
            input-class="text-white"
            :color="userColor=='blackDark'?'black':'primary'"
            debounce="1000" v-model="currentFilterSearch" dense  placeholder="Buscar"
            autofocus style="min-width: 120px;"
            maxlength="100" @input="applySearch" class="q-ml-sm " >
            <template v-slot:prepend style="min-width: 120px; max-height: 20px;">
                <q-icon name="fas fa-search" color="white">
                    <q-tooltip content-class="bg-positive" :offset="[10, 10]">
                        Campos buscados:
                            <li v-for="(col,index) in columnsSystem.filter(x=>x.is_searchable)" :key="index">{{col.label}}</li>
                    </q-tooltip>
                </q-icon>
            </template>
            <template v-if="currentFilterSearch" v-slot:append>
                <q-btn @click="()=>{currentFilterSearch=''; applySearch()}" flat round icon="fas fa-times" size="xs" color="white" />
            </template>
        </q-input>
        <q-btn
            no-caps no-wrap :color="userColor!=='blackDark'?'primary':undefined"
            v-shortkey="['alt', 'n']" @shortkey="openEditForm({value: 0, row: null}, 1)"
            @click="openEditForm({value: 0, row: null}, 1)"
            :disable="!allow_insert" style="height: 40px;"
            class="q-ml-xs no-shadow" title="Crear nuevo documento" >
            <q-icon name="fas fa-plus-circle" color="white" />
            <div class="text-white q-pl-xs gt-sm"><u>N</u>uevo</div>
        </q-btn>
        <q-btn-dropdown split
            icon="fas fa-filter" no-caps no-wrap
            class="q-ml-xs" style="height: 40px;"
            :color="userColor!=='blackDark'?'primary':undefined"
            @click="isColumnsDrawerVisible = false; isFiltersDrawerVisible = true;">
            <template v-slot:label>
                <div class=" q-pl-xs gt-sm">Filtros</div>
            </template>
            <q-list separator>
                <q-item
                    clickable v-close-popup  class="q-pr-xs"
                    v-for="(filtro, index) in filters" :key="index"
                    :title="filtro.is_default?'Este es su filtro predeterminado':''"
                    @click="applyFilter(filtro)">
                    <q-item-section side>
                        <q-icon :name="filtro.is_system?'fas fa-database':'fas fa-user'" size="0.8rem" />
                    </q-item-section>
                    <q-item-section >
                        <q-item-label>
                            {{filtro.label}}
                        </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-icon v-if="filtro.is_default" name="fas fa-check-circle" color="primary" size="1rem" />
                    </q-item-section>
                    <q-menu context-menu>
                        <q-list dense>
                            <q-item clickable v-if="!filtro.is_default" @click="defaultUserFilter(filtro)"><q-item-section side><q-icon name="fas fa-check-circle" size="1rem" /></q-item-section><q-item-section>Hacer predeterminado</q-item-section></q-item>
                            <q-item clickable v-if="filtro.is_default" @click="clearDefaultUserFilter"><q-item-section side><q-icon name="fas fa-eraser" size="1rem" /></q-item-section><q-item-section>Quitar predeterminado</q-item-section></q-item>
                            <q-item clickable v-if="!filtro.is_system" @click="deleteUserFilter(filtro)"><q-item-section side><q-icon name="fas fa-trash" size="1rem" /></q-item-section><q-item-section>Eliminar filtro</q-item-section></q-item>
                        </q-list>
                    </q-menu>
                </q-item>
            </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown
            flat stretch icon="fas fa-chart-bar" no-caps no-wrap class="q-ml-sm"
            :color="userColor=='blackDark'?'white':'primary'" :disable="!allow_report"
            >
            <template v-slot:label>
                <div class=" q-pl-xs gt-sm">Reportes</div>
            </template>

            <q-list>
                <q-list class="text-grey-7" separator>
                    <q-item
                        v-for="(report,index) in moduleReports" :key="index"
                        clickable @click="openReportForm(report)"
                        :class="userColor=='blackDark'?'text-white':'text-primary'"
                        >
                        <q-item-section avatar><q-icon :name="report.icon" /></q-item-section>
                        <q-item-section>
                            <q-item-label>{{report.name_es}}</q-item-label>
                            <q-item-label caption>{{report.comment_es}}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-list>
        </q-btn-dropdown>
        <q-btn
            flat stretch icon="fas fa-columns" no-caps no-wrap
            :color="userColor=='blackDark'?'white':'primary'"
            @click="isFiltersDrawerVisible = false; isColumnsDrawerVisible = true;">
            <div class="q-pl-xs gt-sm">Columnas</div>
        </q-btn>
        <q-space />
        <q-btn
            v-if="selectedRows.length>0"
            flat no-caps no-wrap stretch
            :color="userColor=='blackDark'?'white':'primary'"
            :title="'Limpiar ' + selectedRows.length + ' seleccionados'"
            @click="()=>{selectedRows = []}"
            icon-right="far fa-square"  >
            <div class="q-pr-xs gt-sm">Limpiar Selección</div>
        </q-btn>
        <q-btn v-if="isCurrentFilter"
            flat stretch icon-right="fas fa-eraser"
            :color="userColor=='blackDark'?'white':'primary'"  @click="clearFilter" no-caps no-wrap >
            <div class="q-pr-xs gt-sm">Limpiar Filtro</div>
        </q-btn>
    </q-toolbar>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(require('vue-shortkey'))

export default ({
  props: {
      moduleName: { type: String , required: true },
      moduleEditName: { type: String , required: true },
  },
  data () {
    return {
        router: this.$router,
    }
  },
  /*components: {
     reportComponent: reportComponent
  },*/
  methods:{
    clearFilter(){
        this.currentFilter = [];
        this.$emit('onClearFilter', 'onClearFilter')
    },
    applySearch(){
        this.$emit('onFilterApplied', 'onFilterApplied')
    },
    openEditForm(props, editMode){
      this.editRecord = props
      this.editMode = editMode //false = edit || true  = new
      this.lastRecord = props.value//agregado para manejar scroll (cuando se crea, entonces regresar al principio)
      this.router.push(this.moduleEditName);
    },
    openReportForm(report){
      let newReportData = {
           report: report
          ,parameters: null
      }
      this.currentReportData = newReportData
      this.router.push('/mainReport');
    },
    applyFilter(filter){
        let newFilter = []
        this.filtersDetails.filter(x=>x.filter_id==filter.value).map(filtro=>{
            newFilter.push({
                    db_column: filtro.db_column
                ,symbol: 'in'//se deja fijo
                ,valueC: filtro.valueC//pendiente(this.field.ux_type==='date'||this.field.ux_type==='datetime')?JSON.stringify(this.ticked).replace('[','').replace(']',''):JSON.stringify(this.selectedRows.map(x => x.value)).replace('[','').replace(']','')
                ,valueClabel: filtro.valueClabel//pendiente//(this.field.ux_type==='date'||this.field.ux_type==='datetime')?this.ticked.length+' fechas':this.selectedRows.map(x => x[this.firstLabelFieldName])
            })
        })
        this.currentFilter = newFilter;
        this.$emit('onFilterApplied', 'filterUpdated')
    },
    deleteUserFilter(filtro){
      this.$q.dialog({
        //title: 'Prompt',
        message: 'Desea eliminar este filtro?',
        cancel: 'Cancelar',
        persistent: true
        }).onOk(data => {
          this.loadingData=true;
          let newFilterArray = [];
          newFilterArray = JSON.parse(JSON.stringify(this.currentFilter))//clona
                this.$axios.post( this.apiURL + 'spSysModulesFiltersUserDelete',
                    {
                        link_name: this.moduleName,
                        sys_user_code: this.userCode,
                        filter_id: filtro.value
                    }
                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                  ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    //los filtros se reciben desde el mismo SP, entonces guardo en Vuex
                    this.filters = JSON.parse(response.data[0].filters)
                    this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
                    this.loadingData = false
                  }).catch((error) => {
                    console.error(error)
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
        })
        },
    defaultUserFilter(filtro){
            this.$q.dialog({
                //title: 'Prompt',
                message: 'Desea hacer este filtro, su filtro predeterminado?',
                cancel: 'Cancelar',
                persistent: true
            }).onOk(data => {
                this.loadingData=true;
                let newFilterArray = [];
                newFilterArray = JSON.parse(JSON.stringify(this.currentFilter))//clona
                this.$axios.post( this.apiURL + 'spSysModulesFiltersUserDefaultUpdate',
                    {
                        link_name: this.moduleName,
                        sys_user_code: this.userCode,
                        filter_id: filtro.value
                    }
                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    //los filtros se reciben desde el mismo SP, entonces guardo en Vuex
                    this.filters = JSON.parse(response.data[0].filters)
                    this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
                    this.loadingData = false
                }).catch((error) => {
                    console.error(error)
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
            })
        },
    clearDefaultUserFilter(){
            this.$q.dialog({
                //title: 'Prompt',
                message: 'Desea dejar de usar este filtro como predeterminado?',
                cancel: 'Cancelar',
                persistent: true
            }).onOk(data => {
                this.loadingData=true;
                let newFilterArray = [];
                newFilterArray = JSON.parse(JSON.stringify(this.currentFilter))//clona
                this.$axios.post( this.apiURL + 'spSysModulesFiltersUserDefaultUpdate',
                    {
                        link_name: this.moduleName,
                        sys_user_code: this.userCode,
                        filter_id: 0//cuando 0, el SP elimina el filtro predeterminado
                    }
                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    //los filtros se reciben desde el mismo SP, entonces guardo en Vuex
                    this.filters = JSON.parse(response.data[0].filters)
                    this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
                    this.loadingData = false
                }).catch((error) => {
                    console.error(error)
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
            })
        },
  },
  computed:{

    allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
    allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
    allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
    allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
    allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },

    isFiltersDrawerVisible: {
      get () { return this.$store.state[this.moduleName].isFiltersDrawerVisible },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFiltersDrawerVisible', value: val}) }
    },
    isColumnsDrawerVisible: {
      get () { return this.$store.state[this.moduleName].isColumnsDrawerVisible },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isColumnsDrawerVisible', value: val}) }
    },
    moduleReports: {
        get () { return this.$store.state[this.moduleName].moduleReports },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'moduleReports', value: val}) }
    },
    filters: {
        get () { return this.$store.state[this.moduleName].filters },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filters', value: val}) }
    },
    filtersDetails: {
        get () { return this.$store.state[this.moduleName].filtersDetails },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filtersDetails', value: val}) }
    },
    currentFilter: {
        get () { return this.$store.state[this.moduleName].currentFilter },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'currentFilter', value: val}) }
    },
    currentFilterSearch: {
        get () { return this.$store.state[this.moduleName].currentFilterSearch },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'currentFilterSearch', value: val}) }
    },
    isCurrentFilter: {
        get () { return this.$store.state[this.moduleName].currentFilter.filter(x => x.valueA != null || x.valueB != null || (x.valueC != null && x.valueC.length > 0)).length>0; },
    },
    userMainToolbarComponentClass: { get () {
        let result = 'no-padding '
        if(this.$store.state.main.userColor=='default'){
            result=result + 'bg-white text-white'
        }
        if(this.$store.state.main.userColor=='blackDark'){
            result=result + 'bg-grey-10 text-white'
        }
        return result
    }},
    userColor: { get () { return this.$store.state.main.userColor }  },
    editRecord: {
        get () { return this.$store.state[this.moduleName].editRecord },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editRecord', value: val}) }
    },
    editMode: {
        get () { return this.$store.state[this.moduleName].editMode },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editMode', value: val}) }
    },
    selectedRows: {
        get () { return this.$store.state[this.moduleName].selectedRows },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'selectedRows', value: val}) }
    },
    currentReportData: {
        /*get () { return this.$store.state[this.moduleName].currentReportData },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'currentReportData', value: val}) }  */
        get () { return this.$store.statemain.currentReportData },
        set (val) { this.$store.commit('main/updateState', {key: 'currentReportData', value: val}) }
    },
    columnsSystem: {
        get () { return this.$store.state[this.moduleName].columnsSystem },
    },
    userCode: { get () { return this.$store.state.main.userCode } },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
  }
})
</script>
