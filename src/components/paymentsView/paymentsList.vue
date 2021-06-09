<template>
<div style="margin: -16px;">
    <q-toolbar class="no-padding">
        <q-btn label="Nuevos Pagos" no-caps icon="far fa-plus-square" color="primary" flat stretch @click="paymentsNewsVisible=true" />
        <q-btn label="Actualizar Datos" no-caps icon="fas fa-sync" color="primary" flat stretch />
    </q-toolbar>
    <q-separator />

    <!--<DxPopup
        :visible.sync="paymentsNewsVisible" :drag-enabled="false" :close-on-outside-click="false"
        :show-title="false"
        width="calc(98vw)"
        height="calc(90vh)"
        @content-ready="changePadding"
        >
        <div>
            <paymentsNews name="prueba" v-if="paymentsNewsVisible" @onClose="paymentsNewsVisible=false" />
        </div>
    </DxPopup>-->
    <q-dialog square persistent v-model="paymentsNewsVisible">
        <paymentsNews v-if="paymentsNewsVisible" @onClose="paymentsNewsVisible=false" />
    </q-dialog>
</div>
</template>
<script>
import paymentsNews from './paymentsNew.vue'
import DxPopup, {DxToolbarItem} from 'devextreme-vue/popup';

export default ({
    components:{
        paymentsNews: paymentsNews, DxPopup
    },
    data(){
        return {
            router: this.$router
            ,paymentsNewsVisible: false
        }
    },
    methods:{
        changePadding(e){
            var contentElement = e.component.content();  
            contentElement.style.padding = '0px';
        }
    },
    
    
})
</script>