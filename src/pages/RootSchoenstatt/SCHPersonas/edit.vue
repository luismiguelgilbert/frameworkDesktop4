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
            spSelectName: 'spSchPersonasSelectEdit',
            spUpdateName: 'spSchPersonasUpdate',
            toolbarTitle: "Persona",
            toolbarTitleName: "basic.sys_user_fullname",
            startTab: 'basic',
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Datos de la Persona', isTabDisable: false, rootPath:'pages', importPath: 'RootSchoenstatt/SCHPersonas/SCHPersonasEditBasicMultiple.vue' },
                { tabName: 'groups', iconName: 'fas fa-building', textLabel: 'Grupos', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'groups', 
                        keyColumn: 'groupID',  listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_groups',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'groupID', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Grupo', dataField: 'groupName', listDataField: 'label', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Ingreso', dataField: 'fechaIngreso', dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Alianza', dataField: 'fechaAlianza',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Santuario', dataField: 'fechaSantuario',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Nombre Santuario', dataField: 'nombreSantuario', dataType: 'string', visible: true },
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
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'País', dataField: 'countryID', dataType: 'number', visible: true, lookupOptions: 'this.editData.lookup_countries' },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Ciudad', dataField: 'cityID', dataType: 'number', visible: true, lookupOptions: 'this.editData.lookup_cities' },
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
                { tabName: 'apostolados', iconName: 'fas fa-pray', textLabel: 'Apostolados', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'apostolados', 
                        keyColumn: 'apostoladoID',  listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_apostolados',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'apostoladoID', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Apostolado', dataField: 'apostoladoName', listDataField: 'label', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Inicio', dataField: 'fechaInicio',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Observaciones', dataField: 'comments', dataType: 'string', visible: true },
                        ],
                    }
                },
                { tabName: 'formaciones', iconName: 'fas fa-chalkboard-teacher', textLabel: 'Formaciones', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'formaciones', 
                        keyColumn: 'formacionID',  listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_formaciones',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'formacionID', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Apostolado', dataField: 'formacionName', listDataField: 'label', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: false, caption: 'Fecha Inicio', dataField: 'fechaInicio',  dataType: 'date', visible: true, format: 'dd-MMM-yyyy' },
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
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Cobertura', dataField: 'jobPlaces', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Descripción del Cargo (Conocimientos)', dataField: 'jobSkills', dataType: 'textArea', visible: true },
                            //{alignment: 'left', allowEditing: true, isDataRequired: true, caption: 'Descripción del Cargo (Conocimientos)', dataField: 'jobSkills', dataType: 'string', visible: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo?', dataField: 'estado', dataType: 'boolean', visible: true, defaultValue: true },
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
                { name: 'groups', filterBy: null, fields: ['groupID','fechaIngreso','fechaAlianza','fechaSantuario','fechaSalida'] },
                { name: 'phones', filterBy: null, fields: ['phoneNumber','tipo'] },
                { name: 'address', filterBy: null, fields: ['countryID','cityID', 'addressName', 'tipo'] },
                { name: 'mails', filterBy: null, fields: ['mailAddress'] },
                { name: 'children', filterBy: null, fields: ['childrenName','sexo', 'birthday'] },
                { name: 'apostolados', filterBy: null, fields: ['apostoladoID','fechaInicio', 'comments'] },
                { name: 'formaciones', filterBy: null, fields: ['formacionID','fechaInicio', 'comments'] },
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