<template>
    <div 
        :style="shouldWrapCellText?'padding-left: 5px; padding-right: 5px; white-space: normal':'padding-left: 5px; padding-right: 5px;'" 
        v-html="data.displayValue"
        />
    <!--{{data.displayValue}}-->
</template>
<script>
export default ({
    name: 'mainViewCellTemplateLookup',
    props: {
        data: { required: true },
    },
    /*mounted(){
        console.dir(this.data)
    },*/
    computed: {
        userColor: { get () { return this.$store.state.main.userColor }  },
        shouldWrapCellText: { get () { return this.$store.state.main.shouldWrapCellText }  },
    }
})
</script>