<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div v-if="rewTableID>0">
        <q-card style="height: calc(100vh - 170px);">
            <q-splitter v-model="splitterModel" style="height: calc(100vh - 170px);">

                <template v-slot:before>
                    <q-toolbar class="text-subtitle2 bg-primary text-white no-padding" style="border-top-left-radius: 4px;">
                        <div class="q-pl-sm ellipsis">Lista de Resultados</div>
                        <q-space />
                        <q-btn color="white" title="Opciones"  no-caps no-wrap flat stretch icon="fas fa-ellipsis-v">
                            <q-menu>
                                <q-list >
                                    <q-item clickable clickable v-close-popup @click="addRewMasterResult" >
                                        <q-item-section side>
                                            <q-icon name="fas fa-plus" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label>Agregar Registro a Lista de Resultados</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                    <q-item clickable clickable v-close-popup @click="batchUpdateConditions" >
                                        <q-item-section side>
                                            <q-icon name="fas fa-pen-square" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label>Actualizar Condición de Pago en Todos los Resultados</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                    </q-toolbar>
                    <q-separator />

                    <!-- RESULTADOS -->
                    <q-list v-if="rewMasterResults.length>0"  style="height: calc(100vh - 221px); overflow-y: scroll;" >
                        <q-card v-for="(resultado, index) in rewMasterResults" :key="index" class="q-ma-md">
                            <q-expansion-item 
                                :header-class="userColor=='default'?'bg-grey-3 text-primary ':'bg-grey-8 text-primary'" 
                                style="border-top-left-radius: 4px; border-top-right-radius: 4px;"
                                header-style="border-top-left-radius: 4px; border-top-right-radius: 4px;"
                                expand-icon-class="text-primary"
                                :label="resultado.name_es" >
                                <template v-slot:header>
                                    <q-item-section side>
                                        <q-btn icon="fas fa-ellipsis-v" color="primary" @click.stop flat round>
                                            <q-menu>
                                                <q-list>
                                                    <q-item clickable v-close-popup @click="addRewMasterResultsLines(resultado)" class="text-primary">
                                                        <q-item-section side><q-icon name="fas fa-plus" color="primary" /></q-item-section>
                                                        <q-item-section>Nuevo Plan </q-item-section>
                                                    </q-item>
                                                    <q-item clickable v-close-popup @click="renameRewMasterResult(resultado)" class="text-primary">
                                                        <q-item-section side><q-icon name="fas fa-edit" color="primary" /></q-item-section>
                                                        <q-item-section>Renombrar {{resultado.name_es}}</q-item-section>
                                                    </q-item>
                                                    <q-item clickable v-close-popup @click="deleteRewMasterResult(resultado)" class="text-red">
                                                        <q-item-section side><q-icon name="fas fa-trash-alt" color="red" /></q-item-section>
                                                        <q-item-section>Eliminar {{resultado.name_es}}</q-item-section>
                                                    </q-item>
                                                </q-list>
                                            </q-menu>
                                        </q-btn>
                                    </q-item-section>

                                    <q-item-section class="ellipsis">{{resultado.name_es}}</q-item-section>

                                </template>

                                <q-list >
                                    <q-item
                                        v-for="(resultLine, index) in rewMasterResultsLines.filter(x=>x.resultID==resultado.resultID)"
                                        :key="resultLine.lineID" 
                                        :class="' ' + (resultLine==rewMasterResultsLinesSelected?' bg-primary text-white ':undefined)" 
                                        :active="resultLine==rewMasterResultsLinesSelected"
                                        active-class="bg-primary text-white"
                                        :style="rewMasterResultsLines.filter(x=>x.resultID==resultado.resultID).length == (index+1)?'border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;':undefined"
                                        clickable
                                        @click="selectRewMasterResultLine(resultLine)"
                                        >
                                        <q-item-section side>
                                            <q-btn icon="fas fa-cog" @click.stop flat round :color="resultLine==rewMasterResultsLinesSelected?'white':'primary'">
                                                <q-menu>
                                                    <q-list>
                                                        <q-item clickable v-close-popup @click="renameRewMasterResultLine(resultLine)" class="text-primary">
                                                            <q-item-section side><q-icon name="fas fa-edit" color="primary" /></q-item-section>
                                                            <q-item-section>Renombrar {{resultLine.name_es}}</q-item-section>
                                                        </q-item>
                                                        <q-item clickable class="text-primary" >
                                                            <q-item-section side><q-icon name="fas fa-copy" color="primary" /></q-item-section>
                                                            <q-item-section>Copiar {{resultLine.name_es}}</q-item-section>
                                                            <q-item-section side><q-icon name="fas fa-chevron-right" color="primary" size="0.5rem" /></q-item-section>
                                                            <q-menu anchor="top end" self="top start">
                                                                <q-list >
                                                                    <q-item 
                                                                        v-for="copiarResultado in rewMasterResults" :key="copiarResultado.resultID" 
                                                                        @click="copyPlanFromTo(resultLine,copiarResultado)"
                                                                        clickable v-close-popup >
                                                                        <q-item-section>
                                                                            <q-item-label>{{copiarResultado.name_es}}</q-item-label>
                                                                        </q-item-section>
                                                                    </q-item>
                                                                </q-list>
                                                            </q-menu>
                                                        </q-item>
                                                        <q-item clickable v-close-popup @click="deleteRewMasterResultLine(resultLine)" class="text-red">
                                                            <q-item-section side><q-icon name="fas fa-trash-alt" color="red" /></q-item-section>
                                                            <q-item-section>Eliminar {{resultLine.name_es}}</q-item-section>
                                                        </q-item>
                                                    </q-list>
                                                </q-menu>
                                            </q-btn>
                                        </q-item-section>
                                        <q-item-section>
                                            {{resultLine.name_es}}
                                        </q-item-section>
                                        <q-item-section side class="q-ml-lg"
                                                v-if="!(resultLine.sumType>0)  ||  (resultLine.sumFieldName==null||resultLine.sumFieldName=='')  ||  !(resultLine.resultType>0)  || (resultLine.resultType==1&&(resultLine.resultRangeTableID==0||resultLine.resultRangeTableID==null))  || (resultLine.resultType==2&&!(resultLine.resultRangeValue>0))">
                                                <q-icon name="fas fa-exclamation-triangle" color="red" />
                                        </q-item-section>
                                        <!--
                                        <q-item-section class="no-padding" side>
                                            <q-btn flat stretch color="primary" no-caps no-wrap align="left" dense >
                                                <q-item>
                                                    <q-item-section>
                                                        <q-icon name="fas fa-cog" :color="resultLine==rewMasterResultsLinesSelected?'white':'primary'" />
                                                    </q-item-section>
                                                    <q-menu>
                                                    <q-list>
                                                        <q-item clickable v-close-popup @click="renameRewMasterResultLine(resultLine)" class="text-primary">
                                                            <q-item-section side><q-icon name="fas fa-edit" color="primary" /></q-item-section>
                                                            <q-item-section>Renombrar {{resultLine.name_es}}</q-item-section>
                                                        </q-item>
                                                        <q-item clickable class="text-primary" >
                                                            <q-item-section side><q-icon name="fas fa-copy" color="primary" /></q-item-section>
                                                            <q-item-section>Copiar {{resultLine.name_es}}</q-item-section>
                                                            <q-item-section side><q-icon name="fas fa-chevron-right" color="primary" size="0.5rem" /></q-item-section>
                                                            <q-menu anchor="top end" self="top start">
                                                                <q-list >
                                                                    <q-item 
                                                                        v-for="copiarResultado in rewMasterResults" :key="copiarResultado.resultID" 
                                                                        @click="copyPlanFromTo(resultLine,copiarResultado)"
                                                                        clickable v-close-popup >
                                                                        <q-item-section>
                                                                            <q-item-label>{{copiarResultado.name_es}}</q-item-label>
                                                                        </q-item-section>
                                                                    </q-item>
                                                                </q-list>
                                                            </q-menu>
                                                        </q-item>
                                                        <q-item clickable v-close-popup @click="deleteRewMasterResultLine(resultLine)" class="text-red">
                                                            <q-item-section side><q-icon name="fas fa-trash-alt" color="red" /></q-item-section>
                                                            <q-item-section>Eliminar {{resultLine.name_es}}</q-item-section>
                                                        </q-item>
                                                    </q-list>
                                                </q-menu>
                                                </q-item>
                                            </q-btn>
                                        </q-item-section>
                                        <q-item-section class="no-padding" >
                                            <q-btn flat stretch :color="resultLine==rewMasterResultsLinesSelected?'white':'primary'" no-caps no-wrap align="left" dense @click="selectRewMasterResultLine(resultLine)" >
                                                <q-item>
                                                    <q-item-section>{{resultLine.name_es}}</q-item-section>
                                                    <q-item-section side class="q-ml-lg"
                                                        v-if="!(resultLine.sumType>0)  ||  (resultLine.sumFieldName==null||resultLine.sumFieldName=='')  ||  !(resultLine.resultType>0)  || (resultLine.resultType==1&&(resultLine.resultRangeTableID==0||resultLine.resultRangeTableID==null))  || (resultLine.resultType==2&&!(resultLine.resultRangeValue>0))">
                                                        <q-icon name="fas fa-exclamation-triangle" color="red" />
                                                    </q-item-section>
                                                </q-item>
                                            </q-btn>
                                        </q-item-section>
                                        -->
                                    </q-item>
                                </q-list>
                            </q-expansion-item>
                        </q-card>
                    </q-list>
                    <div v-else class="q-pa-md" >
                        No hay registros.
                    </div>

                </template>

                <template v-slot:after>
                    <div v-if="rewMasterResultsLinesSelected">
                        <q-tabs v-model="tabInternal" class="bg-primary text-white" active-color="white" indicator-color="positive" align="justify" no-caps style="height: 50px; border-top-right-radius: 4px;">
                            <q-tab name="payment" :label="'Comisiones a Pagar:  ' + rewMasterResults.find(x=>x.resultID==rewMasterResultsLinesSelected.resultID).name_es + ' / ' + rewMasterResultsLinesSelected.name_es" />
                            <q-tab name="filters" :label="'Condiciones de Pago:  ' + rewMasterResults.find(x=>x.resultID==rewMasterResultsLinesSelected.resultID).name_es + ' / ' + rewMasterResultsLinesSelected.name_es" />
                        </q-tabs>
                        <!--<q-separator />-->
                        
                        <q-tab-panels v-model="tabInternal" animated style="height: calc(100vh - 220px); overflow-y: auto;" >
                            <q-tab-panel name="payment" >
                                <div class="text-subtitle2 text-primary q-ml-xs">Resultados se obtendrán de la siguiente forma:</div>
                                <q-select dense
                                    :options="lookup_sumType" emit-value map-options
                                    :value="rewMasterResultsLinesSelected.sumType" 
                                    filled label="Tipo de Operación" 
                                    @input="(valor)=>{
                                        let temporal = JSON.parse(JSON.stringify(rewMasterResultsLines));
                                        temporal.find(x=>x.resultID==rewMasterResultsLinesSelected.resultID&&x.lineID==rewMasterResultsLinesSelected.lineID).sumType = valor;
                                        rewMasterResultsLines = temporal;
                                        rewMasterResultsLinesSelected.sumType = valor;
                                        }"
                                    >
                                    <template v-slot:prepend><q-icon flat dense name="fas fa-folder-plus" /></template>
                                </q-select>

                                
                                <q-select  dense
                                    :options="lookup_fields.filter(x=>x.allow_calculation)" emit-value map-options
                                    :value="rewMasterResultsLinesSelected.sumFieldName" 
                                    filled label="Campo sobre el cual realizar el Tipo de Operación" class="q-mt-sm"
                                    @input="(valor)=>{
                                        let temporal = JSON.parse(JSON.stringify(rewMasterResultsLines));
                                        temporal.find(x=>x.resultID==rewMasterResultsLinesSelected.resultID&&x.lineID==rewMasterResultsLinesSelected.lineID).sumFieldName = valor;
                                        rewMasterResultsLines = temporal
                                        rewMasterResultsLinesSelected.sumFieldName = valor;
                                        }"
                                    >
                                    <template v-slot:prepend><q-icon flat dense name="fas fa-search-plus" /></template>
                                </q-select>
                                    
                                <br /><div class="text-subtitle2 text-primary q-ml-xs">Calcular resultado de la siguiente forma:</div>
                                <q-select dense
                                    :options="lookup_resultType" emit-value map-options
                                    :value="rewMasterResultsLinesSelected.resultType"
                                    filled label="Calcular Monto a Pagar usando esta metodología"  class="q-mt-sm"
                                    @input="(valor)=>{
                                        let temporal = JSON.parse(JSON.stringify(rewMasterResultsLines));
                                        temporal.find(x=>x.resultID==rewMasterResultsLinesSelected.resultID&&x.lineID==rewMasterResultsLinesSelected.lineID).resultType = valor;
                                        rewMasterResultsLines = temporal
                                        rewMasterResultsLinesSelected.resultType = valor;
                                        }"
                                    >
                                    <template v-slot:prepend><q-icon flat dense name="fas fa-calculator" /></template>
                                </q-select>
                                
                                <selectSearchable 
                                    v-if="rewMasterResultsLinesSelected.resultType==1"
                                    class="q-mt-sm"
                                    prependIcon="fas fa-table"
                                    labelText="Tabla de Rangos (*)" labelSearchText="Buscar Tabla"
                                    :optionsList="lookup_ranges"
                                    rowValueField="value" optionsListLabel="label" optionsListCaption="rangeTableResultTypeName"
                                    :isRequired="true" 
                                    :isDisable="false" 
                                    :isDense="true"
                                    :initialValue="rewMasterResultsLinesSelected.resultRangeTableID"
                                    :tableSearchColumns="[
                                            { name: 'label', label: 'Tabla', field: 'label', align: 'left'}
                                            ,{ name: 'rangeTableResultTypeName', label: 'Tipo de Resultado', field: 'rangeTableResultTypeName', align: 'left'}
                                        ]"
                                    @onItemSelected="(row)=>{
                                            //rewMasterResultsLinesSelected.resultRangeTableID=row.value;
                                            
                                            let temporal = JSON.parse(JSON.stringify(rewMasterResultsLines));
                                            temporal.find(x=>x.resultID==rewMasterResultsLinesSelected.resultID&&x.lineID==rewMasterResultsLinesSelected.lineID).resultRangeTableID = row.value;
                                            rewMasterResultsLines = temporal
                                            rewMasterResultsLinesSelected.resultRangeTableID = row.value;

                                        }"
                                    />
                                    
                                <q-input
                                    v-if="rewMasterResultsLinesSelected.resultType==2" dense
                                    :value="rewMasterResultsLinesSelected.resultRangeValue"
                                    filled label="Porcentaje (%)" max="100" min="0" type="number" class="q-mt-sm"
                                    @input="(valor)=>{
                                        let temporal = JSON.parse(JSON.stringify(rewMasterResultsLines));
                                        temporal.find(x=>x.resultID==rewMasterResultsLinesSelected.resultID&&x.lineID==rewMasterResultsLinesSelected.lineID).resultRangeValue = valor;
                                        rewMasterResultsLines = temporal
                                        rewMasterResultsLinesSelected.resultRangeValue = valor;
                                        }"
                                    >
                                    <template v-slot:prepend><q-icon flat dense name="fas fa-percent" /></template>
                                </q-input>
                            </q-tab-panel>
                            <q-tab-panel name="filters" >
                                <q-toolbar class="no-padding">
                                    <!-- {{selected}} -->
                                            <q-btn-dropdown color="primary" label="Agregar Filtro" no-caps>
                                                <q-list >
                                                    <q-item 
                                                        v-for="field in lookup_fields.filter(x=>x.allow_filter&&x.estado)" :key="field.value"
                                                        @click="addRewMasterResultLineFilter(rewMasterResultsLinesSelected, field)"
                                                        clickable v-close-popup >
                                                        <q-item-section>
                                                            <q-item-label>{{field.label}}</q-item-label>
                                                        </q-item-section>
                                                    </q-item>
                                                </q-list>
                                            </q-btn-dropdown>
                                            <!--<q-btn-dropdown color="primary" label="Agregar Condición Guardada" no-caps>
                                            </q-btn-dropdown>-->
                                </q-toolbar>
                                <div v-if="rewMasterResultsLinesSelected.filters.length>0">
                                    <q-list separator bordered>
                                        <q-expansion-item 
                                            v-for="filtro in rewMasterResultsLinesSelected.filters" :key="filtro.fieldName"
                                            :label="filtro.fieldFriendlyName" group="samegroup"
                                            >
                                            <div >
                                                <div v-if="filtro.operatorType&&filtro.operatorType==1" class="q-pa-sm">
                                                        <q-table
                                                            v-if="filtro.operatorType&&filtro.operatorType==1" bordered flat square dense color="primary"
                                                            :data="internal_lookup_data.filter(x=>x.field==filtro.fieldName)" 
                                                            row-key="value" selection="multiple" 
                                                            virtual-scroll style="height: 150px" :rows-per-page-options="[0]" hide-header hide-bottom
                                                            :selected="selectedInternal.filter(x=>x.resultID==rewMasterResultsLinesSelected.resultID&&x.lineID==rewMasterResultsLinesSelected.lineID&&x.fieldName==filtro.fieldName)"
                                                            :columns="[
                                                                { name: 'value', field: 'value', sortable: false, align: 'left' },
                                                            ]"
                                                            @row-click="(evt, row, index)=>{
                                                                if(selectedInternal.some(x=>x.resultID==rewMasterResultsLinesSelected.resultID&&x.lineID==rewMasterResultsLinesSelected.lineID&&x.fieldName==filtro.fieldName&&x.value==row.value)){
                                                                    selected = selectedInternal.filter(x=>!(x.resultID==rewMasterResultsLinesSelected.resultID&&x.lineID==rewMasterResultsLinesSelected.lineID&&x.fieldName==filtro.fieldName&&x.value==row.value))
                                                                }else{
                                                                    selectedInternal.push({
                                                                        resultID: rewMasterResultsLinesSelected.resultID
                                                                        ,lineID: rewMasterResultsLinesSelected.lineID
                                                                        ,fieldName: filtro.fieldName
                                                                        ,value: row.value
                                                                    })
                                                                }
                                                            }"
                                                            @selection="(details)=>{
                                                                if(details.added==true){//agrega
                                                                    selectedInternal.push({
                                                                        resultID: rewMasterResultsLinesSelected.resultID
                                                                        ,lineID: rewMasterResultsLinesSelected.lineID
                                                                        ,fieldName: filtro.fieldName
                                                                        ,value: details.keys[0]
                                                                    })
                                                                }
                                                                if(details.added==false){//quita
                                                                    selectedInternal = selectedInternal.filter(x=>!(x.resultID==rewMasterResultsLinesSelected.resultID&&x.lineID==rewMasterResultsLinesSelected.lineID&&x.fieldName==filtro.fieldName&&x.value==details.keys[0]))
                                                                }

                                                            }"
                                                            />
                                                </div>
                                                <q-card-actions align="center">
                                                    <q-btn color="red" flat icon="fas fa-trash-alt" :label="'Eliminar ' + filtro.fieldFriendlyName" no-caps @click="deleteFilter(filtro)" />
                                                </q-card-actions>
                                            </div>
                                        </q-expansion-item>
                                    </q-list>
                                    <br/><br/><br/>
                                </div>
                                <div v-else>No hay Condiciones de Pago</div>
                            </q-tab-panel>
                        </q-tab-panels>
                    </div>

                    <div v-else class="absolute-center" >
                        No ha seleccionado un plan de la lista.
                    </div>
                </template>
            </q-splitter>
        </q-card>
    </div>
    <div v-else class="text-red text-subtitle2" >
        Antes de continuar, debe escoger una Tabla de Datos en la sección "Información Básica"
    </div>

    <q-dialog v-model="batchUpdateCondition">
        <q-card>
            <q-toolbar>
                <q-toolbar-title>Actualizar Condición de Pago en Todos los Resultados</q-toolbar-title>
            </q-toolbar>
            <q-separator />
            <q-card-section>
                <div class="text-primary text-subtitle2">Seleccione el Campo que desea Modificar en lote:</div>
                <q-select
                    filled label="Reemplzar Filtro"
                    :options="lookup_fields.filter(x=>x.allow_filter&&x.estado)"
                    option-value="value" option-label="label" map-options emit-value
                    v-model="batchUpdateConditionSelectedField"
                    @input="()=>{batchUpdateConditionSelectedRows=[]}"
                    >
                    <template v-slot:prepend><q-icon flat dense name="fas fa-filter" /></template>
                </q-select>

                <div v-if="batchUpdateConditionSelectedField">
                    <div class="q-mt-md text-primary text-subtitle2">Seleccione los nuevos valores a reemplazar en lote:</div>
                    <q-table
                        v-if="batchUpdateConditionSelectedField"
                        bordered flat square dense color="primary"
                        :data="internal_lookup_data.filter(x=>x.field==batchUpdateConditionSelectedField)" 
                        row-key="value" 
                        virtual-scroll style="height: 150px" :rows-per-page-options="[0]" hide-header hide-bottom
                        selection="multiple"  
                        :selected.sync="batchUpdateConditionSelectedRows"
                        :columns="[
                            { name: 'value', field: 'value', sortable: false, align: 'left' },
                        ]"
                    />
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn label="Cancelar" color="red" flat no-caps @click="batchUpdateCondition=false" />
                <q-btn icon="fas fa-edit" label="Modificar" color="primary" flat no-caps @click="batchUpdateConditionsApply" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</q-form>
