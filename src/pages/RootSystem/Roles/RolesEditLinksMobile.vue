<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">    
    <q-tree
        class="q-ma-md" accordion
        :nodes="lookup_links"
        nodeKey="sys_link_id"
        tick-strategy="leaf"
        :color="userColor=='blackDark'?'grey-7':'primary'"
        :ticked.sync="ticked_links"
        :text-color="userColor=='blackDark'?'white':'primary'"
        >
        <template v-slot:default-header="prop">
            <div class="row items-center">
            <q-icon :name="prop.node.icon" size="18px" class="q-ml-sm q-mr-sm" />
            <div class="text-weight-bold">{{ prop.node.label }}</div>
            </div>
        </template>
    </q-tree>
        <br><br>
    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
    data () {
        return {
            moduleName: "Roles",
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        flatToHierarchy (dataset) {
            let hashTable = Object.create(null)
            dataset.forEach( aData => hashTable[aData.sys_link_id] = { ...aData, children : [] } )
            let dataTree = []
            dataset.forEach( aData => {
            if( aData.parent ) hashTable[aData.parent].children.push(hashTable[aData.sys_link_id])
            else dataTree.push(hashTable[aData.sys_link_id])
            } )
            return dataTree
        },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        lookup_links: {
            get () { 
                let allLinks = this.$store.state[this.moduleName].editData.lookup_links_mobile
                return this.flatToHierarchy(allLinks);
            }
        },
        ticked_links: {
            get () { 
                //let ticked_links = this.$store.state[this.moduleName].editData.ticked_links.map(x=>x.sys_link_id)//así devuelve en formato correcto para q-tree
                return this.$store.state[this.moduleName].editData.ticked_links_mobile.map(x=>x.sys_link_id)//así devuelve en formato correcto para q-tree
            },
            set (val) { 
                this.$store.commit((this.moduleName)+'/updateEditDataTickedLinksMobile', val)
            }  
        }
    },
})
</script>