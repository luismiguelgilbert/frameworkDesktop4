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
            spSelectName: 'spmktMFGRetSelectEdit',
            spUpdateName: 'spmktMFGRetUpdate',
            toolbarTitle: "Devolución de Insumos",
            toolbarTitleName: "basic.headerID",
            startTab: 'basic',
            splitterModel: 230,
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Datos de la Orden', isTabDisable: false, rootPath:'pages', importPath: 'RootMFG/mktMFGreturn/mktMFGreturnEditBasic.vue' },
                { tabName: 'lines', iconName: 'fas fa-list-ol', textLabel: 'Items Pedidos', isTabDisable: false, rootPath:'pages', importPath: 'RootMFG/mktMFGreturn/mktMFGreturnEditLines.vue' },
                { tabName: 'status', iconName: 'fas fa-shipping-fast', textLabel: 'Mi Pedido', isTabDisable: false, rootPath:'pages', importPath: 'RootMFG/mktMFGreturn/mktMFGreturnEditWH.vue' },
                //{ tabName: 'print', iconName: 'fas fa-print', textLabel: 'Imprimir Documento', isTabDisable: false, rootPath:'components', importPath: 'mainReport/reportComponentDialog' },
                //{ tabName: 'print', iconName: 'fas fa-print', textLabel: 'Ver Documento', isTabDisable: false, rootPath:'components', importPath: 'mainReport/reportComponentPDF' },
                //{ tabName: 'share', iconName: 'fas fa-envelope', textLabel: 'Enviar Documento', isTabDisable: false, rootPath:'components', importPath: 'mailForm/mailFormDialog' },
                { tabName: 'files', iconName: 'fas fa-paperclip', textLabel: 'Archivos Adjuntos', isTabDisable: false, rootPath:'components', importPath: 'filesView/filesView' },
                { tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'lines', filterBy: null, fields: null },
                { name: 'files', filterBy: null, fields: ['attach_id'] },
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