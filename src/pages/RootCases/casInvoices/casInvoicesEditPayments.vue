<template>
<q-table
      :data="payments"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="contactID"
      :separator="userTableLines"
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        //{ name: 'phoneID', required: true, label: 'ID', align: 'left', field: row => row.phoneID, sortable: true },
        { name: 'paymentDate', required: true, label: 'Fecha Pago', align: 'left', field: row => row.paymentDate, sortable: true },
        { name: 'amount', required: true, label: 'Monto', align: 'left', field: row => row.amount, sortable: true },
        { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true },
        { name: 'voided', required: true, label: 'Anulado?', align: 'left', field: row => row.voided, sortable: true },
        { name: 'estado', required: true, label: 'Eliminar', align: 'center', field: row => row.estado, sortable: true },
      ]"
  >
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="paymentDate" :props="props">
            {{ props.row.paymentDate }}
            <q-popup-edit :value="props.row.paymentDate" content-class="no-padding">
              <q-date minimal emit-immediately :value="props.row.paymentDate" @input="(value)=>{updateRow(value,'paymentDate',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="amount" :props="props">
            <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.amount" type="number" :min="0"
              dense item-aligned borderless input-class="text-left"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'amount',props.row)}" />
          </q-td>
          <q-td key="comments" :props="props">
            <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.comments"
              dense item-aligned borderless input-class="text-left"
              debounce="1000" @input="(value)=>{updateRow(value,'comments',props.row)}" />
          </q-td>
          <q-td key="voided" :props="props">
            <q-checkbox :value="props.row.voided" color="red" dense @input="updateRow(!props.row.voided,'voided',props.row)" />
          </q-td>

          <q-td key="estado" :props="props">
            <q-btn v-if="props.row.estado==false" color="red" flat dense size="xs" icon="fas fa-trash-alt" 
              @click="payments=payments.filter(x=>!(props.row.paymentID==x.paymentID))" />
          </q-td>
        </q-tr>
  </template>
  <template v-slot:top>
      <q-btn label="Agregar Pago" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
      <q-space />
      <q-input borderless dense v-model="filterString" placeholder="Buscar...">
        <template v-slot:append>
          <q-icon name="fas fa-search" />
        </template>
      </q-input>
  </template>
  <template v-slot:bottom-row >
    <q-tr></q-tr>
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
            moduleName: "casInvoices", filterString: ''
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
        let newRows = JSON.parse(JSON.stringify(this.payments))
        newRows.find(x=>x.paymentID==row.paymentID)[colName] = newVal
        this.payments = newRows
      },
      addRow(){
        let max_id = 1
        if(this.payments.length > 0){
            let temp = this.getMax(this.payments, "paymentID");
            max_id = parseInt(temp.paymentID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.payments))
        newRows.push({
           paymentID: max_id
          ,paymentDate: ''
          ,amount: 0
          ,estado: false
          ,voided: false
          ,comments: ''
        })
        this.payments = newRows
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
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        payments: {
            get () { return this.$store.state[this.moduleName].editData.payments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataPayments', val) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
    }
})
</script>
