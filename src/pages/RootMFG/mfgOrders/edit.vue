<template>
    <editFormComponent 
        v-if="editReady"
        ref="editFormComponent" 
        :moduleName="moduleName"
        @onLoadedData="updateTabStatus"
        />
</template>
<script>
import editFormComponent from '../../../components/editForm/editForm'

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components:{
        editFormComponent: editFormComponent
    },
    mounted(){//NO debe ser created, porque aun NO estaría creado el componente editForm
        let newEditConfig = {
            spSelectName: 'spMfgOrdersSelectEdit',
            spUpdateName: 'spMfgOrdersUpdate',
            toolbarTitle: "Orden de Producción",
            startTab: 'basic',
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información de Orden', isTabDisable: false, rootPath:'pages', importPath: 'RootMFG/mfgOrders/mfgOrdersEditBasic.vue' },
                { tabName: 'locations', iconName: 'fas fa-shopping-cart', textLabel: 'Líneas de Producción', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'locations', 
                        keyColumn: 'locationID',  listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_mfgLocations',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'locationID', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Línea de Producción', dataField: 'name_es', listDataField: 'label', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Desde', dataField: 'startDate', dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Hasta', dataField: 'stopDate', dataType: 'date', visible: true, format: 'dd-MMM-yyyy' }
                        ],
                    }
                },
                { tabName: 'budget', iconName: 'fas fa-file-invoice-dollar', textLabel: 'Presupuesto de Insumos', isTabDisable: false, rootPath:'pages', importPath: 'RootMFG/mfgOrders/mfgOrdersEditBudget.vue' },
                { tabName: 'expense', iconName: 'fas fa-dollar-sign', textLabel: 'Gastos de Producción', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'expense', 
                        keyColumn: 'lineID', 
                        insertAllowed: true, insertType: 'form',  insertList: null,
                        deleteAllowed: true,
                        summarycolumns: [{columnName: 'lineSubtotal', summaryType: 'sum'}],
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'lineID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Descripción', dataField: 'comments', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha', dataField: 'expenseDate', dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'right', allowEditing: true, isDataRequired: true, caption: 'Monto', dataField: 'lineSubtotal', dataType: 'number', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', dataType: 'boolean', visible: true, defaultValue: true },
                        ]
                    }
                },
                { tabName: 'stats', iconName: 'fas fa-calculator', textLabel: 'Resumen de OP', isTabDisable: false, rootPath:'pages', importPath: 'RootMFG/mfgOrders/mfgOrdersEditStats.vue' },
                { tabName: 'deliveries', iconName: 'fas fa-box', textLabel: 'Entregas de PT', isTabDisable: false, rootPath:'pages', importPath: 'RootMFG/mfgOrders/mfgOrdersEditDeliveries.vue' },
                { tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'locations', filterBy: null, fields: ['lineID','locationID','startDate','stopDate'] },
                { name: 'budget', filterBy: null, fields: ['lineID','invID','quantity','price','lineSubtotal','lineDiscntPrcnt','lineDiscntAmount','lineUntaxed','comments'] },
                { name: 'expense', filterBy: null, fields: ['lineID','lineSubtotal','comments','expenseDate'] },
            ],
            //hide Tabs if something happens
            tabStatusChange:[
                //{ tabName: 'priceLists', dataCheckSection: 'basic', dataCheckField: 'is_customer', dataCheckCondition: 'equal', dataCheckValue: false },
            ]
        }
        this.editConfig = newEditConfig;
        this.editReady = true;
    },
    data () {
        return {
            //Confirmed
            router: this.$router,
            editReady: false,
        }
    },
    methods:{
        updateTabStatus(){
            //Si es que el dato de la [sección][columna] es igual al valor, entonces deshabilita la pestaña
            let newConfig = JSON.parse(JSON.stringify(this.editConfig));
            newConfig.moduleTabs.map(x=>{
                if(this.editConfig.tabStatusChange.some(y=>y.tabName == x.tabName)){
                    let check = this.editConfig.tabStatusChange.find(y=>y.tabName == x.tabName)
                    if(check.dataCheckCondition=='equal'){
                        if(this.editData[check.dataCheckSection][check.dataCheckField]==check.dataCheckValue){
                            x.isTabDisable = true;
                        }
                    }
                    if(check.dataCheckCondition=='distinct'){
                        if(this.editData[check.dataCheckSection][check.dataCheckField]!=check.dataCheckValue){
                            x.isTabDisable = true;
                        }
                    }
                }
            })
            this.editConfig = newConfig;
        }
    },
    computed:{
        rptName: { get () { return this.$store.state[this.moduleName].rptName }, },
        rptLink: { get () { return this.$store.state[this.moduleName].rptLink }, },
        rptLinkCompany: { get () { return this.$store.state[this.moduleName].rptLinkCompany }, },
        rptType: { get () { return this.$store.state[this.moduleName].rptType }, },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
        editConfig: {
            get () { return this.$store.state[this.moduleName].editConfig },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editConfig', value: val})  }
        },
        editData: {
            get () { return this.$store.state[this.moduleName].editData },
        },
    },

})
</script>