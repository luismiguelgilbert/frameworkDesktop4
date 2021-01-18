<template>
<div style="margin: -16px;">
  <q-table
        ref="mainTable"
        :data="lines"
        table-style="min-height: calc(100vh - 189px); max-height: calc(100vh - 189px);"
        row-key="lineID"
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        hide-bottom dense
        selection="multiple" :selected.sync="selected"
        :filter="filterString"
        :virtual-scroll="true"
        :class="tableLastLine"
        :columns="[
          //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
          { name: 'hasError', required: true, label: '', align: 'center', field: row => row.uploaded, sortable: true },
          { name: 'invID', required: true, label: 'Item', align: 'left', field: row => row.invID, sortable: true, style: 'min-width: 300px;' },
          { name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'max-width: 100px;', },
          { name: 'quantityRcvd', required: true, label: 'Recibido', align: 'right', field: row => row.quantityRcvd, sortable: true, style: 'max-width: 100px;',  },
          { name: 'quantityInvoiced', required: true, label: 'Facturado', align: 'right', field: row => row.quantityInvoiced, sortable: true, style: 'max-width: 100px;',headerStyle: 'padding-right: 20px;'  },
          { name: 'quantityCancel', required: true, label: 'Cancelado', align: 'right', field: row => row.quantityCancel, sortable: true, style: 'max-width: 100px;',headerStyle: 'padding-right: 20px;'  },
          { name: 'quantityCancelNew', required: true, label: 'Cancelar', align: 'right', field: row => row.quantityCancelNew, sortable: true, style: 'max-width: 100px;',headerStyle: 'padding-right: 20px;'  },
          { name: 'quantityOpen', required: true, label: 'Por Recibir', align: 'right', field: row => row.quantityOpen, sortable: true, style: 'max-width: 100px;',  },
          { name: 'whID', required: true, label: 'Bodega', align: 'left', field: row => row.whID, sortable: true, style: 'min-width: 250px;' },
          { name: 'expectedDate', required: true, label: 'Esperado el', align: 'left', field: row => row.expectedDate, sortable: true, style: 'min-width: 130px;' },
          { name: 'transportTypeID', required: true, label: 'Entrega?', align: 'left', field: row => row.transportTypeID, sortable: true, style: 'min-width: 300px;' },
          { name: 'prjID', required: true, label: 'Centro de Costo?', align: 'left', field: row => row.prjID, sortable: true, },
          
        ]"
    >
    <template v-slot:top >
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Bodega':''" title="Cambiar Bodega a líneas seleccionadas" @click="isWHDialog = true" icon="fas fa-warehouse" color="primary"  no-caps :disable="selected.length<=0"/>
        <q-btn v-if="editMode==true||editMode==false" :label="$q.screen.gt.sm?'Esperado':''" title="Cambiar Fecha Esperada de Entrega a líneas seleccionadas" @click="isExpectedDialog=true" icon="fas fa-calendar" color="primary" :class="editMode==false?undefined:'q-ml-sm'"  no-caps :disable="selected.length<=0"/>
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Entrega':''" title="Cambiar Tipo de Entrega a líneas seleccionadas" @click="isTransportDialog = true" icon="fas fa-truck" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0" />
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Centro de Costo':''" title="Cambiar Centro de Costo a a líneas seleccionadas" @click="isPrjDialog = true" icon="fas fa-folder-open" color="primary" no-caps  class="q-ml-sm" :disable="selected.length<=0"/>
        <q-btn v-if="editMode==false" :label="$q.screen.gt.sm?'Cancelar':''" title="Cancelar líneas seleccionadas" @click="cancelRows" icon="fas fa-ban" color="primary" class="q-ml-sm" no-caps   :disable="selected.length<=0" />
        <q-space />
    </template>

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" dense :title="props.row.lineID" />
        </q-td>

        <q-td key="hasError" :props="props" class="no-padding">
            <q-icon 
                size="xs" name="fas fa-exclamation-triangle" color="red" flat dense
                v-if="rowValidation(props.row, true)"
                :title="rowValidation(props.row, false)"
                />
        </q-td>
        <q-td key="invID" :props="props">
          <selectSearchable
              labelText="Materia Prima" 
              labelSearchText="Buscar Materia Prima"
              :optionsList="lookup_items"
              rowValueField="value" optionLabelField="label" optionsListCaption="internal_code" optionsListLabel="label" optionDisableField="estado"
              :isRequired="true" :isDisable="false" :isReadonly="true"
              :isInline="true" :isDense="true"
              appendIcon="f"
              :tableSearchColumns="[
                    { name: 'label', label: 'Línea de Producción', field: 'label', align: 'left'}
                  ,{ name: 'internal_code', label: 'Código', field: 'internal_code', align: 'left'}
                  ,{ name: 'uomName', label: 'Unidad', field: 'uomName', align: 'left'}
                  ,{ name: 'lastPrice', label: 'Precio P. Actual', field: 'lastPrice', align: 'left'}
                  ,{ name: 'systemTypeName', label: 'Tipo', field: 'systemTypeName', align: 'left'}
              ]"
              :tooltipColumns="[
                   { name: 'label', label: 'Item'}
                  ,{ name: 'internal_code', label: 'Código'}
                  ,{ name: 'uomName', label: 'Unidad'}
                  ,{ name: 'brandName', label: 'Marca'}
              ]"
              :initialValue="props.row.invID"
              />
        </q-td>
        <q-td key="quantity" :props="props">{{ props.row.quantity }}</q-td>
        <q-td key="quantityRcvd" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityRcvd }}</q-td>
        <q-td key="quantityInvoiced" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityInvoiced }}</q-td>
        <q-td key="quantityCancel" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityCancel }}</q-td>
        <q-td key="quantityCancelNew" :props="props" :tabindex="(props.key*10)+2">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.quantityCancelNew" type="number" :min="0" :readonly="(editMode==true)" :max="props.row.quantityOpen"
              dense item-aligned borderless input-class="text-right"
              :rules="[val => parseFloat(val)>=0 || 'Requerido']"
              @focus="$event.target.select()"
              @input="(value)=>{updateRow(value,'quantityCancelNew',props.row)}" />
        </q-td>
        <q-td key="quantityOpen" :class="userColor=='blackDark'?'bg-grey-9':'bg-grey-2'" :props="props">{{ props.row.quantityOpen }}</q-td>
        <q-td key="whID" :props="props">
          <selectSearchable
              labelText="Bodega" 
              labelSearchText="Buscar Bodega"
              :optionsList="lookup_wh"
              rowValueField="value" optionLabelField="label" optionsListCaption="internal_code" optionsListLabel="label" optionDisableField="estado"
              :isRequired="true" :isDisable="false" :isReadonly="true"
              :isInline="true" :isDense="true"
              appendIcon="f"
              :tableSearchColumns="[
                    { name: 'label', label: 'Línea de Producción', field: 'label', align: 'left'}
              ]"
              :initialValue="props.row.whID"
              />
        </q-td>
        <q-td key="expectedDate" :props="props" :title="dateName(props.row.expectedDate)">
          <q-input
            ref="expectedDate" mask="date" 
            dense borderless class="no-padding" style="height: 20px !important;" debounce="1000"
            :value="props.row.expectedDate" 
            @input="(value)=>{updateRow(value,'expectedDate',props.row)}"
            >
            <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" size="xs">
                <q-popup-proxy ref="qDateProxy_expectedDate" transition-show="scale" transition-hide="scale">
                <q-date :locale="myQDateLocale" minimal 
                    :value="props.row.expectedDate"
                    @input="(value)=>{updateRow(value,'expectedDate',props.row)}"
                    >
                    <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                    </div>
                </q-date>
                </q-popup-proxy>
            </q-icon>
            </template>
          </q-input>
        </q-td>
        <q-td key="transportTypeID" :props="props">
          <selectSearchable
              labelText="Tipo Entrega" 
              labelSearchText="Buscar Tipo de Entrega"
              :optionsList="lookup_transports"
              rowValueField="value" optionLabelField="label" optionsListLabel="label" optionDisableField="estado"
              :isRequired="true" :isDisable="false" :isReadonly="true"
              :isInline="true" :isDense="true"
              appendIcon="f"
              :tableSearchColumns="[
                    { name: 'label', label: 'Línea de Producción', field: 'label', align: 'left'}
                  ,{ name: 'internal_code', label: 'Código', field: 'internal_code', align: 'left'}
                  ,{ name: 'uomName', label: 'Unidad', field: 'uomName', align: 'left'}
                  ,{ name: 'lastPrice', label: 'Precio P. Actual', field: 'lastPrice', align: 'left'}
                  ,{ name: 'systemTypeName', label: 'Tipo', field: 'systemTypeName', align: 'left'}
              ]"
              :initialValue="props.row.transportTypeID"
              />
        </q-td>
        <q-td key="prjID" :props="props">
          <selectSearchable
              labelText="Centro Costo" 
              labelSearchText="Buscar Tipo de Entrega"
              :optionsList="lookup_prj"
              rowValueField="value" optionLabelField="label" optionsListLabel="label" optionDisableField="estado"
              :isRequired="false" :isDisable="false" :isReadonly="true"
              :isInline="true" :isDense="true"
              appendIcon="f"
              :tableSearchColumns="[
                    { name: 'label', label: 'Línea de Producción', field: 'label', align: 'left'}
                  ,{ name: 'internal_code', label: 'Código', field: 'internal_code', align: 'left'}
                  ,{ name: 'uomName', label: 'Unidad', field: 'uomName', align: 'left'}
                  ,{ name: 'lastPrice', label: 'Precio P. Actual', field: 'lastPrice', align: 'left'}
                  ,{ name: 'systemTypeName', label: 'Tipo', field: 'systemTypeName', align: 'left'}
              ]"
              :initialValue="props.row.prjID"
              />
            </q-td>
      </q-tr>
    </template>
    
    <template v-slot:bottom-row >
      <q-tr></q-tr>
    </template>
  </q-table>

  <q-dialog v-model="isWHDialog" >
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
          ref="whSearchTable" flat square
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
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
          :class="tableLastLine"
          :separator="userTableLines"
          >
        </q-table>
        <q-separator />
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

  <q-dialog v-model="isTransportDialog">
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
          ref="transportSearchTable" flat square
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
          :class="tableLastLine"
          :separator="userTableLines"
          >
          
        </q-table>
        <q-separator />
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
          ref="prjSearchTable" flat square
          table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
          @keydown.native.keyCodes.115="prjDialogSelectAction(prjDialogSelected)"
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
          :class="tableLastLine"
          :separator="userTableLines"
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
        <q-separator />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn  flat label="Cancelar (ESC)" no-caps color="primary" @click="isPrjDialog=false" />
        <q-btn icon-right="fas fa-check-circle" label="Seleccionar (F4)" no-caps color="primary" 
          :disable="(prjDialogSelected.length<=0||prjDialogSelected[0].row_has_children||prjDialogSelected[0].estado==false)" 
          @click="prjDialogSelectAction(prjDialogSelected)"
          />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isExpectedDialog" >
    <q-card style="min-width: 700px;" > 
      <q-toolbar>
        Aplicar la siguiente Fecha a registros seleccionados
      </q-toolbar>
      <q-card-section>
        <q-input
          ref="expectedDialogDate"
          mask="date" :rules="['date']"
          placeholder="Ingrese la fecha esperada" label="Fecha Esperada" filled
          v-model="expectedDialogDate"
          >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy  ref="qDateProxy_expectedDialogDate" transition-show="scale" transition-hide="scale">
                <q-date minimal v-model="expectedDialogDate" >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
      </q-input>
      </q-card-section>
      <q-card-actions align="around" >
        <q-btn label="Cancelar" @click="isExpectedDialog=false" flat />
        <q-btn label="Seleccionar" color="primary" @click="updateExpectedDates" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
  

