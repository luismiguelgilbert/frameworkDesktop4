<template>
<div class="row ">
  <q-table
        ref="mainTable"
        :data="lines"
        :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
        table-style="min-height: calc(100vh - 255px); max-height: calc(100vh - 255px)"
        row-key="lineID"
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        dense
        selection="multiple" :selected.sync="selected"
        :columns="[
           //{ name: 'tipoComprobanteName', required: true, label: 'Documento', align: 'left', field: row => row.tipoComprobanteName, sortable: true, style: 'min-width: 50px;' },
           { name: 'accAPnumeroDoc', label: '# Documento', align: 'left', field: row => row.accAPnumeroDoc, sortable: true, style: 'min-width: 100px;' },
          ,{ name: 'sustentoName', label: 'Sustento', align: 'left', field: row => row.sustentoName, sortable: true, style: 'min-width: 100px;' },
          ,{ name: 'lineSubtotal', label: 'Subtotal', align: 'right', field: row => row.lineSubtotal, sortable: true , style: 'max-width: 100px;' },
          //,{ name: 'accAP_account_id', required: true, label: 'accAP_account_id', align: 'right', field: row => row.accAP_account_id, sortable: true , style: 'max-width: 100px;' },
          //,{ name: 'tax_account_id', required: true, label: 'tax_account_id', align: 'right', field: row => row.tax_account_id, sortable: true , style: 'max-width: 100px;' },
          ,{ name: 'taxID', label: 'Retención', align: 'left', field: row => row.taxID, sortable: true },
          ,{ name: 'baseImponible', label: 'Base Imponible', align: 'right', field: row => row.baseImponible, sortable: true , style: 'max-width: 100px;' },
          ,{ name: 'valorRetenido', label: 'Valor Retenido', align: 'right', field: row => row.valorRetenido, sortable: true , style: 'max-width: 100px;' },
        ]"
    >

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="md" dense :title="props.row.lineID" />
        </q-td>
        <!--<q-td key="tipoComprobanteName" :props="props">
          {{ props.row.tipoComprobanteName }}
        </q-td>-->
        <q-td key="accAPnumeroDoc" :props="props">
          {{ props.row.accAPnumeroDoc }}
        </q-td>
        <q-td key="sustentoName" :props="props">
          {{ props.row.sustentoName }}
        </q-td>
        <q-td key="lineSubtotal" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.lineSubtotal" type="number" :min="0" :readonly="(editMode==false)"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'lineSubtotal',props.row)}" />
        </q-td>
        <q-td key="taxID" :props="props" :tabindex="(props.key*10)+3">
          {{props.row.taxID}}
        </q-td>
        <q-td key="baseImponible" :props="props" :tabindex="(props.key*10)+4">
          <!--{{ props.row.baseImponible }}-->
          {{ props.row.baseImponible.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="valorRetenido" :props="props" :tabindex="(props.key*10)+5">
          <!--{{ props.row.valorRetenido }}-->
          {{ props.row.valorRetenido.toFixed(userMoneyFormat) }}
        </q-td>
        <!--{{ props.row.tipoComprobanteName.toFixed(userMoneyFormat) }}-->

        
        

        

      </q-tr>
    </template>
    
    <template v-slot:top >
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Agregar':''" title="Agregar Facturas" @click="()=>{itemsDialogSelected=[];isDialogOpen=true}" icon="fas fa-shopping-cart" color="primary"  no-caps />
        <!--<q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Buscar':''" title="Agregar Varios Servicios" @click="addBatch" icon="fas fa-search-plus" color="primary" no-caps  class="q-ml-sm"/>-->
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Quitar':''" title="Eliminar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0" />
        <q-space />
        <q-btn v-if="editMode==true" :label="$q.screen.gt.lg?'Descuento':''" size="sm" title="Aplicar un mismo sustento a filas seleccionadas" @click="batchUpdateDiscount" icon="fas fa-percent" color="primary" flat no-caps   :disable="selected.length<=0" />
    </template>

    <template v-slot:bottom-row >
      <q-tr></q-tr>
    </template>

    <template v-slot:bottom>
        <q-space />
        <q-item clickable dense class="full-width">
          <q-item-section >
            <q-item-label class="text-subtitle2 text-primary"><b>TOTAL:</b></q-item-label>
          </q-item-section>
          <q-item-section side class="text-subtitle2 text-primary q-mr-md">
            {{
              (lines.reduce(function(sum, d) { return sum + d.valorRetenido; }, 0)).toFixed(userMoneyFormat)
            }}
          </q-item-section>
        </q-item>
    </template>
  </q-table>

  <q-dialog v-model="isDialogOpen" >
    <q-card style="min-width: 950px;">
      <q-bar class="bg-primary text-white">
        Facturas del Proveedor
        <q-space />
        <q-input input-class="text-white" borderless dense debounce="300" v-model="requisicionesFilterString" placeholder="Buscar">
          <template v-slot:append>
            <q-icon v-if="!requisicionesFilterString" name="fas fa-search" flat round size="xs" color="white" />
            <q-btn v-if="requisicionesFilterString" @click="requisicionesFilterString=''" flat round icon="fas fa-times" size="xs" color="white" />
          </template>
        </q-input>
      </q-bar>
      <q-card-section class="no-padding">
        <q-table
          :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
          :data="lookup_invoices"
          :columns="[
            //{ name: 'headerID', required: true, label: 'ID', align: 'left', field: row => row.headerID, sortable: true, style: 'max-width: 50px;', },
            { name: 'tipoComprobanteName', required: true, label: 'Documento', align: 'left', field: row => row.tipoComprobanteName, sortable: true, style: 'min-width: 100px;', },
            { name: 'numeroDoc', required: true, label: '# Documento', align: 'left', field: row => row.numeroDoc, sortable: true, style: 'min-width: 150px;', },
            { name: 'headerDate', required: true, label: 'Fecha', align: 'left', field: row => row.headerDate, sortable: true, style: 'min-width: 50px;'},
            { name: 'sustentoName', required: true, label: 'Sustento Tributario', align: 'left', field: row => row.sustentoName, sortable: true, style: 'min-width: 50px;'},
            //{ name: 'amountTotal', required: true, label: 'TOTAL', align: 'right', field: row => row.amountTotal.toFixed(userMoneyFormat), sortable: true, style: 'min-width: 50px;', },
            //{ name: 'amountUnpaid', required: true, label: 'Pendiente', align: 'right', field: row => row.amountUnpaid.toFixed(userMoneyFormat), sortable: true, style: 'min-width: 50px;', },
            { name: 'subtotalBySustento', required: true, label: 'Subtotal del Sustento', align: 'right', field: row => row.subtotalBySustento.toFixed(userMoneyFormat), sortable: true, style: 'min-width: 50px;', },
          ]"
          row-key="ux_id"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="multiple" :selected.sync="itemsDialogSelected"
          :filter="requisicionesFilterString"
          />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar (F4)" no-caps color="primary" 
        :disable="itemsDialogSelected.length<=0" @click="addRows(itemsDialogSelected)" ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog >

  <q-dialog v-model="isSustentoDialogOpen">
    <q-card style="min-width: 950px;">
      <q-bar class="bg-primary text-white">
        Seleccione el Sustento a aplicar en las líneas seleccionadas
      </q-bar>
      <q-card-section class="no-padding">
        <selectSearchable 
          prependIcon="fas fa-percent"
          labelText="Retención" labelSearchText="Buscar Retención"
          :optionsList="this.lookup_taxes"
          rowValueField="taxID" optionsListLabel="short_name_es" optionsListCaption="name_es" optionDisableField="estado"
          :isRequired="true"
          :isDisable="false"
          :tableSearchColumns="[
                   { name: 'name_es', label: 'Retención', field: 'name_es', align: 'left'}
                  ,{ name: 'label', label: 'País', field: 'label', align: 'left'}
              ]"
              @onItemSelected="(row)=>{
                if(row){
                  this.selected.forEach(line => this.updateRow(row.taxID, 'taxID', line) );
                }
                this.isSustentoDialogOpen = false
              }"
          />
      </q-card-section>
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
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    components: {
        selectSearchable: selectSearchable
    },
    data () {
      return {
          moduleName: "accRet", filterString: '', selected: []
        ,isDialogOpen: false
        ,isUpdateItemDialog: false
        ,isItemsDialog: false, itemsDialogFilter: '', itemsDialogSelected: [], itemsDialogRowToUpdate: null, itemsDialogTableBusy: false
        ,isSustentoDialogOpen: false
        ,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: [], itemsBatchDialogRowToUpdate: null, itemsBatchDialogTableBusy: false
        ,isRequisicionDialog: false, requisicionesDialogSelected: [], requisicionesFilterString: '', isRequisicionDialogLoading: false
        ,isStatsDialog: false
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
      addRows(rows){
        try{
          this.$q.loading.show()
          //#region NextIDs
          let newLineID = 0
          if(this.lines.length > 0){
            let temp = this.getMax(this.lines, "lineID");
            newLineID = parseInt(temp.lineID);
          }
          //#endregion NextIDs

          //#region BackupData
          let newRows = JSON.parse(JSON.stringify(this.lines))
          //#endregion BackupData
          
          //#region Row
          rows.map(row=>{
            //addLine
            newLineID++;
            let nuevaFila = {
               lineID: newLineID
              ,tipoComprobanteName: row.tipoComprobanteName
              ,accAPheaderID: row.headerID
              ,accAPheaderDate: row.headerDate
              ,accAPnumeroDoc: row.numeroDoc
              ,sustentoID: row.sustentoID
              ,sustentoName: row.sustentoName
              ,taxID: 0
              ,accAP_account_id: row.partner_account_id
              ,tax_account_id: 0
              ,lineSubtotal: row.subtotalBySustento
              ,baseImponible: 0
              ,valorRetenido: 0
            }
            newRows.push(nuevaFila)
          })
          //#endregion Row
          
          //#region Finalize
          this.lines = newRows
          this.isDialogOpen=false;
          this.$q.loading.hide()
          this.$emit('onAccMoveCompute')
          //#endregion Finalize
        }catch(ex){
          console.dir(ex)
          this.$q.loading.hide()  
        }
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
            this.$emit('onAccMoveCompute')
          })
        }
      },
      updateRow(newVal, colName, row){
        try{
          this.$q.loading.show()
          //Actualiza las líneas
          let newRows = JSON.parse(JSON.stringify(this.lines))
          newRows.filter(x=>x.lineID==row.lineID).map(result=>{
            if(colName=="taxID" || colName=="lineSubtotal"){
              result[colName] = parseFloat(newVal)
            }else{
              result[colName] = newVal
            }
            const impuesto = this.lookup_taxes.find(y=>y.taxID==result.taxID)
            if(impuesto){
              result.tax_account_id = impuesto.accPurchase;
              result.taxName = impuesto.short_name_es;
              result.baseImponible = parseFloat(result.lineSubtotal * impuesto.factor_base);
              result.valorRetenido = parseFloat(result.lineSubtotal * impuesto.factor_base * impuesto.factor);
            }
            return result
          })
          this.lines = newRows;
          this.$q.loading.hide()
          this.$emit('onAccMoveCompute')
        }catch(ex){
          console.error(ex)
          this.$q.loading.hide()
        }
      },
      batchUpdateDiscount(){
        this.isSustentoDialogOpen = true;
        /*this.$q.dialog({
          title: 'Aplicar el siguiente descuento a todo el documento',
          //message: 'Des?',
          prompt: {
            model: 0,
            type: 'number',
            //isValid: val => val >= 0, // << here is the magic
            isValid: val => val >=0 && val <= 100
          },
          ok: { label: 'Aplicar', noCaps: true },
          cancel: { label: 'Cancelar', noCaps: true, flat: true },
        }).onOk(data => {
          this.selected.forEach(row => this.updateRow(data.toString() ,'lineDiscntPrcnt', row) );
        })*/
      },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        allow_view: { get () { return true }, },
        allow_edit: { get () { return true }, },
        allow_insert: { get () { return true }, },
        allow_report: { get () { return true }, },
        allow_disable: { get () { return true }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        lookup_invoices: {
            get () { return this.$store.state[this.moduleName].editData.lookup_invoices },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLookupInvoices', val) }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
        },
        partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
        },
        lookup_taxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxes },
        },
        
    }
})
</script>
