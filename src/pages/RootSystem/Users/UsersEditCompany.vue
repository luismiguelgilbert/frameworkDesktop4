<template>
<q-table
      :data="lookup_companies"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="sys_company_id"
      virtual-scroll dense
      :rows-per-page-options="[0]"
      :separator="userTableLines"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        { name: 'value', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true },
        { name: 'label', required: true, label: 'Compañía', align: 'left', field: row => row.label, sortable: true },
        { name: 'is_allowed', required: true, label: 'Permitida?', align: 'left', field: row => row.is_allowed, sortable: true },
        { name: 'is_default', required: true, label: 'Principal?', align: 'left', field: row => row.is_default, sortable: true },
      ]"
>
    <template v-slot:top>
        <div :class="'text-h6 '+(userColor=='blackDark'?'ellipsis text-white':'ellipsis text-primary')" style="max-width: 40%;" >Lista de Compañías Activas</div>
        <q-space />
        <q-input borderless dense v-model="filterString" placeholder="Buscar...">
          <template v-slot:append>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>
    </template>
    <template v-slot:body-cell-is_allowed="props">
        <q-td :props="props">
            <q-checkbox size="sm" color="positive" dense :value="props.value" @input="changeCompanyAllowStatus(props)" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" />
        </q-td>
    </template>
    <template v-slot:body-cell-is_default="props">
        <q-td :props="props">
            <q-toggle size="sm" dense color="positive" :value="props.value" @input="changeCompanyDefaultStatus(props)" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" />
        </q-td>
    </template>
    <template v-slot:bottom-row >
      <q-tr>
      </q-tr>
    </template>
</q-table>
    
</template>
<style lang="sass">
.q-table__bottom
    padding: 0px
.my-sticky-header-usercompany
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: white

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2

.my-sticky-header-usercompany-dark
  /* max height is important */
  .q-table__middle
    max-height: 50px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: $grey-10

  thead tr:first-child th
    position: sticky
    top: 0
    opacity: 1
    z-index: 2
</style>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default ({
    data () {
        return {
            moduleName: "Users", filterString: ''
        }
    },
    methods:{
        changeCompanyAllowStatus(row){
            let new_lookup_companies = JSON.parse(JSON.stringify(this.lookup_companies))
            new_lookup_companies.find(x=>x.value==row.row.value).is_allowed=!row.row.is_allowed
            this.lookup_companies = new_lookup_companies
        },
        changeCompanyDefaultStatus(row){
            let new_lookup_companies = JSON.parse(JSON.stringify(this.lookup_companies))
            new_lookup_companies.map(x=>{ x.is_default = false });
            new_lookup_companies.find(x=>x.value==row.row.value).is_default=!row.row.is_default
            this.lookup_companies = new_lookup_companies
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        lookup_companies: { 
            get () { return this.$store.state[this.moduleName].editData.lookup_companies }, 
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataCompanies', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }  
        },
        sys_user_color: { 
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color }, 
        },
    }
})
</script>