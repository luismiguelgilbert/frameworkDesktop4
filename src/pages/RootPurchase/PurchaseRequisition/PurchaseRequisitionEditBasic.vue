<template>
<center class="q-gutter-md">
    <!--<div :class="'text-h4 q-mb-md ' + (userColor=='blackDark'?'text-white':'text-primary')">Datos de Requisición</div>-->
    <q-input 
        label="Fecha" placeholder="Ingrese la fecha del pedido" 
        :standout="userColor=='blackDark'?true:'bg-primary text-white'"
        v-model="fecha"
        />
    <q-select 
        label="Estado" placeholder="Seleccione el estado del pedido" 
        :standout="userColor=='blackDark'?true:'bg-primary text-white'" 
        :options="[{value: 1, label:'Activo'},{value: 2, label:'Inactivo'}]" 
        v-model="estado"
        />
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este pedido" 
        :standout="userColor=='blackDark'?true:'bg-primary text-white'"
        type="textarea"
        v-model="comments"
        />
</center>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default ({
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
    },
    data () {
        return {
            fecha: null, estado: null, comments: null
        }
    },
})
</script>