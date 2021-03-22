<template>
    <q-dialog v-model="isFiltersDrawerVisible" square >
        <q-card style="width: 500px; maxWidth: calc(100vw - 50px);">
            <q-bar class="bg-primary text-white q-pl-none q-pr-none">
                <q-btn label="Filtros" no-caps flat stretch color="white" />
                <q-space />
                <q-btn flat stretch color="white" icon="fas fa-times" @click="isFiltersDrawerVisible=false" />
            </q-bar>
            <q-list  separator class="scroll" style="max-height: calc(35vh);">
                <q-item v-for="(filtro, index) in filters" :key="index">
                     <q-item-section side>
                        <q-icon :name="filtro.is_system?'fas fa-database':'fas fa-user'" size="0.8rem" />
                    </q-item-section>
                    <q-item-section class="q-mr-lg">
                        <q-item-label>
                            {{filtro.label}}
                            <q-icon v-if="filtro.is_default" name="fas fa-check-circle" color="grey-8" size="1rem" />
                        </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn v-if="filtro.is_default" flat no-caps color="primary" label="Quitar" @click="clearDefaultUserFilter" size="sm" title="Dejar de ser mi filtro predeterminado" />
                        <q-btn v-if="!filtro.is_default" flat no-caps color="primary" label="Predeterminar" @click="defaultUserFilter(filtro)" size="sm" title="Aplicar filtro al abrir módulo por primara vez" />
                    </q-item-section>
                    <q-item-section side>
                        <q-btn :disable="filtro.is_system" flat round icon="fas fa-trash-alt" color="red" size="sm" title="Eliminar Filtro" @click="deleteUserFilter(filtro)" />
                        <span></span>
                    </q-item-section>
                    
                </q-item>
            </q-list>
            <q-separator />
            <!--<q-card-actions align="around">
                <q-btn color="primary" icon="fas fa-save" flat label="Guardar Filtro Actual" @click="saveFilter" />
            </q-card-actions>-->
        </q-card>
    </q-dialog>
    
</template>
<script>
export default ({
    name: 'mainViewFilters',
    props: {
        moduleName: { type: String , required: true },
    },
    methods: {
        defaultUserFilter(filtro){
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
            }).catch((error) => {
                console.error(error)
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            })
        },
        clearDefaultUserFilter(){
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
            }).catch((error) => {
                console.error(error)
                let mensaje = ''
                if(error.message){ mensaje = error.message }
                if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                    ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
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
                    this.$axios.post( this.apiURL + 'spSysModulesFiltersUserDelete',
                        {
                            link_name: this.moduleName,
                            sys_user_code: this.userCode,
                            filter_id: filtro.value
                            //no va porque NO se pueden eliminar filtros de sistema is_system: filtro.is_system,
                        }
                        , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                    ).then((response) => {
                        this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                        //los filtros se reciben desde el mismo SP, entonces guardo en Vuex
                        this.filters = JSON.parse(response.data[0].filters)
                    }).catch((error) => {
                        console.error(error)
                        let mensaje = ''
                        if(error.message){ mensaje = error.message }
                        if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                        if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                        this.$q.notify({ html: true, multiLine: false, color: 'red'
                            ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                            ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                            ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                        })
                    })
            })
        },
        /*saveFilter(){
            this.$emit('onSaveFilter')
        }*/
    },
    computed: {
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        userCode: { get () { return this.$store.state.main.userCode } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        filters: {
            get () { return this.$store.state[this.moduleName].filters },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'filters', value: val}) }
        },
        isFiltersDrawerVisible: {
            get () { return this.$store.state[this.moduleName].isFiltersDrawerVisible },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'isFiltersDrawerVisible', value: val}) }
        },
        /*pagination: {
            get () { return this.$store.state[this.moduleName].pagination },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'pagination', value: val}) }
        },*/
        /*userTableLines: { 
            get () { return this.$store.state.main.userTableLines }, 
            set (val) { this.$store.commit('main/updateState', {key: 'userTableLines', value: val}) } 
        },*/
    }

})
</script>