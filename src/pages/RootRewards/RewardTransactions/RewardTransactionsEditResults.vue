<template>
<div style="margin: -16px;">
    
    <div v-if="rewTableID>0">
        <q-toolbar class="no-padding">
            <q-btn icon="fas fa-table" label="Calcular Resultados" no-caps no-wrap flat stretch color="primary" @click="loadResults" />
            <q-btn icon="fas fa-file-excel" label="Descargar Resultados" no-caps no-wrap flat stretch color="primary" @click="downloadResults" />
        </q-toolbar>
        <q-separator />
         <DxDataGrid
            ref="mainviewtableDxDataGrid"
            height="calc(100vh - 170px)"
            column-resizing-mode="widget"
            :column-auto-width="true"
            :data-source="gridData"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="false"
            :show-column-lines="true"
            :show-row-lines="true"
            >
            <DxScrolling mode="virtual"  :useNative="true" showScrollbar="always" />
            <DxSummary >
                <DxTotalItem column="Monto_a_Pagar" summary-type="sum" cssClass="q-mr-none" display-format="{0}" > <DxValueFormat type="#.00" /> </DxTotalItem>
            </DxSummary>
         </DxDataGrid>
    </div>
    <div v-else class="text-red text-subtitle2" >
        Antes de continuar, debe escoger una Tabla de Datos en la sección "Información Básica"
    </div>
</div>
</template>
<script>
import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxPager, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat /*, DxSearchPanel*/ } from 'devextreme-vue/data-grid';
import saveAs from 'file-saver';
/*
import Vue from 'vue';
import Vuex from 'vuex';
*/

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxDataGrid,
        DxColumn,
        DxColumnFixing,
        DxScrolling,
        DxPager,
        DxStateStoring,
        DxSorting,
        DxPaging,
        DxHeaderFilter,
        DxSelection,
        DxEditing,
        DxLookup,
        DxSummary,
        DxTotalItem, 
        DxValueFormat
        //,computeFunctions: computeFunctions
        //,partnersEdit: () => import('../../../pages/RootMaster/Partners/PartnersEdit.vue')
    },
    mounted(){
        //this.$refs.formulario.validate()
    },
    data () {
        return {
            gridData: null
        }
    },
    methods:{
        loadResults(){
            this.$q.loading.show()
            this.$axios.post( this.apiURL + 'spRewMasterGetResults', {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    rewTableID: this.rewTableID,
                    rewMasterResults: JSON.stringify(this.rewMasterResults),
                    rewMasterResultsLines: JSON.stringify(this.rewMasterResultsLines),
                    selected: JSON.stringify(this.selected),
                }
            , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
            ).then((response) => {
                //console.dir(response)
                this.gridData = response.data
                
                this.$q.loading.hide()
            }).catch((error) => {
                console.dir(error)
                this.$q.loading.hide()
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            })
        },
        downloadResults(){
            this.$q.loading.show()
            this.$axios.post( this.apiURL + 'spRewMasterGetResultsDetails', {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    rewTableID: this.rewTableID,
                    rewMasterResults: JSON.stringify(this.rewMasterResults),
                    rewMasterResultsLines: JSON.stringify(this.rewMasterResultsLines),
                    selected: JSON.stringify(this.selected),
                }
            , { 
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } 
                ,responseType: 'blob', // important
                }
            ).then((response) => {
                //saveAs(new Blob([buffer], { type: 'application/octet-stream' }), this.rptName+'.xlsx');
                //saveAs(new Blob([response.data], { type: 'application/octet-stream' }), 'tutorials.xlsx');
                let blob = new Blob([response.data])
                let link = document.createElement('a')
                link.setAttribute("type", "hidden"); // make it hidden if needed
                link.href = window.URL.createObjectURL(blob)
                document.body.appendChild(link);
                //link.download = file.fileName//set download file name
                link.download = 'Resultados.xlsx'//set download file name
                link.click()
                link.remove()
                //console.dir(response)
                //this.gridData = response.data
                this.$q.loading.hide()
            }).catch((error) => {
                console.dir(error)
                this.$q.loading.hide()
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            })
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
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
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
        },
        rewTableID: {
            get () { return this.$store.state[this.moduleName].editData.basic.rewTableID },
        },
        rewMasterResults: {
            get () { return this.$store.state[this.moduleName].editData.rewMasterResults },
        },
        rewMasterResultsLines: {
            get () { return this.$store.state[this.moduleName].editData.rewMasterResultsLines },
        },
        selected: {
            get () { return this.$store.state[this.moduleName].editData.selected },
        },
    },
})
</script>