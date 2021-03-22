<template>
    <!--<q-btn flat color="white" class="no-padding full-width text-weight-bolder" :label="data.value" @click="openEditForm"  />-->
    <div class="cursor-pointer q-pl-md" @click="openEditForm"><u>{{data.value}}</u></div>
</template>
<script>
export default ({
    name: 'mainViewCellTemplateKey',
    props: {
        data: { required: true },
        moduleName: { type: String , required: true },
    },
    /*mounted(){
        console.dir(this.data)
    },*/
    methods: {
        openEditForm(){
            let newStatus = { 
                editMode: 'edit',
                copyRecord: 0,
                navigateToRecord: this.data.value
            }
            this.editStatus = newStatus;
            this.$emit('onKeyClicked',this.data.value)//envía el código
        }
    },
    computed: {
        userColor: { get () { return this.$store.state.main.userColor }  },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
    }
})
</script>