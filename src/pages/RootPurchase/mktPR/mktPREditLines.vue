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
        { name: 'whID', required: true, label: 'Bodega', align: 'right', field: row => row.whID, sortable: true },
        { name: 'prjID', required: true, label: 'Centro de Costo?', align: 'right', field: row => row.prjID, sortable: true },
        { name: 'transportTypeID', required: true, label: 'Entrega?', align: 'right', field: row => row.transportTypeID, sortable: true },
        //{ name: 'estado', required: true, label: 'Activo?', align: 'left', field: row => row.estado, sortable: true }
      ]"


>
  <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="lineID" :props="props">{{ props.row.lineID }}</q-td>
          <!--<q-td key="invID" :props="props">
            {{ props.row.invName }}
            <q-popup-edit :value="props.row.invID">
              <q-select :value="props.row.invID" dense map-options :options="lookup_items" @input="(value)=>{updateRow(value.value,'invID',props.row)}" />
            </q-popup-edit>
          </q-td>-->
          <q-td key="invID" :props="props">
            <!--<q-select borderless :value="props.row.invID" dense map-options :options="lookup_items"
              @input="(value)=>{updateRow(value.value,'invID',props.row)}"
              :option-disable="opt => !opt.estado"
              />-->
          </q-td>
          <q-td key="quantity" :props="props">
            <q-input borderless input-class="text-right" :value="props.row.quantity" dense
              @input="(value)=>{updateRow(value,'quantity',props.row)}" type="number" />
          </q-td>
          <q-td key="price" :props="props">
            <q-input borderless input-class="text-right" :value="props.row.price" dense
              @input="(value)=>{updateRow(value,'price',props.row)}" type="number" />
          </q-td>
          <q-td key="lineSubtotal" :props="props">
            <div class="text-right">{{props.row.price * props.row.quantity}}</div>
          </q-td>
          <q-td key="lineDiscntPrcnt" :props="props">
            <q-input borderless input-class="text-right" :value="props.row.lineDiscntPrcnt" dense
              @input="(value)=>{updateRow(value,'lineDiscntPrcnt',props.row)}" type="number" :min="0" />
          </q-td>
          <q-td key="lineUntaxed" :props="props">
            <div class="text-right">{{ /*Subtotal:*/(props.row.price * props.row.quantity) * /*Descuento:*/(1- (props.row.lineDiscntPrcnt / 100) ) }}</div>
          </q-td>
          <q-td key="whID" :props="props">
            <!--<q-select borderless :value="props.row.whID" dense map-options :options="lookup_wh"
              @input="(value)=>{updateRow(value.value,'whID',props.row)}"
              :option-disable="opt => !opt.estado"
              />-->
          </q-td>
          <q-td key="prjID" :props="props">
            <!--<q-select borderless :value="props.row.prjID" dense map-options :options="lookup_prj"
              @input="(value)=>{updateRow(value.value,'prjID',props.row)}"
              :option-disable="opt => !opt.estado"
              />-->
          </q-td>
          <q-td key="transportTypeID" :props="props">
            <!--<q-select borderless :value="props.row.transportTypeID" dense map-options :options="lookup_transport"
              @input="(value)=>{updateRow(value.value,'transportTypeID',props.row)}"
              :option-disable="opt => !opt.estado"
              />-->
          </q-td>


          <!--<q-td key="linesName" :props="props">
            {{ props.row.linesName }}
            <q-popup-edit :value="props.row.linesName" >
              <q-input :value="props.row.linesName" dense autofocus counter @input="(value)=>{updateRow(value,'linesName',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="sexo" :props="props">
            {{ lookup_sexo.find(x=>x.value==props.row.sexo).label }}
            <q-popup-edit :value="props.row.sexo">
              <q-select :value="props.row.sexo" dense map-options :options="lookup_sexo" @input="(value)=>{updateRow(value.value,'sexo',props.row)}" />
            </q-popup-edit>
          </q-td>
          <q-td key="birthday" :props="props">
            {{ props.row.birthday }}
            <q-popup-edit :value="props.row.birthday" class="no-padding">
              <q-date :value="props.row.birthday" @input="(value)=>{updateRow(value,'birthday',props.row)}" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-edit>
          </q-td>
          <q-td key="computedAge" :props="props">
            {{ getAge(props.row.birthday) }}
          </q-td>
          <q-td key="estado" :props="props">
            <q-toggle :value="props.row.estado" dense @input="updateRow(!props.row.estado,'estado',props.row)" />
          </q-td>-->
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
        let newRows = JSON.parse(JSON.stringify(this.lines))
        newRows.find(x=>x.lineID==row.lineID)[colName] = newVal
        this.lines = newRows
      },
      addRow(){
        console.dir('addRow')
        let max_id = 1
        console.dir('addRow 1')
        if(this.lines.length > 0){
            let temp = this.getMax(this.lines, "linesID");
            max_id = parseInt(temp.lineID) + parseInt(1);
        }
        console.dir('addRow 2')
        let newRows = JSON.parse(JSON.stringify(this.lines))
        newRows.push({
           lineID: max_id
          ,invID: 0
          ,invName: ''
          ,invCode: ''
          //,sexo: this.lookup_sexo[0].value
          //,birthday: ''
          //,estado: true
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
