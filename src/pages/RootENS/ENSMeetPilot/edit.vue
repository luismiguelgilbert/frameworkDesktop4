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
            spSelectName: 'spEnsPilotMeetSelectEdit',
            spUpdateName: 'spEnsPilotMeetUpdate',
            toolbarTitle: "Reunión de Pilotaje",
            startTab: 'basic',
            disableSaveButton: true,//hides save button from dropwn save and dropwn down save and close
            moduleTabs: [
                { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información de la Reunión', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeetPilot/ENSMeetPilotEditBasic.vue' },
                //{ tabName: 'prepared', iconName: 'fas fa-tasks', textLabel: 'Preparación de la Reunión', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeet/ENSMeetEditPrepared.vue' },
                { tabName: 'attend', iconName: 'fas fa-users', textLabel: 'Asistencia de Equipistas', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeetPilot/ENSMeetPilotEditAsistencia.vue' },
                { tabName: 'priest', iconName: 'fas fa-user-nurse', textLabel: 'Participación del Consiliario', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeetPilot/ENSMeetPilotEditPriest.vue' },
                { tabName: 'moments', iconName: 'fas fa-stream', textLabel: 'Momentos de la Reunión', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeetPilot/ENSMeetPilotEditMoments.vue' },
                //{ tabName: 'social', iconName: 'fas fa-birthday-cake', textLabel: 'Reunión Social', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeetPilot/ENSMeetEditSocial.vue' },
                //{ tabName: 'schedule', iconName: 'fas fa-calendar-alt', textLabel: 'Agendar Siguiente Reunión', isTabDisable: false, rootPath:'pages', importPath: 'RootENS/ENSMeetPilot/ENSMeetEditCalendar.vue' },
                { tabName: 'files', iconName: 'fas fa-camera', textLabel: 'Fotos y Archivos', isTabDisable: false, rootPath:'components', importPath: 'filesView/filesView' },
                //{ tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
            ],
            //name es el nombre del property en el editData (vuex)
            //filterBY sirve para enviar al server solamente registros donde el campo filtrado sea verdadero
            //fields sirve para enviar específicamente los campos indicados (si es null entonces envía todos)
            editDataSaveProperties: [
                { name: 'basic', filterBy: null, fields: null },
                { name: 'ensPilotMeetPersonas', filterBy: null, fields: ['sys_user_code','attended','absentReasonID'] },
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