<template>
<div>
    <q-table
          :data="bom"
          :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 225px); max-height: calc(100vh - 225px)"
          row-key="partnerID"
          :separator="userTableLines"
          :rows-per-page-options="[0]"
          hide-bottom dense
          :filter="filterString"
          :columns="[
            //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
            { name: 'materialID', required: true, label: 'Nombre del Material', align: 'left', field: row => row.materialID, sortable: true },
            { name: 'materialQuantity', required: true, label: 'Cantidad', align: 'center', field: row => row.materialQuantity, sortable: true },
            { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true },
            { name: 'estado', required: true, label: 'Activo?', align: 'center', field: row => row.estado, sortable: true },

          ]"


    >
      <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="materialID" :props="props">
                {{ props.row.name_es }}
              </q-td>
              <q-td key="materialQuantity" :props="props">
                {{ props.row.materialQuantity }}
                <q-popup-edit :value="props.row.materialQuantity" >
                  <q-input :value="props.row.materialQuantity" type="number" :min="0" dense autofocus counter @input="(value)=>{updateRow(value,'materialQuantity',props.row)}" />
                </q-popup-edit>
              </q-td>
              <q-td key="comments" :props="props">
                {{ props.row.comments }}
                <q-popup-edit :value="props.row.comments" >
                  <q-input :value="props.row.comments" dense autofocus counter @input="(value)=>{updateRow(value,'comments',props.row)}" />
                </q-popup-edit>
              </q-td>
              <q-td key="estado" :props="props">
                <q-toggle :value="props.row.estado" color="positive" icon="fas fa-check" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
              </q-td>
            </q-tr>
      </template>
      <template v-slot:top>
          <q-btn label="Agregar Material" @click="showPrompt" icon="fas fa-plus" color="primary" no-caps />
          <q-space />
      </template>
      <template v-slot:bottom-row >
        <q-tr>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="prompt">
        <mainLookup 
            titleBar="Buscar Material"
            :data="this.lookup_items"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :columns="[
                    //{ name: 'value', required: true, label: 'Código', align: 'left', field: row => row.short_name_es , sortable: true }
                    { name: 'label', required: true, label: 'Material', align: 'left', field: row => row.label, sortable: false,    }
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
            moduleName: "Items", filterString: '', prompt: false, //newRecord: null
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
        let newRows = JSON.parse(JSON.stringify(this.bom))
        newRows.find(x=>x.materialID==row.materialID)[colName] = newVal
        this.bom = newRows
      },
      showPrompt(){
        this.prompt=true
      },
      addRow(newRecord){
        if(newRecord && newRecord.length>0 && !(this.bom.find(x=>x.materialID==newRecord[0].value)) ){
          let newRows = JSON.parse(JSON.stringify(this.bom))
          newRows.push({
             materialID: newRecord[0].value
            ,name_es: this.lookup_items.find(t=>t.value==newRecord[0].value).label
            ,materialQuantity: 1
            ,comments: ''
            ,estado: true
          })
          this.bom = newRows
          this.prompt = false
        }else{
          this.$q.notify({ message: 'Ya existe ese material', color: 'primary', progress: true, })
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
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        bom: {
            get () { return this.$store.state[this.moduleName].editData.bom },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataBoM', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_bom: {
            get () { return this.$store.state[this.moduleName].editData.lookup_bom },
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
    }
})
</script>
