<template>
    <div>
    BOOL><q-icon name="fas fa-exclamation-circle" :color="data.value?'primary':'transparent'" />
    </div>
    <!--<span>Boolean = {{data.value?'SI':'no'}}</span>-->
</template>
<script>
export default ({
    name: 'mainViewCellTemplateBool',
    props: {
        data: { required: true },
    },
    mounted(){
        //console.dir(this.data)
    },
    computed: {
        userColor: { get () { return this.$store.state.main.userColor }  },
    }
})
</script>