<template>
<div class="row ">
  <q-table
        ref="mainTable"
        :data="lines"
        :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
        table-style="min-height: calc(100vh - 225px); max-height: calc(100vh - 225px)"
        row-key="lineID"
        virtual-scroll
        :rows-per-page-options="[0]"
        hide-bottom dense
        selection="multiple" :selected.sync="selected"
        :filter="filterString"
        :columns="[
          //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
          { name: 'invID', required: true, label: 'Item', align: 'left', field: row => row.invID, sortable: true, style: 'min-width: 300px;' },
          { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'max-width: 100px;', headerStyle: 'padding-right: 20px;' },
          { name: 'whID', required: true, label: 'Bodega', align: 'left', field: row => row.whID, sortable: true },
          { name: 'transportTypeID', required: true, label: 'Entrega?', align: 'left', field: row => row.transportTypeID, sortable: true },
          { name: 'prjID', required: true, label: 'Centro de Costo?', align: 'left', field: row => row.prjID, sortable: true },
          { name: 'expectedDate', required: true, label: 'Esperado el', align: 'left', field: row => row.expectedDate, sortable: true, style: 'min-width: 100px;' },
        ]"
    >

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="sm" dense :title="props.row.lineID" />
        </q-td>

        <q-td key="invID" :props="props">{{ props.row.invName }}</q-td>
        <q-td key="quantity" :props="props">{{ props.row.quantity }}</q-td>
        <q-td key="whID" :props="props">{{ props.row.whName }}</q-td>
        <q-td key="transportTypeID" :props="props">{{ props.row.transportTypeName }}</q-td>
        <q-td key="prjID" :props="props">{{ props.row.prjName }}</q-td>
        <q-td key="expectedDate" :props="props" >
          {{showDateName(props.row.expectedDate)}}
          <q-popup-edit :value="props.row.expectedDate" class="no-padding">
            <q-date :value="props.row.expectedDate" @input="(value)=>{updateRow(value,'expectedDate',props.row)}" >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Seleccionar" color="primary" flat />
              </div>
            </q-date>
          </q-popup-edit>
        </q-td>

      </q-tr>
    </template>
    <template v-slot:top >
        <q-btn :label="$q.screen.gt.sm?'Bodega':''" title="Cambiar Bodega a líneas seleccionadas" @click="openSearchWH" icon="fas fa-warehouse" color="primary"  no-caps :disable="selected.length<=0"/>
        <q-btn :label="$q.screen.gt.sm?'Entrega':''" title="Cambiar Tipo de Entrega a líneas seleccionadas" @click="openSearchTransport" icon="fas fa-truck" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0" />
        <q-btn :label="$q.screen.gt.sm?'Centro de Costo':''" title="Cambiar Centro de Costo a a líneas seleccionadas" @click="openSearchPrj" icon="fas fa-folder-open" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0"/>
        <q-space />
    </template>
  </q-table>

  <q-dialog v-model="isWHDialog" @show="whDialogShown">
    <q-card style="min-width: 700px;" > 
      <q-bar class="bg-primary text-white">
        Buscar Bodega
        <q-space />
        <q-input input-class="text-white" borderless dense debounce="300" autofocus v-model="whDialogFilter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon v-if="!whDialogFilter" name="fas fa-search" flat round size="xs" color="white" />
            <q-btn v-if="whDialogFilter" @click="whDialogFilter=''" flat round icon="fas fa-times" size="xs" color="white" />
          </template>
        </q-input>
      </q-bar>
      <q-card-section class="no-padding">
        <q-table
          ref="whSearchTable"
          :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 410px); max-height: calc(100vh - 410px)"
          @keydown.native.keyCodes.115="whDialogSelectAction(whDialogSelected)"
          :data="lookup_wh.filter(x=>x.estado==true)"
          :columns="[
            { name: 'value', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
            { name: 'label', required: true, label: 'Item', align: 'left', field: row => row.label, sortable: true, style: 'min-width: 250px;', },
          ]"
          row-key="value"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="single" :selected.sync="whDialogSelected"
          :filter="whDialogFilter"
          >
        </q-table>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn  flat label="Cancelar (ESC)" no-caps color="primary" @click="isWHDialog=false" ></q-btn>
        <q-btn icon-right="fas fa-check-circle"  label="Seleccionar (F4)" no-caps color="primary" :disable="whDialogSelected.length<=0" @click="whDialogSelectAction(whDialogSelected)" ></q-btn>
      </q-card-actions>
      <q-inner-loading :showing="whDialogTableBusy" style="z-index: 10" >
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isTransportDialog" @show="transportDialogShown">
    <q-card style="min-width: 700px;" > 
      <q-bar class="bg-primary text-white">
        Tipo de Entrega
        <q-space />
        <q-input input-class="text-white" borderless dense debounce="300" autofocus v-model="transportDialogFilter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon v-if="!transportDialogFilter" name="fas fa-search" flat round size="xs" color="white" />
            <q-btn v-if="transportDialogFilter" @click="transportDialogFilter=''" flat round icon="fas fa-times" size="xs" color="white" />
          </template>
        </q-input>
      </q-bar>
      <q-card-section class="no-padding">
        <q-table
          ref="transportSearchTable"
          :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 410px); max-height: calc(100vh - 410px)"
          @keydown.native.keyCodes.115="transportDialogSelectAction(transportDialogSelected)"
          :data="lookup_transports.filter(x=>x.estado==true)"
          :columns="[
            { name: 'value', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
            { name: 'label', required: true, label: 'Item', align: 'left', field: row => row.label, sortable: true, style: 'min-width: 250px;', },
          ]"
          row-key="value"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="single" :selected.sync="transportDialogSelected"
          :filter="transportDialogFilter"
          >
        </q-table>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn  flat label="Cancelar (ESC)" no-caps color="primary" @click="isTransportDialog=false" ></q-btn>
        <q-btn icon-right="fas fa-check-circle"  label="Seleccionar (F4)" no-caps color="primary" :disable="transportDialogSelected.length<=0" @click="transportDialogSelectAction(transportDialogSelected)" ></q-btn>
      </q-card-actions>
      <q-inner-loading :showing="transportDialogTableBusy" style="z-index: 10" >
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isPrjDialog" >
    <q-card style="min-width: 700px;" > 
      <q-bar class="bg-primary text-white">
        Centro de Costo
        <q-space />
        <q-input input-class="text-white" borderless dense debounce="300" autofocus v-model="prjDialogFilter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon v-if="!prjDialogFilter" name="fas fa-search" flat round size="xs" color="white" />
            <q-btn v-if="prjDialogFilter" @click="prjDialogFilter=''" flat round icon="fas fa-times" size="xs" color="white" />
          </template>
        </q-input>
      </q-bar>
      <q-card-section class="no-padding" >
         <q-select
            label="Centro de Costo (*)" placeholder="Seleccione el Centro de Costo que desea utilizar (*)" emit-value map-options filled
            :options="lookup_prj.filter(x=>x.parent==null)" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
            :option-disable="opt => !opt.estado" clearable
            v-model="rootPrjIDSelected"
            ref="rootPrjIDSelected"
            
            >
            <template v-slot:prepend><q-icon name="fas fa-folder-open" /></template>
        </q-select>
        <q-separator />
        <q-table
          ref="transportSearchTable" square
          :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 410px); max-height: calc(100vh - 410px)"
          @keydown.native.keyCodes.115="transportDialogSelectAction(transportDialogSelected)"
          :data="lookup_prj.filter(x=>x.rootID == rootPrjIDSelected)"
          :columns="[
            //{ name: 'prjID', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
            { name: 'code_es', required: true, label: 'Código', align: 'left', field: row => row.code_es, sortable: false, style: 'max-width: 75px;', },
            { name: 'label', required: true, label: 'Descripción', align: 'left', field: row => row.label, sortable: false, style: 'min-width: 250px;', },
            //{ name: 'row_has_children', required: true, label: 'row_has_children', align: 'left', field: row => row.row_has_children, sortable: true },
            //{ name: 'row_level', required: true, label: 'row_level', align: 'left', field: row => row.row_level, sortable: false },
            { name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false },
          ]"
          row-key="value"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="single" :selected.sync="prjDialogSelected"
          :filter="prjDialogFilter"
          >
          <template v-slot:body-cell-label="props">
            <q-td :props="props">
              <div :class="props.row.row_has_children?'text-bold':''">{{ '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(props.row.row_level) + props.value }}</div>
            </q-td>
          </template>
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-checkbox :value="props.value" color="primary" dense size="sm" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn  flat label="Cancelar (ESC)" no-caps color="primary" @click="isPrjDialog=false" ></q-btn>
        <q-btn icon-right="fas fa-check-circle" label="Seleccionar (F4)" no-caps color="primary" :disable="(prjDialogSelected.length<=0||prjDialogSelected[0].row_has_children||prjDialogSelected[0].estado==false)" ></q-btn>
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
          moduleName: "mktPR", filterString: '', selected: []
        ,isWHDialog: false, whDialogFilter: '', whDialogSelected: [], whDialogTableBusy: false
        ,isTransportDialog: false, transportDialogFilter: '', transportDialogSelected: [], transportDialogTableBusy: false
        ,isPrjDialog: false, prjDialogFilter: '', prjDialogSelected: [], prjDialogTableBusy: false, rootPrjIDSelected: null, prjIDSelected: null
        
        //,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: [], itemsBatchDialogRowToUpdate: null, itemsBatchDialogTableBusy: false
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
        try{
          //Actualiza las líneas
          let newRows = JSON.parse(JSON.stringify(this.lines))
          newRows.find(x=>x.lineID==row.lineID)[colName] = newVal;
          let whID = newRows.find(x=>x.lineID==row.lineID).whID
          let whName = whID?this.lookup_wh.find(x => x.value == whID).label:''
          let prjID = newRows.find(x=>x.lineID==row.lineID).prjID
          let prjName = prjID?this.lookup_prj.find(x => x.value == prjID).label:''
          let transportTypeID = newRows.find(x=>x.lineID==row.lineID).transportTypeID
          let transportTypeName = transportTypeID?this.lookup_transports.find(x => x.value == transportTypeID).label:''
          newRows.find(x=>x.lineID==row.lineID).whName = whName
          newRows.find(x=>x.lineID==row.lineID).prjName = prjName
          newRows.find(x=>x.lineID==row.lineID).transportTypeName = transportTypeName
          this.lines = newRows
        }catch(ex){
          console.error(ex)
        }
      },
      openSearchWH(){
        this.isWHDialog = true
      },
      whDialogSelectAction(){
        if(this.whDialogSelected.length>0){
          //Segundo, actualiza la fila por medio del método [updateRow]
          if(this.whDialogSelected[0].estado==true){
            this.selected.forEach(rowToUpdate=>{
                this.updateRow(this.whDialogSelected[0].value, 'whID', rowToUpdate)
            })
            this.isWHDialog = false
          }
        }
      },
      whDialogShown(){
        if(this.whDialogSelected.length>0){
          try{
            this.$refs.whSearchTable.scrollTo(this.lookup_wh.findIndex(x=>x.value == this.whDialogSelected[0].value))
          }catch(ex){}
        }
        
      },
      rowTitleInventory(fila){
        let resultado = 'Seleccionar...'
        let target = null
        if(fila&&fila.invID&&fila.invID>0){
          try{
            target = this.lookup_items.find(x=>x.value == fila.invID)
            resultado = 'Código: ' + target.internal_code + ' || Tipo: ' + target.groupName + ' || Unidad: ' + target.uomName + ' || Marca: ' + target.brandName
          }catch(ex){}
        }
        return resultado
      },
      //
      openSearchTransport(){
        this.isTransportDialog = true
      },
      transportDialogSelectAction(){
        if(this.transportDialogSelected.length>0){
          //Segundo, actualiza la fila por medio del método [updateRow]
          if(this.transportDialogSelected[0].estado==true){
            this.selected.forEach(rowToUpdate=>{
                this.updateRow(this.transportDialogSelected[0].value, 'transportTypeID', rowToUpdate)
            })
            this.isTransportDialog = false
          }
        }
      },
      transportDialogShown(){
        if(this.transportDialogSelected.length>0){
          try{
            this.$refs.transportSearchTable.scrollTo(this.lookup_transports.findIndex(x=>x.value == this.transportDialogSelected[0].value))
          }catch(ex){}
        }
      },
      //
      openSearchPrj(){
        this.isPrjDialog = true
      },
      showDateName(value){
        let resultado = '...'
        try{
          resultado = date.formatDate(value, this.userDateFormat,
            {
              days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
              daysShort: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'],
              months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
              monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            }
          )
        }catch(ex){console.dir(ex)}
        return resultado;
      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        allow_view: { get () { return true }, },
        allow_edit: { get () { return true }, },
        allow_insert: { get () { return true }, },
        allow_report: { get () { return true }, },
        allow_disable: { get () { return true }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        defaultWhID: {
            get () { return this.$store.state[this.moduleName].editData.basic.defaultWhID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'defaultWhID', value: val}) }
        },
        defaultTransportID: {
            get () { return this.$store.state[this.moduleName].editData.basic.defaultTransportID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'defaultTransportID', value: val}) }
        },
        paytermID: {
            get () { return this.$store.state[this.moduleName].editData.basic.paytermID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'paytermID', value: val}) }
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        linesTaxes: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLinesTaxes', val) }
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
        lookup_transports: {
            get () { return this.$store.state[this.moduleName].editData.lookup_transports },
        },
        lookup_payterms: {
            get () { return this.$store.state[this.moduleName].editData.lookup_payterms },
        },
        lookup_paytermsDetails: {
            get () { return this.$store.state[this.moduleName].editData.lookup_paytermsDetails },
        },
        lookup_taxesByGroup: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxesByGroup },
        },
    }
})
</script>
