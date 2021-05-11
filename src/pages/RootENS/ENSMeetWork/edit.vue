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
            spSelectName: 'spEnsWorkMeetSelectEdit',
            spUpdateName: 'spEnsWorkMeetUpdate',
            toolbarTitle: "Reunión de Trabajo",
            startTab: 'basic',
            disableSaveButton: true,//hides save button from dropwn save and dropwn down save and close
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información de la Reunión', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeetWork/ENSMeetWorkEditBasic.vue' },
                { tabName: 'ensWorkMeetPersonas', iconName: 'fas fa-users', textLabel: 'Asistentes', isTabDisable: false, rootPath:'components', importPath: 'editForm/editFormGrid.vue',
                    tabConfig: { 
                        dataName: 'ensWorkMeetPersonas',
                        keyColumn: 'sys_user_code', listKeyColumn: 'sys_user_code',
                        insertAllowed: true, insertType: 'list',  insertList: 'lookup_users',
                        deleteAllowed: true,
                        columns: [
                            //'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime'
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Código', dataField: 'sys_user_code', listDataField: 'sys_user_code', dataType: 'number', visible: false, },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Nombres', dataField: 'sys_user_name', listDataField: 'sys_user_name', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Apellidos', dataField: 'sys_user_lastname', listDataField: 'sys_user_lastname', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Espos@', dataField: 'relatedName', listDataField: 'relatedName', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Equipo Base', dataField: 'teamName', listDataField: 'teamName', dataType: 'string', visible: true },
                            {alignment: 'left', allowEditing: false, isDataRequired: true, caption: 'Servicios', dataField: 'servicios', listDataField: 'servicios', dataType: 'string', visible: true },
                            //{alignment: 'right', allowEditing: true, isDataRequired: true, caption: 'Cantidad', dataField: 'materialQuantity', dataType: 'number', visible: true, defaultValue: 1 },//en el lookup NO va cantidad
                            //{alignment: 'center', allowEditing: true, isDataRequired: true, caption: 'Activo', dataField: 'estado', listDataField: 'estado', dataType: 'boolean', visible: true },
                        ],
                    }
                },
                //{ tabName: 'prepared', iconName: 'fas fa-tasks', textLabel: 'Preparación de la Reunión', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeet/ENSMeetEditPrepared.vue' },
                //{ tabName: 'attend', iconName: 'fas fa-users', textLabel: 'Asistencia de Equipistas', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeetWork/ENSMeetWorkEditAsistencia.vue' },
                { tabName: 'files', iconName: 'fas fa-camera', textLabel: 'Fotos y Archivos', isTabDisable: false, rootPath:'components', importPath: 'filesView/filesView' },
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'ensWorkMeetPersonas', filterBy: null, fields: ['sys_user_code'] },
                //{ name: 'ensMeetTeamPreparePersonas', filterBy: null, fields: ['sys_user_code','attended'] },
                //{ name: 'ensMeetTeamSocialPersonas', filterBy: null, fields: ['sys_user_code','attended'] },
                //{ name: 'ensEvents', filterBy: null, fields: ['value','eventTypeID','eventName','eventPlace','eventComments','startDate','startTime'] },
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