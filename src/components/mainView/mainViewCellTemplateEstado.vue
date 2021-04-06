<template>
    <div style="padding-left: 5px; padding-right: 5px;">
        <q-icon
            :color="data.value?'positive':'red'"
            :name="data.column.dataField.includes('sex')?(data.value?('fas fa-male'):'fas fa-female'):(data.value?('fas fa-check-circle'):'fas fa-times-circle')"
            />
        {{data.displayValue}}
    </div>
</template>
<script>
export default ({
    name: 'mainViewCellTemplateEstado',
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