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
            spSelectName: 'spCasCasesSelectEdit',
            spUpdateName: 'spCasCasesUpdate',
            toolbarTitle: "Caso",
            startTab: (this.editStatus.editMode=='create'?'basic':'tasks'),
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información del Caso', isTabDisable: false, rootPath:'pages', importPath: 'RootCases/casCasos/casCasosEditBasic.vue' },
                { tabName: 'users', iconName: 'fas fa-users', textLabel: 'Consultores Asignados', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'users', 
                        keyColumn: 'sys_user_code', listKeyColumn: 'value',
                        insertAllowed: this.allow_users, insertType: 'list',  insertList: 'lookup_users',
                        deleteAllowed: this.allow_users,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'sys_user_code', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Nombres', dataField: 'sys_user_fullname', listDataField: 'label', dataType: 'string', visible: true },
                            //{alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Apellidos', dataField: 'sys_user_lastname', listDataField: 'sys_user_lastname', dataType: 'string', visible: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Principal?', dataField: 'isDefault', dataType: 'boolean', visible: true, defaultValue: false },
                        ],
                    }
                },
                { tabName: 'locations', iconName: 'fas fa-map-marked-alt', textLabel: 'Localidades Asignadas', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'locations', 
                        keyColumn: 'value', listKeyColumn: 'value',
                        insertAllowed: this.allow_locations, insertType: 'list',  insertList: 'lookup_locations',
                        deleteAllowed: this.allow_locations,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'value', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Localidad', dataField: 'label', listDataField: 'label', dataType: 'string', visible: true },
                            //{alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Apellidos', dataField: 'sys_user_lastname', listDataField: 'sys_user_lastname', dataType: 'string', visible: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Principal?', dataField: 'isDefault', dataType: 'boolean', visible: true, defaultValue: false },
                        ],
                    }
                },
                { tabName: 'contacts', iconName: 'fas fa-address-book', textLabel: 'Contactos del Socio', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'contacts', 
                        keyColumn: 'contactID', 
                        insertAllowed: this.allow_contacts, insertType: 'form',  insertList: null,
                        deleteAllowed: this.allow_contacts,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'contactID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Nombre', dataField: 'contactName', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Teléfono', dataField: 'mobile', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Correo', dataField: 'mail', dataType: 'string', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', dataType: 'boolean', visible: true },
                        ]
                    }
                },
                { tabName: 'payterms', iconName: 'fas fa-money-check-alt', textLabel: 'Compromisos de Pago', isTabDisable: false, rootPath:'pages', importPath: 'RootCases/casCasos/casCasosEditPayterms.vue' },
                { tabName: 'tasks', iconName: 'fas fa-tasks', textLabel: 'Actividades Realizadas', isTabDisable: (this.editStatus.editMode=='create'?true:false), rootPath:'pages', importPath: 'RootCases/casCasos/casCasosEditTasks.vue' },
                { tabName: 'files', iconName: 'fas fa-paperclip', textLabel: 'Archivos Adjuntos', isTabDisable: false, rootPath:'components', importPath: 'filesView/filesView' },
                { tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
                //,{ tabName: 'print', iconName: 'fas fa-print', textLabel: 'Imprimir Documento', isTabDisable: false, rootPath:'components', importPath: 'mainReport/reportComponentDialog' }
                //,{ tabName: 'share', iconName: 'fas fa-envelope', textLabel: 'Enviar Documento', isTabDisable: false, rootPath:'components', importPath: 'mailForm/mailFormDialog' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'users', filterBy: null, fields: ['sys_user_code', 'isDefault'] },
                { name: 'locations', filterBy: null, fields: ['value', 'isDefault'] },
                { name: 'contacts', filterBy: null, fields: ['contactName', 'mobile', 'mail'] },
                { name: 'payterms', filterBy: null, fields: ['paytermID','typeID', 'contractID', 'docDate', 'amount', 'comments', 'voided'] },
                { name: 'tasks', filterBy: null, fields: ['taskTypeID', 'taskDate', 'taskLength', 'comments', 'nextDate', 'nextDateComments', 'uploaded','value'] },
                { name: 'files', filterBy: null, fields: ['attach_id'] }
                /*
                { name: 'lots', filterBy: null, fields: ['lotID', 'name_es', 'expirationDate', 'warrantyDate'] },
                */
            ],
            //hide Tabs if condition occurs (if editData.[dataCheckSection].[dataCheckField] {dataCheckCondition}  dataCheckValue   ? TRUE > entonces inactivo)
            tabStatusChange:[
                /*
                { tabName: 'priceLists', dataCheckSection: 'basic', dataCheckField: 'is_sales', dataCheckCondition: 'equal', dataCheckValue: false },
                { tabName: 'bom', dataCheckSection: 'basic', dataCheckField: 'systemType', dataCheckCondition: 'distinct', dataCheckValue: 3 },
                { tabName: 'bins', dataCheckSection: 'basic', dataCheckField: 'systemType', dataCheckCondition: 'equal', dataCheckValue: 1 }
                */
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
        allow_users: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].security.filter(x=>x.label=='allow_users').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_locations: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].security.filter(x=>x.label=='allow_locations').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_contacts: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].security.filter(x=>x.label=='allow_contacts').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
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