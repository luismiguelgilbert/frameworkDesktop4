<template>
<div>
    <q-dialog v-model="seamless">
        <q-card class="no-padding" style="height: 315px; width: 560px;">
            <q-video :ratio="16/9" src="https://www.youtube.com/embed/_FDtTrHlCgc?autoplay=1" />
        </q-card>
        <!--<q-card>
            <q-video src="https://youtu.be/boEBmfjsNFg"/>
        </q-card>-->
    </q-dialog>

    
</div>
</template>
<script>

export default ({
    data () {
        return {
            //Confirmed
            router: this.$router,
            seamless: true,
        }
    },
    
})

</script>