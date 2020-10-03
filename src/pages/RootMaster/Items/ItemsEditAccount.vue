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
    <q-input
        ref="accInventoryName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta de Inventario (*)" label="Cuenta de Inventario (*)" filled
        :value="accInventoryName" title="Por ejemplo, va al DEBE cuando Ingresa Inventario por Compra"
        @keyup.keyCodes.113="openSearchAccount('accInventory','accInventoryName',accInventory)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-boxes" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accInventory','accInventoryName',accInventory)"/></template>
    </q-input>

    <!--accAllocation-->
    <q-input
        ref="accAllocationName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta de Liquidación de Documentos de Inventario (*)" label="Cuenta de Liquidación de Documentos de Inventario (*)" filled
        :value="accAllocationName" title="Por ejemplo, va al HABER cuando Ingresa Inventario por Compra || va al DEBE cuando se Contabiliza Factura de Compra"
        @keyup.keyCodes.113="openSearchAccount('accAllocation','accAllocationName',accAllocation)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-file-invoice" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accAllocation','accAllocationName',accAllocation)"/></template>
    </q-input>

    <!--accCOGS-->
    <q-input
        ref="accCOGSName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta de Costo de Ventas Inventario (*)" label="Cuenta de Costo de Ventas de Inventario (*)" filled
        :value="accCOGSName" title="Por ejemplo, va al DEBE cuando Egresa Inventario por Venta"
        @keyup.keyCodes.113="openSearchAccount('accCOGS','accCOGSName',accCOGS)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-tags" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accCOGS','accCOGSName',accCOGS)"/></template>
    </q-input>

    <!--accCOGSprj-->
    <q-input
        ref="accCOGSprjName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta de Costo de Inventario en Obras (*)" label="Cuenta de Costo de Ventas de Inventario que sale x Obras/Proyecto (*)" filled
        :value="accCOGSprjName" title="Por ejemplo, va al DEBE cuando Egresa Inventario para una Obra/Proyecto"
        @keyup.keyCodes.113="openSearchAccount('accCOGSprj','accCOGSprjName',accCOGSprj)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-pencil-ruler" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accCOGSprj','accCOGSprjName',accCOGSprj)"/></template>
    </q-input>

    <!--accRevenue-->
    <q-input
        ref="accRevenueName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta de Ingresos x Venta (*)" label="Cuenta de Ingresos (*)" filled
        :value="accRevenueName" title="Por ejemplo, va al HABER cuando se emite Factura de Venta de Inventario"
        @keyup.keyCodes.113="openSearchAccount('accRevenue','accRevenueName',accRevenue)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-file-invoice-dollar" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accRevenue','accRevenueName',accRevenue)"/></template>
    </q-input>

    <!--accInventoryIncrease-->
    <q-input
        ref="accInventoryIncreaseName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta de Ajuste de Inventario Sobrante (*)" label="Cuenta de Ajuste de Inventario Sobrante (*)" filled
        :value="accInventoryIncreaseName" title="Por ejemplo, va al HABER cuando se registra Ajuste de Inventario Sobrante"
        @keyup.keyCodes.113="openSearchAccount('accInventoryIncrease','accInventoryIncreaseName',accInventoryIncrease)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-box" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accInventoryIncrease','accInventoryIncreaseName',accInventoryIncrease)"/></template>
    </q-input>

    <!--accInventoryDecrease-->
    <q-input
        ref="accInventoryDecreaseName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta de Ajuste de Inventario Faltante (*)" label="Cuenta de Ajuste de Inventario Faltante (*)" filled
        :value="accInventoryDecreaseName" title="Por ejemplo, va al DEBE cuando se registra Ajuste de Inventario Faltante"
        @keyup.keyCodes.113="openSearchAccount('accInventoryDecrease','accInventoryDecreaseName',accInventoryDecrease)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-box-open" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accInventoryDecrease','accInventoryDecreaseName',accInventoryDecrease)"/></template>
    </q-input>

    <!--accMfg-->
    <q-input
        ref="accMfgName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta de Consumo de Inventario x Producción (*)" label="Cuenta de Consumo de Inventario x Producción (*)" filled
        :value="accMfgName" title="Por ejemplo, va al DEBE cuando se registra Ajuste de Inventario Faltante"
        @keyup.keyCodes.113="openSearchAccount('accMfg','accMfgName',accMfg)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-industry" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accMfg','accMfgName',accMfg)"/></template>
    </q-input>

    <!--sri_sustento-->
    <q-input
        ref="sri_sustentoName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione el Sustento Tributario al que pertenece el Item (*)" label="Sustento Tributario (*)" filled
        :value="sri_sustentoName" title="Por ejemplo, va al DEBE cuando se registra Ajuste de Inventario Faltante"
        @keyup.keyCodes.113="isSustentosDialog=true"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-balance-scale" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="isSustentosDialog=true"/></template>
    </q-input>
    
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

export default ({
    components: {
        mainLookup: mainLookup
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
