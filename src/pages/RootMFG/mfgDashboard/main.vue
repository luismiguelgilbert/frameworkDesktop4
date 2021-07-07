<template>
    <reportList :rootName="rootName" :rootTitle="rootTitle" />
</template>
<script>
import reportList from 'components/reportList/reportList'

export default ({
    components: {
        reportList
    },
    data () {
        return {
            rootName: "RootMFG",
            rootTitle: "Reportes de Producción",
        }
    },
})
</script>