</div>
</template>
<style lang="scss">
  .q-table__bottom{ padding: 0px; padding-left: 10px; padding-right: 10px; }
  .q-virtual-scroll__padding{ visibility: hidden;}
  .q-table thead tr:first-child th{ position: sticky; top: 0; opacity: 1; z-index: 1; padding-left: 5px; font-weight: bolder; color: $primary; }
  .my-sticky-header-table{
    .q-table thead tr:first-child th{ background-color: white }
  }
  .my-sticky-header-table-LastLine{
    .q-table thead tr:first-child th{ background-color: white }
    .q-table .q-virtual-scroll__content td{ border-bottom-width: 1px }
  }
  .my-sticky-header-table-dark{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
  }
  .my-sticky-header-table-dark-LastLine{
    .q-table thead tr:first-child th{ background-color: $grey-10 }
    .q-table td{ border-bottom-width: 1px }
  }
</style>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
  props: {
      moduleName: { type: String , required: true },
  },
  components: {
    selectSearchable: selectSearchable
  },
  data () {
    return {
        myQDateLocale: {
            /* starting with Sunday */
            days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
            daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
            months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
            monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
            firstDayOfWeek: 1
        }
      ,filterString: '', selected: []
      ,isWHDialog: false, whDialogFilter: '', whDialogSelected: [], whDialogTableBusy: false
      ,isTransportDialog: false, transportDialogFilter: '', transportDialogSelected: [], transportDialogTableBusy: false
      ,isPrjDialog: false, prjDialogFilter: '', prjDialogSelected: [], prjDialogTableBusy: false, rootPrjIDSelected: null, prjIDSelected: null
      ,isExpectedDialog: false, expectedDialogDate: ''
      //,isItemsBatchDialog: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: [], itemsBatchDialogRowToUpdate: null, itemsBatchDialogTableBusy: false
    }
  },
  methods:{
    rowValidation(currentRow, returnType){
        if(currentRow.invID==null||currentRow.invID==undefined||currentRow.invID<=0){
            return (returnType?true:'Debe corregir la celda: Materia Prima')
        }
        if(currentRow.quantity==null||currentRow.quantity==undefined||currentRow.quantity<=0){
            return (returnType?true:'Debe corregir la celda: Cantidad')
        }
        if(currentRow.quantity>currentRow.maxQuantity){
            return (returnType?true:'Debe disminuir el valor en la celda: Cantidad')
        }
        if(currentRow.debit_account_id==null||currentRow.debit_account_id==undefined||currentRow.debit_account_id<=0||currentRow.credit_account_id==null||currentRow.credit_account_id==undefined||currentRow.credit_account_id<=0){
            return (returnType?true:'Debe corregir la configuración contable')
        }
        if(currentRow.lineUntaxed==null||currentRow.lineUntaxed==undefined||currentRow.lineUntaxed<0){
            return (returnType?true:'Debe verificar todas las celdas por un error en: Total')
        }
        if(this.editMode==false){
          if(currentRow.quantityCancelNew==null||currentRow.quantityCancelNew==undefined||currentRow.quantityCancelNew<0||currentRow.quantityCancelNew>currentRow.quantityOpen){
            return (returnType?true:'Debe corregir la celda: Cancelar')
          }
        }
        
        return false
      },
    dateName(value){
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
    },
    updateRow(newVal, colName, row){
      try{
        this.$q.loading.show()
        //Actualiza las líneas
        let newRows = JSON.parse(JSON.stringify(this.lines))
        newRows.filter(x=>x.lineID==row.lineID).map(result=>{
          if(colName=="quantityCancelNew"){
              result[colName] = parseFloat(newVal);
          }else{
              result[colName] = newVal;
          }
          return result;
        })
        this.lines = newRows
        this.$q.loading.hide()
      }catch(ex){
        console.error(ex)
        this.$q.loading.hide()
      }
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
    updateExpectedDates(){
      this.isExpectedDialog=false
      this.selected.forEach(row => this.updateRow(this.expectedDialogDate, 'expectedDate' , row) );
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
    prjDialogSelectAction(){
      if(this.prjDialogSelected.length>0){
        //Segundo, actualiza la fila por medio del método [updateRow]
        if(this.prjDialogSelected[0].estado==true){
          this.selected.forEach(rowToUpdate=>{
              this.updateRow(this.prjDialogSelected[0].value, 'prjID', rowToUpdate)
          })
          this.isPrjDialog = false
        }
      }
    },
    cancelRows(){
      this.selected.forEach(rowToUpdate=>{
        //pone en columna quantityCancel el valor de las cantidades pendientes (open / por recibir)
        this.updateRow(rowToUpdate.quantityOpen, 'quantityCancelNew', rowToUpdate)
      })
    },
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
      userTableLines: { get () { return this.$store.state.main.userTableLines } },
      tableLastLine: {
          get () { 
              let resultado = ''
              if(this.userColor=='blackDark'){
              if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
              {
                  resultado = 'my-sticky-header-table-dark-LastLine bg-grey-10 '
              }else{
                  resultado = 'my-sticky-header-table-dark bg-grey-10 '
              }
              }
              if(this.userColor!='blackDark'){
                  if(this.userTableLines=='horizontal'||this.userTableLines=='cell')
                  {
                      resultado = 'my-sticky-header-table-LastLine '
                  }else{
                      resultado = 'my-sticky-header-table '
                  }
              }
              return resultado
          }
      },
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
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
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
