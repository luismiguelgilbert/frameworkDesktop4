<template>
    <div style="padding-left: 5px; padding-right: 5px;" class="text-center">
        <q-icon
            v-if="data.value"
            color="red"
            name="fas fa-stop-circle"
            />
    </div>
</template>
<script>
export default ({
    name: 'mainViewCellTemplateVoided',
    props: {
        data: { required: true },
    },
    /*mounted(){
        console.dir(this.data)
    },*/
    /*computed: {
        userColor: { get () { return this.$store.state.main.userColor }  },
    }*/
})
</script>