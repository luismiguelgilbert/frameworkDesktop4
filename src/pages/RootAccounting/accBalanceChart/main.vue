<template>
<div >
    <q-layout container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px); overflow-y: hidden !important;" >

        <q-toolbar :class="toolbarComponentClass">
            <q-input 
                v-model="startDate" class="q-ml-md"
                :title="dateName(startDate)"
                maxlength="50" style="max-width: 180px;" dense 
                placeholder="Ingrese fecha de Inicio" label="Desde (aaaa/mm/dd)"
                :input-class="userColor!=='blackDark'?'text-primary':'text-white'"
                :autofocus="$q.screen.gt.sm?true:false">
                <!--<template v-slot:prepend >
                    <q-icon name="fas fa-search" :color="userColor!=='blackDark'?'primary':'white'" />
                </template>-->
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                        <q-popup-proxy  ref="qDateProxy_startDate" transition-show="scale" transition-hide="scale">
                            <q-date :locale="myQDateLocale" minimal v-model="startDate" >
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>

            <q-input 
                v-model="stopDate" class="q-ml-md"
                :title="dateName(stopDate)"
                maxlength="50" style="max-width: 180px;" dense 
                placeholder="Ingrese fecha de Corte" label="Hasta (aaaa/mm/dd)"
                :input-class="userColor!=='blackDark'?'text-primary':'text-white'"
                :autofocus="$q.screen.gt.sm?true:false">
                <!--<template v-slot:prepend >
                    <q-icon name="fas fa-search" :color="userColor!=='blackDark'?'primary':'white'" />
                </template>-->
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                        <q-popup-proxy  ref="qDateProxy_stopDate" transition-show="scale" transition-hide="scale">
                            <q-date :locale="myQDateLocale" minimal v-model="stopDate" >
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>

            <q-btn color="primary" flat label="Actualizar Datos" stretch no-caps no-wrap icon="fas fa-play" class="q-ml-lg" @click="loadData" />
            
            <q-space />


            <q-btn 
                flat no-caps no-wrap round @click="expandAll"
                :color="userColor=='blackDark'?'white':'primary'"
                icon="far fa-plus-square">
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>EXPANDIR</b><br>Expandir plan de cuentas (puede tardar unos segundos...)
                </q-tooltip>
            </q-btn>
            <q-btn 
                flat no-caps no-wrap round @click="collapseAll"
                :color="userColor=='blackDark'?'white':'primary'"
                icon="far fa-minus-square">
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>CONTRAER</b><br>Contraer plan de cuentas (puede tardar unos segundos...)
                </q-tooltip>
            </q-btn>
            <q-btn 
                flat no-caps no-wrap round class="q-mr-md"
                :color="userColor=='blackDark'?'white':'primary'"
                @click="exportData(false)"
                icon="fas fa-file-excel">
                <q-tooltip content-class="bg-primary text-white" :delay="1200" :offset="[10, 40]">
                    <b>EXPORTAR</b><br>Exporte rápidamente los datos actuales en pantalla
                </q-tooltip>
            </q-btn>
                
            <q-input 
                v-model="toolbarSearchString" class="q-mr-md"
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

           

            
        </q-toolbar>
        <q-separator />
        
        <DxTreeList
            ref="treelist"
            key="treelist"
            id="treelist"
            height="calc(100vh - 102px)"
            :data-source="gridData"
            :show-borders="true"
            :column-auto-width="true"
            :word-wrap-enabled="true"
            key-expr="account_id"
            parent-id-expr="parent_id"
            :cache-enabled="false"
            column-resizing-mode="widget"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            @row-prepared="treeListRowPrepared"
            >
                <DxColumn data-field="account_name" data-type="string" caption="Cuenta Contable" :minWidth="100" alignment="left" :allowFiltering="true" :allowSorting="false" />
                <DxColumn data-field="Saldo_Inicial" data-type="number" caption="Saldo Inicial" alignment="right" :minWidth="80" :width="100" :format="userMoneyFormat" :allowSorting="false" />
                <DxColumn data-field="Saldo_Mes" data-type="number" caption="Saldo del Mes" alignment="right" :minWidth="80" :width="100" :format="userMoneyFormat" :allowSorting="false" />
                <DxColumn data-field="Saldo_Final" data-type="number" caption="Saldo" alignment="right" :minWidth="80" :width="100" :format="userMoneyFormat" :allowSorting="false" />
                <DxColumn caption=" " name="voidButton" :allow-editing="false" alignment="left" :visible="true" cell-template="voidEditor" :width="57" :allowSorting="false" />
                <template #voidEditor="{ data: cellInfo }">
                    <q-btn icon="fas fa-search" :color="cellInfo.data.account_has_children==false?'primary':'grey-5'" flat stretch :title="'Ver detalles del saldo del mes de: ' + cellInfo.data.account_name"  @click="openDetails(cellInfo)"
                        style="margin: -10px;"/>
                </template>
        </DxTreeList>

        <!--Details-->
        <DxPopup
            v-if="detailsVisible"
            :visible.sync="detailsVisible"
            :drag-enabled="true"
            :resizeEnabled="true"
            :close-on-outside-click="true"
            :show-title="true"
            width="calc(95vw)"
            height="calc(75vh)"
            :title="'Detalle de Asientos que afectan cuenta contable: ' + currentAccount.account_name"
            >
                <DxToolbarItem widget="dxButton" location="after" :options="exportKardexButton" />
                 <q-separator />

                <div style="margin: -15px;">
                    <DxDataGrid
                        ref="detailsGrid"
                        width="100%"
                        height="calc(75vh - 55px)"
                        column-resizing-mode="widget"
                        :data-source="currentAccountData"
                        :allow-column-resizing="true" 
                        :allow-column-reordering="true"
                        :show-borders="false"
                        :show-column-lines="userTableLinesDXcols"
                        :show-row-lines="userTableLinesDXrows"
                        :cache-enabled="false"
                        keyExpr="rowID"
                        >
                        <DxScrolling mode="virtual" :useNative="false" showScrollbar="always" /> <!--rowRenderingMode="virtual" deshabilitado, porque aquí cuando se edita causa un flickering que no me gusta || :useNative="true" hace que la última columna tenga un margen-->
                        <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
                        <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
                        
                        <DxColumn data-field="anulado" data-type="boolean" caption="Anulado?" alignment="center" :width="75" :allowSorting="false" />
                        <DxColumn data-field="accMoveID" data-type="number" caption="Asiento" alignment="left" :width="90" :allowSorting="false" />
                        <DxColumn data-field="accMoveDate" data-type="string" caption="Fecha" alignment="left" :width="100" :allowSorting="false" />
                        <DxColumn data-field="journalName" data-type="string" caption="Origen" alignment="left" :width="150" :allowSorting="false" />
                        <DxColumn data-field="partnerName" data-type="string" caption="Proveedor/Cliente" :width="200" alignment="left" :allowSorting="false" />
                        <DxColumn data-field="comments" data-type="string" caption="Referencia/Comentario" alignment="left" :minWidth="200" :allowSorting="false" />
                        <DxColumn data-field="debit" data-type="number" caption="DEBE" alignment="right" :minWidth="80" :width="120" :format="userMoneyFormat" :allowSorting="false" />
                        <DxColumn data-field="credit" data-type="number" caption="HABER" alignment="right" :minWidth="80" :width="120" :format="userMoneyFormat" :allowSorting="false" />
                        <DxColumn data-field="saldo" data-type="number" caption="Saldo" alignment="right" :minWidth="80" :width="120" :format="userMoneyFormat" :allowSorting="false" />

                        <DxSummary>
                            <DxTotalItem column="debit" summary-type="sum" ><DxValueFormat type="#.00" /> </DxTotalItem>
                            <DxTotalItem column="credit" summary-type="sum" ><DxValueFormat type="#.00" /> </DxTotalItem>
                            <DxTotalItem column="saldo" summary-type="sum" ><DxValueFormat type="#.00" /> </DxTotalItem>
                            <!--<DxTotalItem column="SaleAmount" summary-type="sum" value-format="currency" />-->
                        </DxSummary>

                        <!--
                        <DxStateStoring :enabled="true" type="sessionStorage" storage-key="invQueryKardex" :savingTimeout="200" />
                        <DxColumn name="moveDate" data-field="moveDate" data-type="date" caption="Fecha" :width="100" alignment="left" :allowSorting="false" format="dd-MMM-yyy" />
                        
                        
                        <template #moveTemplate="{ data }">
                            <div :class="data.row.data.direction?'text-positive':'text-red'">{{data.value}}</div>
                        </template>
                        <DxColumn name="quantity" data-field="quantity" data-type="number" caption="Cantidad" :width="85" alignment="right" :allowSorting="false" />
                        <DxColumn name="price" data-field="price" data-type="number" caption="Precio U." :width="85" alignment="right" :allowSorting="false" />
                        <DxColumn name="RunningQTY" data-field="RunningQTY" data-type="number" caption="Stock" :width="95" alignment="right" :allowSorting="false" />
                        <DxColumn name="mktTypeName" data-field="mktTypeName" data-type="string" caption="Tipo Orden" :width="170" alignment="left" :allowSorting="false" />
                        <DxColumn name="mktHeaderID" data-field="mktHeaderID" data-type="number" caption="# Orden" :width="80" alignment="right" :allowSorting="false" />
                        <DxColumn name="partnerName" data-field="partnerName" data-type="string" caption="Proveedor" :width="150" alignment="left" :allowSorting="false" />
                        <DxColumn name="invDocName" data-field="invDocName" data-type="string" caption="Dcoumento" :width="130" alignment="left" :allowSorting="false" />
                        <DxColumn name="invDocNumber" data-field="invDocNumber" data-type="string" caption="# Documento" :width="100" alignment="left" :allowSorting="false" />
                        -->


                    </DxDataGrid>
                </div>
        </DxPopup>

    </q-layout>
    <div v-if="dataLoading" style="height: calc(100vh - 80px)"  >
        <q-inner-loading :showing="dataLoading">
            <q-spinner-facebook size="10%" color="primary" />
        </q-inner-loading>
    </div>
