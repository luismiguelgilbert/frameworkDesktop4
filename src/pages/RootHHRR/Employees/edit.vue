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
            spSelectName: 'spSysUsersSelectEdit',
            spUpdateName: 'spSysUsersUpdate',
            toolbarTitle: "Usuario",
            startTab: 'basic',
            moduleTabs: [
                 { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información del Usuario', isTabDisable: false, rootPath:'pages', importPath: 'RootSystem/Users/UsersEditBasic.vue' },
                 { tabName: 'system', iconName: 'fas fa-cog', textLabel: 'Configuración', isTabDisable: false, rootPath:'pages', importPath: 'RootSystem/Users/UsersEditSystem.vue' },
                 { tabName: 'password', iconName: 'fas fa-key', textLabel: 'Contraseña', isTabDisable: false, rootPath:'pages', importPath: 'RootSystem/Users/UsersEditPassword.vue' },
                 { tabName: 'companies', iconName: 'fas fa-building', textLabel: 'Acceso a Empresas', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'companies', 
                        keyColumn: 'value',  listKeyColumn: 'value',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_companies',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'value', listDataField: 'value', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Compañía', dataField: 'label', listDataField: 'label', dataType: 'string', visible: true },
                            {alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Principal?', dataField: 'is_default', dataType: 'boolean', visible: true, defaultValue: false },
                        ],
                    }
                },
                { tabName: 'picture', iconName: 'fas fa-camera', textLabel: 'Foto de Perfil', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormPicture.vue', pictureConfig: { section: 'basic', upload_file_name: 'userPhoto', attach_id: 'picture_attach_ID'} },
                { tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'system', filterBy: null, fields: null },
                { name: 'password', filterBy: null, fields: null },
                { name: 'companies', filterBy: null, fields: ['value', 'is_default'] }
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