<template>
    <q-avatar size="20px">
        <q-icon v-if="data.value == null" name="fas fa-camera" :color="userColor=='blackDark'?'white':'grey-7'" />
        <q-img v-if="data.value != null" :src="$q.sessionStorage.getItem('serverFilesPath') + data.data[data.column.dataField]">
            <q-tooltip anchor="top left" self="top left" content-class="bg-primary text-white">
                <q-img  style="width: 250px" :src="$q.sessionStorage.getItem('serverFilesPath') + data.data[data.column.dataField]" />
            </q-tooltip>
        </q-img>
    </q-avatar>
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