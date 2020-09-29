<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
      <q-toggle class="col-4"
        v-model="estado" icon="fas fa-check" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
      <q-toggle class="col-4"
        v-model="is_sales" icon="fas fa-tag" color="blue-6" label="Se Vende?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
      <q-toggle class="col-4"
        v-model="is_purchase" icon="fas fa-shopping-cart" color="light-blue-6" label="Se Compra?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <q-select class="col-4"
        label="Tipo de Item (*)" placeholder="Seleccione el Tipo de Item al que corresponde el Item (*)" emit-value map-options filled
        :options="lookup_systemTypes" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="systemType"
        ref="systemType"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-cog" /></template>
    </q-select>
    <q-select class="col-4"
        label="Grupo Contable (*)" placeholder="Seleccione el Grupo Contable al que pertenece el Item (*)" emit-value map-options filled
        :options="lookup_groups" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="groupID"
        ref="groupID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-book" /></template>
    </q-select>
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
    <q-select class="col-4"
        label="Clasificación (*)" placeholder="Seleccione la Clasificación al que pertenece el Item (*)" emit-value map-options filled
        :options="lookup_types" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :option-disable="opt => opt.estado"
        v-model="typeID"
        ref="typeID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-layer-group" /></template>
    </q-select>

    <q-input class="q-mb-md"
        ref="bar_code" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el Código de Barras del Item" label="Código de Barras del Item" filled
        v-model="bar_code"
        >
        <template v-slot:prepend><q-icon name="fas fa-qrcode" /></template>
    </q-input>

    <q-select class="col-4"
        label="Unidad de Medida (*)" placeholder="Seleccione la Unidad de Medida del Item (*)" emit-value map-options filled
        :options="lookup_UoM" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="uomID"
        ref="uomID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-weight" /></template>
    </q-select>

    <q-select class="col-4"
        label="Marca" placeholder="Seleccione la Marca del Item (*)" emit-value map-options filled
        :options="lookup_brands" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="brandID"
        ref="brandID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-sticky-note" /></template>
    </q-select>


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


export default ({
    data () {
        return {
            moduleName: "Items"
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
})
</script>
