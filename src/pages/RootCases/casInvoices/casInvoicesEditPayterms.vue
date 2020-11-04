<template>
<div>
  <q-table
        :data="payterms"
        :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
        table-style="min-height: 150px; max-height: calc(100vh - 225px)"
        row-key="paytermID"
        virtual-scroll
        :rows-per-page-options="[0]"
        hide-bottom dense
        :columns="[
          //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
          { name: 'paytermID', required: true, label: 'Compromiso', align: 'left', field: row => row.paytermID, sortable: true },
          { name: 'caseID', required: true, label: 'Caso', align: 'left', field: row => row.caseID, sortable: true, style:'min-width: 500px;' },
          { name: 'amount', required: true, label: 'Monto', align: 'right', field: row => row.amount, sortable: true },
          { name: 'delete', required: true, label: '', align: 'center', field: row => row.delete, sortable: true },
        ]"
    >
    <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="paytermID" :props="props">
              {{ props.row.paytermID }}
            </q-td>
            <q-td key="caseID" :props="props">
              {{ props.row.caseName }}
            </q-td>
            <q-td key="amount" :props="props">
              <q-input class="no-padding" style="height: 20px !important;"
                :value="props.row.amount" type="number" :min="0"
                dense item-aligned borderless input-class="text-right"
                :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                debounce="1000" @input="(value)=>{updateRow(value,'amount',props.row)}" />
            </q-td>
            <q-td key="delete" :props="props">
              <q-btn color="red" flat dense size="xs" icon="fas fa-trash-alt" @click="payterms=payterms.filter(x=>!(props.row.paytermID==x.paytermID&&props.row.caseID==x.caseID))" />
            </q-td>
          </q-tr>
    </template>
    <template v-slot:top>
        <q-btn label="Agregar Compromisos" @click="isDialogOpen=true" icon="fas fa-plus" color="primary" no-caps />
        <q-space />
        <!--<q-input borderless dense v-model="filterString" placeholder="Buscar...">
          <template v-slot:append>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>-->
    </template>
  </q-table>

  <q-dialog v-model="isDialogOpen">
    <q-card  style="min-width: 850px;">
      <q-bar class="bg-primary text-white">
          Lista de Compromisos de Pago
          <q-space />
      </q-bar>
      <q-card-section class="no-padding">
        <q-table
          flat dense
          :data="lookup_payterms" 
          selection="multiple"
          :selected.sync="selected"
          row-key="rowID"
          :rows-per-page-options="[0]"
          :columns="[
            //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
            { name: 'caseName', required: true, label: 'Caso', align: 'left', field: row => row.caseName, sortable: true },
            { name: 'Tipo', required: true, label: 'Tipo', align: 'left', field: row => row.Tipo, sortable: true, style:'max-width: 50px;' },
            { name: 'amount', required: true, label: 'Monto', align: 'right', field: row => row.amount, sortable: true , style:'max-width: 50px;' },
            { name: 'amountInvoiced', required: true, label: 'Facturado', align: 'right', field: row => row.amountInvoiced, sortable: true, style:'max-width: 50px;' },
            { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true },
          ]"
          />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn color="primary" label="Agregar" icon="fas fa-plus" :disable="selected.length<=0" @click="addRow" />
      </q-card-actions>
    </q-card>
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

export default ({
    data () {
        return {
            moduleName: "casInvoices", filterString: '', isDialogOpen: false, selected: []
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
        let newRows = JSON.parse(JSON.stringify(this.payterms))
        newRows.find(x=>x.caseID==row.caseID&&x.paytermID==row.paytermID)[colName] = newVal
        this.payterms = newRows
      },
      addRow(){
        if(this.selected.length>0){
          let newRows = JSON.parse(JSON.stringify(this.payterms))
          this.selected.map(row=>{
            //console.dir(row)
            if(!(this.payterms.some(x=>x.caseID==row.caseID&&x.paytermID==row.paytermID))){
              newRows.push({
                caseID: row.caseID
                ,caseName: row.caseName
                ,paytermID: row.paytermID
                ,amount: row.amount
                ,estado: false
              })
            }
          })
          this.payterms = newRows
          this.isDialogOpen = false
        }
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
        payterms: {
            get () { return this.$store.state[this.moduleName].editData.payterms },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPayterms', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_payterms: {
            get () { return this.$store.state[this.moduleName].editData.lookup_payterms },
        },
    }
})
</script>
