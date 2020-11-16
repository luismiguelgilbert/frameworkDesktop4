<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
      <q-toggle class="col-4"
        v-model="estado" icon="fas fa-check" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <q-input
        ref="name_es" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el nombre de la Bodega (*)" label="Nombre de la Bodega (*)" filled
        v-model="name_es"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length > 0 || 'Campo debe tener al menos 1 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-warehouse" /></template>
    
    </q-input>
    <q-input class="q-mb-lg"
        ref="position" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba la posición en que debe aparecer esta bodega" label="Posición de la Bodega" filled
        v-model="position" type="number" :min=0
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-sort-amount-up-alt" /></template>
    </q-input>

    <selectSearchable 
        prependIcon="fas fa-globe"
        labelText="País (*)" labelSearchText="Buscar País"
        :optionsList="this.lookup_countries"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false"  class="q-pb-md"
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

    <selectSearchable 
        prependIcon="fas fa-city"
        labelText="Ciudad" labelSearchText="Buscar Ciudad"
        :optionsList="this.lookup_cities"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false"  class="q-pb-md"
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

    <q-input class="q-mb-lg"
        ref="address" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba la dirección donde se encuentra la Bodega" label="Dirección de la Bodega" filled
        v-model="address"
        >
        <template v-slot:prepend><q-icon name="fas fa-map-marker-alt" /></template>
    </q-input>


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
            moduleName: "Warehouses"
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
        name_es: {
            get () { return this.$store.state[this.moduleName].editData.basic.name_es },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'name_es', value: val}) }
        },
        position: {
            get () { return this.$store.state[this.moduleName].editData.basic.position },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'position', value: val}) }
        },
        country_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.country_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'country_id', value: val}) }
        },
        city_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.city_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'city_id', value: val}) }
        },
        address: {
            get () { return this.$store.state[this.moduleName].editData.basic.address },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'address', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
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
