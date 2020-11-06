<template>
<div>
    <q-table
          :data="partners"
          :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 225px); max-height: calc(100vh - 225px)"
          row-key="partnerID"
          virtual-scroll
          :rows-per-page-options="[0]"
          hide-bottom dense
          :filter="filterString"
          :columns="[
            //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
            { name: 'partner_id', required: true, label: 'Nombre del Proveedor', align: 'left', field: row => row.partner_id, sortable: true },
            { name: 'is_prefered', required: true, label: 'Proveedor Preferido?', align: 'center', field: row => row.is_prefered, sortable: true },
            { name: 'catalog_code', required: true, label: 'Código del Item según Proveedor', align: 'left', field: row => row.catalog_code, sortable: true },
            { name: 'catalog_name', required: true, label: 'Nombre del Item según Proveedor', align: 'left', field: row => row.catalog_name, sortable: true },
            { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },

          ]"


      >
      <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="partner_id" :props="props">
                {{ props.row.name_es }}
              </q-td>
              <q-td key="is_prefered" :props="props">
                <q-checkbox :value="props.row.is_prefered" color="positive" icon="fas fa-check" dense @input="updateRow(!props.row.is_prefered,'is_prefered',props.row)" />
              </q-td>
              <q-td key="catalog_code" :props="props">
                {{ props.row.catalog_code }}
                <q-popup-edit :value="props.row.catalog_code" >
                  <q-input :value="props.row.catalog_code" dense autofocus counter @input="(value)=>{updateRow(value,'catalog_code',props.row)}" />
                </q-popup-edit>
              </q-td>
              <q-td key="catalog_name" :props="props">
                {{ props.row.catalog_name }}
                <q-popup-edit :value="props.row.catalog_name" >
                  <q-input :value="props.row.catalog_name" dense autofocus counter @input="(value)=>{updateRow(value,'catalog_name',props.row)}" />
                </q-popup-edit>
              </q-td>
              <q-td key="estado" :props="props">
                <q-toggle :value="props.row.estado" color="positive" icon="fas fa-check" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
              </q-td>
            </q-tr>
      </template>
        <template v-slot:top>
            <q-btn label="Agregar Proveedor" @click="showPrompt" icon="fas fa-plus" color="primary" no-caps />
            <q-space />
            <q-input borderless dense v-model="filterString" placeholder="Buscar...">
              <template v-slot:append>
                <q-icon name="fas fa-search" />
              </template>
            </q-input>
        </template>
        <!--<template v-slot:body-cell-is_profile="props">
            <q-td :props="props">
                <q-toggle size="sm" dense color="positive" :value="props.value" @input="changeProfileforUser(props)" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" />
            </q-td>
        </template>
        -->
    </q-table>

    <q-dialog v-model="prompt">
        <mainLookup 
            titleBar="Buscar Proveedor"
            :data="this.lookup_partners"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :columns="[
                    //{ name: 'value', required: true, label: 'Código', align: 'left', field: row => row.short_name_es , sortable: true }
                    { name: 'label', required: true, label: 'Material', align: 'left', field: row => row.label, sortable: false,  style: 'max-width: 350px;',  }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            @onCancel="prompt=false"
            @onSelect="(selectedRows)=>{addRow(selectedRows)}"
        />
    </q-dialog>
</div>
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
import { date } from 'quasar';
import mainLookup from '../../../components/mainLookup/mainLookup.vue'

export default ({
    components: {
        mainLookup: mainLookup
    },
    data () {
        return {
            moduleName: "Items", filterString: '', prompt: false, newRecord: null
        }
    },
    methods:{
      getMax(arr, prop) {
          var max;
          for (var i=0 ; i<arr.length ; i++) {
              if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                  max = arr[i];
          }
          return max;
      },
      updateRow(newVal, colName, row){
        let newRows = JSON.parse(JSON.stringify(this.partners))
        newRows.find(x=>x.partnerID==row.partnerID)[colName] = newVal
        this.partners = newRows
      },
      showPrompt(){
        this.prompt=true
      },
      addRow(newRecord){
        //if(this.newRecord && !(this.partners.find(x=>x.partnerID==this.newRecord)) ){
        if(newRecord && newRecord.length>0 && !(this.partners.find(x=>x.partnerID==newRecord[0].value)) ){
          let newRows = JSON.parse(JSON.stringify(this.partners))
          newRows.push({
            partnerID: newRecord[0].value
            ,name_es: this.lookup_partners.find(t=>t.value==newRecord[0].value).label
            ,is_prefered: true
            ,catalog_code: ''
            ,catalog_name: ''
            ,estado: true
          })
          this.partners = newRows
          this.prompt = false
        }else{
          this.$q.notify({ message: 'Ya existe ese proveedor', color: 'primary', progress: true, })
        }
      },
      getAge(fecha){
        return date.getDateDiff(new Date(), fecha, 'years')
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
        partners: {
            get () { return this.$store.state[this.moduleName].editData.partners },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPartners', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_partners: {
            get () { return this.$store.state[this.moduleName].editData.lookup_partners },
        },
    }
})
</script>
