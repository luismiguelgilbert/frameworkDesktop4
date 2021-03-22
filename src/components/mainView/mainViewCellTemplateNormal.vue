<template>
    <!--v-html="data.value"-->
    <div :style="shouldWrapCellText?'padding-left: 5px; padding-right: 5px; white-space: normal':'padding-left: 5px; padding-right: 5px;'" 
        v-html="data.column.dataType=='date'?this.data.data[this.data.column.name.replace('_val','')]:data.value"
        />
    <!--<div style="padding-left: 5px; padding-right: 5px;">{{data.value}}</div>-->
</template>
<script>
export default ({
    name: 'mainViewCellTemplateNormal',
    props: {
        data: { required: true },
    },
    /*mounted(){
        console.dir(this.data.column.alignment)
    },*/
    computed: {
        shouldWrapCellText: { get () { return this.$store.state.main.shouldWrapCellText }  },
    }
})
</script>