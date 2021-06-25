<template>
    <editFormComponent 
        v-if="editReady"
        ref="editFormComponent" 
        :moduleName="moduleName"
        />
</template>
        <!--:toolbarTitle="toolbarTitle"
        :moduleTabs="moduleTabs"
        :startTab="startTab"
        :rptName="rptName"
        :rptLink="rptLink"
        :rptLinkCompany="rptLinkCompany"
        :rptType="rptType"
        @loadData="loadData"-->
<script>
//import Vue from 'vue';
//import Vuex from 'vuex';
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
            spSelectName: 'spPartnerMasterSelectEdit',
            toolbarTitle: "Socio",
            moduleTabs: [
                 { tabName: 'basic', iconName: 'fas fa-info-circle', textLabel: 'Información del Socio', isTabDisable: false, rootPath:'pages', importPath: 'RootMaster/Partners/PartnersEditBasic.vue' }
                ,{ tabName: 'account', iconName: 'fas fa-book', textLabel: 'Configuración Contable', isTabDisable: false, rootPath:'pages', importPath: 'RootMaster/Partners/PartnersEditAccount.vue' }
                ,{ tabName: 'picture', iconName: 'fas fa-camera', textLabel: 'Logo del Socio', isTabDisable: false, rootPath:'pages', importPath: 'RootMaster/Partners/PartnersEditPicture.vue' }
                ,{ tabName: 'contacts', iconName: 'fas fa-address-book', textLabel: 'Contactos del Socio', isTabDisable: false, rootPath:'pages', importPath: 'RootMaster/Partners/PartnersEditContacts.vue' }
                ,{ tabName: 'owners', iconName: 'fas fa-user-tie', textLabel: 'Vendedores Asignados', isTabDisable: false, rootPath:'pages', importPath: 'RootMaster/Partners/PartnersEditSales.vue' }
                ,{ tabName: 'files', iconName: 'fas fa-paperclip', textLabel: 'Archivos Adjuntos', isTabDisable: false, rootPath:'components', importPath: 'filesView/filesView' }
                ,{ tabName: 'history', iconName: 'fas fa-history', textLabel: 'Auditoría de Cambios', isTabDisable: false, rootPath:'components', importPath: 'historyView/historyView' }
                //,{ tabName: 'print', iconName: 'fas fa-print', textLabel: 'Imprimir Documento', isTabDisable: false, rootPath:'components', importPath: 'mainReport/reportComponentDialog' }
                //,{ tabName: 'share', iconName: 'fas fa-envelope', textLabel: 'Enviar Documento', isTabDisable: false, rootPath:'components', importPath: 'mailForm/mailFormDialog' }
            ],
            startTab: 'basic'
        }
        this.editConfig = newEditConfig;
        this.editReady = true;
    },
    data () {
        return {
            //Confirmed
            router: this.$router,
            editReady: false,
            ///////////////////////////////////////////
            //Yet to be confirmed
            //,tab: 'basic'/*'basic'*/, splitterModel: 250
            //,reportComponent_isVisible: false
            //,reportComponent_isFullSize: true
            //,reportComponent_linkName: "mktPO" //custom: report name in SQL Report Server (BI Server)
            //,reportComponent_shouldAddCompany: true //custom: when "true" reportComponent will add _1 to linkName
            //,reportComponent_reportName: "Orden de Compra" //custom
            //,reportComponent_reportType: "ssrs" // custom String "ssrs" or "pbirs"
        }
    },
  
  methods:{
    saveData(shouldReload){
        try{
            //this.loadingData = true
            let promise1 = this.$refs.basicComponent.$refs.formulario.validate() //valida tab BASIC
            Promise.all([promise1]).then((resultados)=>{
                if(resultados.filter(x=>x==false).length>0){
                    //this.loadingData = false
                    this.$q.notify({ html: true, multiLine: false, color: 'red', message: "Revise el formulario" ,timeout: 1000, progress: true , icon: "fas fa-exclamation-circle"})
                    if(resultados[0]==false){this.tab='basic'}
                }else{//NO hay errores, entonces guardar
                    //this.loadingData = false//xq usuario puede cancelar en la confirmación del diálogo
                    this.saveDataExec(shouldReload);
                }
            })
        }catch(ex){
            //this.loadingData = false
            this.$q.notify({ html: true, multiLine: false, color: 'red', message: "Se produjo el siguiente error:<br/>"+ex.message ,timeout: 1000, progress: true , icon: "fas fa-exclamation-circle"})
        }
    },
    saveDataExec(shouldReload, shouldConfirm){
        this.$q.dialog({
                title: 'CONFIRMACIÓN',
                message: 'Desea guardar los datos?',
                ok: {  label: 'Sí', flat: true, icon: 'fas fa-save', color: 'primary', "no-caps": true },
                cancel: {  label: 'No',  flat: true, color: 'primary', "no-caps": true },
                persistent: true
            }).onOk(() => {
                //this.loadingData = true

                let newEditData = {
                     basic: this.editData.basic
                    ,lines: this.editData.lines
                    ,linesTaxes: this.editData.linesTaxes
                    ,files: this.editData.files
                    //,address: this.editData.address.filter(x=>x.is_allowed).map(x=>x.headerID_ux)
                }
                //console.dir(this.editData)
                //console.dir(newEditData)
                this.$axios.post( this.apiURL + 'spMktPOUpdate', {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    //"sys_user_language": this.$q.sessionStorage.getItem('sys_user_language'),
                    //"row_id": this.editMode?0:this.editRecord.row.headerID_ux,
                    row_id: this.editMode?0:this.router.currentRoute.params.id,
                    "editRecord": JSON.stringify(newEditData),
                }
            , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
            ).then((response) => {
                this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                //this.loadingData = false;
                try{
                    //pre-seleccionar el nuevo registro en VUEX
                    let newSelectedRow = [];
                    newSelectedRow.push(response.data[0])
                    this.selectedRows = newSelectedRow;
                    //pre-seleccionar el nuevo registro en VUEX
                    /*let selectedRow = {
                        value: response.data[0].value//value: props.value
                        ,row: response.data[0]//,row: props.row
                    }
                    this.editRecord = selectedRow*/
                    //agregado para que funcione el AutoScroll en cada módulo
                    this.lastRecord = response.data[0].value
                    //porque NO importa cómo estaba, ahora pasa a estar editando
                    this.editMode = false 
                }catch(ex){}
                if(shouldReload){//shouldReload es TRUE entonces recarga datos
                    this.loadData();//recarga datos
                }else{//shouldReload es FALSE entonces regresa a página principal (igual que hasta versión 4.6.1)
                    //this.editRecord = null;
                    //this.router.replace('/'+this.currentPathModule); //navigate to previous Main module
                    this.router.push(this.mainRoute)
                }
            }).catch((error) => {
                console.dir(error)
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
                this.router.push(this.mainRoute);
                //this.loadingData = false
            })
        })
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
    //////////////
    //yet to be confirmed
    mainRoute: { get () { return this.$store.state[this.moduleName].mainRoute }, }, 
    dataRows: {
        get () { return this.$store.state[this.moduleName].dataRows },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'dataRows', value: val}) }
    },
    userCode: { get () { return this.$store.state.main.userCode } },
    userCompany: { get () { return this.$store.state.main.userCompany } },
    selectedRows: {
      get () { return this.$store.state[this.moduleName].selectedRows },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'selectedRows', value: val}) }
    },
    lastRecord:{
      get () { return this.$store.state[this.moduleName].lastRecord },
      set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'lastRecord', value: val}) }
    },
    editData: {
        get () { return this.$store.state[this.moduleName].editData },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editData', value: val}) }
    },
    editMode: {
        get () { return this.$store.state[this.moduleName].editMode },
        set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editMode', value: val}) }
    },
    //allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
    //allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
    //allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
    //allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
    //allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
    apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    
    //currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    //currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
    //userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
    /*tableContextMenu: {
      get () { return this.$store.state[this.moduleName].tableContextMenu },
    },*/
    /*lines: {
          get () { return this.$store.state[this.moduleName].editData.lines },
    },*/
  },
  watch: {
    '$route.params.id': function (val) {
        if(val){
            console.dir('cambiando ID')
            this.loadData();
        }
    },
  }
})
</script>