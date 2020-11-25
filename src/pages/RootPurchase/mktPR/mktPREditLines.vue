<template>
<div class="row ">
  <q-table
        ref="mainTable"
        :data="lines"
        :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
        table-style="min-height: calc(100vh - 400px); max-height: calc(100vh - 400px)"
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
          { name: 'price', required: true, label: 'Precio', align: 'right', field: row => row.price, sortable: true , style: 'max-width: 100px;' , headerStyle: 'padding-right: 20px;' },
          { name: 'lineSubtotal', required: true, label: 'Suman', align: 'right', field: row => row.lineSubtotal, sortable: true , style: 'max-width: 100px;' },
          { name: 'lineDiscntPrcnt', required: true, label: 'Descuento %', align: 'right', field: row => row.lineDiscntPrcnt, sortable: true , style: 'max-width: 60px;' , headerStyle: 'padding-right: 20px;' },
          { name: 'lineUntaxed', required: true, label: 'Total', align: 'right', field: row => row.lineUntaxed, sortable: true , style: 'max-width: 100px;' },
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
        <q-td key="invID" :props="props" class="no-padding" :tabindex="(props.key*10)+1" >
          <q-input class="no-padding" style="height: 20px !important;" :ref="'lineItem'+(props.key*10)+1"
              :value="props.row.invName" dense item-aligned borderless
              :rules="[val => !!val || 'Requerido']"
              :title="rowTitleInventory(props.row)"
              >
          </q-input>
        </q-td>
        <q-td key="quantity" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantity" type="number" :min="0" :readonly="(editMode==false)"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'quantity',props.row)}" />
        </q-td>
        <q-td key="price" :props="props" :tabindex="(props.key*10)+3">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.price" type="number" :min="0" :readonly="(props.row.quantitymktPO>0 || props.row.estado==false)"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'price',props.row)}" />
        </q-td>
        <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" key="lineSubtotal" :props="props">
          {{ props.row.lineSubtotal.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="lineDiscntPrcnt" :props="props" :tabindex="(props.key*10)+4">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.lineDiscntPrcnt" type="number" :min="0" :max="100" :readonly="(props.row.quantitymktPO>0 || props.row.estado==false)"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              debounce="1000" @input="(value)=>{updateRow(value,'lineDiscntPrcnt',props.row)}" />
        </q-td>
        <q-td :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" key="lineUntaxed" :props="props">
          {{ props.row.lineUntaxed.toFixed(userMoneyFormat) }}
        </q-td>

        <q-td key="whID" :props="props">{{ props.row.whName }}</q-td>
        <q-td key="prjID" :props="props">{{ props.row.prjName }}</q-td>
        <q-td key="transportTypeID" :props="props">{{ props.row.transportTypeName }}</q-td>

      </q-tr>
    </template>
    <template v-slot:top >
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Agregar':''" title="Agregar Varios Ítems" @click="itemsBatchDialogSelected=[];isItemsBatchDialog=true;" icon="fas fa-plus" color="primary" no-caps />
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Quitar':''" title="Eliminar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0" />
        <q-space />
        <q-btn v-if="editMode==true" :label="$q.screen.gt.lg?'Descuento':''" size="sm" title="Aplicar un mismo descuento a filas seleccionadas" @click="batchUpdateDiscount" icon="fas fa-percent" color="primary" flat no-caps  class="q-ml-sm" :disable="selected.length<=0" />
    </template>
  </q-table>

  <div class="row col-12 q-pt-sm ">
    <q-card class="col-md-6">
      <q-bar class="bg-primary text-white">
        <div v-if="$q.screen.gt.sm" class="text-subtitle2">Forma de Pago:</div>
        <div v-else class="text-subtitle2">Resumen</div>
        <q-space />
        <q-select
            emit-value map-options item-aligned dense borderless dark color="orange"
            :options="lookup_payterms" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
            :option-disable="opt => !opt.estado"
            v-model="paytermID"
            ref="paytermID"
            :rules="[
                    val => val!= null || '* Requerido',
            ]"
            >
        </q-select>
        <q-icon name="fas fa-money-check" color="white" />
      </q-bar>
      <q-card-section class="no-padding">
        <q-list class="scroll" style="height: 135px;">
      
          <q-item clickable dense v-for="fila in calculated_paytermsDetails" :key="fila.value">
            <q-item-section>
                <q-item-label class="text-grey-7">{{fila.label}}</q-item-label>
            </q-item-section>
            <q-item-section>
                <q-item-label class="text-grey-7">Días Plazo: {{fila.days}}</q-item-label>
            </q-item-section>
            <q-item-section>
                <q-item-label class="text-grey-7">Porcentaje: {{fila.factor}}%</q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-item-label class="text-grey-7">$: {{fila.amount}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <q-card class="col-md-5 offset-md-1" >
      <q-bar class="bg-primary text-white">
        <q-icon name="fas fa-dollar-sign" color="white" />
        <q-space />
        <div v-if="$q.screen.gt.sm" class="text-subtitle2">Resumen del Documento</div>
        <div v-else class="text-subtitle2">Resumen</div>
      </q-bar>
      <q-card-section class="no-padding">
        <q-list class="scroll" style="height: 100px;">
          <q-item clickable dense>
            <q-item-section >
                <q-item-label class="text-grey-7">Suman:</q-item-label>
            </q-item-section>
            <q-item-section side>
              {{lines.reduce(function(sum, d) { return sum + d.lineSubtotal; }, 0).toFixed(userMoneyFormat)}}
            </q-item-section>
          </q-item>
          <q-item clickable dense>
            <q-item-section >
                <q-item-label class="text-grey-7">Descuento:</q-item-label>
            </q-item-section>
            <q-item-section side>
              {{(lines.reduce(function(sum, d) { return sum + d.lineDiscntAmount; }, 0) * -1).toFixed(userMoneyFormat)}}
            </q-item-section>
          </q-item>
          <q-item clickable dense>
            <q-item-section>
              <b class="text-subtitle2 text-grey-7" >Subtotal:</b>
            </q-item-section>
            <q-item-section side>
              <b>{{lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0).toFixed(userMoneyFormat)}}</b>
            </q-item-section>
          </q-item>
          <q-separator />
          <!--Sección Impuestos, que están en [calculatedSumOfTaxes] :key="fila.value"-->
          <q-item clickable dense v-for="lines in calculatedSumOfTaxes" :key="lines.index">
              <q-item-section >
                  <q-item-label class="text-grey-7">{{lines.label}}:</q-item-label>
              </q-item-section>
              <q-item-section side>
                {{lines.value.toFixed(userMoneyFormat)}}
              </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator />
      <q-card-actions class="no-padding">
        <q-item clickable dense class="full-width">
          <q-item-section >
              <q-item-label class="text-subtitle2 text-primary"><b>TOTAL:</b></q-item-label>
          </q-item-section>
          <q-item-section side class="text-subtitle2 text-primary q-mr-md">
            <!--<b>{{lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0).toFixed(userMoneyFormat)}}</b>-->
            {{
              (
                lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0)
                +
                linesTaxes.reduce(function(sum, d) { return sum + d.taxAmount; }, 0)
              ).toFixed(userMoneyFormat)
            }}
          </q-item-section>
        </q-item>
      </q-card-actions>

    </q-card>
  </div>

  <q-dialog v-model="isItemsBatchDialog">
    <q-card style="min-width: 800px;" > 
      <q-bar class="bg-primary text-white">
        Buscar Items
        <q-space />
        <q-input input-class="text-white" borderless dense debounce="300" autofocus v-model="itemsBatchDialogFilter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon v-if="!itemsBatchDialogFilter" name="fas fa-search" flat round size="xs" color="white" />
            <q-btn v-if="itemsBatchDialogFilter" @click="itemsBatchDialogFilter=''" flat round icon="fas fa-times" size="xs" color="white" />
          </template>
        </q-input>
      </q-bar>
      <q-card-section class="no-padding">
        <q-table
          ref="itemsSearchTable"
          :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
          @keydown.native.keyCodes.115="itemsDialogSelectAction(itemsDialogSelected)"
          :data="lookup_items.filter(x=>x.estado==true)"
          :columns="[
            { name: 'value', required: true, label: 'ID', align: 'left', field: row => row.value, sortable: true, style: 'max-width: 20px;' },
            { name: 'label', required: true, label: 'Item', align: 'left', field: row => row.label, sortable: true, style: 'min-width: 250px;', },
            { name: 'systemTypeName', required: true, label: 'Tipo', align: 'left', field: row => row.systemTypeName, sortable: true, style: 'min-width: 50px;', },
            { name: 'internal_code', required: true, label: 'Código', align: 'left', field: row => row.internal_code, sortable: true, style: 'min-width: 50px;'},
            { name: 'uomName', required: true, label: 'Unidad de Medida', align: 'left', field: row => row.uomName, sortable: true, style: 'min-width: 50px;'},
            //{ name: 'groupName', required: true, label: 'Grupo Contable', align: 'left', field: row => row.groupName, sortable: true, style: 'min-width: 50px;'},
            { name: 'brandName', required: true, label: 'Marca', align: 'left', field: row => row.brandName, sortable: true, style: 'min-width: 50px;'},
          ]"
          row-key="value"
          virtual-scroll :rows-per-page-options="[0]"
          hide-bottom dense
          selection="multiple" :selected.sync="itemsBatchDialogSelected"
          :filter="itemsBatchDialogFilter"
          >
        </q-table>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn icon-right="fas fa-check-circle" flat label="Seleccionar (F4)" no-caps color="primary" :disable="itemsBatchDialogSelected.length<=0" @click="itemsBatchDialogSelectAction(itemsBatchDialogSelected)" ></q-btn>
      </q-card-actions>
      <q-inner-loading :showing="itemsBatchDialogTableBusy" style="z-index: 10" >
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
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
        ,isItemsDialog: false, itemsDialogFilter: '', itemsDialogSelected: [], itemsDialogRowToUpdate: null, itemsDialogTableBusy: false
        ,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: [], itemsBatchDialogRowToUpdate: null, itemsBatchDialogTableBusy: false
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
          if(colName=="quantity"||colName=="price"||colName=="lineDiscntPrcnt"){
            newRows.find(x=>x.lineID==row.lineID)[colName] = parseFloat(newVal);
          }else{
            newRows.find(x=>x.lineID==row.lineID)[colName] = newVal
          }
          newRows.find(x=>x.lineID==row.lineID)[colName] = newVal;
          let invID = newRows.find(x=>x.lineID==row.lineID).invID
          let invName = invID?this.lookup_items.find(x => x.value == invID).label:''
          let lineSubtotal = newRows.find(x=>x.lineID==row.lineID).price * newRows.find(x=>x.lineID==row.lineID).quantity;
          let lineDiscntAmount = lineSubtotal * (  (newRows.find(x=>x.lineID==row.lineID).lineDiscntPrcnt) / 100  );
          let lineUntaxed = lineSubtotal - lineDiscntAmount
          newRows.find(x=>x.lineID==row.lineID).lineSubtotal = lineSubtotal
          newRows.find(x=>x.lineID==row.lineID).lineDiscntAmount = lineDiscntAmount
          newRows.find(x=>x.lineID==row.lineID).lineUntaxed = lineUntaxed
          newRows.find(x=>x.lineID==row.lineID).invName = invName
          this.lines = newRows

          //Actualiza todas las taxLines correspondientes a la línea modificada
          let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))
          newRowsTaxes.filter(x=>x.lineID==row.lineID).map(lineaImpuesto=>{
            lineaImpuesto.lineUntaxed = lineUntaxed;
            lineaImpuesto.taxAmount = lineaImpuesto.isPercent?( parseFloat(lineUntaxed * lineaImpuesto.factor_base) * parseFloat(lineaImpuesto.factor) )  :  parseFloat(lineaImpuesto.factor);
            return lineaImpuesto
            //return lineaImpuesto.taxAmount = lineaImpuesto.isPercent?( parseFloat(lineUntaxed * lineaImpuesto.factor_base) * parseFloat(lineaImpuesto.factor) )  :  parseFloat(lineaImpuesto.factor)
          })
          this.linesTaxes = newRowsTaxes

        }catch(ex){
          console.error(ex)
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

            //Impuestos
            let newRowsTaxes = JSON.parse(JSON.stringify(this.linesTaxes))
            newRowsTaxes = newRowsTaxes.filter(x=>newRows.some(y=>y.lineID==x.lineID))
            this.linesTaxes = newRowsTaxes

            this.selected = []//limpia selección para evitar problema de referencia a filas que no existan
          })
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
                ,lineUntaxed: 0
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
      itemsBatchDialogSelectAction(){
        //let max_id = 1
        let max_id = 0
        let temp = null
        if(this.lines.length > 0){
          temp = this.getMax(this.lines, "lineID");
          //max_id = parseInt(temp.lineID) + parseInt(1);
          max_id = parseInt(temp.lineID);//no es necesario incrementar en 1, porque lo hace luego 
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
              ,estado: true
            })

            //Impuestos de la línea
            this.lookup_items_taxes.filter(x=>x.invID==row.value).forEach(impuesto=>{
                newRowsTaxes.push({
                   lineID: max_id
                  ,taxID: impuesto.taxID
                  ,taxName: impuesto.shortLabel
                  ,taxAmount: impuesto.isPercent?( parseFloat(1 * impuesto.factor_base) * parseFloat(impuesto.factor) )  :  parseFloat(impuesto.factor)
                  ,isPercent: impuesto.isPercent
                  ,factor: impuesto.factor
                  ,factor_base: impuesto.factor_base
                  ,lineUntaxed: 1
                })
              })
          })
          this.lines = newRows
          this.linesTaxes = newRowsTaxes
          this.isItemsBatchDialog = false
        }
      },
      rowTitleInventory(fila){
        let resultado = 'Seleccionar...'
        let target = null
        if(fila&&fila.invID&&fila.invID>0){
          try{
            target = this.lookup_items.find(x=>x.value == fila.invID)
            resultado = 'Código: ' + target.internal_code + ' || Unidad: ' + target.uomName + ' || Marca: ' + target.brandName
          }catch(ex){}
        }
        return resultado
      },
      batchUpdateDiscount(){
        this.$q.dialog({
          title: 'Aplicar el siguiente descuento a líneas seleccionadas',
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
        })
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
        lookup_items_taxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items_taxes },
        },
        /*lookup_taxesByGroup: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxesByGroup },
        },*/
        calculated_paytermsDetails: {
            get () {
              let resultado = []
              let grandTotal = this.lines.reduce(function(sum, d) { return sum + d.lineUntaxed; }, 0)
              if(this.paytermID&&this.paytermID>0){
                if(this.lookup_paytermsDetails.filter(x=>x.paytermID==this.paytermID)){
                  let linea = {}
                  this.lookup_paytermsDetails.filter(x=>x.paytermID==this.paytermID).map(row=>{
                    linea = {
                      value: row.value
                      ,label: row.label
                      ,factor: row.factor
                      ,days: row.days
                      ,amount: (grandTotal * (row.factor/100)).toFixed(this.userMoneyFormat)
                    }
                    resultado.push(linea)
                  })
                  
                }
              }
              return resultado
            },
        },
        calculatedSumOfTaxes: {
          get () {
            //Sección Subtotales
            //acc = acumulador  ||  it = fila
            const resultadoSubtotales = this.linesTaxes.reduce((acc, it) => {
              //crea en el acumulador el atributo con el nombre del impuesto, ej: acc[IVA 12%]
              //luego, suma el valor del acumulador cuando coincida el nombre (ej: acc[IVA 12%] debe ser igual a it.taxName que sería 'IVA 12%')
              //y luego toma el valor y le suma el campo taxAmount
              acc[it.taxName] = ((acc[it.taxName]?acc[it.taxName]:0) + it.lineUntaxed);
              return acc;
            }, {});
            //sección Impuestos
            const resultado = this.linesTaxes.reduce((acc, it) => {
              //crea en el acumulador el atributo con el nombre del impuesto, ej: acc[IVA 12%]
              //luego, suma el valor del acumulador cuando coincida el nombre (ej: acc[IVA 12%] debe ser igual a it.taxName que sería 'IVA 12%')
              //y luego toma el valor y le suma el campo taxAmount
              acc[it.taxName] = ((acc[it.taxName]?acc[it.taxName]:0) + it.taxAmount);
              return acc;
            }, {});
            //resultado es un objeto, entonces se convierte a Array object a Array
            var result = [];
            for(var i in resultadoSubtotales){
              result.push({
                 label: 'Subtotal ' + i
                ,value: resultadoSubtotales[i]
                }
              )
            }
            for(var i in resultado){
              result.push({
                 label: i
                ,value: resultado[i]
                }
              )
            }
            return result
          }
        }
    }
})
</script>
