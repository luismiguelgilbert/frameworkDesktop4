<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div class="row">
      <q-toggle class="col-12 col-md-4"
        tabindex="-1"
        v-model="estado" icon="fas fa-check" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
      <q-toggle class="col-12 col-md-4"
        tabindex="-1"
        v-model="is_sales" icon="fas fa-tag"  color="blue-6" label="Se Vende?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
      <q-toggle class="col-12 col-md-4"
        tabindex="-1"
        v-model="is_purchase" icon="fas fa-shopping-cart" color="light-blue-6" label="Se Compra?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <selectSearchable 
        prependIcon="fas fa-cog"
        labelText="Tipo de Item (*)" labelSearchText="Buscar el Tipo de Item"
        :optionsList="this.lookup_systemTypes"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="systemType"
        :tableSearchColumns="[
                { name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.systemType=row.value;
            }"
        />
    <!--<q-select class="col-4"
        label=" (*)" placeholder="Seleccione el Tipo de Item al que corresponde el Item (*)" emit-value map-options filled
        :options="" :readonly=""
        v-model=""
        ref="systemType"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-cog" /></template>
    </q-select>-->
   
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el nombre del Item (*)" label="Nombre del Item (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-box" /></template>
    </q-input>
    <q-input
        ref="internal_code" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el Código de Identificación del Item (*)" label="Código de Identificación del Item (*)" filled
        v-model="internal_code"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-barcode" /></template>
    </q-input>

    <selectSearchable
        prependIcon="fas fa-layer-group"
        labelText="Clasificación (*)" labelSearchText="Buscar Clasificación"
        title="Por ejemplo, va al DEBE cuando Ingresa Inventario por Compra"
        :optionsList="this.lookup_types"
        rowValueField="value" optionsListLabel="label" 
        optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="typeID"
        :tableSearchColumns="[
                 //{ name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                { name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.typeID=row.value;
                //this.accSalesInvoiceName=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />

    <q-input class="q-mb-md"
        ref="bar_code" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el Código de Barras del Item" label="Código de Barras del Item" filled
        v-model="bar_code"
        >
        <template v-slot:prepend><q-icon name="fas fa-qrcode" /></template>
    </q-input>

    <selectSearchable
        prependIcon="fas fa-weight"
        labelText="Unidad de Medida (*)" labelSearchText="Buscar Unidad de Medida"
        :optionsList="this.lookup_UoM"
        rowValueField="value" optionsListLabel="label" optionsListCaption="short_name_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="uomID"
        :tableSearchColumns="[
                { name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                ,{ name: 'short_name_es', label: 'Abreviado', field: 'short_name_es', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.uomID=row.value;
            }"
        />
    
    <selectSearchable
        prependIcon="fas fa-sticky-note"
        labelText="Marca" labelSearchText="Buscar Marca"
        :optionsList="this.lookup_brands"
        rowValueField="value" optionsListLabel="label"
        optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="brandID"
        :tableSearchColumns="[
                { name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.brandID=row.value;
            }"
        />

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Socio" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />

    <br><br>
</q-form>
</template>
<script>
/*
import Vue from 'vue';
import Vuex from 'vuex';
*/
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        selectSearchable:selectSearchable
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
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
        editConfig: {
            get () { return this.$store.state[this.moduleName].editConfig },
            set (val) {  this.$store.commit((this.moduleName)+'/updateState', {key: 'editConfig', value: val})  }
        },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        systemType: {
            get () { return this.$store.state[this.moduleName].editData.basic.systemType },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'systemType', value: val}) }
        },
        groupID: {
            get () { return this.$store.state[this.moduleName].editData.basic.groupID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'groupID', value: val}) }
        },
        typeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.typeID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'typeID', value: val}) }
        },
        is_purchase:  {
            get () { return this.$store.state[this.moduleName].editData.basic.is_purchase },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'is_purchase', value: val}) }
        },
        is_sales:  {
            get () { return this.$store.state[this.moduleName].editData.basic.is_sales },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'is_sales', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        partner_ruc: {
            get () { return this.$store.state[this.moduleName].editData.basic.partner_ruc },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partner_ruc', value: val}) }
        },
        internal_code: {
            get () { return this.$store.state[this.moduleName].editData.basic.internal_code },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'internal_code', value: val}) }
        },
        bar_code: {
            get () { return this.$store.state[this.moduleName].editData.basic.bar_code },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'bar_code', value: val}) }
        },
        uomID:  {
            get () { return this.$store.state[this.moduleName].editData.basic.uomID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'uomID', value: val}) }
        },
        brandID:  {
            get () { return this.$store.state[this.moduleName].editData.basic.brandID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'brandID', value: val}) }
        },
        lead_time_days:  {
            get () { return this.$store.state[this.moduleName].editData.basic.lead_time_days },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'lead_time_days', value: val}) }
        },
        should_replenish:  {
            get () { return this.$store.state[this.moduleName].editData.basic.should_replenish },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'should_replenish', value: val}) }
        },
        trigger_replenish:  {
            get () { return this.$store.state[this.moduleName].editData.basic.trigger_replenish },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'trigger_replenish', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_systemTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_systemTypes },
        },
        lookup_groups: {
            get () { return this.$store.state[this.moduleName].editData.lookup_groups },
        },
        lookup_types: {
            get () { return this.$store.state[this.moduleName].editData.lookup_types },
        },
        lookup_UoM: {
            get () { return this.$store.state[this.moduleName].editData.lookup_UoM },
        },
        lookup_brands: {
            get () { return this.$store.state[this.moduleName].editData.lookup_brands },
        },
    },
    watch: {
        systemType(newValue, oldValue) {
            let newEditConfig = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].editConfig));
            console.dir(newValue)
            if(newValue==1){
                newEditConfig.moduleTabs.find(x=>x.tabName=='bom').isTabDisable
            }
            if(newValue==1){//servicio
                newEditConfig.moduleTabs.find(x=>x.tabName=='bom').isTabDisable = true;
                newEditConfig.moduleTabs.find(x=>x.tabName=='lots').isTabDisable = true;
                newEditConfig.moduleTabs.find(x=>x.tabName=='bins').isTabDisable = true;
            }
            if(newValue==2){//producto
                newEditConfig.moduleTabs.find(x=>x.tabName=='bom').isTabDisable = true;
                newEditConfig.moduleTabs.find(x=>x.tabName=='lots').isTabDisable = true;
                newEditConfig.moduleTabs.find(x=>x.tabName=='bins').isTabDisable = false;
            }
            if(newValue==3){//kit
                newEditConfig.moduleTabs.find(x=>x.tabName=='bom').isTabDisable = false;
                newEditConfig.moduleTabs.find(x=>x.tabName=='lots').isTabDisable = true;
                newEditConfig.moduleTabs.find(x=>x.tabName=='bins').isTabDisable = false;
            }
            if(newValue==4){//producto lote
                newEditConfig.moduleTabs.find(x=>x.tabName=='bom').isTabDisable = true;
                newEditConfig.moduleTabs.find(x=>x.tabName=='lots').isTabDisable = false;
                newEditConfig.moduleTabs.find(x=>x.tabName=='bins').isTabDisable = false;
            }
            this.editConfig = newEditConfig;
        },
        is_sales(newValue, oldValue) {
            let newEditConfig = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].editConfig));
            if(newValue){
                newEditConfig.moduleTabs.find(x=>x.tabName=='priceLists').isTabDisable = false;
            }else{
                newEditConfig.moduleTabs.find(x=>x.tabName=='priceLists').isTabDisable = true;
            }
            this.editConfig = newEditConfig;
        },
        is_purchase(newValue, oldValue) {
            let newEditConfig = JSON.parse(JSON.stringify(this.$store.state[this.moduleName].editConfig));
            if(newValue){
                newEditConfig.moduleTabs.find(x=>x.tabName=='partners').isTabDisable = false;
            }else{
                newEditConfig.moduleTabs.find(x=>x.tabName=='partners').isTabDisable = true;
            }
            this.editConfig = newEditConfig;
        },
    }
})
</script>
