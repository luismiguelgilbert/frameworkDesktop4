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
            rootName: "RootBitacora",
            rootTitle: "Reportes de Bitácora Digital",
        }
    },
})
</script>