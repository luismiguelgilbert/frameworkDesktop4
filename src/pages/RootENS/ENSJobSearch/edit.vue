<template>
<q-layout container view="hHh lpR lff" style="min-height: 50px !important; height: calc(100vh - 50px);">
    <q-header>
        <q-toolbar :class="toolbarComponentClass">
             <q-space />
             <q-input 
                v-model="toolbarSearchString" class="q-ml-md"
                debounce="100" maxlength="50" style="min-width: 50%;"
                dense 
                placeholder="Escriba profesión, cargo, empresa o habilidad que esté buscando y presione el botón..." 
                :input-class="userColor!=='blackDark'?'text-primary':'text-white'"
                :autofocus="$q.screen.gt.sm?true:false">
            </q-input>
            <q-btn :disable="!(toolbarSearchString.length>0)" color="primary" flat no-caps no-wrap stretch icon="fas fa-search" label="Buscar" @click="loadData" />
            <q-space />
        </q-toolbar>

        <q-separator color="grey-4" />
    </q-header>

    <q-page-container>
        <DxDataGrid
            ref="mainviewtableDxDataGrid"
            height="calc(100vh - 107px)"
            column-resizing-mode="widget"
            :data-source="gridData"
            :allow-column-resizing="true" 
            :allow-column-reordering="true"
            :show-borders="false"
            :show-column-lines="userTableLinesDXcols"
            :show-row-lines="userTableLinesDXrows"
            :cache-enabled="false"
            keyExpr="sys_user_code"
            @context-menu-preparing="showOptions"
            >
                <DxColumn name="sys_user_name" data-field="sys_user_name" data-type="string" caption="Nombres" :minWidth="300" alignment="left" :allowFiltering="true" :allowSorting="true" />
                <DxColumn name="sys_user_lastname" data-field="sys_user_lastname" data-type="string" caption="Apellidos" :minWidth="300" alignment="left" :allowFiltering="true" :allowSorting="true" />
                <DxColumn name="teamName" data-field="teamName" data-type="string" caption="Equipo" width="300" alignment="left" :allowFiltering="true" :allowSorting="true" />
                <DxColumn name="jobPosition" data-field="jobPosition" data-type="string" caption="Cargo" :minWidth="200" alignment="left" :allowFiltering="true" :allowSorting="true" />
                
                <DxScrolling mode="virtual"  rowRenderingMode="virtual" :useNative="false" showScrollbar="always" /> <!--columnRenderingMode="virtual" hace que la última columna tenga un margen-->
                <DxPager :visible="true" :show-page-size-selector="false" :allowed-page-sizes="allowedPageSizes" :show-info="true" :infoText="'Página {0} de {1} ({2} registros)'" :showNavigationButtons="true" :showPageSizeSelector="false" />
                    
                <DxHeaderFilter :visible="true" :allowSearch="true" :texts="{cancel: 'Cancelar', ok: 'Filtrar', emptyValue: '(Vacío)'}" />
                
                <DxSelection select-all-mode="page" show-check-boxes-mode="always" mode="single" :deferred="false"/>
                <DxSorting mode="single" ascendingText="Ordenar ascendente" clearText="Limpar orden" descendingText="Ordenar descendente" />
                <DxStateStoring :enabled="true" type="sessionStorage" storage-key="invQueryMain" :savingTimeout="200" />

                

        </DxDataGrid>
    </q-page-container>

     <!--Details-->
    <DxPopup
        v-if="personDataWindow"
        :visible.sync="personDataWindow"
        :drag-enabled="true"
        :resizeEnabled="true"
        :close-on-outside-click="true"
        :show-title="true"
        width="calc(85vw)"
        height="calc(75vh)"
        :title="'Datos de ' + selectedPersona.sys_user_name + ' ' + selectedPersona.sys_user_lastname"
        >
            <div style="margin: -14px;">
                <q-splitter v-model="splitterModel" style="height: calc(75vh - 56px)">
                    <template v-slot:before>
                        <q-tabs v-model="tab" vertical class="text-primary" >
                            <q-tab name="basic" icon="fas fa-user" label="Datos de la Persona" />
                            <q-tab name="jobs" icon="fas fa-building" label="Historia Laboral" />
                        </q-tabs>
                    </template>
                    <template v-slot:after>
                        <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up" >
                            <q-tab-panel name="basic">
                                <q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
                                    <q-input
                                        label="Nombres" readonly filled v-model="selectedPersonaData.basic.sys_user_name"
                                        >
                                        <template v-slot:prepend><q-icon name="fas fa-id-card" /></template>
                                    </q-input>
                                    <q-input
                                        label="Apellidos" readonly filled v-model="selectedPersonaData.basic.sys_user_lastname"
                                        >
                                        <template v-slot:prepend><q-icon name="fas fa-id-card" /></template>
                                    </q-input>
                                    <q-input
                                        v-for="(telefono,index) in selectedPersonaData.phones" :key="index"
                                        label="Teléfono" readonly filled v-model="telefono.phoneNumber"
                                        >
                                        <template v-slot:prepend><q-icon name="fas fa-phone" /></template>
                                    </q-input>
                                    <q-input
                                        v-for="(mail,index) in selectedPersonaData.mails" :key="index"
                                        label="Mail" readonly filled v-model="mail.mailAddress"
                                        >
                                        <template v-slot:prepend><q-icon name="fas fa-envelope" /></template>
                                    </q-input>
                                </q-form>
                            </q-tab-panel>
                            <q-tab-panel name="jobs">
                                <q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
                                    <div v-for="(job, index) in selectedPersonaData.jobs" :key="'job_'+index">
                                        <q-input
                                            label="Empresa" readonly filled v-model="job.companyName"
                                            >
                                            <template v-slot:prepend><q-icon name="fas fa-building" /></template>
                                        </q-input>
                                        <q-input
                                            label="Cargo" readonly filled v-model="job.jobPosition"
                                            >
                                            <template v-slot:prepend><q-icon name="fas fa-user" /></template>
                                        </q-input>
                                        <q-input
                                            label="Habilidades" readonly filled v-model="job.jobSkills" type="textarea"
                                            >
                                            <template v-slot:prepend><q-icon name="fas fa-briefcase" /></template>
                                        </q-input>
                                        
                                    </div>
                                </q-form>
                            </q-tab-panel>
                        </q-tab-panels>
                    </template>
                </q-splitter>
                
            </div>
    </DxPopup>
