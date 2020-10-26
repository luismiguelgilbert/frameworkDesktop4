<template>
<div class="row ">
  <q-table
        ref="mainTable"
        :data="accMoveGrouped?linesGrouped:lines"
        :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
        table-style="min-height: calc(100vh - 230px); max-height: calc(100vh - 230px)"
        row-key="lineID"
        :rows-per-page-options="[0]"
        hide-bottom dense
        selection="multiple" :selected.sync="selected"
        :filter="filterString"
        :columns="[
          //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
          { name: 'account_id', required: true, label: 'Cuenta', align: 'left', field: row => row.account_id, sortable: true, style: 'min-width: 300px;' },
          { name: 'debit', required: true, label: 'DEBE', align: 'right', field: row => row.debit, sortable: true, style: 'max-width: 100px;', headerStyle: 'padding-right: 20px;' },
          { name: 'credit', required: true, label: 'HABER', align: 'right', field: row => row.credit, sortable: true , style: 'max-width: 100px;' , headerStyle: 'padding-right: 20px;' },
          { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true, headerStyle: 'padding-right: 20px;' },
          //{ name: 'lineSubtotal', required: true, label: 'Suman', align: 'right', field: row => row.lineSubtotal, sortable: true , style: 'max-width: 100px;' },
          //{ name: 'whID', required: true, label: 'Bodega', align: 'right', field: row => row.whID, sortable: true },
          //{ name: 'prjID', required: true, label: 'Centro de Costo?', align: 'right', field: row => row.prjID, sortable: true },
          //{ name: 'transportTypeID', required: true, label: 'Entrega?', align: 'right', field: row => row.transportTypeID, sortable: true },
        ]"
    >

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="sm" dense :title="props.row.lineID" />
        </q-td>
        <q-td key="account_id" :props="props" class="no-padding" :tabindex="(props.key*10)+1" >
          <q-input class="no-padding" style="height: 20px !important;" :ref="'lineItem'+(props.key*10)+1"
              :value="props.row.account_name" dense item-aligned borderless
              :rules="[val => !!val || 'Requerido']"
              @input="(value)=>{updateRow(value,'account_name',props.row)}"
              @keyup.keyCodes.113="openSearchItems(props.row)"
              >
              <template v-slot:prepend><q-btn icon="fas fa-search" title="Buscar (F2)" size="xs" round color="primary" flat @click="openSearchItems(props.row)" /></template>
          </q-input>
        </q-td>
        <q-td key="debit" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.debit" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @input="(value)=>{updateRow(value,'debit',props.row)}" />
        </q-td>
        <q-td key="credit" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.credit" type="number" :min="0"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @input="(value)=>{updateRow(value,'credit',props.row)}" />
        </q-td>
        <q-td key="comments" :props="props">{{ props.row.comments }}</q-td>
        <!--pendiente-->
        <q-td key="partnerID" :props="props">{{ props.row.partnerName }}</q-td>
        <q-td key="invID" :props="props">{{ props.row.invName }}</q-td>
        <q-td key="prjID" :props="props">{{ props.row.prjName }}</q-td>
        <q-td key="stockID" :props="props">{{ props.row.stockID }}</q-td>
      </q-tr>
    </template>
    <template v-slot:top >
        <q-btn v-if="!(allow_edit==false || allow_insert==false || journalID!=1)" :label="$q.screen.gt.sm?'Agregar':''" title="Agregar línea" @click="addRow" icon="fas fa-plus" color="primary"  no-caps />
        <!--<q-btn v-if="!(allow_edit==false || allow_insert==false || journalID!=1)" :label="$q.screen.gt.sm?'Buscar':''" title="Agregar Varios Ítems" @click="addBatch" icon="fas fa-search-plus" color="primary" no-caps  class="q-ml-sm"/>-->
        <q-btn v-if="!(allow_edit==false || allow_insert==false || journalID!=1)" :disable="selected.length<=0" :label="$q.screen.gt.sm?'Quitar':''" title="Eliminar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" no-caps  class="q-ml-sm"  />
        <q-space />
        <q-toggle v-model="accMoveGrouped" class="text-right" color="primary" label="Agrupado por Cuenta?" />
    </template>

    <template v-slot:bottom-row>
        <q-tr>
          <q-td class="text-right text-subtitle2 text-primary" >

          </q-td>
          <q-td class="text-right text-subtitle2 text-primary" >
            Suma: <!--{{lines.reduce((total,item)=>{return total + item.debit}, 0) - lines.reduce((total,item)=>{return total + item.credit}, 0) }}-->
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            {{lines.reduce((total,item)=>{return total + item.debit}, 0).toFixed(userMoneyFormat)}}
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            {{lines.reduce((total,item)=>{return total + item.credit}, 0).toFixed(userMoneyFormat)}}
          </q-td>
          
        </q-tr>
    </template>
  </q-table>

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
          moduleName: "AccMoves", filterString: '', selected: []
        ,isItemsDialog: false, itemsDialogFilter: '', itemsDialogSelected: [], itemsDialogRowToUpdate: null, itemsDialogTableBusy: false
        ,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: [], itemsBatchDialogRowToUpdate: null, itemsBatchDialogTableBusy: false
        ,accMoveGrouped: true
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
          if(colName=="debit"||colName=="credit"){
            newRows.find(x=>x.lineID==row.lineID)[colName] = parseFloat(newVal);
          }else{
            newRows.find(x=>x.lineID==row.lineID)[colName] = newVal
          }
          
          /*let invID = newRows.find(x=>x.lineID==row.lineID).invID
          let invName = invID?this.lookup_items.find(x => x.value == invID).label:''
          let lineSubtotal = newRows.find(x=>x.lineID==row.lineID).price * newRows.find(x=>x.lineID==row.lineID).quantity;
          let lineDiscntAmount = lineSubtotal * (  (newRows.find(x=>x.lineID==row.lineID).lineDiscntPrcnt) / 100  );
          let lineUntaxed = lineSubtotal - lineDiscntAmount
          newRows.find(x=>x.lineID==row.lineID).lineSubtotal = lineSubtotal
          newRows.find(x=>x.lineID==row.lineID).lineDiscntAmount = lineDiscntAmount
          newRows.find(x=>x.lineID==row.lineID).lineUntaxed = lineUntaxed
          newRows.find(x=>x.lineID==row.lineID).invName = invName*/
          this.lines = newRows

        }catch(ex){
          console.error(ex)
        }
      },
      addRow(){
        //Get Next LineID
        let max_id = 1
        if(this.lines.length > 0){
          let temp = this.getMax(this.lines, "lineID");
          max_id = parseInt(temp.lineID) + parseInt(1);
        }
        
        //Add Line
        let newRows = JSON.parse(JSON.stringify(this.lines))
        let nuevaFila = {
           lineID: max_id
          ,account_id: 0
          ,account_name: ''
          ,partnerID: 0
          ,partner_name: ''
          ,invID: 0
          ,invName: ''
          ,prjID: 0
          ,prjName: ''
          ,stockID: 0
          ,debit: parseFloat(0)
          ,credit: parseFloat(0)
          ,no_deducible: false
          ,comments: ''
        }
        newRows.push(nuevaFila)
        this.lines = newRows
        this.openSearchItems(nuevaFila)//autoOpen Items Search
      },
      removeRows(){
        if(this.selected.length > 0){
          this.$q.dialog({ 
            title: 'Confirmación'
            ,message: 'Desea quitar las líneas seleccionadas?'
            ,ok: { icon: 'fas fa-trash-alt', label: 'Eliminar', noCaps: true }
            ,cancel: { label: 'Cancelar', noCaps: true, flat: true }
          }
          ).onOk(() => {
            //Líneas
            let newRows = JSON.parse(JSON.stringify(this.lines))
            this.selected.map(row=>{
              newRows = newRows.filter(x=>x.lineID!=row.lineID);
            })
            this.lines = newRows

            this.selected = []//limpia selección para evitar problema de referencia a filas que no existan
          })
        }
      },
      getAge(fecha){
        return date.getDateDiff(new Date(), fecha, 'years')
      },
      openSearchItems(currentRow){
        this.itemsDialogRowToUpdate = currentRow
        this.isItemsDialog = true
        if(currentRow&&currentRow.invID&&currentRow.invID>0){
          this.itemsDialogTableBusy = true
          try{
            this.itemsDialogSelected = []
            //this.itemsDialogSelected.push(this.lookup_items.find(x => x.value == currentRow.invID))
            this.itemsDialogTableBusy = false
          }catch(ex){
            this.itemsDialogTableBusy = false
          }
        }
        
      },
      itemsDialogSelectAction(){
        if(this.itemsDialogSelected.length>0){
          //Primero agrega los impuestos correspondientes al Item con su código de línea
          let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))
          newRowsTaxes = newRowsTaxes.filter(x=>x.lineID!=this.itemsDialogRowToUpdate.lineID)//remuevo los impuestos de la línea xq voy a agregarlos nuevamente
          this.lookup_items_taxes.filter(x=>x.invID==this.itemsDialogSelected[0].value).forEach(impuesto=>{
              newRowsTaxes.push({
                 lineID: this.itemsDialogRowToUpdate.lineID
                ,taxID: impuesto.taxID
                ,taxName: impuesto.shortLabel
                ,taxAmount: 0
                ,isPercent: impuesto.isPercent
                ,factor: impuesto.factor
                ,factor_base: impuesto.factor_base
              })
            })
          this.linesTaxes = newRowsTaxes

          //Segundo, actualiza la fila por medio del método [updateRow] , el cual también actualiza las líneas del impuesto
          if(this.itemsDialogSelected[0].estado==true){
            this.updateRow(this.itemsDialogSelected[0].value, 'invID', this.itemsDialogRowToUpdate)
            this.isItemsDialog = false
          }
        }
      },
      itemsDialogShown(){
        if(this.itemsDialogSelected.length>0){
          try{
            this.$refs.itemsSearchTable.scrollTo(this.lookup_items.findIndex(x=>x.value == this.itemsDialogSelected[0].value))
          }catch(ex){}
        }
        
      },
      addBatch(){
        this.isItemsBatchDialog = true
      },
      itemsBatchDialogSelectAction(){
        let max_id = 1
        let temp = null
        if(this.lines.length > 0){
          temp = this.getMax(this.lines, "lineID");
          max_id = parseInt(temp.lineID) + parseInt(1);
        }
        let newRows = JSON.parse(JSON.stringify(this.lines))            //Líneas
        let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))  //Impuestos
        if(this.itemsBatchDialogSelected.length>0){
          this.itemsBatchDialogSelected.filter(x=>x.estado).map(row => {
            max_id = parseInt(max_id) + parseInt(1);
            //líneas
            newRows.push({
               lineID: max_id
              ,invID: row.value
              ,invName: row.label
              ,quantity: 1
              ,price: 1
              ,lineSubtotal: 1
              ,lineDiscntPrcnt: 0
              ,lineDiscntAmount: 0
              ,lineUntaxed: 1
              ,whID: this.defaultWhID
              ,whName: this.lookup_wh.find(x => x.value == this.defaultWhID).label
              ,prjID: 0
              ,prjName: ''
              ,transportTypeID: this.defaultTransportID
              ,transportTypeName: this.lookup_transports.find(x => x.value == this.defaultTransportID).label
            })

          })
          this.lines = newRows
          this.isItemsBatchDialog = false
        }
      },
      
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
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
        linesGrouped:{
            get () { 
              let resultado = [];
              this.lines.map(x=>{
                if(resultado.some(y=>y.account_id==x.account_id)){
                  resultado.find(y=>y.account_id==x.account_id).debit += x.debit
                  resultado.find(y=>y.account_id==x.account_id).credit += x.credit
                }else{
                  resultado.push({
                     account_id: x.account_id
                    ,account_name: x.account_name
                    ,debit: x.debit
                    ,credit: x.credit 
                  })
                }
              })
              return resultado;
            }
        },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        lookup_prj: {
            get () { return this.$store.state[this.moduleName].editData.lookup_prj },
        },
        journalID:  {
            get () { return this.$store.state[this.moduleName].editData.basic.journalID },
        },
        /*lookup_taxesByGroup: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxesByGroup },
        },*/
    }
})
</script>
