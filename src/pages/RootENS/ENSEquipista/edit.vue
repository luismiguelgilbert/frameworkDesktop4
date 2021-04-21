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
            
        ////specific in this module
         //row_id: this.editStatus.editMode=='create'?this.editStatus.copyRecord:this.editStatus.navigateToRecord,
        let newEditStatus = JSON.parse(JSON.stringify(this.editStatus));
        newEditStatus.editMode = 'edit';
        newEditStatus.navigateToRecord = this.userCode;
        this.editStatus = newEditStatus;
        this.columnKeyName = 'sys_user_code';
        let newEditConfig = {
            hideCloseButton: true,//specific in this module
            spSelectName: 'spEnsPersonaSelectEdit', //notar que es específico para este módulo (en vez de spEnsPersonasSelectEdit que lleva s)
            spUpdateName: 'spEnsPersonasUpdate',
            toolbarTitle: "Mi Perfil",
            startTab: 'basic',
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Datos del Equipista', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSEquipista/ENSEquipistaEditBasic.vue' },
                { tabName: 'teams', iconName: 'fas fa-users', textLabel: 'Equipo', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'teams', 
                        keyColumn: 'teamID',  listKeyColumn: 'value',
                        insertAllowed: false, insertType: 'list',  insertList: 'lookup_teams',
                        deleteAllowed: false,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'teamID', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Equipo', dataField: 'label', listDataField: 'label', dataType: 'string', visible: true, },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Ciudad', dataField: 'nivel_0', listDataField: 'nivel_0', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Sector', dataField: 'nivel_1', listDataField: 'nivel_1', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Inicio Pilotaje', dataField: 'fechaPilotaje', dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Acogida', dataField: 'fechaAlianza',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Salida', dataField: 'fechaSalida',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                        ],
                    }
                },
                { tabName: 'phones', iconName: 'fas fa-mobile', textLabel: 'Teléfonos', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'phones', 
                        keyColumn: 'phoneID',  listKeyColumn: null,
                        insertAllowed: true, insertType: 'form',  insertList: null,
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'phoneID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Número Telefónico', dataField: 'phoneNumber', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Tipo', dataField: 'tipo', dataType: 'number', visible: true, lookupOptions: [{value: 1, label: 'Domicilio'}, {value: 2, label: 'Celular'} ] },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Principal?', dataField: 'is_default', dataType: 'boolean', visible: true, defaultValue: false },
                        ],
                    }
                },
                { tabName: 'address', iconName: 'fas fa-map-marker-alt', textLabel: 'Direcciones', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'address', 
                        keyColumn: 'addressID',  listKeyColumn: null,
                        insertAllowed: true, insertType: 'form',  insertList: null,
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'addressID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Dirección', dataField: 'addressName', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'País', dataField: 'countryID', dataType: 'number', visible: true, lookupOptions: this.editData.lookup_countries },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Ciudad', dataField: 'cityID', dataType: 'number', visible: true, lookupOptions: this.editData.lookup_cities },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Tipo', dataField: 'tipo', dataType: 'number', visible: true, lookupOptions: [{value: 1, label: 'Trabajo'}, {value: 2, label: 'Domicilio'}] },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Principal?', dataField: 'is_default', dataType: 'boolean', visible: true, defaultValue: false },
                        ],
                    }
                },
                { tabName: 'mails', iconName: 'fas fa-envelope', textLabel: 'Correos', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'mails', 
                        keyColumn: 'mailID',  listKeyColumn: null,
                        insertAllowed: true, insertType: 'form',  insertList: null,
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'mailID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Correo Electrónico', dataField: 'mailAddress', dataType: 'string', visible: true },
                        ],
                    }
                },
                { tabName: 'children', iconName: 'fas fa-child', textLabel: 'Hijos', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'children', 
                        keyColumn: 'childrenID',  listKeyColumn: null,
                        insertAllowed: true, insertType: 'form',  insertList: null,
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'childrenID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Nombre Completo', dataField: 'childrenName', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Sexo', dataField: 'sexo', dataType: 'number', visible: true, lookupOptions: [{value: 1, label: 'Hombre'}, {value: 0, label: 'Mujer'}] },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Nacimiento', dataField: 'birthday',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                        ],
                    }
                },
                { tabName: 'servicios', iconName: 'fas fa-pray', textLabel: 'Servicios', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'servicios', 
                        keyColumn: 'recordID',  listKeyColumn: 'value',
                        insertAllowed: false, insertType: 'listRepeated',  insertList: 'lookup_servicios',
                        deleteAllowed: false,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            //{alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'recordID', dataField: 'recordID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'servicioID', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Servicio', dataField: 'servicioName', listDataField: 'label', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Comentarios', listDataField: 'comments', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Inicio', dataField: 'fechaInicio',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Fin', dataField: 'fechaSalida',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Observaciones', dataField: 'comments', dataType: 'string', visible: true },
                        ],
                    }
                },
                { tabName: 'jobs', iconName: 'fas fa-briefcase', textLabel: 'Bolsa de Trabajo', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'jobs', 
                        keyColumn: 'recordID',  listKeyColumn: null,
                        insertAllowed: true, insertType: 'form',  insertList: null,
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime' | 'textArea'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'recordID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Compañía', dataField: 'companyName', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Cargo', dataField: 'jobPosition', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Desde', dataField: 'jobStartDate',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Hasta', dataField: 'jobStopDate',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Cobertura (Ciudades)', dataField: 'jobPlaces', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Descripción del Cargo (Conocimientos)', dataField: 'jobSkills', dataType: 'textArea', visible: true },
                            //{alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Descripción del Cargo (Conocimientos)', dataField: 'jobSkills', dataType: 'string', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo?', dataField: 'estado', dataType: 'boolean', visible: true, defaultValue: true },
                        ],
                    }
                },
                //porque sale del usuario, no de este módulo { tabName: 'picture', iconName: 'fas fa-camera', textLabel: 'Foto de Perfil', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormPicture.vue', pictureConfig: { section: 'basic', upload_file_name: 'userPhoto', attach_id: 'picture_attach_ID'} },
                { tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'teams', filterBy: null, fields: ['teamID','fechaPilotaje','fechaAlianza','fechaSalida'] },
                { name: 'phones', filterBy: null, fields: ['phoneNumber','tipo'] },
                { name: 'address', filterBy: null, fields: ['countryID','cityID', 'addressName', 'tipo'] },
                { name: 'mails', filterBy: null, fields: ['mailAddress'] },
                { name: 'children', filterBy: null, fields: ['childrenName','sexo', 'birthday'] },
                { name: 'servicios', filterBy: null, fields: ['servicioID','fechaInicio', 'fechaSalida', 'comments'] },
                { name: 'jobs', filterBy: null, fields: ['companyName','jobPosition', 'jobStartDate','jobStopDate','jobSkills','jobPlaces'] }
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
        userCode: { get () { return this.$store.state.main.userCode } },
        columnKeyName: {
            get () { return this.$store.state[this.moduleName].columnKeyName },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnKeyName', value: val}) }
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