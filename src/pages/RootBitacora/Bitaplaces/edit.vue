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
            spSelectName: 'spBitaplacesSelectEdit',
            spUpdateName: 'spBitaplacesUpdate',
            toolbarTitle: "Punto de Control",
            startTab: 'basic',
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información de Punto de Control', isTabDisable: false, rootPath:'pages', importPath: 'RootBitacora/Bitaplaces/BitaplacesEditBasic.vue' },
                { tabName: 'picture', iconName: 'fas fa-camera', textLabel: 'Foto de Perfil', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormPicture.vue', pictureConfig: { section: 'basic', upload_file_name: 'upload_file_name', attach_id: 'picture_attach_ID'} },
                { tabName: 'users', iconName: 'fas fa-users', textLabel: 'Usuarios Asignados', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'users', 
                        keyColumn: 'sys_user_code',  listKeyColumn: 'sys_user_code',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_users',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'sys_user_code', listDataField: 'sys_user_code', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Nombres', dataField: 'sys_user_name', listDataField: 'sys_user_name', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Apellidos', dataField: 'sys_user_lastname', listDataField: 'sys_user_lastname', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Login', dataField: 'sys_user_id', listDataField: 'sys_user_id', dataType: 'string', visible: true },
                        ],
                    }
                },
                { tabName: 'cars', iconName: 'fas fa-truck', textLabel: 'Vehículos Asignados', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'cars', 
                        keyColumn: 'carID',  listKeyColumn: 'carID',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_cars',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'carID', listDataField: 'carID', dataType: 'number', visible: false },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Placa', dataField: 'placa', listDataField: 'placa', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Marca', dataField: 'marca', listDataField: 'marca', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Modelo', dataField: 'modelo', listDataField: 'modelo', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Color', dataField: 'color', listDataField: 'color', dataType: 'string', visible: true },
                        ],
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
                { name: 'users', filterBy: null, fields: ['sys_user_code'] },
                { name: 'cars', filterBy: null, fields: ['carID'] },
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
    },

})
</script>