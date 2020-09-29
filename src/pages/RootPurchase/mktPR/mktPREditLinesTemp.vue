<template>
<q-table
      :data="lines"
      :class="userColor=='blackDark'?'my-sticky-header-usercompany-dark bg-grey-10 ':'my-sticky-header-usercompany'"
      table-style="min-height: 150px; max-height: calc(100vh - 225px)"
      row-key="lineID"
      virtual-scroll
      :rows-per-page-options="[0]"
      hide-bottom dense
      :filter="filterString"
      :columns="[
        { name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
        { name: 'invID', required: true, label: 'Item', align: 'left', field: row => row.invID, sortable: true },
        { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true },
        { name: 'price', required: true, label: 'Precio', align: 'right', field: row => row.price, sortable: true },
        { name: 'lineSubtotal', required: true, label: 'Subtotal', align: 'right', field: row => row.lineSubtotal, sortable: true },
        { name: 'lineDiscntPrcnt', required: true, label: 'Descuento %', align: 'right', field: row => row.lineDiscntPrcnt, sortable: true },
        { name: 'lineUntaxed', required: true, label: 'Total', align: 'right', field: row => row.lineUntaxed, sortable: true },
        { name: 'lineDiscntAmount', required: true, label: 'lineDiscntAmount', align: 'right', field: row => row.lineDiscntAmount, sortable: true },
        { name: 'whID', required: true, label: 'Bodega', align: 'right', field: row => row.whID, sortable: true },
        { name: 'prjID', required: true, label: 'Centro de Costo?', align: 'right', field: row => row.prjID, sortable: true },
        { name: 'transportTypeID', required: true, label: 'Entrega?', align: 'right', field: row => row.transportTypeID, sortable: true },
        //{ name: 'estado', required: true, label: 'Activo?', align: 'left', field: row => row.estado, sortable: true }
      ]"


>
  <template v-slot:body="props">
        <q-tr :props="props" >
          <q-td key="lineID" :props="props">{{ props.row.lineID }}</q-td>
          <!--<q-td key="invID" :props="props">{{ props.row.invName }}</q-td>-->
          <q-td key="invID" :props="props" :tabindex="(props.key*10)+1" >
            {{ props.row.invName }}
            <q-popup-edit :value="props.row.invID" title="Seleccionar Item" auto-save >
              <q-select  autofocus :value="props.row.invID" dense map-options :options="lookup_items" @input="(value)=>{updateRow(value.value,'invID',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="quantity" :props="props" :tabindex="(props.key*10)+2">
            {{ props.row.quantity }}
            <q-popup-edit :value="props.row.quantity" title="Editar Cantidad" auto-save>
              <q-input
                :value="props.row.quantity" type="number" :min="0" autofocus
                :rules="[val => !!val || 'Requerido']"
                @input="(value)=>{updateRow(value,'quantity',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="price" :props="props" :tabindex="(props.key*10)+3">
            <div>{{ props.row.price }}</div> - {{props.row.price && props.row.price.toString().includes('.') }} - {{ props.row.price.toString().substring(props.row.price.toString().indexOf('.')+1,10).length }}
            <q-popup-edit :value="props.row.price" title="Editar Precio" auto-save>
              <q-input
                :value="props.row.price" dense type="number" autofocus
                prefix="$" input-class="text-right"
                :rules="[ val => !!val || '* Requerido' ,
                          val => props.row.price.toString().substring(props.row.price.toString().indexOf('.')+1,10).length <= 6 || 'AQUI' ]"
                @input="(value)=>{updateRow(value,'price',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="lineSubtotal" :props="props">{{ props.row.lineSubtotal.toFixed(userMoneyFormat) }}</q-td>
          <q-td key="lineDiscntPrcnt" :props="props">{{ props.row.lineDiscntPrcnt }}</q-td>
          <q-td key="lineUntaxed" :props="props">{{ props.row.lineUntaxed }}</q-td>
          <q-td key="lineDiscntAmount" :props="props">{{ props.row.lineDiscntAmount }}</q-td>

          <q-td key="whID" :props="props">{{ props.row.whName }}</q-td>
          <q-td key="prjID" :props="props">{{ props.row.prjName }}</q-td>
          <q-td key="transportTypeID" :props="props">{{ props.row.transportTypeName }}</q-td>

        </q-tr>
  </template>
    <template v-slot:top>
        <q-btn label="Agregar" @click="addRow" icon="fas fa-plus" color="primary" no-caps />
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
            moduleName: "mktPR", filterString: ''
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
        console.dir('newVal')
        console.dir(newVal)
        let newRows = JSON.parse(JSON.stringify(this.lines))
        newRows.find(x=>x.lineID==row.lineID)[colName] = newVal;
        let invID = newRows.find(x=>x.lineID==row.lineID).invID
        let invName = this.lookup_items.find(x => x.value == invID).label
        let lineSubtotal = newRows.find(x=>x.lineID==row.lineID).price * newRows.find(x=>x.lineID==row.lineID).quantity;
        let lineDiscntAmount = lineSubtotal * (  (newRows.find(x=>x.lineID==row.lineID).lineDiscntPrcnt) / 100  );
        newRows.find(x=>x.lineID==row.lineID).lineSubtotal = lineSubtotal
        newRows.find(x=>x.lineID==row.lineID).lineDiscntAmount = lineDiscntAmount
        newRows.find(x=>x.lineID==row.lineID).lineUntaxed = lineSubtotal - lineDiscntAmount
        newRows.find(x=>x.lineID==row.lineID).invName = invName

        this.lines = newRows
      },
      addRow(){
        let max_id = 1
        if(this.lines.length > 0){
          let temp = this.getMax(this.lines, "lineID");
          max_id = parseInt(temp.lineID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.lines))
        newRows.push({
           lineID: max_id
          ,invID: 0
          ,quantity: 1
          ,price: 1
          ,lineSubtotal: 1
          ,lineDiscntPrcnt: 0
          ,lineDiscntAmount: 0
          ,lineUntaxed: 1
          ,whID: 0
          ,prjID: 0
          ,transportTypeID: 0
        })
        this.lines = newRows
      },
      getAge(fecha){
        return date.getDateDiff(new Date(), fecha, 'years')
      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return true }, },
        allow_edit: { get () { return true }, },
        allow_insert: { get () { return true }, },
        allow_report: { get () { return true }, },
        allow_disable: { get () { return true }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
        lookup_wh: {
            get () { return this.$store.state[this.moduleName].editData.lookup_wh },
        },
        lookup_prj: {
            get () { return this.$store.state[this.moduleName].editData.lookup_prj },
        },
        lookup_transport: {
            get () { return this.$store.state[this.moduleName].editData.lookup_transport },
        },
    }
})
</script>
