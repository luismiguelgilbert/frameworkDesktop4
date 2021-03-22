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
            spSelectName: 'spPartnerMasterSelectEdit',
            spUpdateName: 'spPartnerMasterUpdate',
            toolbarTitle: "Socio",
            startTab: 'basic',
            moduleTabs: [
                 { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información del Socio', isTabDisable: false, rootPath:'pages', importPath: 'RootMaster/Partners/PartnersEditBasic.vue' }
                ,{ tabName: 'account', iconName: 'fas fa-book', textLabel: 'Configuración Contable', isTabDisable: false, rootPath:'pages', importPath: 'RootMaster/Partners/PartnersEditAccount.vue' }
                ,{ tabName: 'priceLists', iconName: 'fas fa-tags', textLabel: 'Listas de Precios', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'pricelists', 
                        keyColumn: 'value',  listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_pricelists',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'value', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Lista de Precio', dataField: 'label', listDataField: 'label', dataType: 'string', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', listDataField: 'estado', dataType: 'boolean', visible: true },
                        ],
                    }
                }
                ,{ tabName: 'payterms', iconName: 'fas fa-cash-register', textLabel: 'Formas de Pago', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'payterms', 
                        keyColumn: 'value', listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_payterms',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'value', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Forma de Pago', dataField: 'label', listDataField: 'label', dataType: 'string', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', listDataField: 'estado', dataType: 'boolean', visible: true },
                        ],
                    }
                }
                ,{ tabName: 'picture', iconName: 'fas fa-camera', textLabel: 'Logo del Socio', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormPicture.vue', pictureConfig: { section: 'basic', upload_file_name: 'upload_file_name', attach_id: 'picture_attach_ID'} }
                ,{ tabName: 'contacts', iconName: 'fas fa-address-book', textLabel: 'Contactos del Socio', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'contacts', 
                        keyColumn: 'contactID', 
                        insertAllowed: true, insertType: 'form',  insertList: null,
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'contactID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Nombre', dataField: 'contactName', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Teléfono', dataField: 'mobile', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Correo', dataField: 'mail', dataType: 'string', visible: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Enviar OC', dataField: 'sendPO', dataType: 'boolean', visible: true, defaultValue: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Enviar Ret', dataField: 'sendRET', dataType: 'boolean', visible: true, defaultValue: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Enviar OV', dataField: 'sendSO', dataType: 'boolean', visible: true, defaultValue: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Enviar Factura', dataField: 'sendBILL', dataType: 'boolean', visible: true, defaultValue: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Enviar Guía', dataField: 'sendINV', dataType: 'boolean', visible: true, defaultValue: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', dataType: 'boolean', visible: true },
                        ]
                    }
                }
                ,{ tabName: 'owners', iconName: 'fas fa-user-tie', textLabel: 'Vendedores Asignados', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'owners', 
                        keyColumn: 'sys_user_code', listKeyColumn: 'sys_user_code',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_users',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'sys_user_code', listDataField: 'sys_user_code', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Usuario', dataField: 'sys_user_fullname', listDataField: 'sys_user_fullname', dataType: 'string', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', listDataField: 'estado', dataType: 'boolean', visible: true },
                        ],
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
                { name: 'contacts', filterBy: null, fields: null },
                { name: 'pricelists', filterBy: null, fields: ['value'] },
                { name: 'payterms', filterBy: null, fields: ['value'] },
                { name: 'owners', filterBy: null, fields: ['sys_user_code'] },
                { name: 'files', filterBy: null, fields: ['attach_id'] }
            ],
            //hide Tabs if something happens
            tabStatusChange:[
                { tabName: 'priceLists', dataCheckSection: 'basic', dataCheckField: 'is_customer', dataCheckCondition: 'equal', dataCheckValue: false },
                { tabName: 'owners', dataCheckSection: 'basic', dataCheckField: 'is_customer', dataCheckCondition: 'equal', dataCheckValue: false }
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