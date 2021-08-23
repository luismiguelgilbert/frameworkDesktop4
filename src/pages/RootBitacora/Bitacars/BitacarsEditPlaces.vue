<template>
    <q-table
      :data="places"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="sys_user_code"
      virtual-scroll
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        { name: 'placeID', required: true, label: 'ID', align: 'left', field: row => row.placeID, sortable: true },
        { name: 'label', required: true, label: 'Punto de Control', align: 'left', field: row => row.label, sortable: true },
        { name: 'sys_user_lastname', required: true, label: 'Apellidos', align: 'left', field: row => row.sys_user_lastname, sortable: true },
        { name: 'is_allowed', required: true, label: 'Asignar Este Punto?', align: 'left', field: row => row.is_allowed, sortable: true },
      ]"
    >
    <template v-slot:top>
        <div :class="'text-subtitle2 '+(userColor=='blackDark'?'ellipsis text-primary':'ellipsis text-primary')" style="max-width: 50%;" >Permitir el uso de este punto de control a los siguientes usuarios ({{places.filter(x=>x.is_allowed).length}})</div>
        <q-space />
        <q-input borderless dense v-model="filterString" placeholder="Buscar...">
          <template v-slot:append>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>
    </template>
    <template v-slot:body-cell-is_allowed="props">
        <q-td :props="props">
            <q-toggle size="sm" dense color="positive" :value="props.value" @input="changeProfileforUser(props)" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" />
        </q-td>
    </template>
    <template v-slot:body-cell-is_recipient="props">
        <q-td :props="props">
            <q-toggle size="sm" dense color="positive" :value="props.value" @input="changeNotifierforUser(props)" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" />
        </q-td>
    </template>
</q-table>
    
</template>
<style lang="sass">
.q-table__bottom
    padding: 0px
.my-sticky-header-usercompany
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: white

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2

.my-sticky-header-usercompany-dark
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: $grey-10

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2
</style>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default ({
    data () {
        return {
            moduleName: "BitaCars", filterString: ''
        }
    },
    methods:{
      changeProfileforUser(row){
        let new_places = JSON.parse(JSON.stringify(this.places))
        new_places.find(x=>x.placeID==row.row.placeID).is_allowed=!row.row.is_allowed
        this.places = new_places
      },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_edit: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_edit').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_insert: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_insert').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_disable: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_disable').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        places: { 
            get () { return this.$store.state[this.moduleName].editData.places }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPlaces', val) }
        },
        sys_user_color: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color }, 
        },
    }
})
</script>