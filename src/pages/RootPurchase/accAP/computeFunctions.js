import Vue from 'vue';
import Vuex from 'vuex';
import storeInstance from '../../../store/index';


import accAP from '../../../store/accAP'
const moduleName = "accAP"

Vue.use(Vuex)

export default {
    foo: function() { 
        console.dir('foo')
        //console.dir(store().state)
        //console.dir(store().state[moduleName])
        console.dir(storeInstance().state[moduleName].editData.basic)
        console.dir(storeInstance().state[moduleName].editData.basic.get)
        
        /*console.dir(Vue)
        console.dir(Vue.prototype)
        console.dir(Vue.prototype.$store)
        
        console.dir(Vuex.Store.state)
        console.dir(Vuex.Store)
        console.dir(store().state[moduleName].editData.basic)
        console.dir(store().state[moduleName].editData.basic.value)
        console.dir(store().state[moduleName].editData.basic.partnerID)
        //console.dir(store().state[moduleName].editData.basic.partner_account_id)*/
        /*console.dir(moduleName)
        console.dir(this)
        console.dir(accAP)
        console.dir(accAP.state())
        console.dir(accAP.state().editData.basic)
        console.dir(accAP.getters.getState('editData'))*/
        //this.$store.commit((this.moduleName)+'/updateEditDataLines', val)
        //console.dir(this.$store.state[moduleName].editData.accountLines)
        //console.dir($store)
        //console.dir(this.$store)
        

        /*accountLines: {
            get () { return this.$store.state[this.moduleName].editData.accountLines },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },*/
    }
}