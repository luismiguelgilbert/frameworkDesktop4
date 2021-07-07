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
            rootName: "RootSales",
            rootTitle: "Reportes de Ventas",
        }
    },
})
</script>