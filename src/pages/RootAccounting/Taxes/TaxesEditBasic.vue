<template>
<q-form ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div>
      <q-toggle
        tabindex="-1"
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <selectSearchable 
        prependIcon="fas fa-percent"
        labelText="Impuesto" labelSearchText="Buscar Impuesto"
        :optionsList="this.lookup_taxes"
        rowValueField="value" optionsListLabel="label" optionDisableField="estado"
        :isRequired="true"
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="taxID"
        :tableSearchColumns="[
                 { name: 'label', label: 'País', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.taxID=row.value;
            }"
        />
    <!--<q-select
        label="Impuesto (*)" placeholder="Seleccione el impuesto que desea utilizar" emit-value map-options filled
        :options="lookup_taxes" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="taxID"
        ref="taxID"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-percent" /></template>
    </q-select>-->

    <q-input class="q-mt-md"
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre del Impuesto (*)" label="Nombre del Impuesto (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-passport" /></template>
    </q-input>
    <q-input
        ref="short_name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre abreviado del Impuesto (*)" label="Nombre Abreviado del Impuesto (*)" filled
        v-model="short_name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-bolt" /></template>
    </q-input>

    <selectSearchable 
        prependIcon="fas fa-tags"
        labelText="Cuenta usada en Ventas (*)" labelSearchText="Buscar Cuenta Contable"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accSales"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accSales=row.value;
                //this.accSalesInvoiceName=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />
    <!--<q-input
        ref="accSalesName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta Contable del Impuesto en Ventas (*)" label="Cuenta usada en Ventas (*)" filled
        :value="accSalesName" title="Por ejemplo, va al HABER cuando se emite una Factura de Venta"
        @keyup.keyCodes.113="openSearchAccount('accSales','accSalesName',accSales)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-tags" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accSales','accSalesName',accSales)"/></template>
    </q-input>-->

    <selectSearchable 
        prependIcon="fas fa-shopping-cart"
        labelText="Cuenta usada en Compras (*)" labelSearchText="Buscar Cuenta Contable"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accPurchase"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accPurchase=row.value;
                //this.accSalesInvoiceName=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />
    <!--<q-input
        ref="accPurchaseName" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione la Cuenta Contable del Impuesto en Compras (*)" label="Cuenta usada en Compras (*)" filled
        :value="accPurchaseName" title="Por ejemplo, va al DEBE cuando se emite una Factura de Compra"
        @keyup.keyCodes.113="openSearchAccount('accPurchase','accPurchaseName',accPurchase)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-shopping-cart" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchAccount('accPurchase','accPurchaseName',accPurchase)"/></template>
    </q-input>-->

    <q-dialog v-model="isSearchDialog">
        <mainLookup 
            titleBar="Buscar Cuenta Contable"
            :data="lookup_accounts"
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
        ,selectSearchable: selectSearchable
    },
    data () {
        return {
            moduleName: "Taxes"
            ,isSearchDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
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
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        taxID: {
            get () { return this.$store.state[this.moduleName].editData.basic.taxID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'taxID', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        short_name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.short_name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'short_name_es', value: val}) }
        },
        lookup_taxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxes },
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        accSales: {
            get () { return this.$store.state[this.moduleName].editData.basic.accSales },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accSales', value: val}) }
        },
        accSalesName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accSalesName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accSalesName', value: val}) }
        },
        accPurchase: {
            get () { return this.$store.state[this.moduleName].editData.basic.accPurchase },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accPurchase', value: val}) }
        },
        accPurchaseName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accPurchaseName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accPurchaseName', value: val}) }
        },
        
    },
})
</script>
