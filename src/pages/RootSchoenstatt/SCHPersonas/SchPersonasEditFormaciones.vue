<template>
<q-table
      :data="formaciones"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="sys_user_code"
      virtual-scroll
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        { name: 'formacionID', required: true, label: 'Formación', align: 'left', field: row => row.formacionID, sortable: true },
        { name: 'fechaInicio', required: true, label: 'Fecha', align: 'left', field: row => row.fechaInicio, sortable: true },
        { name: 'comments', required: true, label: 'Observaciones', align: 'left', field: row => row.comments, sortable: true },
      ]"
>
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="formacionID" :props="props">
            {{ lookup_formaciones.find(x=>x.value==props.row.formacionID).label }}
            <q-popup-edit :value="props.row.formacionID">
              <q-select :value="props.row.formacionID" dense map-options :options="lookup_formaciones"
                :option-disable="opt => !opt.estado"
                @input="(value)=>{updateRow(value.value,'formacionID',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="fechaInicio" :props="props">
            {{ props.row.fechaInicio }}
            <q-popup-edit :value="props.row.fechaInicio" class="no-padding">
              <q-date :value="props.row.fechaInicio" @input="(value)=>{updateRow(value,'fechaInicio',props.row)}" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-edit>
          </q-td>
          <q-td key="comments" :props="props">
            {{ props.row.comments }}
            <q-popup-edit :value="props.row.comments" >
              <q-input :value="props.row.comments" dense autofocus counter @input="(value)=>{updateRow(value,'comments',props.row)}" />
            </q-popup-edit>
          </q-td>
        </q-tr>
  </template>
    <template v-slot:top>
        <q-btn label="Agregar Formación" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
        <q-space />
        <q-input borderless dense v-model="filterString" placeholder="Buscar...">
          <template v-slot:append>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>
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
import { date } from 'quasar';

export default ({
    data () {
        return {
            moduleName: "SCHPersonas", filterString: ''
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
        let newRows = JSON.parse(JSON.stringify(this.formaciones))
        newRows.find(x=>x.recordID==row.recordID)[colName] = newVal
        this.formaciones = newRows
      },
      addRow(){
        let max_id = 1
        if(this.formaciones.length > 0){
            let temp = this.getMax(this.formaciones, "recordID");
            max_id = parseInt(temp.recordID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.formaciones))
        newRows.push({
          recordID: max_id
          ,formacionID: this.lookup_formaciones[0].value
          ,fechaInicio: ''
          ,comments: ''
        })
        this.formaciones = newRows
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
        formaciones: {
            get () { return this.$store.state[this.moduleName].editData.formaciones },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataFormaciones', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_formaciones: {
            get () { return this.$store.state[this.moduleName].editData.lookup_formaciones },
        },
    }
})
</script>
