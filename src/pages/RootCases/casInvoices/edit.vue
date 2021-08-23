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
            spSelectName: 'spCasInvoicesSelectEdit',
            spUpdateName: 'spCasInvoicesUpdate',
            toolbarTitle: "Factura",
            startTab: 'basic',
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información Factura', isTabDisable: false, rootPath:'pages', importPath: 'RootCases/casInvoices/casInvoicesEditBasic.vue' },
                { tabName: 'payterms', iconName: 'fas fa-money-check-alt', textLabel: 'Pagar Compromisos', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'payterms', 
                        keyColumn: 'rowID',  listKeyColumn: 'rowID',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_payterms',
                        deleteAllowed: true,
                        summarycolumns: [{columnName: 'amount', summaryType: 'sum'}],
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'rowID', listDataField: 'rowID', dataType: 'string', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código Caso', dataField: 'caseID', listDataField: 'caseID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código Compromiso', dataField: 'paytermID', listDataField: 'paytermID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Caso', dataField: 'caseName', listDataField: 'caseName', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Observaciones', listDataField: 'comments', dataType: 'string', visible: true },
                            {alignment: 'right', allowEditing: true, isDataRequired: true, caption: 'Monto', dataField: 'amount', listDataField: 'amount', dataType: 'number', visible: true, format: 'userMoneyFormat' },
                        ],
                    }
                },
                { tabName: 'payments', iconName: 'fas fa-money-bill-alt', textLabel: 'Pagos Recibidos', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'payments', 
                        keyColumn: 'paymentID', 
                        insertAllowed: true, insertType: 'form',  insertList: null,
                        deleteAllowed: true,
                        summarycolumns: [{columnName: 'amount', summaryType: 'sum'}],
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'paymentID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Fecha', dataField: 'paymentDate', dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'right', allowEditing: true, isDataRequired: true, caption: 'Monto', dataField: 'amount', dataType: 'number', visible: true, format: 'userMoneyFormat' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Comentario', dataField: 'comments', dataType: 'string', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Anulado?', dataField: 'voided', dataType: 'boolean', visible: true },
                        ]
                    }
                },
                { tabName: 'files', iconName: 'fas fa-paperclip', textLabel: 'Archivos Adjuntos', isTabDisable: false, rootPath:'components', importPath: 'filesView/filesView' },
                { tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'payterms', filterBy: null, fields: ['caseID','paytermID', 'amount'] },
                { name: 'payments', filterBy: null, fields: ['paymentDate','amount', 'amount'] },
                { name: 'files', filterBy: null, fields: ['attach_id'] }
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
        lookup_payterms: {
            get () { return this.$store.state[this.moduleName].editData.lookup_payterms },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_payterms', value: val}) }
        },
    },

})
</script>