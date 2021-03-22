<template>
    <div style="padding-left: 5px; padding-right: 5px;">
        {{data.displayValue}}
    </div>
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
    }
})
</script>