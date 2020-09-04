<template>
<div>
    <q-bar class="bg-primary text-white q-pl-none q-pr-none">
        <q-btn label="Columnas" flat stretch color="white" />
        <q-space />
        <q-btn color="white" icon="fas fa-times" flat stretch title="Ocultar panel" @click="isColumnsDrawerVisible = false" />
    </q-bar>
    <q-separator />
    <q-list dense separator class="scroll" style="height: calc(100vh - 190px);">
        <q-item v-for="(columna, index) in columnsUser" :key="index">
            <q-item-section side>
                <q-checkbox 
                    :disable="columna.is_required" 
                    size="xs"
                    :value="columna.is_visible"
                    @input="(value, evt)=> {columnVisibilityChange(value, evt, columna)}"
                    />
            </q-item-section>
            <q-item-section>
                <q-item-label>
                    {{columna.label}}
                    <q-icon v-if="columna.is_searchable" name="fas fa-search" color="primary" title="Opción 'Buscar' sí considera esta columna" />
                </q-item-label>
            </q-item-section>
            <q-item-section side>
                <div style="display: inline-block;">
                    <q-btn icon="fas fa-arrow-up" flat color="primary" size="sm" dense round :disable="index==0" @click="moveUp(columna, index)" />
                    <q-btn icon="fas fa-arrow-down" flat color="primary" size="sm" dense round :disable="index==columnsSystem.length-1" @click="moveDown(columna, index)" />
                </div>                
            </q-item-section>
        </q-item>
    </q-list>
    <q-separator />
    <q-card-actions align="around">
        <q-btn color="primary" icon="fas fa-save" flat title="Guardar mi configuración" @click="saveConfig" />
        <q-btn color="red" icon="fas fa-trash-alt" flat title="Regresar a configuración original del sistema" @click="resetConfig" />
    </q-card-actions>

    <q-inner-loading :showing="loadingData" style="z-index: 999;">
      <q-spinner-ios size="50px" color="amber" />
    </q-inner-loading>
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
//import { Columna } from 'components/models';

export default({
    name: 'columnsLayoutComponent',
    props: {
        moduleName: { type: String , required: true },
    },
    computed:{
        loadingData: { 
            get () { return this.$store.state[this.moduleName].loadingData }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'loadingData', value: val}) }  
        },
        columnsSystem: { 
            get () { return this.$store.state[this.moduleName].columnsSystem }, 
        },
        columnsUser: { 
            get () { return this.$store.state[this.moduleName].columnsUser }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'columnsUser', value: val}) }  
        },
        isColumnsDrawerVisible: { 
            get () { return this.$store.state[this.moduleName].isColumnsDrawerVisible }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isColumnsDrawerVisible', value: val}) }  
        },
        pagination: { 
            get () { return this.$store.state[this.moduleName].pagination }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'pagination', value: val}) }  
        },
        userCode: { get () { return this.$store.state.main.userCode } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    },
    methods: {
        columnVisibilityChange(value, evt, columna){
            this.loadingData = true;
            if(value==false&&columna.db_column==this.pagination.sortBy){
                let newPagination = JSON.parse(JSON.stringify(this.pagination))
                newPagination.sortBy = this.columnsUser.find(x=>x.is_key).db_column
                this.pagination = newPagination
                this.$q.notify({color: 'info', message: 'El ordenamiento se cambió a la columna ' + this.columnsUser.find(x=>x.is_key).label + ' porque acaba de ocultar la columna ' + columna.label + '. Recuerde actualizar sus datos.' , timeout: 2000, icon: "fas fa-info-circle" });
            }
            let cloneResult = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].columnsUser)) //clona
            cloneResult.find(x=>x.db_column==columna.db_column).is_visible=value;//cambia is_visible
            this.columnsUser = cloneResult//actualizad vuex
            this.loadingData = false
        },
        moveUp(columna, index){
            this.loadingData = true;
            let cloneResult = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].columnsUser)) //clona
            let looperIndex = 0;
            cloneResult.map(x=>{ x['sortIndex']=looperIndex; looperIndex++; return x; })
            cloneResult[index].sortIndex=index-1;
            cloneResult[index-1].sortIndex=index;
            cloneResult = cloneResult.sort(function(a, b) { return a.sortIndex - b.sortIndex; });
            this.columnsUser = cloneResult;
            this.loadingData = false;
        },
        moveDown(columna, index){
            this.loadingData = true;
            let cloneResult = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].columnsUser)) //clona
            let looperIndex = 0;
            cloneResult.map(x=>{ x['sortIndex']=looperIndex; looperIndex++; return x; })
            cloneResult[index].sortIndex=index+1;
            cloneResult[index+1].sortIndex=index;
            cloneResult = cloneResult.sort(function(a, b) { return a.sortIndex - b.sortIndex; });
            this.columnsUser = cloneResult;
            this.loadingData = false;
        },
        resetConfig(){
            this.loadingData = true;
            this.columnsUser = this.columnsSystem
            this.loadingData = false;
        },
        saveConfig(){
                this.loadingData = true
                let gridColumnsFormated = []
                let contador = 0;
                this.columnsUser.map(x => {
                    contador = contador + 1;
                    gridColumnsFormated.push({
                        db_column: x.db_column
                        ,position: contador
                        ,is_visible: x.is_visible
                        //,min_width: parseInt(x.style.replace(/\D/g,''))
                    })
                })
                
                this.$axios.post( this.apiURL+'spSysModulesColumnsUserUpdate', 
                    {
                        link_name: this.moduleName,
                        sys_user_code: this.userCode,
                        columns: JSON.stringify(gridColumnsFormated)
                    } , {headers: { 'Authorization': "Bearer " + this.$q.sessionStorage.getItem('jwtToken') }}
                ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    this.loadingData = false
                }).catch((error) => {
                    console.error(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.loadingData = false
                })
           
        }
    }
    
})
</script>