<template>
<div>
    <q-bar class="bg-primary text-white q-pl-none q-pr-none">
        <q-btn-dropdown flat stretch style="width: 140px;" label="Mis Filtros" >
            <q-list separator>
                <q-item
                    clickable v-close-popup  class="q-pr-xs"
                    v-for="(filtro, index) in filters" :key="index"
                    :title="filtro.is_default?'Este es su filtro predeterminado':''"
                    @click="applyFilter(filtro)">
                    <q-item-section side>
                        <q-icon :name="filtro.is_system?'fas fa-database':'fas fa-user'" size="0.8rem" />
                    </q-item-section>
                    <q-item-section >
                        <q-item-label>
                            {{filtro.label}}
                        </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-icon v-if="filtro.is_default" name="fas fa-check-circle" color="primary" size="1rem" />
                    </q-item-section>
                    <q-menu context-menu>
                        <q-list dense>
                            <q-item clickable v-if="!filtro.is_default" @click="defaultUserFilter(filtro)"><q-item-section side><q-icon name="fas fa-check-circle" size="1rem" /></q-item-section><q-item-section>Hacer predeterminado</q-item-section></q-item>
                            <q-item clickable v-if="filtro.is_default" @click="clearDefaultUserFilter"><q-item-section side><q-icon name="fas fa-eraser" size="1rem" /></q-item-section><q-item-section>Quitar predeterminado</q-item-section></q-item>
                            <q-item clickable v-if="!filtro.is_system" @click="deleteUserFilter(filtro)"><q-item-section side><q-icon name="fas fa-trash" size="1rem" /></q-item-section><q-item-section>Eliminar filtro</q-item-section></q-item>
                        </q-list>
                    </q-menu>
                </q-item>
            </q-list>
        </q-btn-dropdown>
        <q-space />
        <q-btn color="white" icon="fas fa-times" flat stretch title="Ocultar panel" @click="isFiltersDrawerVisible = false" />
    </q-bar>

    <q-list dense separator class="scroll" style="height: calc(100vh - 190px);">
        <!--{{currentFilter}}-->
        <!--{{filters}}-->
        <br>
        <div
            v-for="(field, index) in columnsSystem.filter(x=>x.is_filterable)" :key="index" >
            <filtersLayoutFieldComponent
                :field="field"
                :moduleName="moduleName"
                @onFilterApplied="onFilterApplied"
                />
        </div>
    </q-list>
    <q-separator />
    <q-card-actions align="around">
        <q-btn :disable="!isCurrentFilter" color="primary" icon="fas fa-save" flat title="Guardar mi filtro" @click="saveUserFilter" />
    </q-card-actions>

    <q-inner-loading :showing="loadingData" style="z-index: 999;">
      <q-spinner-ios size="50px" color="amber" />
    </q-inner-loading>
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import filtersLayoutFieldComponent from './filtersLayoutFieldComponent.vue'

