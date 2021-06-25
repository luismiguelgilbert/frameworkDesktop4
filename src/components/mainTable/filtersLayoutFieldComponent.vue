<template>
<div class="q-pl-sm q-pr-sm">
    <q-input dense
        ref="inputField"
        :label="field.label" 
        :label-color="isFieldFiltered?'positive':null"
        :value="displayValue"
        :title="displayValue"
        @click.self="openDialog"
        >
        <template v-slot:append>
            <q-btn round v-if="isFieldFiltered" icon="fas fa-times" flat size="xs" class="q-mt-md" @click.prevent="clearField()" />
            <q-icon name="fas fa-sort-down" @click.self="openDialog" />
        </template>
    </q-input>

    <q-dialog v-model="isDialogVisible" @show="loadFieldData" >
        <q-card >
            <q-bar class="bg-primary q-pr-xs text-white">
                {{field.label}}
                <q-space />
                <q-btn flat dense round color="white"  icon="fas fa-times" @click="isDialogVisible=false" />
            </q-bar>
            <!--No me gusta.. mejor dekarla el q-card-section sin el style="min-height: 200px;"-->
            <q-card-section class="q-pa-sm" >
                <q-input v-if="field.ux_type!=='date'&&field.ux_type!=='datetime'" v-model="searchString" dense autofocus 
                    placeholder="Buscar.."
                    input-class="q-pl-sm" >
                    <template v-slot:append>
                        <q-icon v-if="searchString===''" name="fas fa-search" />
                        <q-btn flat dense round v-if="searchString!==''" icon="fas fa-times" @click="searchString=''" />
                    </template>
                </q-input>
                <q-btn-dropdown flat class="full-width" v-if="field.ux_type==='date'||field.ux_type==='datetime'" label="Filtros Rápidos" no-caps no-wrap>
                    <q-list>
                        <q-item class="text-primary" v-close-popup clickable @click="selectToday"><q-item-section>Hoy</q-item-section></q-item>
                        <q-item class="text-primary" v-close-popup clickable @click="selectYesterday"><q-item-section>Ayer</q-item-section></q-item>
                        <q-item class="text-primary" v-close-popup clickable @click="selectLastWeek"><q-item-section>Últimos 7 días</q-item-section></q-item>
                        <q-item class="text-primary" v-close-popup clickable @click="selectLastMonth"><q-item-section>Últimos 30 días</q-item-section></q-item>
                    </q-list>
                </q-btn-dropdown>
                <q-table v-if="field.ux_type!=='date'&&field.ux_type!=='datetime'"
                    ref="gridSearch"
                    :data="gridData"
                    dense flat square bordered
                    row-key="value"
                    selection="multiple"
                    :selected.sync="selectedRows"
                    virtual-scroll
                    :rows-per-page-options="[0]"
                    hide-bottom
                    table-style="max-height: 200px;"
                    :filter="searchString"
                    :visible-columns="visibleColumns"
                    hide-header
                    >
                    <template v-slot:body-cell="props">
                        <q-td :props="props" style="text-align: left !important;" >
                            {{props.value}}
                        </q-td>
                    </template>
                </q-table>
                <!--{{ticked}}-->
                <q-tree v-if="field.ux_type==='date'||field.ux_type==='datetime'"
                    :nodes="treeData"
                    node-key="value"
                    label-key="label"
                    class="scroll" style="width: 225px; height: 250px; max-height: 250px;"
                    tick-strategy="leaf"
                    :ticked.sync="ticked"
                    />
                    
            </q-card-section>
            <q-card-actions align="around">
                <q-btn flat color="primary" label="OK" @click="applyFilter" />
                <q-btn flat color="primary" label="Cancelar" @click="isDialogVisible=false" />
            </q-card-actions>

            <q-inner-loading :showing="loadingData" style="z-index: 999;">
                <q-spinner-ios size="50px" color="amber" />
            </q-inner-loading>
        </q-card>
    </q-dialog>
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default({
    name: 'filtersLayoutFieldComponent',
    props: {
        moduleName: { type: String , required: true },
        field: { type: Object , required: true },
    },
    data () {
        return {
            isDialogVisible: false, searchString: '', gridData: [], selectedRows: [], ticked: [],
            visibleColumns: [], firstLabelFieldName: ''
        }
    },
    computed:{
        loadingData: { 
            get () { return this.$store.state[this.moduleName].loadingData }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'loadingData', value: val}) }  
        },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        currentFilter: { 
            get () { return this.$store.state[this.moduleName].currentFilter }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateState', {key: 'currentFilter', value: val}) }  
        },
        //isFieldFiltered: { get() { return this.currentFilter.some(x=>x.db_column==this.field.db_column ) } },
        isFieldFiltered: { get() { return this.currentFilter.some(x=>x.db_column==this.field.db_column && (x.valueC!=null&&x.valueC.length>0) ) } },
        displayValue: { get() { 
            if(this.currentFilter.some(x=>x.db_column==this.field.db_column)){
                return this.currentFilter.find(x=>x.db_column==this.field.db_column).valueClabel
            }else{
                return null
            }
        } },
        treeData: { get() {
                let result = []
                let years = []
                let months = []
                let existingDates = this.gridData.map(x=>{
                    return {
                        value: x.value
                        ,year:  x.value.substring(0,4)//.replace('-','')
                        ,month:  x.value.substring(5,7)//.replace('-','')
                        ,day:  x.value.substring(8,10)//.replace('-','')
                    }
                });
                years = Array.from(new Set(existingDates.map(x=>x.year)))
                years.map(x=>{
                    result.push({
                        value: x
                        ,label: x
                        ,children: Array.from(new Set(existingDates.filter(int1=>int1.year==x).map(int2=>int2.month))).map(int3=>{
                                return {
                                    value: x+'_'+int3
                                    ,label: this.returnMonthName(int3) 
                                    ,children: Array.from(new Set(existingDates.filter(fin1=>fin1.year==x&&fin1.month==int3))).map(int4=>{
                                            return {
                                                value: int4.value
                                                ,label: int4.day
                                            }
                                        }
                                    )
                                }
                            })
                        })
                })
                return result
            } 
        }
    },
    methods:{
        openDialog(){
            this.isDialogVisible = true;
            this.$refs.inputField.blur();
        },
        loadFieldData(){
            this.loadingData = true;
            this.gridData = [];
            this.$axios.post( this.apiURL+'getLookupData', 
                {
                    link_name: this.moduleName
                    ,sys_user_code: this.userCode
                    ,sys_company_id: this.userCompany
                    ,db_column: this.field.db_column
                } , {headers: { 'Authorization': "Bearer " + this.$q.sessionStorage.getItem('jwtToken') }}
            ).then((response) => {
                this.gridData = response.data;
                //construye arreglo de columnas visible (todas menos value)
                if(response.data && response.data.length>0){
                    this.visibleColumns = []
                    let contador = 0;
                    Object.keys(response.data[0]).map(x=>{
                        if(x!='value'){
                            this.visibleColumns.push(x)
                            if(contador==0){this.firstLabelFieldName = x};
                            contador++;
                        }
                    })
                }
                //preSelect filtered value(s) when NOT DATE (this.selectedRows)
                if(this.field.ux_type!=='date'&&this.field.ux_type!=='datetime'){
                    this.selectedRows = [];
                    if(this.currentFilter.some(x=>x.db_column==this.field.db_column)){
                        this.currentFilter.find(x=>x.db_column==this.field.db_column).valueC.split(',').map(y=>{
                            if(y&&y.length>0){
                                this.selectedRows.push(this.gridData.find(z=>z.value==y||z.value==y.replace('"','').replace('"','')))
                            }
                        })
                    }
                }
                //preSelect filtered value(s) when NOT DATE (this.selectedRows)
                if(this.field.ux_type==='date'||this.field.ux_type==='datetime'){
                    this.ticked = [];
                    if(this.currentFilter.some(x=>x.db_column==this.field.db_column)){
                        this.currentFilter.find(x=>x.db_column==this.field.db_column).valueC.split(',').map(y=>{
                            if(y&&y.length>0){
                                this.ticked.push(y.replace('"','').replace('"',''))
                            }
                        })
                    }
                }
                
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
        },
        clearField(){
            this.selectedRows = [];
            this.searchString = '';
            let newFilterArray = [];
            newFilterArray = JSON.parse(JSON.stringify(this.currentFilter))//clona
            newFilterArray = newFilterArray.filter(x=>x.db_column!=this.field.db_column)//remueve campo a agregar
            this.currentFilter = newFilterArray;//save to vuex
            this.$emit('onFilterApplied', 'filterUpdated')//emit to parent, so parent will reload data
        },
        applyFilter(){
            let newFilterArray = [];
            newFilterArray = JSON.parse(JSON.stringify(this.currentFilter))//clona
            newFilterArray = newFilterArray.filter(x=>x.db_column!=this.field.db_column)//remueve campo a agregar
            this.loadingData=true;
            let newFilter = {
                 db_column: this.field.db_column
                ,symbol: 'in'//se deja fijo
                ,valueC: (this.field.ux_type==='date'||this.field.ux_type==='datetime')?JSON.stringify(this.ticked).replace('[','').replace(']',''):JSON.stringify(this.selectedRows.map(x => x.value)).replace('[','').replace(']','')
                //,valueClabel: (this.field.ux_type==='date'||this.field.ux_type==='datetime')?this.ticked.length+' fechas':this.selectedRows.map(x => x[this.firstLabelFieldName])
                ,valueClabel: (this.field.ux_type==='date'||this.field.ux_type==='datetime')?this.ticked.length+' fechas':this.selectedRows.map(x => x[this.firstLabelFieldName]).toString()
            }
            newFilterArray.push(newFilter)
            this.currentFilter = newFilterArray;
            this.loadingData=false;
            this.isDialogVisible=false;
            this.$emit('onFilterApplied', 'filterUpdated')
        },
        returnMonthName(monthNum){
            let result = ''
            if(monthNum=='01'){result='Enero'}
            if(monthNum=='02'){result='Febrero'}
            if(monthNum=='03'){result='Marzo'}
            if(monthNum=='04'){result='Abril'}
            if(monthNum=='05'){result='Mayo'}
            if(monthNum=='06'){result='Junio'}
            if(monthNum=='07'){result='Julio'}
            if(monthNum=='08'){result='Agosto'}
            if(monthNum=='09'){result='Septiembre'}
            if(monthNum=='10'){result='Octubre'}
            if(monthNum=='11'){result='Noviembre'}
            if(monthNum=='12'){result='Diciembre'}
            return result
        },
        selectToday(){
            this.ticked = [];
            let hoy = new Date();
            let valueDate = hoy.getFullYear() + '-' + ('0'+(hoy.getMonth() + 1).toString()).slice(-2) + '-' + ('0'+(hoy.getDate()).toString()).slice(-2) + 'T00:00:00.000Z';
            this.ticked.push(valueDate)
        },
        selectYesterday(){
            this.ticked = [];
            let yesterday = new Date();
            yesterday = new Date(new Date().setDate(new Date().getDate()-1));
            let valueDate = yesterday.getFullYear() + '-' + ('0'+(yesterday.getMonth() + 1).toString()).slice(-2) + '-' + ('0'+(yesterday.getDate()).toString()).slice(-2) + 'T00:00:00.000Z';
            this.ticked.push(valueDate)
        },
        selectLastWeek(){
            this.ticked = [];
            let counter = 0;
            let looper = new Date();
            while (counter <= 6){
                looper = new Date(new Date().setDate(new Date().getDate()-counter));
                let valueDate = looper.getFullYear() + '-' + ('0'+(looper.getMonth() + 1).toString()).slice(-2) + '-' + ('0'+(looper.getDate()).toString()).slice(-2) + 'T00:00:00.000Z';
                this.ticked.push(valueDate)
                counter++;
            }
        },
        selectLastMonth(){
            this.ticked = [];
            let counter = 0;
            let looper = new Date();
            while (counter <= 29){
                looper = new Date(new Date().setDate(new Date().getDate()-counter));
                let valueDate = looper.getFullYear() + '-' + ('0'+(looper.getMonth() + 1).toString()).slice(-2) + '-' + ('0'+(looper.getDate()).toString()).slice(-2) + 'T00:00:00.000Z';
                this.ticked.push(valueDate)
                counter++;
            }
        }
        
    }
})
</script>