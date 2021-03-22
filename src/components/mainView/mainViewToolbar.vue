<template>
    <div>
        <q-toolbar :class="toolbarComponentClass">
            <q-btn
                v-if="allow_insert"
                :rounded="$q.screen.gt.xs"
                no-caps no-wrap  class="q-ml-sm"  :color="userColor!=='blackDark'?'primary':undefined"
                v-shortkey="['alt', 'n']" @shortkey="openEditForm({value: 0, row: null}, true)"
                @click="openEditForm({value: 0, row: null}, true)"
                icon="fas fa-plus-circle">
                <div class="q-pl-xs gt-sm"><u>N</u>uevo</div>
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>Nuevo</b><br>Crear registro
                </q-tooltip>
            </q-btn>
            
            <q-input 
                v-model="toolbarSearchString" class="q-ml-md"
                debounce="1000" maxlength="50" style="max-width: 200px;"
                dense clearable
                placeholder="Buscar" 
                :input-class="userColor!=='blackDark'?'text-primary':'text-white'"
                :autofocus="$q.screen.gt.sm?true:false">
                <template v-slot:prepend >
                    <q-icon name="fas fa-search" :color="userColor!=='blackDark'?'primary':'white'" />
                </template>
                <template v-if="toolbarSearchString" v-slot:append>
                    <q-btn @click="()=>{toolbarSearchString=''}" flat round icon="fas fa-times" size="xs" color="white" />
                </template>
            </q-input>

            <q-space />

            <q-btn v-if="isFilterApplied" 
                rounded flat size="sm" @click="clearFilter" icon="fas fa-filter" icon-right="fas fa-times" 
                :color="userColor=='blackDark'?'white':'primary'">
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>Limpiar Filtro</b><br>Quita todos los filtros aplicados en todas las columnas
                </q-tooltip>
            </q-btn>
            
            <q-btn 
                flat no-caps no-wrap round
                icon="fas fa-filter"
                :color="userColor=='blackDark'?'white':'primary'"
                >
                <q-menu>
                    <!--<q-card>-->
                        <q-card-section class="no-padding" style="width: 500px; min-width: 80%; max-height: 250px; min-height: 250px; overflow-y: scroll;">
                            <q-list dense >
                                <q-item
                                    clickable v-close-popup  class="q-pr-xs"
                                    v-for="(filtro, index) in filters" :key="index"
                                    :title="filtro.is_default?'Este es su filtro predeterminado':''"
                                    @click="applyFilter(filtro)"
                                    >
                                    <q-item-section side>
                                        <q-icon :name="filtro.is_system?'fas fa-database':'fas fa-user'" size="0.8rem" />
                                    </q-item-section>
                                    <q-item-section >
                                        <q-item-label>
                                            {{filtro.label}}
                                        </q-item-label>
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-icon v-if="filtro.is_default" name="fas fa-check-circle" color="grey-6" size="1rem" class="q-mr-md" />
                                    </q-item-section>
                                    
                                </q-item>
                                
                            </q-list>
                        </q-card-section>
                        <q-separator />
                        <q-btn-group flat class="no-margin no-padding full-width">
                            <q-btn v-close-popup color="primary" icon="fas fa-user-cog" flat no-caps no-wrap :label="$q.screen.gt.sm?'Mis Filtros':undefined" @click="isFiltersDrawerVisible=true" class="full-width" />
                            <q-btn v-close-popup color="primary" icon="fas fa-save" flat no-caps no-wrap :label="$q.screen.gt.sm?'Guardar Filtro':undefined" @click="saveFilter" class="full-width" />
                        </q-btn-group>
                    <!--</q-card>-->
                </q-menu>
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>Filtros</b><br>Aplicar filtros a los datos<br>Administrador de filtros
                </q-tooltip>
            </q-btn>

            <q-btn v-if="allow_export"
                flat no-caps no-wrap round
                :color="userColor=='blackDark'?'white':'primary'"
                @click="exportData(false)"
                icon="fas fa-file-excel">
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>EXPORTAR</b><br>Exporte rápidamente los datos actuales del grid
                </q-tooltip>
            </q-btn>

            <q-btn
                v-if="allow_report"
                flat no-caps no-wrap round 
                :color="userColor=='blackDark'?'white':'primary'"
                icon="fas fa-chart-bar"
                >
                <q-menu >
                    <q-list >
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
                </q-menu>
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>Reportes</b><br>Ver reportes y dashboards
                </q-tooltip>
            </q-btn>

            <q-btn
                flat no-caps no-wrap round class="q-mr-md"
                :color="userColor=='blackDark'?'white':'primary'"
                @click="isFiltersDrawerVisible = false; isColumnsDrawerVisible = !isColumnsDrawerVisible;"
                icon="fas fa-columns">
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>COLUMNAS</b><br>Agregar o quitar columnas
                </q-tooltip>
            </q-btn>

        </q-toolbar>

        <q-dialog v-if="isreportDialog" v-model="isreportDialog" square>
            <q-card style="min-width: calc(95vw)">
                <q-bar class="bg-primary text-white q-pl-none q-pr-none">
                    <q-btn :label="'Reporte: ' + reportData.name_es" no-caps flat stretch color="white" />
                    <q-space />
                    <q-btn flat stretch color="white" icon="fas fa-times" @click="isreportDialog=false" />
                </q-bar>
                <q-card-section>
                    <reportComponent
                        :moduleName="moduleName"
                        :rptName="reportData.name_es"
                        :rptLink="reportData.link_name"
                        :rptLinkCompany="false"
                        :rptType="reportData.report_type"
                        v-if="isreportDialog"
                        @closeComponent="isreportDialog=false"
                        />
                </q-card-section>
                
            </q-card>
        </q-dialog>

    </div>    
