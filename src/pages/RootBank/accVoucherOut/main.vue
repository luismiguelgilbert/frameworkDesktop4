<template>
    <div>
        <router-view :moduleName="moduleName" @onMethodRun="runMethod" />
        <q-dialog square persistent v-model="paymentsAssistantVisible">
                    <paymentsListAssistant v-if="paymentsAssistantVisible" @onClose="paymentsAssistantVisible=false" :parametersData="undefined"/>
        </q-dialog>
    </div>
</template>
<script>
import paymentsListAssistant from 'components/paymentsView/paymentsListAssistant.vue'
//import paymentsListAssistant from '../../components/paymentsView/paymentsListAssistant.vue.vue'

export default ({
    components:{
        paymentsListAssistant: paymentsListAssistant,
    },
    created(){
        if(!(this.$store.state[this.moduleName].columnsUser)){//NO existe, entonces inicializo
            this.$store.commit(this.moduleName+'/resetToDefaultState')
        }
        this.mainRoute = this.moduleMainRoute;
        this.rptName = this.rptName_;
        this.rptLink = this.rptLink_;
        this.rptLinkCompany = this.rptLinkCompany_;
        this.rptType = this.rptType_;
        this.toolbarExtraButtons = this.toolbarExtraButtons_;
    },
    data () {
        return {
            moduleName: "accVoucherOut", //this should match the module Name (same as table sys_links.link_name) AND should match Vuex Store Name
            moduleMainRoute: '/RootBank/accVoucherOut',
            rptName_: 'Documento de Pago', rptLink_: 'accVoucherOut', rptLinkCompany_: true, rptType_: 'ssrs',
            paymentsAssistantVisible: false,
            toolbarExtraButtons_: [
                {
                    label:'Asistente de Pagos'
                    ,isRight: false
                    ,icon: 'fas fa-exchange-alt'
                    //,color: 'positive' (when color is not defined, toolbar will ask for [userColor] and set primary when light, or undefined for dark)
                    ,title: '<b>Asistente de Pagos</b><br>Abre el diálogo'
                    ,methodName:'showAssistant' 
                }
            ]
        }
    },
    //methods es nuevo desde versión 5.2.3 
    methods:{
        runMethod(methodName){
            try{
                console.dir('Ejecutando:  ' + methodName)
                this[methodName]();
            }catch(ex){
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo realizar la acción:<br/>" + ex.message
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }
        },
        showAssistant(){
            console.dir('si existe!!')
            this.paymentsAssistantVisible = true;
        }
     },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        mainRoute: {
            get () { return this.$store.state[this.moduleName].mainRoute },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'mainRoute', value: val}) }
        },
        rptName: {
            get () { return this.$store.state[this.moduleName].rptName },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptName', value: val}) }
        },
        rptLink: {
            get () { return this.$store.state[this.moduleName].rptLink },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptLink', value: val}) }
        },
        rptLinkCompany: {
            get () { return this.$store.state[this.moduleName].rptLinkCompany },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptLinkCompany', value: val}) }
        },
        rptType: {
            get () { return this.$store.state[this.moduleName].rptType },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'rptType', value: val}) }
        },
        //Nuevo desde versión 5.2.3
        toolbarExtraButtons: {
            get () { return this.$store.state[this.moduleName].toolbarExtraButtons },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'toolbarExtraButtons', value: val}) }
        },
        
    }    
})
</script>