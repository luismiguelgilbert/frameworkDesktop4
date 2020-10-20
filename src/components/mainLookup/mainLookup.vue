<template>
    <q-card style="min-width: 850px;">
        <q-bar class="bg-primary text-white">
            {{titleBar}}
            <q-space />
            <q-input 
                ref="inputSearch"
                input-class="text-white" borderless dense debounce="300" autofocus v-model="filterString" placeholder="Buscar"
                @keydown.native.keyCodes.115="emitSelect">
            <template v-slot:append>
                <q-icon v-if="!filterString" name="fas fa-search" flat round size="xs" color="white" />
                <q-btn v-if="filterString" @click="filterString=''" flat round icon="fas fa-times" size="xs" color="white" />
            </template>
            </q-input>
        </q-bar>
        <q-card-section class="no-padding">
            <q-table
                ref="searchTable"
                :data="data"
                :row-key="dataRowKey"
                :columns="columns"
                :selection="selectionMode" 
                :selected.sync="selectionData"
                :filter="filterString"
                hide-bottom dense square flat
                virtual-scroll :rows-per-page-options="[0]"
                :class="userColor=='blackDark'?'my-sticky-header-table-dark bg-grey-10 ':'my-sticky-header-table '"
                table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
                @keydown.native.keyCodes.113="focusSearch"
                @keydown.native.keyCodes.115="emitSelect"
                no-data-label= "No hay registros"
                no-results-label= "No se encontraron registros"
                loading-label= "Cargando datos"
                >
                <template v-slot:body-selection="scope">
                    <div>
                        <q-checkbox color="primary" dense v-model="scope.selected" :disable="!(scope.row.estado)" />
                    </div>
                </template>
                <!--<template v-slot:body-cell="props"  dense>
                    <q-td :props="props" dense class="no-padding">
                        <div style='white-space: pre;' dense :class="props.row[boldIfChildrenFielname]?'text-bold':''" >{{props.value}}</div>
                    </q-td>
                </template>-->
            </q-table>
        </q-card-section>
        <q-separator />
        <q-card-actions align="around">
            <q-btn icon-right="fas fa-times" label="Cancelar (ESC)" no-caps color="primary" flat
                @click="emitCancel" >
            </q-btn>
            <q-btn icon-right="fas fa-check-circle" label="Seleccionar (F4)" no-caps color="primary"
                @click="emitSelect" :disable="selectionData.length<=0"
                >
            </q-btn>
        </q-card-actions>
    </q-card>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
export default({
    name: 'mailLookup',
    props: {
        titleBar: { type: String , required: true, default: 'Buscar' },
        data: { type: Array , required: true, default: [] },
        dataRowKey: { type: String , required: true, default: 'value' },
        predefinedValue: {  required: false, default: null },
        selectionMode: { type: String , required: true, default: 'single' },
        columns: { type: Array , required: true, default: [] },
        boldIfChildrenFielname: { type: String , required: false },
    },
    data () {
        return {
            filterString: '', selectionData: [],
            dataRows: [], router: this.$router,
        }
    },
    mounted(){
        try{
            if(this.predefinedValue){
                if(this.predefinedValue>0){
                    this.selectionData.push(this.data.find(x=>x[this.dataRowKey] == this.predefinedValue))
                    this.$refs.searchTable.scrollTo(this.data.findIndex(x=>x[this.dataRowKey] == this.predefinedValue)-1)
                }
            }
        }catch(ex){
            console.error(ex)
        }
    },
    methods:{
        emitSelect(){
            if(this.selectionData && this.selectionData.length > 0){
                this.$emit('onSelect',this.selectionData)
            }
        },
        emitCancel(){
            this.$emit('onCancel')
        },
        focusSearch(){
            this.$refs.inputSearch.focus()
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
    }
})
</script>