</template>
<script>
import Vue from 'vue';
import reportComponent from 'components/mainReport/reportComponentDialog'
Vue.use(require('vue-shortkey'))

export default ({
    name: 'mainViewToolbar',
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        reportComponent
    },
    data () {
        return {
            isreportDialog: false, reportData: null
        }
    },
    methods:{
        openEditForm(){
            let newStatus = { 
                editMode: 'create', 
                copyRecord: 0,
                navigateToRecord: 0
            }
            this.editStatus = newStatus
            this.$emit('onOpenEditForm')
        },
        clearFilter(){
            this.$emit('clearFilter')
        },
        openReportForm(report){
            //this.$emit('onFilterApply', report)
            this.reportData = report;
            this.isreportDialog = true;
        },
        applyFilter(filtro){
            this.$emit('onApplyFilter', filtro)
        },
        exportData(allData){
            this.$emit('onExportData', allData)
        },
        saveFilter(){
            this.$emit('onSaveFilter')
        }
    },
    computed: {
        userColor: { get () { return this.$store.state.main.userColor }  },
        moduleReports: { get () { return this.$store.state[this.moduleName].moduleReports }, },
        columnsUser: { get () { return this.$store.state[this.moduleName].columnsUser }, },
        filters: { get () { return this.$store.state[this.moduleName].filters }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert')?this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value:false }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report')?this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value:false }, },
        allow_export: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_export')?this.$store.state[this.moduleName].security.find(x=>x.label=='allow_export').value:false }, },
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
        toolbarSearchString: {
            get () { return this.$store.state[this.moduleName].toolbarSearchString },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'toolbarSearchString', value: val}) }
        },
        isFiltersDrawerVisible: {
            get () { return this.$store.state[this.moduleName].isFiltersDrawerVisible },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFiltersDrawerVisible', value: val}) }
        },
        isColumnsDrawerVisible: {
            get () { return this.$store.state[this.moduleName].isColumnsDrawerVisible },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isColumnsDrawerVisible', value: val}) }
        },
        isFilterApplied: {
            get () { return this.$store.state[this.moduleName].isFilterApplied },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFilterApplied', value: val}) }
        },
        rptLink: { get () { return this.$store.state[this.moduleName].rptLink },},
        rptLinkCompany: { get () { return this.$store.state[this.moduleName].rptLinkCompany },},
        rptType: { get () { return this.$store.state[this.moduleName].rptType },},
        rptName: {
            get () { return this.$store.state[this.moduleName].rptName },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptName', value: val}) }
        },
        rptName: {
            get () { return this.$store.state[this.moduleName].rptName },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptName', value: val}) }
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
    },
    
})
</script>