export default({
    name: 'filterLayoutComponent',
    props: {
        moduleName: { type: String , required: true },
    },
    components:{
        filtersLayoutFieldComponent: filtersLayoutFieldComponent
    },
    data () {
        return {
            filterContextMenu: false,
        }
    },
    computed:{
        loadingData: {
            get () { return this.$store.state[this.moduleName].loadingData },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'loadingData', value: val}) }
        },
        columnsSystem: {
            get () { return this.$store.state[this.moduleName].columnsSystem },
        },
        isFiltersDrawerVisible: {
            get () { return this.$store.state[this.moduleName].isFiltersDrawerVisible },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFiltersDrawerVisible', value: val}) }
        },
        userCode: { get () { return this.$store.state.main.userCode } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        currentFilter: {
            get () { return this.$store.state[this.moduleName].currentFilter },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'currentFilter', value: val}) }
        },
        isCurrentFilter: {
            get () { return this.$store.state[this.moduleName].currentFilter.filter(x => x.valueA != null || x.valueB != null || (x.valueC != null && x.valueC.length > 0)).length>0; },
        },
        filters: {
            get () { return this.$store.state[this.moduleName].filters },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filters', value: val}) }
        },
        filtersDetails: {
            get () { return this.$store.state[this.moduleName].filtersDetails },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filtersDetails', value: val}) }
        }
    },
    methods: {
        applyFilter(filter){
            let newFilter = []
            this.filtersDetails.filter(x=>x.filter_id==filter.value).map(filtro=>{
                newFilter.push({
                     db_column: filtro.db_column
                    ,symbol: 'in'//se deja fijo
                    ,valueC: filtro.valueC//pendiente(this.field.ux_type==='date'||this.field.ux_type==='datetime')?JSON.stringify(this.ticked).replace('[','').replace(']',''):JSON.stringify(this.selectedRows.map(x => x.value)).replace('[','').replace(']','')
                    ,valueClabel: filtro.valueClabel//pendiente//(this.field.ux_type==='date'||this.field.ux_type==='datetime')?this.ticked.length+' fechas':this.selectedRows.map(x => x[this.firstLabelFieldName])
                })
            })
            this.currentFilter = newFilter;
            this.$emit('onFilterApplied', 'filterUpdated')
        },
        onFilterApplied(value){
            this.$emit('onFilterApplied', 'filterUpdated')
        },
        saveUserFilter(){
            this.$q.dialog({
                //title: 'Prompt',
                message: 'Escriba el nombre de su filtro:',
                prompt: { model: '', type: 'text'},
                cancel: 'Cancelar',
                persistent: true
            }).onOk(data => {
                this.loadingData=true;
                let newFilterArray = [];
                newFilterArray = JSON.parse(JSON.stringify(this.currentFilter))//clona
                this.$axios.post( this.apiURL + 'spSysModulesFiltersUserUpdate',
                    {
                        link_name: this.moduleName,
                        sys_user_code: this.userCode,
                        filter_id: 0,//0=nuevo
                        name: data,
                        conditions: JSON.stringify(newFilterArray)
                    }
                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    //los filtros se reciben desde el mismo SP, entonces guardo en Vuex
                    this.filters = JSON.parse(response.data[0].filters)
                    this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
                    this.loadingData = false
                }).catch((error) => {
                    console.error(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.loadingData = false
                })
            })
        },
        deleteUserFilter(filtro){
          this.$q.dialog({
                //title: 'Prompt',
                message: 'Desea eliminar este filtro?',
                cancel: 'Cancelar',
                persistent: true
          }).onOk(data => {
                this.loadingData=true;
                let newFilterArray = [];
                newFilterArray = JSON.parse(JSON.stringify(this.currentFilter))//clona
                this.$axios.post( this.apiURL + 'spSysModulesFiltersUserDelete',
                    {
                        link_name: this.moduleName,
                        sys_user_code: this.userCode,
                        filter_id: filtro.value
                    }
                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                  ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    //los filtros se reciben desde el mismo SP, entonces guardo en Vuex
                    this.filters = JSON.parse(response.data[0].filters)
                    this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
                    this.loadingData = false
                  }).catch((error) => {
                    console.error(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.loadingData = false
                })
        })
        },
        defaultUserFilter(filtro){
            this.$q.dialog({
                //title: 'Prompt',
                message: 'Desea hacer este filtro, su filtro predeterminado?',
                cancel: 'Cancelar',
                persistent: true
            }).onOk(data => {
                this.loadingData=true;
                let newFilterArray = [];
                newFilterArray = JSON.parse(JSON.stringify(this.currentFilter))//clona
                this.$axios.post( this.apiURL + 'spSysModulesFiltersUserDefaultUpdate',
                    {
                        link_name: this.moduleName,
                        sys_user_code: this.userCode,
                        filter_id: filtro.value,
                        is_system: filtro.is_system
                    }
                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    //los filtros se reciben desde el mismo SP, entonces guardo en Vuex
                    this.filters = JSON.parse(response.data[0].filters)
                    this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
                    this.loadingData = false
                }).catch((error) => {
                    console.error(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.loadingData = false
                })
            })
        },
        clearDefaultUserFilter(){
            this.$q.dialog({
                //title: 'Prompt',
                message: 'Desea dejar de usar este filtro como predeterminado?',
                cancel: 'Cancelar',
                persistent: true
            }).onOk(data => {
                this.loadingData=true;
                let newFilterArray = [];
                newFilterArray = JSON.parse(JSON.stringify(this.currentFilter))//clona
                this.$axios.post( this.apiURL + 'spSysModulesFiltersUserDefaultUpdate',
                    {
                        link_name: this.moduleName,
                        sys_user_code: this.userCode,
                        filter_id: 0,//cuando 0, el SP elimina el filtro predeterminado
                        is_system: 0
                    }
                    , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    //los filtros se reciben desde el mismo SP, entonces guardo en Vuex
                    this.filters = JSON.parse(response.data[0].filters)
                    this.filtersDetails = JSON.parse(response.data[0].filtersDetails)
                    this.loadingData = false
                }).catch((error) => {
                    console.error(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.loadingData = false
                })
            })
        },
    }

})
</script>
