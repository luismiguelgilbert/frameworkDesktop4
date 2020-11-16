<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
      <q-toggle class="col-12 col-md-4"
        v-model="estado" icon="fas fa-check" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>

    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el nombre del Grupo (*)" label="Nombre del Grupo (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-book" /></template>
    </q-input>

    <!--accSalesInvoice-->
    <selectSearchable 
        prependIcon="fas fa-tags"
        labelText="Cuenta x Cobrar al Cliente (*)" labelSearchText="Buscar Cuenta Contable"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accSalesInvoice"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accSalesInvoice=row.value;
                //this.accSalesInvoiceName=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />

    <!--accPaymentIncomeAdvance-->
    <selectSearchable 
        prependIcon="fas fa-hand-holding-usd"
        labelText="Cuenta de Anticipos Recibidos del Cliente (*)" labelSearchText="Buscar Cuenta Contable"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accPaymentIncomeAdvance"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accPaymentIncomeAdvance=row.value;
                //this.accSalesInvoiceName=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />

    <!--accPurchaseInvoice-->
    <selectSearchable 
        prependIcon="fas fa-shopping-cart"
        labelText="Cuenta x Pagar del Proveedor (*)" labelSearchText="Buscar Cuenta Contable"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accPurchaseInvoice"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accPurchaseInvoice=row.value;
                //this.accSalesInvoiceName=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />
    
    <!--accPaymentOutcomeAdvance-->
    <selectSearchable 
        prependIcon="fas fa-money-check-alt"
        labelText="Cuenta de Anticipos Entregados al Proveedor (*)" labelSearchText="Buscar Cuenta Contable"
        :optionsList="this.lookup_accounts"
        rowValueField="value" optionsListLabel="label" optionsListCaption="code_es" 
        optionLabelField="fullLabel" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="accPaymentOutcomeAdvance"
        :tableSearchColumns="[
                 { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                ,{ name: 'label', label: 'Cuenta', field: 'label', align: 'left'}
                //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.accPaymentOutcomeAdvance=row.value;
                //this.accSalesInvoiceName=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />

    <!--sri_compras-->
    <q-select
        ref="sri_compras" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione el Tipo de Identificación en Facturas de Venta al que pertenece el Item (*)" label="Tipo de Identificación en Facturas de Venta (*)" filled
        v-model="sri_compras" :options="lookup_sri_identificacion" map-options emit-value
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-shopping-cart" /></template>
    </q-select>

    <!--sri_ventas-->
    <q-select
        ref="sri_ventas" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione el Tipo de Identificación en Facturas de Compra al que pertenece el Item (*)" label="Tipo de Identificación en Facturas de Compra (*)" filled
        v-model="sri_ventas" :options="lookup_sri_identificacion" map-options emit-value
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-tags" /></template>
    </q-select>
    
    <!--paytermID-->
    <q-select
        ref="paytermID" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Seleccione Forma de Pago predeterminada (*)" label="Forma de Pago Predeterminada (*)" filled
        v-model="paytermID" :options="lookup_payterms" map-options emit-value
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-wallet" /></template>
    </q-select>

    <!--PRICELIST-->
    <div>
        <q-toolbar class="bg-primary text-white shadow-2">
            <q-toolbar-title>
                <q-icon name="fas fa-list-ol" color="white" size="xs" /> Listas de Precios Permitidas
            </q-toolbar-title>
            <q-btn flat icon-right="fas fa-plus"  label="Agregar Lista de Precios" no-caps @click="isTaxesDialog=true" />
        </q-toolbar>
        <q-list bordered>
            <q-item v-for="linea in pricelists" :key="linea.value" >
                <q-item-section>
                    <q-item-label class="text-bolder text-primary">{{linea.label}}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn flat icon="fas fa-trash"  color="primary" round @click="removeTaxLine(linea)" />
                </q-item-section>
            </q-item>
            <q-item v-if="pricelists.length<=0">
                <q-item-section>
                    <q-item-label class="text-bolder text-primary">No se han agregado listas de precios</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </div>

    <!--PAYTERMS-->
    <br />
    <div>
        <q-toolbar class="bg-primary text-white shadow-2">
            <q-toolbar-title>
                <q-icon name="fas fa-money-check" color="white" size="xs" /> Formas de Pago Permitidas
            </q-toolbar-title>
            <q-btn flat icon-right="fas fa-plus"  label="Agregar Formas de Pago" no-caps @click="isPaytermsDialog=true" />
        </q-toolbar>
        <q-list bordered>
            <q-item v-for="linea in payterms" :key="linea.value" >
                <q-item-section>
                    <q-item-label class="text-bolder text-primary">{{linea.label}}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn flat icon="fas fa-trash"  color="primary" round @click="removePaytermLine(linea)" />
                </q-item-section>
            </q-item>
            <q-item v-if="payterms.length<=0">
                <q-item-section>
                    <q-item-label class="text-bolder text-primary">No se ha agregado formas de pago</q-item-label>
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
            titleBar="Buscar Lista de Precios"
            :data="this.lookup_pricelists"
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

    <q-dialog v-model="isPaytermsDialog">
        <mainLookup 
            titleBar="Buscar Formas de Pago"
            :data="this.lookup_payterms"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :columns="[
                     { name: 'label', required: true, label: 'Impuesto', align: 'left', field: row => row.label, sortable: false,    }
                    //,{ name: 'short_name_es', required: true, label: 'Código', align: 'left', field: row => row.short_name_es , sortable: true }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            @onCancel="isPaytermsDialog=false"
            @onSelect="(selectedRows)=>{addPayterm(selectedRows)}"
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
            moduleName: "partnerMasterGroups", isSearchDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,isTaxesDialog: false, isSustentosDialog: false
            ,isPaytermsDialog: false
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
            this.pricelists = newTaxes
        },
        removeTaxLine(linea){
            let newTaxes = JSON.parse(JSON.stringify(this.pricelists))
            newTaxes = newTaxes.filter(x=>x.value != linea.value);
            this.pricelists = newTaxes
        },
        updateValues(selectedRows, lookupValueField, lookupLabelField){
            this[this.mainLookupUpdateFieldValueName] = selectedRows[0].[lookupValueField]
            this[this.mainLookupUpdateFieldLabelName] = selectedRows[0].[lookupLabelField]
            this.isSearchDialog = false
        },
        addTax(selectedRows){
            let newTaxes = JSON.parse(JSON.stringify(this.pricelists))
            if(!(newTaxes.some(x=>x.value==selectedRows[0].value))){
                newTaxes.push(selectedRows[0])
            }
            this.pricelists = newTaxes
            this.isTaxesDialog = false
        },
        updateSustento(selectedRows){
            this.sri_sustento=selectedRows[0].value;
            this.sri_sustentoName=selectedRows[0].label;
            this.isSustentosDialog=false;
        },
        addPayterm(selectedRows){
            let newTaxes = JSON.parse(JSON.stringify(this.payterms))
            if(!(newTaxes.some(x=>x.value==selectedRows[0].value))){
                newTaxes.push(selectedRows[0])
            }
            this.payterms = newTaxes
            this.isPaytermsDialog = false
        },
        removePaytermLine(linea){
            let newTaxes = JSON.parse(JSON.stringify(this.payterms))
            newTaxes = newTaxes.filter(x=>x.value != linea.value);
            this.payterms = newTaxes
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
        groupID: {
            get () { return this.$store.state[this.moduleName].editData.basic.groupID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'groupID', value: val}) }
        },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        accSalesInvoice: {
            get () { return this.$store.state[this.moduleName].editData.basic.accSalesInvoice },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accSalesInvoice', value: val}) }
        },
        accSalesInvoiceName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accSalesInvoiceName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accSalesInvoiceName', value: val}) }
        },
        accPaymentIncomeAdvance: {
            get () { return this.$store.state[this.moduleName].editData.basic.accPaymentIncomeAdvance },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accPaymentIncomeAdvance', value: val}) }
        },
        accPaymentIncomeAdvanceName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accPaymentIncomeAdvanceName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accPaymentIncomeAdvanceName', value: val}) }
        },
        accPurchaseInvoice: {
            get () { return this.$store.state[this.moduleName].editData.basic.accPurchaseInvoice },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accPurchaseInvoice', value: val}) }
        },
        accPurchaseInvoiceName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accPurchaseInvoiceName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accPurchaseInvoiceName', value: val}) }
        },
        accPaymentOutcomeAdvance: {
            get () { return this.$store.state[this.moduleName].editData.basic.accPaymentOutcomeAdvance },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accPaymentOutcomeAdvance', value: val}) }
        },
        accPaymentOutcomeAdvanceName: {
            get () { return this.$store.state[this.moduleName].editData.basic.accPaymentOutcomeAdvanceName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accPaymentOutcomeAdvanceName', value: val}) }
        },
        sri_compras: {
            get () { return this.$store.state[this.moduleName].editData.basic.sri_compras },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sri_compras', value: val}) }
        },
        sri_ventas: {
            get () { return this.$store.state[this.moduleName].editData.basic.sri_ventas },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sri_ventas', value: val}) }
        },
        paytermID: {
            get () { return this.$store.state[this.moduleName].editData.basic.paytermID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'paytermID', value: val}) }
        },
        pricelists: {
            get () { return this.$store.state[this.moduleName].editData.pricelists },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPricelists', val) }
        },
        payterms: {
            get () { return this.$store.state[this.moduleName].editData.payterms },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPaytermns', val) }
        },
        lookup_groups: {
            get () { return this.$store.state[this.moduleName].editData.lookup_groups },
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        lookup_pricelists: {
            get () { return this.$store.state[this.moduleName].editData.lookup_pricelists },
        },
        lookup_payterms: {
            get () { return this.$store.state[this.moduleName].editData.lookup_payterms },
        },
        lookup_sri_identificacion: {
            get () { return this.$store.state[this.moduleName].editData.lookup_sri_identificacion },
        },
    },
})
</script>