</q-layout>
</template>
<script>
import { DxDataGrid, DxColumn, DxScrolling, DxLookup, DxExport, DxSorting, DxPaging, DxPager, DxSelection, DxSummary, DxTotalItem, DxStateStoring, DxHeaderFilter, DxRemoteOperations } from 'devextreme-vue/data-grid';
import { DxPopup, DxToolbarItem } from 'devextreme-vue/popup';

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxDataGrid,
        DxScrolling,
        DxSorting,
        DxPaging,
        DxPager,
        DxColumn,
        DxLookup,
        DxSelection,
        DxTotalItem,
        DxSummary,
        DxStateStoring,
        DxHeaderFilter,
        DxRemoteOperations,
        DxExport,
        DxPopup,
        DxToolbarItem,
    },
    mounted(){//NO debe ser created, porque aun NO estaría creado el componente editForm
        let newEditStatus = JSON.parse(JSON.stringify(this.editStatus));
        newEditStatus.editMode = 'edit';
        newEditStatus.navigateToRecord = this.userCode;
        this.editStatus = newEditStatus;
        this.columnKeyName = 'sys_user_code';
        this.editReady = true;
    },
    data () {
        return {
            //Confirmed
            router: this.$router,
            editReady: false,
            toolbarSearchString: '',
            gridData: [],
            personDataWindow: false,
            selectedPersona: null,
            selectedPersonaData: {},
            splitterModel: 20,
            tab: 'basic',
        }
    },
    methods:{
        loadData(){
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spEnsJobSearch',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    searchString: this.toolbarSearchString,
                }
            }).then((response) => {
                this.gridData = response.data
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
                    ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                })
                this.loadingData = false
            })
        },
        showOptions(e){
            if(e.row.rowType=='data'){
                e.component.selectRows(e.row.key);
                this.selectedPersona = e.row.data;
                e.items = [
                    { text: "Ver datos de la persona", icon: "fas fa-search", onItemClick: ()=> { 
                            this.$axios({
                                method: 'GET',
                                url: this.apiURL + 'spEnsPersonasSelectEdit',
                                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                                params: {
                                    userCode: this.userCode,
                                    userCompany: this.userCompany,
                                    userLanguage: 'es',
                                    row_id: e.row.data.sys_user_code,
                                    editMode: false
                                }
                            }).then((response) => {
                                Object.keys(response.data[0]).map(x=>{
                                    this.selectedPersonaData[x] = JSON.parse(response.data[0][x])
                                })
                                this.personDataWindow = true;
                            }).catch((error) => {
                                console.dir(error.message)
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
                                this.selectedItemKardex = []
                            })
                        }
                    },
                ];
            }
        },
    },
    computed:{
        userCode: { get () { return this.$store.state.main.userCode } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editStatus', value: val})  }
        },
        editConfig: {
            get () { return this.$store.state[this.moduleName].editConfig },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editConfig', value: val})  }
        },
        editData: {
            get () { return this.$store.state[this.moduleName].editData },
        },
        toolbarComponentClass: { get () {
            let result = 'no-padding '
            if(this.$store.state.main.userColor=='default'){
                result=result + 'bg-white text-white'
            }
            if(this.$store.state.main.userColor=='blackDark'){
                result=result + 'bg-grey-10 text-white'
            }
            return result
        }},
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        userTableLinesDXcols: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='vertical'){ result = true }
                return result
            } 
        },
        userTableLinesDXrows: { get () { 
                let result = false;
                if(this.userTableLines=='cell'||this.userTableLines=='horizontal'){ result = true }
                return result
            } 
        },
        allowedPageSizes:{
            get () { 
                let resultado = []
                resultado.push(this.userRowsPerPage)
                return resultado
            },
        },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    },

})
</script>