<template>
    <div style="margin: -16px;">
        <DxTreeList
            ref="mainTreeList"
            height="calc(100vh - 120px)"
            :data-source="lookup_reports"
            :show-borders="false"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            :column-auto-width="true"
            :allow-column-resizing="true"
            :column-min-width="100"
            column-resizing-mode="widget"
            key-expr="sys_report_id"
            parent-id-expr="parent"
            :selected-row-keys="selectedRowKeys" @selection-changed="onSelectionChanged"
            
            >
            <!-- 
                v-model:selected-row-keys="selectedRowKeys"
                :selected-row-keys="selectedRowKeys"
            -->
            <DxSelection :recursive="true" mode="multiple" />
            <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
            
            <DxColumn data-field="icon" caption="" cell-template="mainViewCellTemplateIcon" :allowFiltering="false" :allowSorting="false" :width="150" />
            <DxColumn data-field="label" caption="Reporte/Módulo" />
            <DxColumn data-field="comment_es" caption="Comentarios" />
            <template #mainViewCellTemplateIcon="{ data }">
                <mainViewCellTemplateIcon :data="data" :moduleName="moduleName"/>
            </template>
        </DxTreeList>
    </div>
</template>

<style lang="scss">
    .dx-treelist{  
        font-weight: bold;
        /*font-family: 'Google Sans';*/
    }  
    .dx-header-row > td[role="columnheader"]> div.dx-treelist-text-content {  
        font-size: 13px;  
        font-weight: bold;
        color: #2F74EB;
    }
    .dx-treelist-content .dx-treelist-table .dx-row .dx-command-select{
        padding: 10px !important;
    }
    .dx-treelist-borders > .dx-treelist-headers {  
        border-top-left-radius: 2px;  
        border-top-right-radius: 2px;  
    }  
    .dx-treelist-borders > .dx-treelist-total-footer,  
    .dx-treelist-borders > .dx-treelist-rowsview {  
        border-bottom-left-radius: 1px;  
        border-bottom-right-radius: 1px;  
    }
    .dx-treelist .dx-treelist-rowsview .dx-row > td {
        //padding: 2px !important; //tiene que ser 0, para que keytemplate ocupe toda la celda y se vea bien
        padding-top: 2px !important;
        padding-bottom: 2px !important;
        padding-left: 10px !important;
        padding-right: 2px !important;
    }
    .dx-treelist .dx-header-filter:not(.dx-header-filter-empty){
        color: #21BA45 !important;
        font-weight: bolder !important;
        font-size: 1.5rem;
    }
    .dx-treelist .dx-row > td {
        min-height: 35px;
        height: 35px;
    }

    .dx-treelist-rowsview .dx-row-focused.dx-data-row .dx-command-edit .dx-link, .dx-treelist-rowsview .dx-row-focused.dx-data-row > td:not(.dx-focused), .dx-treelist-rowsview .dx-row-focused.dx-data-row > tr > td:not(.dx-focused) {
        background-color: #2F74EB !important;
        color: white !important;
    }

</style>



<script>
/*
import Vue from 'vue';
import Vuex from 'vuex';
*/
//import DxTreeView from 'devextreme-vue/tree-view';
import { DxTreeList, DxSelection, DxColumn, DxScrolling } from 'devextreme-vue/tree-list';
import mainViewCellTemplateIcon from '../../../components/mainView/mainViewCellTemplateIcon'

export default ({
    components: {
        DxTreeList,
        DxSelection,
        DxColumn,
        DxScrolling,
        mainViewCellTemplateIcon
    },
    props: {
        moduleName: { type: String , required: true },
    },
    data () {
        return {
            //Confirmed
            selectedRowKeys: [],
        }
    },
    mounted(){
        this.selectedRowKeys = []
        let newSelectedRowKeys = []
        this.ticked_reports.map(x=>{
            if(x.sys_report_id){ 
                newSelectedRowKeys.push(x.sys_report_id);
            }else{
                newSelectedRowKeys.push(x);
            }
        })
        this.selectedRowKeys = JSON.parse(JSON.stringify(newSelectedRowKeys))
    },
    methods:{
        onSelectionChanged() {
            let new_ticked_reports = []
            //all (este trabajaría mejor con la lógica actual) || excludeRecursive || leavesOnly
            this.$refs['mainTreeList'].instance.getSelectedRowKeys('all').map(x=>{
                if(!(new_ticked_reports.some(y=>y.sys_report_id==x))){
                    new_ticked_reports.push({sys_report_id: x})
                }
            }); 
            this.ticked_reports = new_ticked_reports
        },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
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
        lookup_reports: {
            get () {  return this.$store.state[this.moduleName].editData.lookup_reports }
        },
        ticked_reports: {
            get () { return this.$store.state[this.moduleName].editData.ticked_reports },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'ticked_reports', value: val}) }
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
    },
})
</script>