<template>
    <q-card style="margin: 10px;" class="shadow-8">
        <DxDataGrid
            v-if="columnsUser&&columnsUser.length>0"
            ref="mainviewtableDxDataGrid"
            height="calc(100vh - 120px)"
            width="calc(100vw - 20px)"
            column-resizing-mode="widget"
            :data-source="dataSource"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="false"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            :remote-operations="true"
            :cache-enabled="false"
            :filter-sync-enabled="true"
            @context-menu-preparing="showOptions"
            >
            <!-- :focused-row-enabled="true" Fue quitado, porque al activarse, obliga al grid a iniciarse por keycolumn (y NO siempre ese es el initial sort)-->
            <!-- :keyExpr="columnKeyName" The "keyExpr" option is not applied when dataSource is not an array  -->
            <DxScrolling mode="virtual"  rowRenderingMode="virtual" columnRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
            <DxPager :visible="true" :show-page-size-selector="false" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="true" :showPageSizeSelector="false" />
            <DxPaging :enabled="true" :page-size="userRowsPerPage" /> <!-- controla que se pagine basado en registros x página del usuario-->
            <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
            <DxSelection select-all-mode="page" show-check-boxes-mode="always" mode="single" :deferred="false"/>
            <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
            <DxRemoteOperations :filtering="true" :paging="true" :sorting="true" :grouping="false" :groupPaging="false" :summary="false" />
            <DxStateStoring :enabled="true" type="sessionStorage" :storage-key="moduleName" :savingTimeout="50" />
            <DxColumnFixing :enabled="true" :texts="{fix:'Fijar', unfix: 'Soltar'}" />
            <DxColumn 
                v-for="columna in columnsUser.filter(x=>x.is_visible)" :key="columna.db_column"
                :name="columna.db_column"
                :data-field="columna.db_column"
                :data-type="(columna.ux_type=='date'||columna.ux_type=='datetime')?'date':undefined"
                :caption="columna.label"
                :width="columna.min_width"
                :alignment="columna.align"
                :allowFiltering="columna.is_filterable"
                :allowSorting="columna.sortable"
                :cell-template="columna.dxCellComponent"
                >
                    <DxLookup v-if="columna.lookup_table&&columna.dxCellComponent!='image'"
                        value-expr="value" display-expr="label"
                        :data-source="columnsLookupData[columna.db_column]"
                    />
            </DxColumn>
            <!--sort-order="desc"-->
            
            <template #mainViewCellTemplateKey="{ data }">
                <mainViewCellTemplateKey :data="data" :moduleName="moduleName" @onOpenEditForm="openEditForm" @onKeyClicked="keyClicked" />
            </template>
            <template #mainViewCellTemplateLookup="{ data }">
                <mainViewCellTemplateLookup :data="data"  />
            </template>
            <template #mainViewCellTemplateEstado="{ data }">
                <mainViewCellTemplateEstado :data="data" />
            </template>
            <template #mainViewCellTemplateImage="{ data }">
                <mainViewCellTemplateImage :data="data" />
            </template>
            <template #mainViewCellTemplateNormal="{ data }">
                <mainViewCellTemplateNormal :data="data" />
            </template>
            <template #mainViewCellTemplateVoided="{ data }">
                <mainViewCellTemplateVoided :data="data" />
            </template>

        </DxDataGrid>
    </q-card>
</template>

<script>

import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling,  DxLookup, DxExport, DxSorting, DxPaging, DxPager, DxSelection, DxSummary, DxTotalItem, DxStateStoring, DxHeaderFilter, DxRemoteOperations } from 'devextreme-vue/data-grid';
//import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import mainViewCellTemplateKey from './mainViewCellTemplateKey'
import mainViewCellTemplateLookup from './mainViewCellTemplateLookup'
import mainViewCellTemplateEstado from './mainViewCellTemplateEstado'
import mainViewCellTemplateImage from './mainViewCellTemplateImage'
import mainViewCellTemplateNormal from './mainViewCellTemplateNormal'
import mainViewCellTemplateVoided from './mainViewCellTemplateVoided'


