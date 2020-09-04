<template>
<q-layout v-if="maindataLoaded && userCode" container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px);">
    <q-header>
        <headerBar
            :moduleName="moduleName.toString()"
            :moduleEditName="moduleEditName.toString()"
            @onClearFilter="onClearFilter"
            @onFilterApplied="onFilterApplied"  />
        <q-separator color="grey-4" />
    </q-header>

    <q-page-container>
        <div>Pendiente BitacoraPeople</div>
    </q-page-container>

    <!--<q-inner-loading :showing="loadingData" style="z-index: 999;">-->
    <q-inner-loading :showing="true" style="z-index: 999;">
        <q-spinner-ios size="50px" color="primary" />
    </q-inner-loading>
</q-layout>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import headerBar from './barComponent.vue'

export default ({
    components: {
        headerBar: headerBar
    },
    data () {
        return {
            moduleName: "BitacoraPeople",
            moduleEditName: "BitacoraPeopleEdit",
            maindataLoaded: true,
            router: this.$router,
        }
    },
    computed:{
        loadingData: { 
            get () { return this.$store.state[this.moduleName].loadingData }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'loadingData', value: val}) }  
        },
        isDrawerVisible: { 
            get () { 
                let result = false
                if(this.$store.state[this.moduleName].isFiltersDrawerVisible  || this.$store.state[this.moduleName].isColumnsDrawerVisible){
                    result = true
                }
                return result
            }, 
        },
        isFiltersDrawerVisible: { 
        get () { return this.$store.state[this.moduleName].isFiltersDrawerVisible }, 
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFiltersDrawerVisible', value: val}) }  
        },
        isColumnsDrawerVisible: { 
        get () { return this.$store.state[this.moduleName].isColumnsDrawerVisible }, 
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isColumnsDrawerVisible', value: val}) }  
        },
        userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage } },
        pagination: { 
        get () { return this.$store.state[this.moduleName].pagination }, 
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'pagination', value: val}) }  
        },
        
        columnsSystem: { 
            get () { return this.$store.state[this.moduleName].columnsSystem }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsSystem', value: val}) }  
        },
        columnsUser: { 
            get () { return this.$store.state[this.moduleName].columnsUser }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsUser', value: val}) }  
        },
        columnsUserLoaded: { 
            get () { return this.$store.state[this.moduleName].columnsUser.length>0?true:false }, 
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
        moduleReports: { 
            get () { return this.$store.state[this.moduleName].moduleReports }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'moduleReports', value: val}) }  
        },
        security: { 
            get () { return this.$store.state[this.moduleName].security }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'security', value: val}) }  
        },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    },
})
</script>