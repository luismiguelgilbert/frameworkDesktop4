<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <q-select class="col-4"
        label="Grupo Contable (*) - Aplica plantilla" placeholder="Seleccione el Grupo Contable al que pertenece el Item (*)" emit-value map-options filled
        :options="lookup_groups" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="groupID"
        ref="groupID" @input="applyNewGroup"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-book" /></template>
    </q-select>

    <!--accInventory-->
    <selectSearchable 
        prependIcon="fas fa-boxes"
        labelText="Cuenta de Inventario (*)" labelSearchText="Buscar Cuenta Contable"
        title="Por ejemplo, va al DEBE cuando Ingresa Inventario por Compra"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accInventory"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accInventory=row.value;
            }"
        />

    <!--accAllocation-->
    <selectSearchable 
        prependIcon="fas fa-file-invoice"
        labelText="Cuenta de Liquidación de Documentos de Inventario (*)" labelSearchText="Buscar Cuenta Contable"
        title="Por ejemplo, va al HABER cuando Ingresa Inventario por Compra || va al DEBE cuando se Contabiliza Factura de Compra"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accAllocation"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accAllocation=row.value;
            }"
        />

    <!--accCOGS-->
    <selectSearchable 
        prependIcon="fas fa-tags"
        labelText="Cuenta de Costo de Ventas de Inventario (*)" labelSearchText="Buscar Cuenta Contable"
        title="Por ejemplo, va al DEBE cuando Egresa Inventario por Venta"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accCOGS"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accCOGS=row.value;
            }"
        />

    <!--accCOGSprj-->
    <selectSearchable 
        prependIcon="fas fa-pencil-ruler"
        labelText="Cuenta de Costo de Ventas de Inventario que sale x Obras/Proyecto (*)" labelSearchText="Buscar Cuenta Contable"
        title="Por ejemplo, va al DEBE cuando Egresa Inventario para una Obra/Proyecto"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accCOGSprj"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accCOGSprj=row.value;
            }"
        />

    <!--accRevenue-->
    <selectSearchable 
        prependIcon="fas fa-file-invoice-dollar"
        labelText="Cuenta de Ingresos (*)" labelSearchText="Buscar Cuenta Contable"
        title="Por ejemplo, va al HABER cuando se emite Factura de Venta de Inventario"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accRevenue"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accRevenue=row.value;
            }"
        />

    <!--accInventoryIncrease-->
    <selectSearchable 
        prependIcon="fas fa-box"
        labelText="Cuenta de Ajuste de Inventario Sobrante (*)" labelSearchText="Buscar Cuenta Contable"
        title="Por ejemplo, va al HABER cuando se registra Ajuste de Inventario Sobrante"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accInventoryIncrease"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accInventoryIncrease=row.value;
            }"
        />
    
    <!--accInventoryDecrease-->
    <selectSearchable 
        prependIcon="fas fa-box-open"
        labelText="Cuenta de Ajuste de Inventario Faltante (*)" labelSearchText="Buscar Cuenta Contable"
        title="Por ejemplo, va al DEBE cuando se registra Ajuste de Inventario Faltante"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accInventoryDecrease"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accInventoryDecrease=row.value;
            }"
        />

    <!--accMfg-->
    <selectSearchable 
        prependIcon="fas fa-industry"
        labelText="Cuenta de Consumo de Inventario x Producción (*)" labelSearchText="Buscar Cuenta Contable"
        title="Por ejemplo, va al DEBE cuando se registra Consumo de Insumos en Producción"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accMfg"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accMfg=row.value;
            }"
        />

    <!--sri_sustento-->
    <selectSearchable 
        prependIcon="fas fa-balance-scale"
        labelText="Sustento Tributario (*)" labelSearchText="Buscar Sustento Tributario"
        title="Por ejemplo, va al DEBE cuando se registra Consumo de Insumos en Producción"
        :optionsList="this.lookup_sri_sustentos"
        rowValueField="value" optionsListLabel="label" 
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="sri_sustento"
        :tableSearchColumns="[
                { name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.sri_sustento=row.value;
            }"
        />

    
    <div>
        <q-toolbar class="bg-primary text-white shadow-2">
            <q-toolbar-title>
                <q-icon name="fas fa-percentage" color="white" size="xs" /> Impuestos
            </q-toolbar-title>
            <q-btn flat icon-right="fas fa-plus"  label="Agregar Impuesto" no-caps @click="isTaxesDialog=true" />
        </q-toolbar>
        <q-list bordered>
            <q-item v-for="linea in taxes" :key="linea.value" >
                <q-item-section>
                    <q-item-label class="text-bolder text-primary">{{linea.short_name_es}}</q-item-label>
                    <q-item-label caption>{{linea.label}}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn flat icon="fas fa-trash"  color="primary" round @click="removeTaxLine(linea)" />
                </q-item-section>
            </q-item>
            <q-item v-if="taxes.length<=0">
                <q-item-section>
                    <q-item-label class="text-bolder text-primary">No se ha agregado impuestos</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </div>
    


    <q-dialog v-model="isSearchDialog">
        <mainLookup 
            titleBar="Buscar Cuenta Contable"
            :data="this.lookup_accounts"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :predefinedValue="mainLookupPredefinedValue"
            :columns="[
                     { name: 'code_es', required: true, label: 'Código', align: 'left', field: row => row.code_es , sortable: false, style: 'min-width: 100px; max-width: 100px;' }
                    ,{ name: 'label', required: true, label: 'Cuenta Contable', align: 'left', field: row => `${'     '.repeat(row.account_level) + row.label} `, sortable: false,    }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            boldIfChildrenFielname="account_has_children"
            @onCancel="isSearchDialog=false"
            @onSelect="(selectedRows)=>{updateValues(selectedRows, 'value', 'fullLabel')}"
        />
    </q-dialog>

    <q-dialog v-model="isTaxesDialog">
        <mainLookup 
            titleBar="Buscar Impuesto"
            :data="this.lookup_taxes"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :columns="[
                     { name: 'label', required: true, label: 'Impuesto', align: 'left', field: row => row.label, sortable: false,    }
                    ,{ name: 'short_name_es', required: true, label: 'Código', align: 'left', field: row => row.short_name_es , sortable: true }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            @onCancel="isTaxesDialog=false"
            @onSelect="(selectedRows)=>{addTax(selectedRows)}"
        />
    </q-dialog>

    <q-dialog v-model="isSustentosDialog">
        <mainLookup 
            titleBar="Buscar Sustento"
            :data="this.lookup_sri_sustentos"
            :predefinedValue="this.sri_sustento"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :columns="[
                     //{ name: 'value', required: true, label: 'Código', align: 'left', field: row => row.value , sortable: true }
                    { name: 'label', required: true, label: 'Sustento Tributario', align: 'left', field: row => row.label, sortable: false, style: 'min-width: 600px; white-space: none !important;'   }
                    ]"
            @onCancel="isSustentosDialog=false"
            @onSelect="(selectedRows)=>{updateSustento(selectedRows)}"
        />
    </q-dialog>

    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import mainLookup from '../../../components/mainLookup/mainLookup.vue'
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    components: {
        mainLookup: mainLookup
        ,selectSearchable:selectSearchable
    },
    data () {
        return {
            moduleName: "Items", isSearchDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,isTaxesDialog: false, isSustentosDialog: false,
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        openSearchAccount(UpdateFieldValueName, UpdateFieldLabelName, predefinedValue){
            this.mainLookupUpdateFieldValueName = UpdateFieldValueName
            this.mainLookupUpdateFieldLabelName = UpdateFieldLabelName
            this.mainLookupPredefinedValue = predefinedValue
            this.isSearchDialog = true
        },
        updateValues(selectedRows, lookupValueField, lookupLabelField){
            this[this.mainLookupUpdateFieldValueName] = selectedRows[0].[lookupValueField]
            this[this.mainLookupUpdateFieldLabelName] = selectedRows[0].[lookupLabelField]
            this.isSearchDialog = false
        },
        applyNewGroup(){
            //aplica valores y nombres
            let newValue = this.lookup_groups.find(x=>x.value==this.groupID)
            this.accAllocation = newValue.accAllocation
            this.accAllocationName = newValue.accAllocationName
            this.accCOGS = newValue.accCOGS
            this.accCOGSName = newValue.accCOGSName
            this.accCOGSprj = newValue.accCOGSprj
            this.accCOGSprjName = newValue.accCOGSprjName
            this.accInventory = newValue.accInventory
            this.accInventoryName = newValue.accInventoryName
            this.accInventoryDecrease = newValue.accInventoryDecrease
            this.accInventoryDecreaseName = newValue.accInventoryDecreaseName
            this.accInventoryIncrease = newValue.accInventoryIncrease
            this.accInventoryIncreaseName = newValue.accInventoryIncreaseName
            this.accMfg = newValue.accMfg
            this.accMfgName = newValue.accMfgName
            this.accRevenue = newValue.accRevenue
            this.accRevenueName = newValue.accRevenueName
            //aplica taxes
            let newTaxes = []
            this.lookup_groupsTaxes.filter(x=>x.groupID==this.groupID).map(row=>{
                newTaxes.push({
                     value: row.value
                    ,label: row.label
                    ,short_name_es: row.short_name_es
                    ,estado: row.estado
                })
            })
            this.taxes = newTaxes
        },
        removeTaxLine(linea){
            let newTaxes = JSON.parse(JSON.stringify(this.taxes))
            newTaxes = newTaxes.filter(x=>x.value != linea.value);
            this.taxes = newTaxes
        },
        updateValues(selectedRows, lookupValueField, lookupLabelField){
            this[this.mainLookupUpdateFieldValueName] = selectedRows[0].[lookupValueField]
            this[this.mainLookupUpdateFieldLabelName] = selectedRows[0].[lookupLabelField]
            this.isSearchDialog = false
        },
        addTax(selectedRows){
            let newTaxes = JSON.parse(JSON.stringify(this.taxes))
            if(!(newTaxes.some(x=>x.value==selectedRows[0].value))){
                newTaxes.push(selectedRows[0])
            }
            this.taxes = newTaxes
            this.isTaxesDialog = false
        },
        updateSustento(selectedRows){
            this.sri_sustento=selectedRows[0].value;
            this.sri_sustentoName=selectedRows[0].label;
            this.isSustentosDialog=false;
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        groupID: {
            get () { return this.$store.state[this.moduleName].editData.basic.groupID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'groupID', value: val}) }
        },
        accAllocation: {
            get () { return this.$store.state[this.moduleName].editData.basic.accAllocation },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accAllocation', value: val}) }
        },
        accAllocationName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accAllocationName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accAllocationName', value: val}) }
        },
        accCOGS: {
            get () { return this.$store.state[this.moduleName].editData.basic.accCOGS },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accCOGS', value: val}) }
        },
        accCOGSName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accCOGSName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accCOGSName', value: val}) }
        },
        accCOGSprj: {
            get () { return this.$store.state[this.moduleName].editData.basic.accCOGSprj },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accCOGSprj', value: val}) }
        },
        accCOGSprjName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accCOGSprjName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accCOGSprjName', value: val}) }
        },
        accInventory: {
            get () { return this.$store.state[this.moduleName].editData.basic.accInventory },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accInventory', value: val}) }
        },
        accInventoryName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accInventoryName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accInventoryName', value: val}) }
        },
        accInventoryDecrease: {
            get () { return this.$store.state[this.moduleName].editData.basic.accInventoryDecrease },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accInventoryDecrease', value: val}) }
        },
        accInventoryDecreaseName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accInventoryDecreaseName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accInventoryDecreaseName', value: val}) }
        },
        accInventoryIncrease: {
            get () { return this.$store.state[this.moduleName].editData.basic.accInventoryIncrease },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accInventoryIncrease', value: val}) }
        },
        accInventoryIncreaseName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accInventoryIncreaseName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accInventoryIncreaseName', value: val}) }
        },
        accRevenue: {
            get () { return this.$store.state[this.moduleName].editData.basic.accRevenue },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accRevenue', value: val}) }
        },
        accRevenueName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accRevenueName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accRevenueName', value: val}) }
        },
        accMfg: {
            get () { return this.$store.state[this.moduleName].editData.basic.accMfg },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accMfg', value: val}) }
        },
        accMfgName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accMfgName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accMfgName', value: val}) }
        },
        sri_sustento: {
            get () { return this.$store.state[this.moduleName].editData.basic.sri_sustento },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sri_sustento', value: val}) }
        },
        sri_sustentoName: {
            get () { return this.$store.state[this.moduleName].editData.basic.sri_sustentoName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sri_sustentoName', value: val}) }
        },
        taxes: {
            get () { return this.$store.state[this.moduleName].editData.taxes },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataTaxes', val) }
        },
        lookup_groups: {
            get () { return this.$store.state[this.moduleName].editData.lookup_groups },
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        lookup_taxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxes },
        },
        lookup_groupsTaxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_groupsTaxes },
        },
        lookup_sri_sustentos: {
            get () { return this.$store.state[this.moduleName].editData.lookup_sri_sustentos },
        },
    },
})
</script>
