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
            spSelectName: 'spInvMasterSelectEdit',
            spUpdateName: 'spInvMasterUpdate',
            toolbarTitle: "Item",
            startTab: 'basic',
            moduleTabs: [
                 { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información del Item', isTabDisable: false, rootPath:'pages', importPath: 'RootMaster/Items/ItemsEditBasic.vue' }
                ,{ tabName: 'picture', iconName: 'fas fa-camera', textLabel: 'Logo del Item', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormPicture.vue', pictureConfig: { section: 'basic', upload_file_name: 'upload_file_name', attach_id: 'picture_attach_ID'} }
                ,{ tabName: 'account', iconName: 'fas fa-book', textLabel: 'Configuración Contable', isTabDisable: false, rootPath:'pages', importPath: 'RootMaster/Items/ItemsEditAccount.vue' }
                ,{ tabName: 'taxes', iconName: 'fas fa-percent', textLabel: 'Impuestos', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'taxes', 
                        keyColumn: 'value', listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_taxes',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'value', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Impuesto', dataField: 'short_name_es', listDataField: 'short_name_es', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Descripción', dataField: 'label', listDataField: 'label', dataType: 'string', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', listDataField: 'estado', dataType: 'boolean', visible: true },
                        ],
                    }
                },
                { tabName: 'priceLists', iconName: 'fas fa-tags', textLabel: 'Listas de Precios', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'pricelists', 
                        keyColumn: 'pricelistID',  listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_pricelists',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'pricelistID', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Lista de Precio', dataField: 'name_es', listDataField: 'label', dataType: 'string', visible: true },
                            {alignment: 'right', allowEditing: true, isDataRequired: true, caption: 'Precio Venta', dataField: 'sales_price', dataType: 'number', visible: true, defaultValue: 0 },//en el lookup NO va cantidad
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', listDataField: 'estado', dataType: 'boolean', visible: true },
                        ],
                    }
                }
                ,{ tabName: 'partners', iconName: 'fas fa-shopping-cart', textLabel: 'Proveedores Sugeridos', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'partners', 
                        keyColumn: 'partnerID',  listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_partners',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'partnerID', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Proveedor', dataField: 'name_es', listDataField: 'label', dataType: 'string', visible: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Preferido?', dataField: 'is_prefered', dataType: 'boolean', visible: true, defaultValue: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Código del Proveedor', dataField: 'catalog_code', dataType: 'string', visible: true },//en el lookup NO va
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Nombre del Item', dataField: 'catalog_name', dataType: 'string', visible: true },//en el lookup NO va
                        ],
                    }
                }
                ,{ tabName: 'bins', iconName: 'fas fa-warehouse', textLabel: 'Perchas Asignadas', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'bins', 
                        keyColumn: 'combinedID', listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_bins',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'combinedID', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'whID', dataField: 'whID', listDataField: 'whID', dataType: 'string', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'binID', dataField: 'binID', listDataField: 'binID', dataType: 'string', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Bodega', dataField: 'whName', listDataField: 'whName', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Percha', dataField: 'binName', listDataField: 'binName', dataType: 'string', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', listDataField: 'estado', dataType: 'boolean', visible: true },
                        ],
                    }
                }
                ,{ tabName: 'bom', iconName: 'fas fa-boxes', textLabel: 'Receta (Bill of Materials)', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'bom',
                        keyColumn: 'materialID', listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_items',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'materialID', listDataField: 'value', dataType: 'number', visible: false, },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Item', dataField: 'name_es', listDataField: 'label', dataType: 'string', visible: true },
                            {alignment: 'right', allowEditing: true, isDataRequired: true, caption: 'Cantidad', dataField: 'materialQuantity', dataType: 'number', visible: true, defaultValue: 1 },//en el lookup NO va cantidad
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', listDataField: 'estado', dataType: 'boolean', visible: true },
                        ],
                    }
                }
                ,{ tabName: 'lots', iconName: 'fas fa-barcode', textLabel: 'Lotes y Series', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'lots', 
                        keyColumn: 'lotID', 
                        insertAllowed: true, insertType: 'form',  insertList: null,
                        deleteAllowed: false,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'lotID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Lote', dataField: 'name_es', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Expiración', dataField: 'expirationDate', dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Garantía', dataField: 'warrantyDate', dataType: 'date', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', dataType: 'boolean', visible: true, defaultValue: true },
                        ]
                    }
                }
                ,{ tabName: 'files', iconName: 'fas fa-paperclip', textLabel: 'Archivos Adjuntos', isTabDisable: false, rootPath:'components', importPath: 'filesView/filesView' }
                ,{ tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
                //,{ tabName: 'print', iconName: 'fas fa-print', textLabel: 'Imprimir Documento', isTabDisable: false, rootPath:'components', importPath: 'mainReport/reportComponentDialog' }
                //,{ tabName: 'share', iconName: 'fas fa-envelope', textLabel: 'Enviar Documento', isTabDisable: false, rootPath:'components', importPath: 'mailForm/mailFormDialog' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'bom', filterBy: null, fields: ['materialID', 'materialQuantity'] },
                { name: 'taxes', filterBy: null, fields: ['value'] },
                { name: 'partners', filterBy: null, fields: ['partnerID', 'is_prefered', 'catalog_code', 'catalog_name'] },
                { name: 'pricelists', filterBy: null, fields: ['pricelistID', 'sales_price'] },
                { name: 'lots', filterBy: null, fields: ['lotID', 'name_es', 'expirationDate', 'warrantyDate'] },
                { name: 'bins', filterBy: null, fields: ['whID', 'binID'] },
                { name: 'files', filterBy: null, fields: ['attach_id', 'estado'] }
            ],
            //hide Tabs if condition occurs (if editData.[dataCheckSection].[dataCheckField] {dataCheckCondition}  dataCheckValue   ? TRUE > entonces inactivo)
            tabStatusChange:[
                { tabName: 'priceLists', dataCheckSection: 'basic', dataCheckField: 'is_sales', dataCheckCondition: 'equal', dataCheckValue: false },
                { tabName: 'partners', dataCheckSection: 'basic', dataCheckField: 'is_purchase', dataCheckCondition: 'equal', dataCheckValue: false },
                { tabName: 'bom', dataCheckSection: 'basic', dataCheckField: 'systemType', dataCheckCondition: 'distinct', dataCheckValue: 3 },
                { tabName: 'lots', dataCheckSection: 'basic', dataCheckField: 'systemType', dataCheckCondition: 'distinct', dataCheckValue: 4 },
                { tabName: 'bins', dataCheckSection: 'basic', dataCheckField: 'systemType', dataCheckCondition: 'equal', dataCheckValue: 1 }
                
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
        },
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