export default ({
    name: 'mainViewTable',
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxDataGrid,
        DxScrolling,
        DxSorting,
        DxPaging,
        DxPager,
        DxColumn,
        DxColumnFixing,
        DxLookup,
        DxSelection,
        DxTotalItem,
        DxSummary,
        DxStateStoring,
        DxHeaderFilter,
        DxRemoteOperations,
        DxExport,
        mainViewCellTemplateKey,
        mainViewCellTemplateLookup,
        mainViewCellTemplateEstado,
        mainViewCellTemplateImage,
        mainViewCellTemplateNormal,
        mainViewCellTemplateVoided
    },
    data() {
        return {
           totalRunsCount: 0
        }
    },
    mounted(){
        this.columnKeyName = this.$store.state[this.moduleName].columnsUser.find(x=>x.is_key).db_column;  
    },
    methods: {
        dxSearchValueIterator(resultadoFinal, filtro){
            if(filtro){
                if(filtro[0][1]=='contains'){
                    resultadoFinal =  resultadoFinal + filtro[0][2]
                }else{
                    if(filtro[0][0][1]=='contains'){
                        resultadoFinal =  resultadoFinal + filtro[0][0][2]
                    }
                }
            }
            return resultadoFinal//si devuelvo null o algo parecido, se va a anular el resultado
        },
        showOptions(e){
            if(e.row.rowType=='data'){
                e.component.selectRows(e.row.data[this.columnKeyName]);//this way is the correct way, now that I have a key defined in customStore definition (instead of //this.$refs['mainviewtableDxDataGrid'].instance.selectRows(e.row.data);//visually select grid row)
                //this.shouldScrollToRow = true;
                if(this.allow_insert){
                    e.items = [
                        //Navega a registro, y registro de copia = 0
                        { text: "Abrir Registro", icon: "far fa-folder-open", onItemClick: ()=> { 
                                let newStatus = { 
                                    editMode: 'edit',
                                    copyRecord: 0,
                                    navigateToRecord: e.row.data[this.columnsUser.find(x=>x.is_key)['name']],
                                }
                                this.editStatus = newStatus;
                                this.openEditForm()
                            }
                        },
                        //Navega a 0, y registro de copia es el valor de la fila seleccionada
                        { disable: true, text: "Copiar Registro", icon: "far fa-copy", onItemClick: ()=> {
                                let newStatus = { 
                                    editMode: 'create', 
                                    copyRecord: e.row.data[this.columnsUser.find(x=>x.is_key)['name']],
                                    navigateToRecord: 0,
                                }
                                this.editStatus = newStatus;
                                this.openEditForm();
                            }
                        },
                    ];
                }else{
                     e.items = [
                        //Navega a registro, y registro de copia = 0
                        { text: "Abrir Registro", icon: "far fa-folder-open", onItemClick: ()=> { 
                                let newStatus = { 
                                    editMode: 'edit',
                                    copyRecord: 0,
                                    navigateToRecord: e.row.data[this.columnsUser.find(x=>x.is_key)['name']],
                                }
                                this.editStatus = newStatus;
                                this.openEditForm()
                            }
                        },
                    ];
                }
            }
        },
        openEditForm(){
            this.$emit('onOpenEditForm')
        },
        keyClicked(valor){
            this.$refs['mainviewtableDxDataGrid'].instance.selectRows(valor);//visually select grid row
            setTimeout(()=>{
                this.openEditForm()
            }, 300)//300 es mayor que los 200ms de mainViewTable
        },
    },
    computed: {
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        //userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode }  },
        userCompany: { get () { return this.$store.state.main.userCompany }  },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        userRowsPerPage: { get () { return this.$store.state.main.userRowsPerPage }  },
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
        toolbarSearchString: { get () { return this.$store.state[this.moduleName].toolbarSearchString }, },
        filters: { get () { return this.$store.state[this.moduleName].filters },},
        columnsLookupData: { get () { return this.$store.state[this.moduleName].columnsLookupData }, },
        columnsUser: {
            get () { return this.$store.state[this.moduleName].columnsUser },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsUser', value: val})  }
        },
        columnKeyName:{
            get () { return this.$store.state[this.moduleName].columnKeyName },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnKeyName', value: val})  }
        },
        columnsLookupData: {
            get () { return this.$store.state[this.moduleName].columnsLookupData },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsLookupData', value: val})  }
        },
        isFilterApplied: {
            get () { return this.$store.state[this.moduleName].isFilterApplied },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFilterApplied', value: val}) }
        },
        dxdatagridState: {
            get () { return this.$store.state[this.moduleName].dxdatagridState },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'dxdatagridState', value: val})  }
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
        dataSource: {
            get(){
                //return new CustomStore({
                return new DataSource({
                    key: this.columnKeyName,//when [focus-row enabled] will force dxdatagrid to initially sort data by key on first load
                    onChanged: () => {
                        if(this.totalRunsCount==0&&this.editStatus&&this.editStatus.navigateToRecord&&this.editStatus.navigateToRecord>0){
                            this.totalRunsCount++;
                            setTimeout(()=>{
                                try{
                                    this.$refs['mainviewtableDxDataGrid'].instance.selectRows(this.editStatus.navigateToRecord)
                                    this.$refs['mainviewtableDxDataGrid'].instance.navigateToRow(this.editStatus.navigateToRecord)
                                }catch(ex){console.dir('NavigateToRow error: ' + ex.message)}
                            }, 500)
                            
                        }else{
                            this.totalRunsCount++;
                        }
                    },
                    //sort: [{ selector: "headerID", desc: true }],
                    load: (loadOptions) => {
                        //get current sorting
                        let visibleColumns  = this.$refs['mainviewtableDxDataGrid'].instance.getVisibleColumns();
                        let currentSort = null;
                        visibleColumns.map(x=>{
                            if(x.sortIndex != null){
                                currentSort = [{"selector":x.dataField,"desc":x.sortOrder=='desc'?true:false}];
                            }
                        })
                        //console.dir(currentSort)
                        //console.dir(this.dataSource.key())
                        if(!loadOptions.dataField){//Datasource request for grid Data
                            let newfilter = null
                            if(loadOptions.filter && loadOptions.filter.length > 0){
                                newfilter = JSON.stringify(loadOptions.filter)
                                newfilter = newfilter.replaceAll(',',' ')
                                newfilter = newfilter.replaceAll('"="',' = ').replaceAll('"<>"',' <> ').replaceAll('">="',' >= ').replaceAll('"<="',' <= ').replaceAll('"<"',' < ')
                                newfilter = newfilter.replaceAll('"or"',' or ').replaceAll('"and"',' and ')
                                newfilter = newfilter.replaceAll(  /\["[a-z-A-Z]*"/g  , function(match){return match.replaceAll('"','')}    )
                                newfilter = newfilter.replaceAll(  /\["[a-z_"]*/g  , function(match){return match.replaceAll('"','')}    )
                                newfilter = newfilter.replaceAll('[','(').replaceAll(']',')')
                                newfilter = newfilter.replaceAll('"','\'')
                                newfilter = newfilter.replaceAll('!\'',' NOT ')
                                newfilter = newfilter.replaceAll('=  null', 'IS NULL')
                                if(loadOptions.take&&loadOptions.take!=1){
                                    this.isFilterApplied = true ;
                                }
                            }else{
                                this.isFilterApplied = false;
                            }
                            return this.$axios.post( this.apiURL + 'getDataDX',
                            {
                                        sys_user_code: this.userCode,
                                        sys_company_id: this.userCompany,
                                        select: this.columnsUser.map(x=>x.db_column).join(','),
                                        link_name: this.moduleName,
                                        take: loadOptions.take?loadOptions.take:100000,//al exportar DXdatagrid envía take NULL para recuperar todos los registros (pero sí mantiene filtro aplicado)
                                        skip: loadOptions.skip?loadOptions.skip:0,//al exportar DXdatagrid envía skip NULL para recuperar todos los registros (pero sí mantiene filtro aplicado)
                                        searchValue: this.toolbarSearchString,
                                        filter: newfilter,
                                        //sortBy: JSON.stringify(loadOptions.sort)
                                        sortBy: loadOptions.sort?JSON.stringify(loadOptions.sort):JSON.stringify(currentSort)
                                    }
                                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                                ).then((response) => {
                                    let arreglo = JSON.parse(response.data[0].data)
                                    let results = {
                                        data: arreglo,
                                        totalCount: arreglo.length>0?arreglo[0].gridDataMaxRows:0
                                        //totalCount: arreglo.length>0?parseInt(arreglo[0].gridDataMaxRows)-parseInt(1):0
                                    }
                                    return results
                                }).catch((error) => {
                                    console.error(error.message)
                                    let mensaje = ''
                                    if(error.message){ mensaje = error.message }
                                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                                    })
                                })
                        }else{//Datasource request for grid Header Filter Data (!!! only non-lookup columns)
                            let columna = loadOptions.dataField
                            let filterText = this.dxSearchValueIterator('',loadOptions.filter)
                            return this.$axios.post( this.apiURL + 'getLookupDataDX',
                                {
                                    link_name: this.moduleName,
                                    db_column: columna.replace('_ux',''),
                                    sys_user_code: this.userCode,
                                    sys_company_id: this.userCompany,
                                    searchValue: filterText//searchValue: null//NO se filtra, sino que se espera recibir TODOS los datos, para poder usarlos luego al calcular el filtro !!!! SE FILTRA MÁS ADELANTE
                                }
                                , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                            ).then((response) => {//NOTA: En este punto SOLO columnas que NO son lookups los utilizan
                                return response.data //NOTA: cuando el tipo de campo es datetime, dxDatagrid convierte el filtro automáticamente
                            }).catch((ex) =>{
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
                            })
                        }
                    }
                })
            }
        },
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        },
        defaultSortColumn:{
            get () { return this.$store.state[this.moduleName].defaultSortColumn },
        },
        defaultSortDescending:{
            get () { return this.$store.state[this.moduleName].defaultSortDescending },
        }
    },
    watch: {
        toolbarSearchString: function(val){
            this.$refs['mainviewtableDxDataGrid'].instance.refresh()
        },
        userCompany: function(val){
            this.$emit('onCompanyChange')
        },
    }
})


</script>