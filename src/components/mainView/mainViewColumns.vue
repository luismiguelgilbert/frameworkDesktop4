<template>
    <q-dialog v-model="isColumnsDrawerVisible" square @show="reorganizeUserColumns"  >
        <q-card style="minWidth: 400px;">
            <q-bar class="bg-primary text-white q-pl-none q-pr-none">
                <q-btn label="Columnas" no-caps flat stretch color="white" />
                <q-space />
                <q-space />
                <q-select title="Estilo de Tabla"
                    v-model="userTableLines" dense borderless emit-value map-options 
                    :dark="userColor=='blackDark'?undefined:true"
                    :options-dark="userColor=='blackDark'?true:false"
                    :options="[
                            { label: 'Horizontal', value: 'horizontal' },
                            { label: 'Vertical', value: 'vertical' },
                            { label: 'Celdas', value: 'cell' },
                            { label: 'Ninguno', value: 'none' },
                        ]"
                    >
                    <template v-slot:prepend> <q-icon name="fas fa-border-all" size="xs" color="white" /> </template>
                </q-select>
                <q-btn flat stretch color="white" icon="fas fa-times" @click="isColumnsDrawerVisible=false" />
            </q-bar>
            <q-list dense separator class="scroll" style="height: calc(35vh);">
                <q-item v-for="(columna, index) in columnsUser" :key="index">
                    <q-item-section side>
                        <!--:disable="columna.is_required"-->
                        <q-checkbox 
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
                </q-item>
            </q-list>
            <q-separator />
            <q-card-actions align="around">
                <q-btn color="primary" icon="fas fa-save" flat title="Guardar mi configuración" @click="saveConfig" />
                <q-btn color="red" icon="fas fa-trash-alt" flat title="Regresar a configuración original del sistema" @click="resetConfig" />
            </q-card-actions>
        </q-card>
    </q-dialog>
    
</template>
<script>
export default ({
    name: 'mainViewColumns',
    props: {
        moduleName: { type: String , required: true },
    },
    methods: {
        reorganizeUserColumns(){
            this.$emit('onShow')
        },
        columnVisibilityChange(value, evt, columna){
            let cloneResult = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].columnsUser)) //clona
            cloneResult.find(x=>x.db_column==columna.db_column).is_visible=value;//cambia is_visible
            this.columnsUser = cloneResult//actualizad vuex
        },
        saveConfig(){
                this.$q.loading.show({ message: 'Guardando configuración...'})
                let gridColumnsFormated = []
                let contador = 0;
                this.columnsUser.map(x => {
                    contador = contador + 1;
                    gridColumnsFormated.push({
                        db_column: x.db_column
                        ,position: contador
                        ,is_visible: x.is_visible
                        ,min_width: x.min_width
                        ,max_width: x.max_width
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
                    this.$q.loading.hide();
                }).catch((error) => {
                    console.error(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.$q.loading.hide();
                })
           
        },
        resetConfig(){
            this.columnsUser = this.columnsSystem
        },
    },
    computed: {
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        userCode: { get () { return this.$store.state.main.userCode } },
        userColor: { get () { return this.$store.state.main.userColor }  },
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
        userTableLines: { 
            get () { return this.$store.state.main.userTableLines }, 
            set (val) { this.$store.commit('main/updateState', {key: 'userTableLines', value: val}) } 
        },
    }

})
</script>