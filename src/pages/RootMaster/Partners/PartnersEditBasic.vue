<template>
<q-form ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
      <q-toggle class="col-3"
        tabindex="-1"
        v-model="estado" icon="fas fa-check" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />

      <q-toggle class="col-3"
        tabindex="-1"
        v-model="is_customer" icon="fas fa-tag" color="blue-6" label="Es Cliente?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
      <q-toggle class="col-3"
        tabindex="-1"
        v-model="is_vendor" icon="fas fa-shopping-cart" color="light-blue-6" label="Es Proveedor?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    <q-toggle class="col-3"
        tabindex="-1"
        v-model="is_foreign" icon="fas fa-flag" color="light-blue-6" label="Es Extranjero?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <!--porque está en tab Contable <q-select class="col-4"
        label="Grupo Contable (*)" placeholder="Seleccione el grupo al que pertenece el socio (*)" emit-value map-options filled
        :options="lookup_groups" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="group_id"
        ref="group_id" @input="changeMonth"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-book" /></template>
    </q-select>-->
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba la Razón Social del socio (*)" label="Razón Social (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-id-card" /></template>
    </q-input>
    <q-input
        ref="partner_ruc" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el Número de Identificación / RUC del socio (*)" label="Número de Identificación / RUC (*)" filled
        v-model="partner_ruc"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-passport" /></template>
    </q-input>

    <q-input class="q-mb-md"
        ref="short_name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el Nombre Comercial del socio (*)" label="Nombre Comercial" filled
        v-model="short_name_es"
        >
        <template v-slot:prepend><q-icon name="far fa-id-card" /></template>
    </q-input>

    <q-input class="q-mb-md"
        ref="billing_address" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba la dirección para uso en facturas del socio (*)" label="Dirección para Facturas" filled
        v-model="billing_address"
        >
        <template v-slot:prepend><q-icon name="fas fa-map-marked" /></template>
    </q-input>

    <q-input class="q-mb-md"
        ref="billing_phone" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el teléfono para uso en facturas del socio (*)" label="Teléfono para Facturas" filled
        v-model="billing_phone"
        >
        <template v-slot:prepend><q-icon name="fas fa-phone" /></template>
    </q-input>

    <selectSearchable 
        prependIcon="fas fa-globe"
        labelText="País (*)" labelSearchText="Buscar País"
        :optionsList="this.lookup_countries"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="country_id"
        :tableSearchColumns="[
                 { name: 'label', label: 'País', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.country_id=row.value;
            }"
        />
    <!--<q-select class="q-mb-md"
        label="País" placeholder="Seleccione el país de origen del socio (*)" emit-value map-options filled
        :options="lookup_countries" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="country_id"
        ref="country_id" @input="changeMonth"
        >
        <template v-slot:prepend><q-icon name="fas fa-globe" /></template>
    </q-select>-->

    <selectSearchable 
        prependIcon="fas fa-city"
        labelText="Ciudad" labelSearchText="Buscar Ciudad"
        :optionsList="this.lookup_cities"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="city_id"
        :tableSearchColumns="[
                 { name: 'label', label: 'País', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.city_id=row.value;
            }"
        />
    <!--<q-select class="q-mb-md"
        label="Ciudad" placeholder="Seleccione la ciudad de origen del socio (*)" emit-value map-options filled
        :options="lookup_cities" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :option-disable="opt => !opt.estado"
        v-model="city_id"
        ref="city_id" @input="changeMonth"
        >
        <template v-slot:prepend><q-icon name="fas fa-city" /></template>
    </q-select>-->

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Socio" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />

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
            moduleName: "Partners"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
      changeMonth(){
        /*if(this.parent_id){
          let temporal = this.lookup_accounts.find(x=>x.value == this.parent_id)
          this.code_es = temporal.code_es + '.xxx'
          this.account_type_root = temporal.account_type_root
          this.account_level = temporal.account_level?parseInt(temporal.account_level+1):1
        }else{
          this.code_es = ''
          this.account_type_root = 1
          this.account_level = 0
        }*/
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
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        group_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.group_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'group_id', value: val}) }
        },
        is_vendor:  {
            get () { return this.$store.state[this.moduleName].editData.basic.is_vendor },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'is_vendor', value: val}) }
        },
        is_customer:  {
            get () { return this.$store.state[this.moduleName].editData.basic.is_customer },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'is_customer', value: val}) }
        },
        is_foreign:  {
            get () { return this.$store.state[this.moduleName].editData.basic.is_foreign },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'is_foreign', value: val}) }
        },
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        partner_ruc: {
            get () { return this.$store.state[this.moduleName].editData.basic.partner_ruc },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partner_ruc', value: val}) }
        },
        short_name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.short_name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'short_name_es', value: val}) }
        },
        billing_address: {
            get () { return this.$store.state[this.moduleName].editData.basic.billing_address },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'billing_address', value: val}) }
        },
        billing_phone: {
            get () { return this.$store.state[this.moduleName].editData.basic.billing_phone },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'billing_phone', value: val}) }
        },
        country_id:  {
            get () { return this.$store.state[this.moduleName].editData.basic.country_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'country_id', value: val}) }
        },
        city_id:  {
            get () { return this.$store.state[this.moduleName].editData.basic.city_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'city_id', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_groups: {
            get () { return this.$store.state[this.moduleName].editData.lookup_groups },
        },
        lookup_countries: {
            get () { return this.$store.state[this.moduleName].editData.lookup_countries },
        },
        lookup_cities: {
            get () { return this.$store.state[this.moduleName].editData.lookup_cities },
        },
    },
})
</script>
