<template>
    <div>
        <q-card class="q-ma-sm rounder-corners shadow-8"  style="min-height: 200px; height: calc(100vh - 68px); overflow-y: hidden;" >
            <div v-if="dataLoaded">
                <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
                    <q-toolbar-title class="text-weight-bolder">{{ (editStatus.editMode=='create'?('Crear '+ editConfig.toolbarTitle):(editConfig.toolbarTitle + (router.currentRoute.params.id?(': '+router.currentRoute.params.id):'') ))}}</q-toolbar-title>
                    <q-space />
                    <!--
                    <q-btn icon="fas fa-chevron-up" title="Cargar registro anterior de la lista" flat dense stretch @click="goPrevRecord" />
                    <q-btn icon="fas fa-chevron-down" title="Cargar prróximo registro de la lista" flat dense stretch @click="goNextRecord" />
                    -->
                    <q-btn 
                        v-if="!(hideCloseButton==true)"
                        :label="$q.screen.gt.sm?'Cerrar':''" @click="goBack(false)"
                        title="Cerrar" icon="fas fa-times-circle" class="q-ml-md"
                        :color="userColor=='blackDark'?'white':'primary'" flat  stretch />
                    <q-btn-dropdown
                        v-if="(editStatus.editMode=='create'&&allow_insert)||(editStatus.editMode=='edit'&&allow_edit)"
                        :label="$q.screen.gt.sm?'Guardar':''" 
                        icon="fas fa-save" 
                        color="primary" stretch >
                        <q-list>
                            <q-item v-if="!(editConfig.disableSaveButton==true)" clickable v-ripple v-close-popup :class="userColor=='blackDark'?'text-white':'text-primary'" @click="saveData(false)">
                                <q-item-section avatar>
                                    <q-icon :color="userColor=='blackDark'?'white':'primary'" name="fas fa-save" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>Guardar</q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-ripple v-close-popup :class="userColor=='blackDark'?'text-white':'text-primary'" @click="saveData(true)"
                                v-if="!(hideCloseButton==true)">
                                <q-item-section avatar>
                                    <q-icon :color="userColor=='blackDark'?'white':'primary'" name="fas fa-save" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>Guardar y Cerrar</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                    
                </q-toolbar>
                <q-separator />
               
                <q-splitter v-model="splitterModel" unit="px" >
                    <template v-slot:before >
                        <div style="height:  calc(100vh - 119px); overflow-y: auto; overflow-x: hidden;">
                            <q-list >

                                <q-item 
                                    v-for="tabRecord in editConfig.moduleTabs" :key="tabRecord.tabName"
                                    clickable v-ripple 
                                    :title="tabRecord.textLabel"
                                    v-if="!(tabRecord.isTabDisable)"
                                    @click="tab=tabRecord.tabName" 
                                    :active="tab==tabRecord.tabName" active-class="bg-primary text-white" >
                                    
                                        <q-item-section side>
                                            <q-icon :name="tabRecord.iconName" :color="tab==tabRecord.tabName?'white':'grey-7'" />
                                        </q-item-section>
                                    
                                        <q-item-section v-if="!editFormLeftCollapsed&&$q.screen.gt.xs">
                                            <q-item-label :class="'text-subtitle2 '+(tab==tabRecord.tabName?'text-white':'text-grey-7')">{{tabRecord.textLabel}}</q-item-label>
                                        </q-item-section>

                                        <!--<q-item-section side v-if="tab==tabRecord.tabName">
                                            <q-icon name="fas fa-chevron-right" color="white" />
                                        </q-item-section>-->
                                </q-item>

                                <q-item clickable @click="changeLeftMenu">
                                    <q-item-section side>
                                        <q-icon :name="editFormLeftCollapsed?'fas fa-angle-double-right':'fas fa-angle-double-left'" color="primary" />
                                    </q-item-section>
                                    <!--<q-item-section >
                                        <q-item-label>{{editFormLeftCollapsed}}</q-item-label>
                                    </q-item-section>-->
                                </q-item>
                            </q-list>
                           
                        </div>
                    </template>

                    <!--<template v-slot:separator>
                        <q-btn size="xs"  color="grey-6" round :title="editFormLeftCollapsed?'Expandir':'Contraer'" 
                            :icon="editFormLeftCollapsed?'fas fa-angle-right':'fas fa-angle-left'" 
                            @click="changeLeftMenu"
                            />
                    </template>-->

                    <template v-slot:after>
                        <q-tab-panels
                            v-if="tab"
                            v-model="tab"
                            :keep-alive="true" animated vertical transition-prev="jump-up" transition-next="jump-up"
                            @before-transition="updateVuexData"
                            >
                            <q-tab-panel
                                v-for="tabRecord in  editConfig.moduleTabs" :key="tabRecord.tabName"
                                :name="tabRecord.tabName"
                                
                                >
                                <div style="maxHeight: calc(100vh - 135px);" >
                                    <keep-alive >
                                        <component
                                            
                                            :ref="'tab_'+tabRecord.tabName"
                                            :is="dynamicComponent"
                                            :moduleName="moduleName"
                                            :tabRecord="tabRecord"
                                            
                                            :rptName="rptName"
                                            :rptLink="rptLink"
                                            :rptLinkCompany="rptLinkCompany"
                                            :rptType="rptType"

                                            :parametersData="parametersData"

                                            @onRunMethod="runMethod"

                                            />
                                    </keep-alive>
                                </div>
                            </q-tab-panel>
                            
                        </q-tab-panels>
                    </template>
                </q-splitter>

                <!--<q-page-sticky position="top-left" :offset="[7, 10]" >
                    <q-fab fab color="primary" flat size="sm" square
                        icon="fas fa-angle-double-left"
                        active-icon="fas fa-angle-double-right"
                        
                        @click="changeLeftMenu"  />
                </q-page-sticky>-->

            </div>
            <div v-else style="height: calc(100vh - 80px)"  >
                <q-inner-loading :showing="!dataLoaded">
                    <q-spinner-facebook size="10%" color="primary" />
                </q-inner-loading>
            </div>
        </q-card>
    </div>
