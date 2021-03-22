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
            spSelectName: 'spSysProfilesSelectEdit',
            spUpdateName: 'spSysProfilesUpdate',
            toolbarTitle: "Rol",
            startTab: 'basic',
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información del Item', isTabDisable: false, rootPath:'pages', importPath: 'RootSystem/Roles/RolesEditBasic.vue' },
                { tabName: 'system', iconName: 'fas fa-desktop', textLabel: 'Permisos (Desktop)', isTabDisable: false, rootPath:'pages', importPath: 'RootSystem/Roles/RolesEditLinks.vue' },
                { tabName: 'mobile', iconName: 'fas fa-mobile-alt', textLabel: 'Permisos (Mobile)', isTabDisable: false, rootPath:'pages', importPath: 'RootSystem/Roles/RolesEditLinksMobile.vue' },
                { tabName: 'users', iconName: 'fas fa-users', textLabel: 'Asignar este perfil', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'users', 
                        keyColumn: 'sys_user_code', listKeyColumn: 'sys_user_code',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_users',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'sys_user_code', listDataField: 'sys_user_code', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Login', dataField: 'sys_user_id', listDataField: 'sys_user_id', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Nombres', dataField: 'sys_user_name', listDataField: 'sys_user_name', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Apellidos', dataField: 'sys_user_lastname', listDataField: 'sys_user_lastname', dataType: 'string', visible: true },
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', listDataField: 'estado', dataType: 'boolean', visible: true },
                        ],
                    }
                },
                { tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
                //,{ tabName: 'print', iconName: 'fas fa-print', textLabel: 'Imprimir Documento', isTabDisable: false, rootPath:'components', importPath: 'mainReport/reportComponentDialog' }
                //,{ tabName: 'share', iconName: 'fas fa-envelope', textLabel: 'Enviar Documento', isTabDisable: false, rootPath:'components', importPath: 'mailForm/mailFormDialog' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'ticked_links', filterBy: null, fields: null },
                { name: 'ticked_links_mobile', filterBy: null, fields: null },
                { name: 'users', filterBy: null, fields: ['sys_user_code'] },
                /*
                { name: 'lots', filterBy: null, fields: ['lotID', 'name_es', 'expirationDate', 'warrantyDate'] },
                { name: 'files', filterBy: null, fields: ['attach_id', 'estado'] }
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