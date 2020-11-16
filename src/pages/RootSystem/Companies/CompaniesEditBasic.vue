<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm" >
    <q-toggle
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    <q-input
        ref="company_number" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el número de identificación (RUC) de la compañía (*)" label="RUC (*)" filled
        v-model="company_number"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 4 || 'Campo debe tener al menos 5 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-id-card" /></template>
    </q-input>
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la razón social de la compañía (*)" label="Razón Social (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-building" /></template>
    </q-input>
    <q-input
        ref="short_name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre comercial de la compañía (*)" label="Nombre Comercial (*)" filled
        v-model="short_name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 2 || 'Campo debe tener al menos 3 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-id-badge" /></template>
    </q-input>
        <q-input
        ref="billing_phone" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese el nombre teléfono de la compañía" label="Teléfono" filled
        v-model="billing_phone"

        >
        <template v-slot:prepend><q-icon name="fas fa-phone" /></template>
    </q-input>
    <q-input
        ref="billing_address" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" class="q-pt-md"
        placeholder="Ingrese la dirección de la compañía" label="Dirección" filled
        v-model="billing_address"

        >
        <template v-slot:prepend><q-icon name="fas fa-map-marker-alt" /></template>
    </q-input>

    <selectSearchable 
        prependIcon="fas fa-globe"
        labelText="País predeterminado para nuevos socios" labelSearchText="Buscar País Predeterminado"
        :optionsList="this.lookup_countries"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false" class="q-mb-md q-mt-md"
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="default_country_id"
        :tableSearchColumns="[
                 { name: 'label', label: 'País', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.default_country_id=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />

    <!--<q-select class="q-mb-md q-pt-md"
        label="País predeterminado para nuevos socios" placeholder="Seleccione el país de origen predeterminado para nuevos socios (*)" emit-value map-options filled
        :options="lookup_countries" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="default_country_id"
        ref="default_country_id"
        >
        <template v-slot:prepend><q-icon name="fas fa-globe" /></template>
    </q-select>-->

    <selectSearchable 
        prependIcon="fas fa-city"
        labelText="Ciudad predeterminado para nuevos socios" labelSearchText="Buscar Ciudad Predeterminada"
        :optionsList="this.lookup_cities"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="default_city_id"
        :tableSearchColumns="[
                 { name: 'label', label: 'País', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.default_city_id=row.value;
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />
    <!--<q-select class="q-mb-md q-pt-md"
        label="Ciudad predeterminada para nuevos socios" placeholder="Seleccione la ciudad de origen predeterminada para nuevos socios (*)" emit-value map-options filled
        :options="lookup_cities" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="default_city_id"
        ref="default_city_id"
        >
        <template v-slot:prepend><q-icon name="fas fa-city" /></template>
    </q-select>-->

     <q-select class="q-mb-md q-pt-md"
        label="Grupo Contable predeterminado para nuevos Socios" placeholder="Seleccione el Grupo Contable predeterminado para nuevos socios (*)" emit-value map-options filled
        :options="lookup_partner_groups" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="default_partner_groupID"
        :option-disable="opt => !opt.estado"
        ref="default_partner_groupID"
        >
        <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
    </q-select>

    <q-select class="q-mb-md q-pt-md"
        label="Grupo Contable predeterminado para nuevos Items" placeholder="Seleccione el Grupo Contable predeterminado para nuevos Items (*)" emit-value map-options filled
        :options="lookup_inv_groups" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :option-disable="opt => !opt.estado"
        v-model="default_inv_groupID"
        ref="default_inv_groupID"
        >
        <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
    </q-select>

    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'


export default ({
    components: {
        selectSearchable: selectSearchable
    },
    data () {
        return {
            moduleName: "Companies"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        /*isFieldErrorBG(fieldName) {
            console.dir('isFieldErrorBG: '+fieldName)
            console.dir(this.$refs.length)
            if(Object.keys(this.$refs).length>0){//espera que existan datos
                return this.$refs[fieldName].hasError?'red':undefined
            }
        },
        isFieldErrorText(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos
                return this.$refs[fieldName].hasError?'text-white':undefined
            }
        },
        isFieldErrorLabel(fieldName) {
            if(Object.keys(this.$refs).length>0){//espera que existan datos
                return this.$refs[fieldName].hasError?'white':undefined
            }
        },*/

    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        company_number: {
            get () { return this.$store.state[this.moduleName].editData.basic.company_number },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'company_number', value: val}) }
        },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        short_name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.short_name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'short_name_es', value: val}) }
        },
        billing_phone: {
            get () { return this.$store.state[this.moduleName].editData.basic.billing_phone },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'billing_phone', value: val}) }
        },
        billing_address: {
            get () { return this.$store.state[this.moduleName].editData.basic.billing_address },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'billing_address', value: val}) }
        },
        /*lookup_profiles: {
            get () { return this.$store.state[this.moduleName].editData.lookup_profiles },
        },*/
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_color', value: val}) }
        },
        default_country_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.default_country_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'default_country_id', value: val}) }
        },
        default_city_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.default_city_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'default_city_id', value: val}) }
        },
        default_partner_groupID: {
            get () { return this.$store.state[this.moduleName].editData.basic.default_partner_groupID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'default_partner_groupID', value: val}) }
        },
        default_inv_groupID: {
            get () { return this.$store.state[this.moduleName].editData.basic.default_inv_groupID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'default_inv_groupID', value: val}) }
        },
        lookup_countries: {
            get () { return this.$store.state[this.moduleName].editData.lookup_countries },
        },
        lookup_cities: {
            get () { return this.$store.state[this.moduleName].editData.lookup_cities },
        },
        lookup_partner_groups: {
            get () { return this.$store.state[this.moduleName].editData.lookup_partner_groups },
        },
        lookup_inv_groups: {
            get () { return this.$store.state[this.moduleName].editData.lookup_inv_groups },
        },

    },
})
</script>
