<template>
    <!--<q-avatar size="20px" :color="userColor=='blackDark'?'white':'grey-7'">-->
    <div class="q-ml-md q-mr-md">
        <q-icon :name="data.value" :color="userColor=='blackDark'?'white':'grey-9'" />
    </div>
    <!--</q-avatar>-->
</template>
<script>
export default ({
    name: 'mainViewCellTemplateImage',
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