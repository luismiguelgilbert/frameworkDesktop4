<template>
    <q-bar :class="userMainToolbarComponentClass">
        <q-btn 
            flat no-caps no-wrap color="positive"  stretch @click="openEditForm(null, true)"
            class="q-ml-xs" title="Crear nuevo documento" >
            <q-icon name="fas fa-plus-circle" color="positive" />
            <div class="text-positive q-pl-xs">Nuevo</div>
        </q-btn>
        <q-btn
            :disable="!(selectedRows.length>0)"
            flat no-caps no-wrap color="primary"  stretch 
            @click="openPrintForm" label="Documento"
            icon="fas fa-file-alt" :title="!(selectedRows.length>0)?'Seleccione un registro':'Generar documento del primer registro seleccionado'" />
        <q-btn-dropdown 
            flat stretch icon="fas fa-chart-bar" label="Reportes" no-caps no-wrap
            :color="userColor=='blackDark'?'white':'primary'" 
            >
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
        <q-space />
        <q-btn v-if="isCurrentFilter" size="xs" label="Quitar Filtro" :color="userColor=='blackDark'?'white':'primary'" flat @click="clearFilter" no-caps no-wrap>
            <span :class="userColor=='blackDark'?'fa-stack text-white':'fa-stack text-primary'">
                <i class="fas fa-filter fa-stack-2x"></i>
                <i class="fas fa-times fa-stack-1x q-pl-md q-pt-sm"></i>
            </span>
        </q-btn>
        <q-btn-dropdown 
            flat split stretch icon="fas fa-filter" label="Filtros" no-caps no-wrap
            :color="userColor=='blackDark'?'white':'primary'"
            dropdown-icon="fas fa-bars"
            @click="isDrawerRightVisible = false; isDrawerLeftVisible = true;">
            <q-list>
                <q-item 
                    clickable @click="isDrawerLeftVisible = false; isDrawerRightVisible = true;"
                    v-close-popup 
                    :class="userColor=='blackDark'?'text-white':'text-primary'"
                    >
                    <q-item-section side>
                        <q-icon name="fas fa-columns" :color="userColor=='blackDark'?'white':'primary'" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Columnas</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-btn-dropdown>
    </q-bar>    
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
//import reportComponent from '../../../components/mainReport/reportComponent.vue'

export default ({
  data () {
    return {
        moduleName: "PurchaseQuotes",
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
    openEditForm(props, editMode){
      this.editRecord = props
      this.editMode = editMode //false = edit || true  = new
      this.router.push('PurchaseRequisitionEdit');
    },
    openReportForm(report){
      let newReportData = {
           report: report
          ,parameters: null
      }
      this.currentReportData = newReportData
      this.router.push('/mainReport');
    },
    openPrintForm(){
      /*let newReportData = {
           report: report
          ,parameters: null
      }
      this.currentReportData = newReportData
      this.router.push('/mainReport');*/
      alert('este botón debe abrir otro componente distinto que envíe además el código PK del documento seleccionado')
    },
  },
  computed:{
    isDrawerLeftVisible: { get () { 
            //let modulo: string = this.moduleName.toString()
            return this.$store.state.main[this.moduleName].isDrawerLeftVisible
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'isDrawerLeftVisible', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },
    isDrawerRightVisible: { get () { 
            return this.$store.state.main[this.moduleName].isDrawerRightVisible
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'isDrawerRightVisible', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },
    userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage } },
    pagination: { get () { 
        return this.$store.state.main[this.moduleName].pagination
      }, 
      set(val) {
        let cambio = { module: this.moduleName, key: 'pagination', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    moduleReports: { get () { 
        return this.$store.state.main[this.moduleName].moduleReports
      }, 
      set(val) {
        let cambio = { module: this.moduleName, key: 'moduleReports', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    loadingData: { get () { 
            return this.$store.state.main[this.moduleName].loadingData
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'loadingData', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },
    columnsSystem: { get () { 
            return this.$store.state.main[this.moduleName].columnsSystem
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'columnsSystem', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },
    columnsUser: { get () { 
            return this.$store.state.main[this.moduleName].columnsUser;
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'columnsUser', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },
    columnsUserLoaded: { get () { 
            return this.$store.state.main[this.moduleName].columnsUser.length>0?true:false
        }
    },
    filters: { get () { 
            return this.$store.state.main[this.moduleName].filters;
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'filters', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },
    filtersDetails: { get () { 
            return this.$store.state.main[this.moduleName].filtersDetails;
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'filtersDetails', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },
    currentFilter: { get () { 
            return this.$store.state.main[this.moduleName].currentFilter;
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'currentFilter', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },
    isCurrentFilter: { get () { 
            return this.$store.state.main[this.moduleName].currentFilter.filter(x => x.valueA != null || x.valueB != null || (x.valueC != null && x.valueC.length > 0)).length>0;
        }, 
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
    userTableLines: { get () { return this.$store.state.main.userTableLines } },
    userTableDense: { get () { return this.$store.state.main.userTableDense } },
    userCode: { get () { return this.$store.state.main.userCode } },
    userCompany: { get () { return this.$store.state.main.userCompany } },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + ':' + this.$q.sessionStorage.getItem('URL_Port') + this.$q.sessionStorage.getItem('URL_Path') } },
    editRecord: { get () { 
        return this.$store.state.main[this.moduleName].editRecord;
      },
      set(val) {
        let cambio = { module: this.moduleName, key: 'editRecord', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    editMode: { get () { 
        return this.$store.state.main[this.moduleName].editMode;
      },
      set(val) {
        let cambio = { module: this.moduleName, key: 'editMode', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    selectedRows: { get () { 
        return this.$store.state.main[this.moduleName].selectedRows;
      },
      set(val) {
        let cambio = { module: this.moduleName, key: 'selectedRows', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    userCode: { get () { return this.$store.state.main.userCode },  },
    currentReportData: { get () { return this.$store.state.main.currentReportData; }, set (val) { this.$store.commit('main/updateState', {key: 'currentReportData', value: val}) } },
  },
  watch: {
    userCode: function (val) {
      if(val){
        this.loadModouleData();
      }
    },
    userCompany: function (val) {
      this.$refs.mainTableComponent.loadData();
    },
    
  }
})
</script>