</template>
<script>
//import Vue from 'vue';
//import Vuex from 'vuex';

export default ({
    name: 'tableComponent',
    props: {
        moduleName: { type: String , required: true },
        parametersData: { type: Object , required: false },
    },
    mounted(){
        if(this.router&&this.router.currentRoute&&this.router.currentRoute.params&&this.router.currentRoute.params.id){
            if(this.editStatus.editMode=='create'&&this.router.currentRoute.params.id!=0){
                let newStatus = { 
                    editMode: 'edit',
                    copyRecord: 0,
                    navigateToRecord: this.router.currentRoute.params.id,
                }
                this.editStatus = newStatus;
            }
        }
        this.tab = this.editConfig.startTab;
        this.loadData();
    },
    data () {
        return {
            router: this.$router
            ,tab: null
            ,dataLoaded: false
        }
    },
    methods:{
        loadData(){
            this.dataLoaded = false;
            this.$axios({
                method: 'GET',
                url: this.apiURL + this.editConfig.spSelectName,
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    row_id: this.editStatus.editMode=='create'?this.editStatus.copyRecord:this.editStatus.navigateToRecord,
                    editMode: this.editStatus.editMode=='create'?true:false
                }
            }).then((response) => {
                this.editData = [];
                let newEditData = {};
                Object.keys(response.data[0]).map(x=>{
                    newEditData[x] = JSON.parse(response.data[0][x])
                })
                this.editData = newEditData;
                //Fix LookupColumns
                let newEditConfig = JSON.parse(JSON.stringify(this.editConfig))
                newEditConfig.moduleTabs.map(tab=>{
                    try{
                        if(tab.tabConfig&&tab.tabConfig.columns){
                            tab.tabConfig.columns.map(columna=>{
                                if(columna.lookupOptions){
                                    if(typeof(columna.lookupOptions)=='string'){
                                        let newlookupoptions = this[columna.lookupOptions.split('.')[1]][columna.lookupOptions.split('.')[2]]
                                        columna.lookupOptions = newlookupoptions
                                    }
                                }
                            })
                        }
                    }catch(ex){console.dir('se cayó: '); console.dir(ex)}
                    return tab
                })
                this.editConfig = newEditConfig;
                this.$emit('onLoadedData')
                this.dataLoaded = true
            }).catch((error) => {
                console.error(error.message)
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
                //this.loadingData = false
                this.goBack(false)
            })
        },
        goPrevRecord(){
            try{
                let indexNum = this.dataRows.findIndex(obj => obj.value==this.router.currentRoute.params.id);
                indexNum--;
                let gotoRecord = this.dataRows[indexNum].value
                let newSelectedRow = this.dataRows.filter(row=>row.value==gotoRecord);
                this.selectedRows = newSelectedRow;
                this.router.push(this.mainRoute+'/'+gotoRecord);
            }catch(ex){
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "No se encontraron más registros"
                    ,timeout: 500, progress: true , icon: "fas fa-hand-paper"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }
        },
        goNextRecord(){
            try{
                let indexNum = this.dataRows.findIndex(obj => obj.value==this.router.currentRoute.params.id);
                indexNum++;
                let gotoRecord = this.dataRows[indexNum].value
                let newSelectedRow = this.dataRows.filter(row=>row.value==gotoRecord);
                this.selectedRows = newSelectedRow;
                this.router.push(this.mainRoute+'/'+gotoRecord);
            }catch(ex){
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "No se encontraron más registros"
                    ,timeout: 500, progress: true , icon: "fas fa-hand-paper"
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
            }
        },
        goBack(showConfirm){
            if(showConfirm){
                this.$q.dialog({
                        title: 'CONFIRMACIÓN',
                        message: 'Desea regresar y descartar cambios realizados?',
                        ok: {  label: 'Sí', flat: true, icon: 'fas fa-arrow-circle-left', color: 'primary' },
                        cancel: {  label: 'No',  flat: true, color: 'primary', "no-caps": true },
                        persistent: true
                    }).onOk(() => {
                    //this.editRecord = null;
                    this.editMode = false;
                    this.router.push(this.mainRoute)
                });
            }else{
                this.router.push(this.mainRoute);
            }
            
        },
        saveData(goBack){
            try{
                this.dataLoaded = false;


                
                /*
                console.dir('!!! esto debe ocurrir antes de nada, para que NO se pierda la data en memoria al recargar información') ;
                console.dir('barrerme tabs, y recuperar data final porque en grids pesados, NO se usa VUEX directamente xq hace lento los grids x ejemeplo') ;
                console.dir('si un tab NO se ha abierto (porque el usuario NO lo ha seleccionad), NO va a aparecer en el barrido; sin embargo su data NO pudo haber cambiado porque no hubo interacción con el usuario? notar que al abrir el formulario, toda la data llega directamente') ;
                console.dir('PENDIENTE revisar cómo se comportan CASOS') ;
                console.dir(this.$refs)
                */
                
                Object.keys(this.$refs).map(x=>{
                    try{
                        this.$refs[x][0].updateVuex();
                    }catch(ex){}
                })


                //FIX DATA (remove unnecessary properties from vuex editData)
                let newEditData = {}
                
                this.editConfig.editDataSaveProperties.map(x=>{
                    if(x.fields==null){//NO fields
                        if(x.filterBy==null){
                            newEditData[x.name] = this.editData[x.name]
                        }
                        if(x.filterBy!=null){
                            if(x.filterBy.operator=='<'){ newEditData[x.name] = this.editData[x.name].filter(y=>y[x.filterBy.field] < [x.filterBy.condition]) }
                            if(x.filterBy.operator=='>'){ newEditData[x.name] = this.editData[x.name].filter(y=>y[x.filterBy.field] > [x.filterBy.condition]) }
                            if(x.filterBy.operator=='<='){ newEditData[x.name] = this.editData[x.name].filter(y=>y[x.filterBy.field] <= [x.filterBy.condition]) }
                            if(x.filterBy.operator=='>='){ newEditData[x.name] = this.editData[x.name].filter(y=>y[x.filterBy.field] >= [x.filterBy.condition]) }
                        }
                    }else{//SÍ TIENE FIELDS
                        if(x.filterBy!=null){
                            if(x.filterBy.operator=='<'){ newEditData[x.name] = this.editData[x.name].filter(y=>y[x.filterBy.field] < [x.filterBy.condition]) }
                            if(x.filterBy.operator=='>'){ newEditData[x.name] = this.editData[x.name].filter(y=>y[x.filterBy.field] > [x.filterBy.condition]) }
                            if(x.filterBy.operator=='<='){ newEditData[x.name] = this.editData[x.name].filter(y=>y[x.filterBy.field] <= [x.filterBy.condition]) }
                            if(x.filterBy.operator=='>='){ newEditData[x.name] = this.editData[x.name].filter(y=>y[x.filterBy.field] >= [x.filterBy.condition]) }
                            let result = newEditData[x.name];
                            let finalArray = []
                            result = result.map(z=>{
                                let record = {}
                                Object.keys(z).map(col=>{ if(x.fields.some(includedCol=>includedCol==col)){ record[col] = z[col] } })
                                finalArray.push(record)
                            })
                            newEditData[x.name] = finalArray;
                        }else{
                            //let result = newEditData[x.name];
                            let result = this.editData[x.name];
                            let finalArray = []
                            result = result.map(z=>{
                                let record = {}
                                Object.keys(z).map(col=>{ if(x.fields.some(includedCol=>includedCol==col)){ record[col] = z[col] } })
                                finalArray.push(record)
                            })
                            newEditData[x.name] = finalArray;
                        }
                    }
                })

                //console.dir(newEditData);
                //this.dataLoaded = true; return;

                //POST data to server
                this.$axios.post( this.apiURL + this.editConfig.spUpdateName, {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        row_id: this.editStatus.editMode=='create'?0:this.editStatus.navigateToRecord,
                        "editRecord": JSON.stringify(newEditData),
                    }
                , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    this.$q.notify({color: 'positive', message: 'Sus datos han sido guardados' , timeout: 500, icon: "fas fa-save" });
                    this.dataLoaded = true;
                    //handle routing if it should go back or stay in editForm
                    if(goBack){
                        this.$router.push(this.mainRoute) //navigate to main Data Grid
                    }else{//se mantiene en editForm (no regresa), entonces cargo data del registro navegando al ID (siempre y cuando se esté creando registro, es decir, si cambia el [this.editStatus.navigateToRecord] )
                        //agregado this.columnKeyName.length porque cuando NO existe this.columnKeyName es porque se copió tab en navegador
                        if( this.columnKeyName.length > 1 && response.data[0][this.columnKeyName] != this.editStatus.navigateToRecord){
                            let newStatus = { 
                                editMode: 'edit',
                                copyRecord: 0,
                                navigateToRecord: response.data[0][this.columnKeyName]
                            }
                            this.editStatus = newStatus;
                            this.$router.push(this.mainRoute+'/'+this.editStatus.navigateToRecord) //navigate to Record or NewRecord (and reloads data)
                        }else{
                            this.loadData()//reload data, because possible changes (such as audit, newCancel should update cancel, etc)
                        }
                    }
                }).catch((error) => {
                    console.dir(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white', } ]
                    })
                    this.dataLoaded = true;
                })
            }catch(ex){
                console.dir(ex.message)
                this.dataLoaded = true;
            }
        },
        updateVuexData(newVal, oldVal){
            try{
                this.$refs['tab_'+oldVal][0].updateVuex();
            }catch(ex){}
        },
       
        changeLeftMenu(){ 
            if(this.editFormLeftCollapsed){
                this.splitterModel = 230//210
                this.editFormLeftCollapsed = false;
            }else{
                this.splitterModel = 55//55
                this.editFormLeftCollapsed = true;
            }
        },
        runMethod(receivedData){
            try{
                this.$refs['tab_'+receivedData.tabName][0][receivedData.methodName]();
            }catch(ex){}
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
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
        rptName: { get () { return this.$store.state[this.moduleName].rptName }, },
        rptLink: { get () { return this.$store.state[this.moduleName].rptLink }, },
        rptLinkCompany: { get () { return this.$store.state[this.moduleName].rptLinkCompany }, },
        rptType: { get () { return this.$store.state[this.moduleName].rptType }, },
        editMode: {
            get () { return this.$store.state[this.moduleName].editMode },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'editMode', value: val}) }
        },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
        editConfig: {
            get () { return this.$store.state[this.moduleName].editConfig },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editConfig', value: val})  }
        },
        hideCloseButton: {
            get () { return this.$store.state[this.moduleName].editConfig.hideCloseButton },
        },
        editData: {
            get () { return this.$store.state[this.moduleName].editData },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editData', value: val})  }
        },
        editFormLeftCollapsed: {
            get () { return this.$store.state.main.editFormLeftCollapsed },
            set (val) { this.$store.commit('main/updateState', {key: 'editFormLeftCollapsed', value: val}) }
        },
        splitterModel: {
            get () { return this.$store.state.main.splitterModel },
            set (val) { this.$store.commit('main/updateState', {key: 'splitterModel', value: val}) }
        },
        dynamicComponent() {
            let componentRooot = this.editConfig.moduleTabs.filter(x=>x.tabName==this.tab)[0].rootPath
            let componentRoute = this.editConfig.moduleTabs.filter(x=>x.tabName==this.tab)[0].importPath
            if(componentRooot=='pages'){
                return () =>import('pages/' + componentRoute)
            }
            if(componentRooot=='components'){
                return () =>import('components/' + componentRoute)
            }
        },
        mainRoute: { get () { return this.$store.state[this.moduleName].mainRoute }, },
        dataRows: { get () { return this.$store.state[this.moduleName].dataRows }, },
        selectedRows: {
            get () { return this.$store.state[this.moduleName].selectedRows },
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'selectedRows', value: val}) }
        },
        columnKeyName:{
            get () { return this.$store.state[this.moduleName].columnKeyName },
        },
    },
    watch: {
        '$route.params.id': function (val) {
            if(val){
                //console.dir('cambiando ID')
                this.loadData();
            }
        },
        tab: function (val) {
            if(val){
                try{
                    this.$refs['tab_'+val][0].tabShown();
                }catch(ex){}
            }
        },
        
    }
})
</script>