</div>
</template>

<style >

.q-layout-container .q-layout{
    overflow-y: hidden !important;
}

</style>

<script>
import Vue from 'vue';
import { date } from 'quasar';


import { DxTreeList, DxTreeColumn, DxTreeHeaderFilter, DxTreeSelection, DxTreeLookup } from 'devextreme-vue/tree-list';
import { DxDataGrid, DxColumn, DxScrolling, DxLookup, DxExport, DxSorting, DxPaging, DxPager, DxSelection, DxSummary, DxTotalItem, DxValueFormat, DxStateStoring, DxHeaderFilter, DxRemoteOperations } from 'devextreme-vue/data-grid';
import { DxPopup, DxToolbarItem } from 'devextreme-vue/popup';
import { DxScrollView } from 'devextreme-vue/scroll-view';
import DxButton from 'devextreme-vue/button';
import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

export default ({
    components: {
        DxTreeList,
        DxTreeColumn,
        DxTreeHeaderFilter,
        DxTreeSelection,
        DxTreeLookup,
        DxDataGrid,
        DxScrolling,
        DxSorting,
        DxPaging,
        DxPager,
        DxColumn,
        DxLookup,
        DxSelection,
        DxTotalItem,
        DxValueFormat,
        DxSummary,
        DxStateStoring,
        DxHeaderFilter,
        DxRemoteOperations,
        DxExport,
        DxPopup,
        DxToolbarItem,
        DxScrollView,
        DxButton
    },
    data () {
        return {
            moduleName: "accBalanceChart",
            startDate: null,
            stopDate: null,
            toolbarSearchString: '',
            dataLoading: false,
            gridData: [],
            detailsVisible: false,
            currentAccount: null,
            currentAccountData: null,
            myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            },

            //remover
            temporal: false,
            isURLready: false,
            rptType: 'ssrs',//'ssrs' ó 'PBIRS'
            rptLinkCompany: false,
            rptLink:'ssrs_pruebas',
            reportURL: '',
            //fin_remover

            
            exportKardexButton: {
                icon:"fas fa-file-excel",
                text:"Exportar",
                type:"default",
                stylingmode:"contained",
                onClick: (e)=> { this.exportDetails() }
            }
        }
    },
    mounted(){
        //definir fecha
        const yourDate = new Date();
        this.startDate = (yourDate.toISOString().split('T')[0]).replace(/-/g,'/');
        this.stopDate = (yourDate.toISOString().split('T')[0]).replace(/-/g,'/');
    },
    methods:{
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            }
            )
        },
        loadData(){
            this.loadingData = true

            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spAccBalanceChart',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    startDate: this.startDate,
                    stopDate: this.stopDate
                }
            }).then((response) => {
                this.gridData = response.data;
                this.loadingData = false;
            }).catch((error) => {
                console.dir(error.message)
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
                this.loadingData = false
            })
            
        },
        expandAll(){
            this.loadingData = true;
            this.$refs['treelist'].instance.forEachNode(node => {
                this.$refs['treelist'].instance.expandRow(node.key);
            })
            this.loadingData = false;
        },
        collapseAll(){
            this.loadingData = true;
            this.$refs['treelist'].instance.forEachNode(node => {
                this.$refs['treelist'].instance.collapseRow(node.key);
            })
            this.loadingData = false;
        },
        exportData(){
            //Create Excel Instance with 1 worksheet
            var workbook = new ExcelJS.Workbook();
            var workSheet = workbook.addWorksheet(
                'Mayor_'+this.startDate.replace(/\//g,'')+'_'+this.stopDate.replace(/\//g,'')//nombre
            );
            
            //Add header
            var headData = ["Cuenta Contable","Saldo Inicial","Suma del Mes","Saldo Final"];
            workSheet.addRow(headData);
            workSheet.getCell('A1').font = { bold: true };
            workSheet.getCell('B1').font = { bold: true };
            workSheet.getCell('C1').font = { bold: true };
            workSheet.getCell('D1').font = { bold: true };

            //Freeze row 1
            workSheet.views = [
                {state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2'}
            ];

            //Add Data
            this.$refs['treelist'].instance.forEachNode(node => {
                //console.dir(node)
                const fila = [
                    "   ".repeat(node.level) +  node.data.account_name
                    ,node.data.Saldo_Inicial
                    ,node.data.Saldo_Mes
                    ,node.data.Saldo_Final
                ]
                workSheet.addRow(fila)
                
            })

            //AutoAdjust Columns
            workSheet.columns.forEach(function (column, i) {
                var maxLength = 0;
                column["eachCell"]({ includeEmpty: true }, function (cell) {
                    var columnLength = cell.value ? cell.value.toString().length : 10;
                    if (columnLength > maxLength ) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength < 10 ? 10 : maxLength;
            });
            
            //Save File
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Mayor.xlsx');
            })
        },
        openDetails(cellInfo){
            this.detailsVisible = true;
            this.currentAccount = cellInfo.data;
            this.loadDetailsData();
        },
        loadDetailsData(){
            this.currentAccountData = null;
            this.loadingData = true;
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spAccBalanceChartDetails',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    startDate: this.startDate,
                    stopDate: this.stopDate,
                    account_id: this.currentAccount.account_id
                }
            }).then((response) => {
                this.currentAccountData = response.data;
                this.loadingData = false
            }).catch((error) => {
                console.dir(error.message)
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
                this.loadingData = false
            })
        },
        exportDetails(){
            const context = this;
            const workbook = new ExcelJS.Workbook();
            const workSheet = workbook.addWorksheet('DetalleMovimientos');
            const component = this.$refs['detailsGrid'].instance;
            exportDataGrid({
                worksheet: workSheet,
                component: component,
                topLeftCell: { row: 1, column: 1 },
                //customizeCell: ({ gridCell, excelCell }) => { setAlternatingRowsBackground(gridCell, excelCell); }
            }).then(() => {
                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Detalle.xlsx');
                })
            })
        },
        async treeListRowPrepared(e){
            //console.dir(e)
            if(e.data){
                if(e.data.account_has_children==false){
                    e.rowElement.style.fontWeight = 'normal';
                    //e.rowElement.style.backgroundColor = 'lightgreen';
                }
            }
        },
    },
    computed: {
        userCode: { get () { return this.$store.state.main.userCode }  },
        userCompany: { get () { return this.$store.state.main.userCompany }  },
        userColor: { get () { return this.$store.state.main.userColor }  },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
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
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        },
        userMoneyFormat: { get () { 
            let resultado ="#0.000000";
            if(this.$store.state.main.userMoneyFormat==0){ resultado = "#0" }
            if(this.$store.state.main.userMoneyFormat==1){ resultado = "#0.0" }
            if(this.$store.state.main.userMoneyFormat==2){ resultado = "#0.00" }
            if(this.$store.state.main.userMoneyFormat==3){ resultado = "#0.000" }
            if(this.$store.state.main.userMoneyFormat==4){ resultado = "#0.0000" }
            if(this.$store.state.main.userMoneyFormat==5){ resultado = "#0.00000" }
            if(this.$store.state.main.userMoneyFormat==6){ resultado = "#0.000000" }
            return resultado }
        },
    },
    watch: {
        userCompany: function(val){
            this.gridData = [];
        },
        toolbarSearchString: function(val){
            this.$refs['treelist'].instance.searchByText(this.toolbarSearchString);
        }
    }
})
</script>