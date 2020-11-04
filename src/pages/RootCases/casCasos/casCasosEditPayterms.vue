<template>
<div>
  <q-table
        :data="payterms"
        :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
        table-style="min-height: 150px; max-height: calc(100vh - 225px)"
        row-key="contactID"
        virtual-scroll
        :rows-per-page-options="[0]"
        hide-bottom dense
        :filter="filterString"
        :columns="[
          { name: 'typeID', required: true, label: 'Tipo', align: 'left', field: row => row.typeID, sortable: true },
          { name: 'contractID', required: true, label: 'Contrato', align: 'left', field: row => row.contractID, sortable: true },
          { name: 'docDate', required: true, label: 'Fecha', align: 'left', field: row => row.docDate, sortable: true },
          { name: 'amount', required: true, label: 'Monto', align: 'right', field: row => row.amount, sortable: true },
          { name: 'comments', required: true, label: 'Obsveraciones', align: 'center', field: row => row.comments, sortable: true },
          { name: 'voided', required: true, label: 'Anular?', align: 'center', field: row => row.voided, sortable: true },
          { name: 'estado', required: true, label: '', align: 'center', field: row => row.estado, sortable: true },
        ]"
    >
    <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="typeID" :props="props">
              {{ props.row.typeID==1?'Contrato':'Factura' }}
            </q-td>
            <q-td key="contractID" :props="props">
              {{ props.row.contractID>0?lookup_contracts.find(x=>x.value==props.row.contractID).label:'' }}
            </q-td>
            <q-td key="docDate" :props="props">
              {{ props.row.docDate }}
            </q-td>
            <q-td key="amount" :props="props">
              {{ props.row.amount }}
            </q-td>
            <q-td key="comments" :props="props">
              {{ props.row.comments }}
            </q-td>
            <q-td key="voided" :props="props">
              <q-checkbox :value="props.row.voided" color="red" dense @input="updateRow(!props.row.voided,'voided',props.row)" />
            </q-td>
            <q-td key="estado" :props="props">
              <q-btn color="red" icon="fas fa-trash-alt" dense flat 
                v-if="!(props.row.estado)" 
                @click="payterms=payterms.filter(x=>x.paytermID!=props.row.paytermID)" />
              <!--<q-checkbox :value="props.row.estado" dense @input="!props.row.estado updateRow(!props.row.estado,'estado',props.row)" />-->
            </q-td>
          </q-tr>
    </template>
    <template v-slot:top>
        <q-btn label="Agregar Compromiso" @click="dialogOpen=true" icon="fas fa-plus" color="primary" no-caps />
        <q-space />
        <q-input borderless dense v-model="filterString" placeholder="Buscar...">
          <template v-slot:append>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>
    </template>
  </q-table>

  <q-dialog v-model="dialogOpen">
    <q-card class="q-pa-md">
      <q-form >
        <div class="row">
          <q-toggle v-model="newRecord.voided" color="red" label="Anulado?" left-label icon="fas fa-disable" class="col-md-4 offset-md-8" />
        </div>
        

        <q-select class="q-pb-md"
          placeholder="Seleccione el Tipo de Compromiso (*)" label="Forma de Pago (*)" filled
          filled v-model="newRecord.typeID" map-options emit-value 
          :options="[{value: 1, label: 'Contrato'},{value: 2, label: 'Factura'}]"  />
        
        <q-select class="q-pb-md" v-if="newRecord.typeID==1"
          placeholder="Seleccione el Contrato que cubre este caso (*)" label="Contrato (*)" filled
          filled v-model="newRecord.contractID" map-options emit-value 
          :options="lookup_contracts.filter(x=>x.customerID==customerID)"  />

        <q-input v-if="newRecord.typeID==2"
          ref="docDate" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
          mask="date" :rules="['date']"
          placeholder="Ingrese la Fecha de Factura" label="Fecha de Factura" filled
          v-model="newRecord.docDate"
          >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="qDateProxy_docDate" transition-show="scale" transition-hide="scale">
                <q-date v-model="newRecord.docDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
        </q-input>
        
        <q-input class="q-pb-md" v-if="newRecord.typeID==2"
          placeholder="Escriba el Monto de esta Factura" label="Monto de Factura" filled
          v-model="newRecord.amount" type="number" :min="0"
          >
          <template v-slot:prepend><q-icon name="fas fa-dollar-sign" /></template>
        </q-input>
        
        <q-input class="q-pb-md"
          placeholder="Observaciones" label="Observaciones" filled
          v-model="newRecord.comments" type="textarea"
          >
          <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
        </q-input>

        <q-btn color="positive" label="Agregar" icon="fas fa-plus" class="full-width" @click="addRow" />
        
      </q-form>
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
            moduleName: "casCasos", filterString: ''
            ,dialogOpen: false
            ,newRecord: {
               typeID: 1
              ,contractID: null
              ,docDate: ''
              ,amount: 0
              ,comments: ''
              ,voided: false
              ,estado: false
            }
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
        newRows.find(x=>x.paytermID==row.paytermID)[colName] = newVal
        this.payterms = newRows
      },
      addRow(){
        //Validaciones
        if(this.newRecord.typeID==1){//if contract, check if value if contract exists
          if(!(this.newRecord.contractID>0)){
            this.$q.notify({message: 'No ha seleccionado un contrato',color: 'red', timeout: 1000})
            return
          }
          if(!(this.newRecord.contractID>0&&this.lookup_contracts.some(x=>x.value==this.newRecord.contractID&&x.customerID==this.customerID))){
            this.$q.notify({message: 'No ha seleccionado un contrato correspondiente al cliente',color: 'red', timeout: 1000})
            return
          }
        }
        if(this.newRecord.typeID==2){//if invoice
          if(!(this.newRecord.docDate)){
            this.$q.notify({message: 'No ha seleccionado una fecha',color: 'red', timeout: 1000})
            return
          }
          if(!(this.newRecord.amount>0)){
            this.$q.notify({message: 'No ha registrado el monto',color: 'red', timeout: 1000})
            return
          }
        }
        
        let max_id = 1
        if(this.payterms.length > 0){
          let temp = this.getMax(this.payterms, "paytermID");
          max_id = parseInt(temp.paytermID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.payterms))
        newRows.push({
           paytermID: max_id
          ,typeID: this.newRecord.typeID
          ,contractID: this.newRecord.typeID=1?this.newRecord.contractID:null
          ,docDate: this.newRecord.typeID=2?this.newRecord.docDate:null
          ,amount: this.newRecord.typeID=2?this.newRecord.amount:null
          ,comments: this.newRecord.comments
          ,voided: this.newRecord.voided
          ,estado: this.newRecord.estado
        })
        this.payterms = newRows
        this.dialogOpen = false
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
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_contracts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_contracts },
        },
        customerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.customerID },
        },
    }
})
</script>
