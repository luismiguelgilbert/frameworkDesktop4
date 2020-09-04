<template>
<q-layout v-if="maindataLoaded && userCode" container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px);">
    
    <q-header>
        <headerBar 
            @onClearFilter="onClearFilter"  />
        <q-separator color="grey-4" />
    </q-header>

    <q-page-container>
        <tableComponent
            :moduleName="moduleName.toString()" ref="mainTableComponent"
            :moduleEditName="moduleEditName.toString()"
            />
    </q-page-container>

    <q-drawer side="right" v-model="isDrawerLeftVisible" bordered behavior="desktop" >
        <filtersLayoutComponent v-if="isDrawerLeftVisible"
                :moduleName="moduleName.toString()"
                @onFilterApplied="onFilterApplied"
                />
    </q-drawer>
    
    <q-drawer side="right" v-model="isDrawerRightVisible"  bordered behavior="desktop" >
        <columnsLayoutComponent v-if="isDrawerRightVisible"
            :moduleName="moduleName.toString()"
            />
    </q-drawer>

    <q-inner-loading :showing="loadingData" style="z-index: 999;">
        <q-spinner-ios size="50px" color="primary" />
    </q-inner-loading>

</q-layout>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import columnsLayoutComponent from '../../../components/mainTable/columnsLayoutComponent.vue'
import tableComponent from '../../../components/mainTable/tableComponent.vue'
import filtersLayoutComponent from '../../../components/mainTable/filtersLayoutComponent.vue'
/*Specific*/
import headerBar from './barComponent.vue'

export default ({
  components: {
     columnsLayoutComponent: columnsLayoutComponent
    ,tableComponent: tableComponent
    ,filtersLayoutComponent: filtersLayoutComponent
    ,headerBar: headerBar
  },
  mounted(){
    //si userCode existe, entonces carga datos básicos del módulo (eg. page refresh puede hacer que userCode se cargue luego, y ese dato es indispensable para la lectura)
    if(this.userCode){
        this.loadModouleData();    
    }
  },
  data () {
    return {
        moduleName: "PurchaseQuotes",
        moduleEditName: "PurchaseQuotesEdit",
        maindataLoaded: false,
        router: this.$router,
    }
  },
  methods:{
    loadModouleData(){
        this.loadingData = true
        this.$axios({
            method: 'GET',
            url: this.apiURL + 'spSysModulesSelect',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: { 
                sys_user_code: this.userCode,
                link_name: this.moduleName,
            }
        }).then((response) => {
            this.columnsSystem = JSON.parse(response.data[0].columnsSystem)
            this.filters = JSON.parse(response.data[0].filters)
            this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
            if(!this.columnsUserLoaded){//es primera carga?
                this.columnsUser=JSON.parse(response.data[0].columnsUser)//(asigna columnas de usuarios
                let initialPagination = JSON.parse(JSON.stringify(this.pagination))//clona
                initialPagination.rowsPerPage = this.userRowsPerPage//asigna rowsPerPage
                this.pagination = initialPagination;//save to vuex
                this.currentFilter = JSON.parse(response.data[0].currentFilter)//filtroPredeterminado viene desde la base de datos
                this.moduleReports = JSON.parse(response.data[0].moduleReports)//filtroPredeterminado viene desde la base de datos
            }
            this.maindataLoaded = true
            this.loadingData = false
            //this.loadMoreData('FirstCall')
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
    onFilterApplied(){
        let resetPagination = JSON.parse(JSON.stringify(this.pagination))//clona
        resetPagination.page = 1; resetPagination.rowsNumber = 0; //reset to default
        this.pagination = resetPagination; //update pagintation
        this.$refs.mainTableComponent.loadData(); //reload Data
    },
    onClearFilter(){
        this.currentFilter = [];
        this.$refs.mainTableComponent.loadData();
    },
  },
  computed:{
    isDrawerLeftVisible: { get () { 
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
    moduleReports: { get () { 
        return this.$store.state.main[this.moduleName].moduleReports
      }, 
      set(val) {
        let cambio = { module: this.moduleName, key: 'moduleReports', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    userCode: { get () { return this.$store.state.main.userCode } },
    userCompany: { get () { return this.$store.state.main.userCompany } },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
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