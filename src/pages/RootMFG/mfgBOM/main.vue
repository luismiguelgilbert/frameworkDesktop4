<template>
    <router-view :moduleName="moduleName" />
</template>
<script>
export default ({
    created(){
        if(!(this.$store.state[this.moduleName].columnsUser)){//NO existe, entonces inicializo
            this.$store.commit(this.moduleName+'/resetToDefaultState')
        }
        this.mainRoute = this.moduleMainRoute;
        this.rptName = this.rptName_;
        this.rptLink = this.rptLink_;
        this.rptLinkCompany = this.rptLinkCompany_;
        this.rptType = this.rptType_;
    },
    data () {
        return {
            moduleName: "mfgBOM", //this should match the module Name (same as table sys_links.link_name) AND should match Vuex Store Name
            moduleMainRoute: '/RootMFG/mfgBOM',
            rptName_: 'Lista de Materiales', rptLink_: 'mfgBOM', rptLinkCompany_: true, rptType_: 'ssrs',
        }
    },
    computed:{
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
        
    }    
})
</script>