</template>
<script>
/*import Vue from 'vue';
import Vuex from 'vuex';
*/
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        selectSearchable: selectSearchable
        //,computeFunctions: computeFunctions
        //,partnersEdit: () => import('../../../pages/RootMaster/Partners/PartnersEdit.vue')
    },
     data () {
        return {
            //Confirmed
            router: this.$router,
            splitterModel: 25,
            splitterModelInterno: 22,//45,
            rewMasterResultsSelected: null,
            rewMasterResultsLinesSelected: null,
            currentFieldDistinctData: {},
            tabInternal: 'payment',
            internal_lookup_data: [],
            selectedInternal: [],
            batchUpdateCondition: false, batchUpdateConditionSelectedField: null, batchUpdateConditionSelectedRows: []
        }
        
        //selected
    },
    mounted(){
        //console.dir('mounted')
        this.internal_lookup_data = JSON.parse(JSON.stringify(this.lookup_data))
        this.selectedInternal = JSON.parse(JSON.stringify(this.selected))
        //console.dir(this.internal_lookup_data)
        //console.dir(this.selectedInternal)
        this.$refs.formulario.validate()
    },
    methods:{
        getMax(arr, prop) {
            var max;
            for (var i=0 ; i<arr.length ; i++) {
                if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                    max = arr[i];
            }
            return max;
        },
        addRewMasterResult(){
            this.$q.dialog({ 
                title: 'Agregar Resultado'
                ,persistent: false
                ,message: 'Escriba el nombre del resultado:'
                ,prompt: { model: '', type: 'text' }
                ,ok: { icon: 'fas fa-plus', label: 'Agregar', noCaps: true, color: 'primary', flat: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true, color:'red' }
            }
            ).onOk((data) => {
                if(data&&data.length>1){
                    let max_id = 0
                    let temp = null
                    if(this.rewMasterResults.length > 0){
                        temp = this.getMax(this.rewMasterResults, "resultID");
                        max_id = parseInt(temp.resultID);//no es necesario incrementar en 1, porque lo hace luego 
                    }
                    max_id++;
                    let temprewMasterResults = JSON.parse(JSON.stringify(this.rewMasterResults))
                    let newRecord = {
                        resultID: max_id
                        ,name_es: data//antes Nuevo Resultado
                    }
                    /*temprewMasterResults.push({
                        resultID: max_id
                        ,name_es: data//antes Nuevo Resultado
                    })*/
                    temprewMasterResults.push(newRecord)
                    this.rewMasterResults = temprewMasterResults;
                    this.rewMasterResultsSelected = null;        

                    //Ahora, auto-agrega un plan
                    this.addRewMasterResultsLines(newRecord);
                }
            })

            
        },
        selectRewMasterResult(resultado){
            this.rewMasterResultsSelected = resultado;
            this.rewMasterResultsLinesSelected = null;
        },
        renameRewMasterResult(resultado){
            this.$q.dialog({ 
                title: 'Renombrar'
                ,persistent: false
                ,message: 'Escriba el nombre del resultado:'
                ,prompt: { model: resultado.name_es, type: 'text' }
                ,ok: { icon: 'fas fa-edit', label: 'Renombrar', noCaps: true, color: 'primary', flat: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true, color:'red' }
            }
            ).onOk((data) => {
                if(data&&data.length>1){
                    let newRows = JSON.parse(JSON.stringify(this.rewMasterResults))
                    newRows.find(x=>x.resultID==resultado.resultID).name_es = data
                    this.rewMasterResults = newRows
                    this.rewMasterResultsSelected = null
                }
            })
        },
        deleteRewMasterResult(resultado){
            this.$q.dialog({ 
                title: 'Confirmación'
                ,persistent: false
                ,message: 'Desea eliminar el resultado: ' + resultado.name_es + '  ?'
                ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true, color: 'red', flat: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
            }
            ).onOk(() => {
                let newRows = JSON.parse(JSON.stringify(this.rewMasterResults.filter(x=>x.resultID != resultado.resultID )))
                let newRowsLines = JSON.parse(JSON.stringify(this.rewMasterResultsLines.filter(x=>x.resultID != resultado.resultID )))
                this.rewMasterResultsLinesSelected = null;
                this.rewMasterResultsSelected = null;
                this.rewMasterResults = newRows;
                this.rewMasterResultsLines = newRowsLines
            })
        },
        renameRewMasterResultLine(lineaResultado){
            this.$q.dialog({ 
                title: 'Confirmación'
                ,persistent: false
                ,message: 'Escriba el nombre del plan:'
                ,prompt: { model: lineaResultado.name_es, type: 'text' }
                ,ok: { icon: 'fas fa-edit', label: 'Renombrar', noCaps: true, color: 'primary', flat: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true, color:'red' }
            }
            ).onOk((data) => {
                if(data&&data.length>1){
                    let newRows = JSON.parse(JSON.stringify(this.rewMasterResultsLines))
                    newRows.find(x=>x.resultID==lineaResultado.resultID&&x.lineID==lineaResultado.lineID).name_es = data
                    this.rewMasterResultsLines = newRows
                    this.rewMasterResultsLinesSelected = null;
                    this.rewMasterResultsLinesSelected = this.rewMasterResultsLines.find(x=>x.resultID==lineaResultado.resultID&&x.lineID==lineaResultado.lineID)
                }
            })
        },
        selectRewMasterResultLine(resultLine){
            this.rewMasterResultsLinesSelected = resultLine;
        },
        addRewMasterResultsLines(resultado){
            let max_id = 0
            let temp = null
            if(this.rewMasterResultsLines.filter(x=>x.resultID==resultado.resultID).length > 0){
                temp = this.getMax(this.rewMasterResultsLines.filter(x=>x.resultID==resultado.resultID), "lineID");
                max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
            }
            max_id++;

            let tempRewMasterResultsLines = JSON.parse(JSON.stringify(this.rewMasterResultsLines))
            tempRewMasterResultsLines.push({
                resultID: resultado.resultID
                ,lineID: max_id//pendiente
                ,name_es: 'Plan ' + max_id
                ,sumFieldName: null
                ,sumType: 1
                //,resultType: 1
                ,resultType: 2
                ,resultRangeTableID: null
                ,resultRangeValue: null
                ,filters: []
            })
            this.rewMasterResultsLines =  tempRewMasterResultsLines
            //this.selectRewMasterResultLine = null
            this.rewMasterResultsLinesSelected = null
            //this.rewMasterResultsSelected = null
            this.tabInternal = 'payment';
        },
        batchUpdateConditions(){
            this.batchUpdateCondition = true;
        },
        batchUpdateConditionsApply(){
            
            if(this.batchUpdateConditionSelectedRows.length > 0 ){
                //copy object
                let temporal = JSON.parse(JSON.stringify(this.selectedInternal))
                temporal = temporal.filter(x=>x.fieldName!=this.batchUpdateConditionSelectedField) //remove all selected equals to field to be replaced with new values
                //loop
                this.rewMasterResultsLines.map(resultLine =>{
                    resultLine.filters.map(resultLineFilter=>{
                        if(resultLineFilter.fieldName == this.batchUpdateConditionSelectedField){
                            this.batchUpdateConditionSelectedRows.map(selectedRow =>{
                                temporal.push({
                                    resultID: resultLineFilter.resultID
                                    ,lineID: resultLineFilter.lineID
                                    ,fieldName: resultLineFilter.fieldName
                                    ,value: selectedRow.value
                                })
                            })
                        }
                    })
                })
                this.selectedInternal = temporal;
                this.batchUpdateCondition = false;
                this.$q.notify({ html: true, multiLine: false, color: 'positive'
                    ,message: "Se realizaron los cambios"
                    ,timeout: 1000, progress: false , icon: "fas fa-edit"
                })
            }else{
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "No ha seleccionado ningún valor!"
                    ,timeout: 1000, progress: false , icon: "fas fa-exclamation-circle"
                })
            }
        },
        deleteRewMasterResultLine(selectedLine){
            this.$q.dialog({ 
                title: 'Confirmación'
                ,persistent: false
                ,message: 'Desea eliminar el plan: ' + selectedLine.name_es + '  ?'
                ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true, color: 'red', flat: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
            }
            ).onOk(() => {
               
                let newRows = []
                this.rewMasterResultsLines.forEach(element => {
                    if(element.resultID==selectedLine.resultID && element.lineID==selectedLine.lineID){
                        //No hace nada porque NO se debe agregar este element
                    }else{
                        newRows.push(element)
                    }
                });
                this.rewMasterResultsLines = newRows
                this.rewMasterResultsLinesSelected = null;
            })
        },
        addRewMasterResultLineFilter(resultLine, field){
            let newFilters = JSON.parse(JSON.stringify(resultLine.filters))
            if(newFilters.some(x=>x.fieldName==field.value)){
                this.$q.notify({ html: true, multiLine: false, color: 'red'
                    ,message: "Ya se encuentra el campo en la lista de conidiciones."
                    ,timeout: 1000, progress: false , icon: "fas fa-exclamation-circle"
                })
            }else{
                newFilters.push({
                    fieldName: field.value
                    ,fieldFriendlyName: field.label
                    ,fieldType: field.fieldType
                    //,operatorType: null
                    ,operatorType: 1 //1 como default que activa la lista
                    ,valueA: null
                    ,valueB: null
                })
                //Load FieldData
                this.loadFieldDistinctData(field.value)
            }
            let nuevoResultLines = JSON.parse(JSON.stringify(this.rewMasterResultsLines))
            nuevoResultLines.find(x=>x.resultID==resultLine.resultID&&x.lineID==resultLine.lineID).filters = newFilters
            this.rewMasterResultsLines = nuevoResultLines
            //vuelve a seleccionar resultline
            let newResultLine = this.rewMasterResultsLines.find(x=>x.resultID==resultLine.resultID&&x.lineID==resultLine.lineID)
            this.selectRewMasterResultLine(newResultLine)
        },
        loadFieldDistinctData(fieldName){
            this.$q.loading.show()
            this.$axios({
                method: 'GET',
                url: this.apiURL + 'spRewMasterTableDataLookupDataSelect',
                headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                params: {
                    userCode: this.userCode,
                    userCompany: this.userCompany,
                    userLanguage: 'es',
                    rewTableID: this.rewTableID,
                    fieldName: fieldName
                }
            }).then((response) => {

                response.data.forEach(dato=>{
                    if(!this.internal_lookup_data.some(x=>x.field==fieldName&&x.value==dato.resultados)){
                        this.internal_lookup_data.push({
                            field: fieldName
                            ,value: dato.resultados
                        })
                    }
                })
                this.$q.loading.hide()
                //console.dir(this.internal_lookup_data)
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
                this.$q.loading.hide()
            })
        },
        deleteFilter(filtro){
            this.$q.dialog({ 
                title: 'Confirmación'
                ,persistent: false
                ,message: 'Desea eliminar el filtro?'
                ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true, color: 'red', flat: true }
                ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
            }
            ).onOk(() => {
                //1.- debo copiar this.rewMasterResultsLines
                //2.- Debo buscar la línea seleccionada que es this.rewMasterResultsLinesSelected
                //3.- De esa línea debo eliminar el campo que es filtro.fieldName
                //4.- Vuelvo a seleccionar el registro para refrescar pantalla
                let newLines = JSON.parse(JSON.stringify(this.rewMasterResultsLines))
                newLines.find(x=>x.resultID==this.rewMasterResultsLinesSelected.resultID&&x.lineID==this.rewMasterResultsLinesSelected.lineID).filters = newLines.find(x=>x.resultID==this.rewMasterResultsLinesSelected.resultID&&x.lineID==this.rewMasterResultsLinesSelected.lineID).filters.filter(z=>z.fieldName!=filtro.fieldName)
                this.rewMasterResultsLines = newLines;
                this.rewMasterResultsLinesSelected = this.rewMasterResultsLines.find(x=>x.resultID==this.rewMasterResultsLinesSelected.resultID&&x.lineID==this.rewMasterResultsLinesSelected.lineID)
            })
        },
        copyPlanFromTo(selectedPlan,destinationResult){
            /*
            console.dir('copy from')
            console.dir(selectedPlan)
            console.dir('copy to')
            console.dir(destinationResult)
            console.dir(this.rewMasterResultsLines)
            */
            //0.- Tal vez debo impedir que copie un plan al mismo resultado?
            //1.- Copiar Planes (this.rewMasterResultsLines)
            //2.- Ver cuál es el maxID existente en destinarionResult.resultID
            //3.- Creo una variable que contenga el mismo resultID que destinarionResult.resultID;  lineID debe ser el maxID nuevo, mismo name_es, etc, y los filters enselectedPlan.filters

            let max_id = 0
            let temp = null
            if(this.rewMasterResultsLines.filter(x=>x.resultID==destinationResult.resultID).length > 0){
                temp = this.getMax(this.rewMasterResultsLines.filter(x=>x.resultID==destinationResult.resultID), "lineID");
                max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
            }
            max_id++;

            let tempRewMasterResultsLines = JSON.parse(JSON.stringify(this.rewMasterResultsLines))
            tempRewMasterResultsLines.push({
                resultID: destinationResult.resultID
                ,lineID: max_id//pendiente
                ,name_es: 'Plan ' + max_id + ' (Copiado)'
                ,sumFieldName: selectedPlan.sumFieldName
                ,sumType: selectedPlan.sumType
                ,resultType: selectedPlan.resultType
                ,resultRangeTableID: selectedPlan.resultRangeTableID
                ,resultRangeValue: selectedPlan.resultRangeValue
                ,filters: selectedPlan.filters
            })
            this.rewMasterResultsLines =  tempRewMasterResultsLines
            this.rewMasterResultsLinesSelected = null
            this.tabInternal = 'payment';

            this.selectedInternal.filter(x=>x.resultID==selectedPlan.resultID&&x.lineID==selectedPlan.lineID).map(nuevo=>{
                this.selectedInternal.push({
                    resultID: destinationResult.resultID
                    ,lineID: max_id
                    ,fieldName: nuevo.fieldName
                    ,value: nuevo.value
                })
            })

            this.$q.notify({ html: true, multiLine: false, color: 'positive'
                ,message: "Se copió el plan con el nombre: " + 'Plan ' + max_id + ' (Copiado)'
                ,timeout: 1000, progress: false , icon: "fas fa-copy"
            })
        }

    },
    
    computed:{
        console: () => console,
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        allow_view: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_view').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
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
        allow_report: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_report').map(y=>{
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
        editStatus: {
            get () { return this.$store.state[this.moduleName].editStatus },
        },
       rewTableID: {
            get () { return this.$store.state[this.moduleName].editData.basic.rewTableID },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'rewTableID', value: val}) }
        },
        rewMasterResults: {
            get () { return this.$store.state[this.moduleName].editData.rewMasterResults },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'rewMasterResults', value: val}) }
        },
        rewMasterResultsLines: {
            get () { return this.$store.state[this.moduleName].editData.rewMasterResultsLines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'rewMasterResultsLines', value: val}) }
        },
        selected: {
            get () { return this.$store.state[this.moduleName].editData.selected },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'selected', value: val}) }
        },
        lookup_rewTables: {
            get () { return this.$store.state[this.moduleName].editData.lookup_rewTables },
        },
        lookup_fields: {
            get () { return this.$store.state[this.moduleName].editData.lookup_fields },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_fields', value: val}) }
        },
        lookup_ranges: {
            get () { return this.$store.state[this.moduleName].editData.lookup_ranges },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_ranges', value: val}) }
        },
        lookup_operators: {
            get () { return this.$store.state[this.moduleName].editData.lookup_operators },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_operators', value: val}) }
        },
        lookup_data: {
            get () { return this.$store.state[this.moduleName].editData.lookup_data },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_data', value: val}) }
        },
        lookup_resultType: {
            get () { 
                let resultado = [
                    {value: 1, label: 'Tabla de Rangos de Comisiones'},
                    {value: 2, label: 'Porcentaje sobre Resultado '}
                ]
                return resultado
            },
        },
        lookup_sumType: {
            get () { 
                let resultado = [
                    {value: 1, label: 'Sumar'},
                    {value: 2, label: 'Conteo de Registros'},
                    {value: 3, label: 'Conteo Distintivo de Registros'}
                ]
                return resultado
            },
        },
    },
    watch: {
        selectedInternal: function(val){
            //this.$refs['mainviewtableDxDataGrid'].instance.refresh()
            console.dir('selectedInternal watch')
            this.selected = JSON.parse(JSON.stringify(val))
        },
        internal_lookup_data: function(val){
            //this.$refs['mainviewtableDxDataGrid'].instance.refresh()
            /*console.dir('internal_lookup_data')
            console.dir('val')
            console.dir(val)
            console.dir('this.internal_lookup_data')
            console.dir(this.internal_lookup_data)
            */
            this.lookup_data = JSON.parse(JSON.stringify(val))
        },
    }
})
</script>
