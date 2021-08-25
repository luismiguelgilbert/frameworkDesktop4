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
            spSelectName: 'spSysModulesSelectEdit',
            spUpdateName: 'spSysModulesUpdate',
            toolbarTitle: "Módulo",
            toolbarTitleName: "basic.link_name",
            startTab: 'basic',
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-database', textLabel: 'Información del Módulo', isTabDisable: false, rootPath:'pages', importPath: 'RootSystem/Modules/ModulesEditBasic.vue' },
                { tabName: 'columns', iconName: 'fas fa-columns', textLabel: 'Columnas', isTabDisable: false, rootPath:'pages', importPath: 'RootSystem/Modules/ModulesEditColumns.vue' },
                { tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'columns', filterBy: null, fields: null },
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