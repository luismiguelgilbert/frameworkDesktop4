<template>
<div class="row ">
  <q-table
        ref="mainTable"
        :data="lines"
        :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
        table-style="min-height: calc(100vh - 225px); max-height: calc(100vh - 225px)"
        row-key="lineID"
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        hide-bottom dense
        selection="multiple" :selected.sync="selected"
        :filter="filterString"
        :columns="[
          //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
          { name: 'invID', required: true, label: 'Item', align: 'left', field: row => row.invID, sortable: true },
          //{ name: 'quantity', required: true, label: 'Cantidad', align: 'right', field: row => row.quantity, sortable: true, style: 'max-width: 100px;', },
          { name: 'account_id', required: true, label: 'Cuenta Contable', align: 'left', field: row => row.account_id, sortable: false },
          { name: 'taxes', required: true, label: 'Impuestos', align: 'left', field: row => linesTaxes, sortable: false },
          { name: 'sri_sustento', required: true, label: 'Sustento Tributario', align: 'left', field: row => row.sri_sustento, sortable: false },
          { name: 'prjID', required: true, label: 'Centro de Costo?', align: 'left', field: row => row.prjID, sortable: false },
          { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true },
          { name: 'mktPOHeader', required: true, label: 'OC #', align: 'left', field: row => row.mktPOHeader, sortable: true },
          { name: 'mktPOlineID', required: true, label: 'OC Línea', align: 'left', field: row => row.mktPOlineID, sortable: true },
        ]"
    >
    <template v-slot:header-cell-account_id="props">
      <q-th :props="props">
        <q-icon name="account_tree" size="1em" />
        {{ props.col.label }}
      </q-th>
    </template>
    <template v-slot:header-cell-taxes="props">
      <q-th :props="props">
        <q-icon name="fas fa-percent" size="1em" />
        {{ props.col.label }}
      </q-th>
    </template>
    <template v-slot:header-cell-sri_sustento="props">
      <q-th :props="props">
        <q-icon name="fas fa-balance-scale" size="1em" />
        {{ props.col.label }}
      </q-th>
    </template>
    <template v-slot:header-cell-prjID="props">
      <q-th :props="props">
        <q-icon name="bookmarks" size="1em" />
        {{ props.col.label }}
      </q-th>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="md" dense :title="props.row.lineID" />
        </q-td>

        <q-td key="invID" :props="props">{{ props.row.invName }}</q-td>
        <!--<q-td key="quantity" :props="props">{{ props.row.quantity }}</q-td>-->
        <q-td key="account_id" :props="props">
          {{lookup_accounts.filter(x=>x.value==props.row.account_id).map(y => {return y.code_es + " - " + y.label}).join("")}}
        </q-td>

        <q-td key="taxes" :props="props">
          {{props.row.taxes.map(y => {return y.short_name_es}).join(" ; ")}}
          <q-popup-edit :ref="'taxSelector'+props.row.lineID" v-model="props.row.taxes" auto-save>
              <q-select class="q-ma-xs" use-chips
                borderless dense
                :options="lookup_taxes.filter(x=>!x.es_retencion)" 
                :value="props.row.taxes"
                multiple option-value="taxID" option-label="short_name_es"
                @input="(row)=>{
                  updateRow(row,'taxes',props.row)
                }"
                @popup-hide="(evento)=>{$refs['taxSelector'+props.row.lineID].hide()}"
                >
                <template v-slot:no-option> 
                    <q-item> <q-item-section class="text-italic text-grey"> No hay datos </q-item-section> </q-item>
                </template>
                
              </q-select>
            </q-popup-edit>
        </q-td>

        <q-td key="sri_sustento" :props="props" >
          {{lookup_SRI_Tabla_Tipo_Sustento.filter(x=>x.value==props.row.sri_sustento).map(y => {return y.short_name_es}).join("")}}
        </q-td>      

        <q-td key="prjID" :props="props">{{ props.row.prjName }}</q-td>
        
        <q-td key="comments" :props="props">
          <q-input class="no-padding" style="height: 20px !important;"
              :value="props.row.comments" debounce="1000"
              dense item-aligned borderless
              @input="(value)=>{updateRow(value,'comments',props.row)}" />
        </q-td>

        <q-td key="mktPOHeader" :props="props">{{ props.row.mktPOHeader }}</q-td>
        <q-td key="mktPOlineID" :props="props">{{ props.row.mktPOlineID }}</q-td>
      </q-tr>
    </template>


    <template v-slot:top >
        <q-btn :label="$q.screen.gt.sm?'Cuenta Contable':''" title="Cambiar Cuenta Contable a líneas seleccionadas" @click="isAccDialog=true" icon="account_tree" color="primary" no-caps :disable="selected.length<=0"/>
        <q-btn :label="$q.screen.gt.sm?'Impuestos':''" title="Cambiar Impuestos a líneas seleccionadas" icon="fas fa-percent" color="primary" no-caps class="q-ml-sm" @click="isTaxesDialog=true" :disable="selected.length<=0"/>
        <q-btn :label="$q.screen.gt.sm?'Sustento':''" title="Cambiar Sustento Tributario a líneas seleccionadas" icon="fas fa-balance-scale" color="primary" no-caps class="q-ml-sm" @click="isSustentoDialog=true" :disable="selected.length<=0"/>
        <q-btn :label="$q.screen.gt.sm?'Centro de Costo':''" title="Cambiar Centro de Costo a líneas seleccionadas" icon="bookmarks" color="primary" no-caps class="q-ml-sm" @click="isPrjDialog=true" :disable="selected.length<=0" />
        <q-btn :label="$q.screen.gt.sm?'Cuenta Pasivo':''" title="Cambiar Cuenta Contable del Pasivo" icon="fas fa-handshake" color="primary" no-caps class="q-ml-sm" @click="isPartnerAccountDialog=true" />
    </template>
    <template v-slot:bottom-row >
      <q-tr>
      </q-tr>
    </template>
  </q-table>


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
            <template v-slot:prepend><q-icon name="bookmarks" /></template>
        </q-select>
        <q-separator />
        <q-table
          ref="prjSearchTable" square
          :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
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
        <q-btn  flat label="Cancelar (ESC)" no-caps color="primary" @click="isPrjDialog=false" />
        <q-btn icon-right="fas fa-check-circle" label="Seleccionar (F4)" no-caps color="primary" 
          :disable="(prjDialogSelected.length<=0||prjDialogSelected[0].row_has_children||prjDialogSelected[0].estado==false)" 
          @click="prjDialogSelectAction(prjDialogSelected)"
          />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isAccDialog" >
    <q-card style="minWidth: 900px;">
      <selectSearchable class="col-12"
          prependIcon="fas fa-cash-register"
          labelText="Cuenta de Liquidación de Compra del Item (*)" labelSearchText="Buscar Cuenta Contable"
          :optionsList="lookup_accounts"
          rowValueField="value" optionLabelField="label" optionsListCaption="code_es" optionsListLabel="label" optionDisableField="estado"
          :isRequired="false" 
          :isDisable="false" 
          :isReadonly="false"
          
          :tableSearchColumns="[
              { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
              ,{ name: 'label', label: 'Cuenta Contable', field: 'label', align: 'left'}
              ]"
          @onItemSelected="(row)=>{
                  if(row){
                      this.selected.forEach(line => this.updateRow(row.value, 'account_id', line) );
                  }
                  this.isAccDialog = false
              }"
          />
    </q-card>
  </q-dialog>

  <q-dialog v-model="isTaxesDialog" >
    <q-card style="minWidth: 900px;">
      <selectSearchable class="col-12"
          prependIcon="fas fa-cash-register"
          labelText="Reemplazar Impuestos a Líneas Seleccionadas (*)" labelSearchText="Buscar Impuesto"
          :optionsList="lookup_taxes.filter(x=>!x.es_retencion)"
          rowValueField="taxID" optionLabelField="short_name_es" optionsListCaption="name_es" optionsListLabel="short_name_es" 
          optionDisableField="estado"
          :isRequired="false" 
          :isDisable="false" 
          :isReadonly="false"
          
          :tableSearchColumns="[
              { name: 'short_name_es', label: 'Impuesto', field: 'short_name_es', align: 'left'}
              ,{ name: 'short_name_es', label: 'Descripción', field: 'short_name_es', align: 'left'}
              ]"
          @onItemSelected="(row)=>{
                  if(row){
                      this.selected.forEach(line => this.updateTaxRows(row, 'taxes', line) );
                  }
                  this.isTaxesDialog = false
              }"
          />
    </q-card>
  </q-dialog>

  <q-dialog v-model="isSustentoDialog" >
    <mainLookup 
            titleBar="Buscar Sustento Tributario"
            :data="this.lookup_SRI_Tabla_Tipo_Sustento"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :predefinedValue="mainLookupPredefinedValue"
            :columns="[
                     { name: 'value', required: true, label: 'Código', align: 'left', field: row => row.value , sortable: false, style: 'min-width: 100px; max-width: 100px;' }
                    ,{ name: 'label', required: true, label: 'Sustento Tributario', align: 'left', field: row => `${'     '.repeat(row.account_level) + row.label} `, sortable: false,    }
                    ,{ name: 'short_name_es', required: true, label: 'Nombre Corto', align: 'left', field: row => row.short_name_es, sortable: false, style: 'max-width: 75px;', }
                    ]"
            @onCancel="isSustentoDialog=false"
            @onSelect="(selectedRows)=>{updateSustentoValues(selectedRows, 'sri_sustento', 'label')}"
        />
  </q-dialog>

  <q-dialog v-model="isPartnerAccountDialog" >
    <q-card style="minWidth: 900px;">
      <selectSearchable class="col-12"
            prependIcon="fas fa-cash-register"
            labelText="Cuenta del Pasivo (*)" labelSearchText="Buscar Cuenta Contable"
            :optionsList="lookup_accounts"
            rowValueField="value" optionLabelField="label" optionsListCaption="code_es" optionsListLabel="label" 
            optionDisableField="estado"
            :isRequired="true" 
            :isDisable="false" 
            :isReadonly="false"
            :initialValue="account_id"
            :tableSearchColumns="[
                   { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                  ,{ name: 'label', label: 'Cuenta Contable', field: 'label', align: 'left'}
                ]"
            @onItemSelected="(row)=>{
                    this.account_id=row.value;
                    this.isPartnerAccountDialog=false;
                    this.$emit('onAccMoveCompute');
                }"
            />
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
import mainLookup from '../../../components/mainLookup/mainLookup.vue'
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    components: {
        mainLookup: mainLookup
        ,selectSearchable:selectSearchable
    },
    data () {
      return {
          moduleName: "accAP", filterString: '', selected: []
        ,isAccDialog: false, accDialogFilter: '', accDialogSelected: [], accDialogTableBusy: false
        ,isPrjDialog: false, prjDialogFilter: '', prjDialogSelected: [], prjDialogTableBusy: false, rootPrjIDSelected: null, prjIDSelected: null
        ,isSustentoDialog: false, sustentoDialogFilter: '', sustentoDialogSelected: [], sustentoDialogTableBusy: false
        ,isExpectedDialog: false, expectedDialogDate: ''
        ,isTaxesDialog: false
        ,mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
        ,isPartnerAccountDialog: false
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
      prjDialogSelectAction(){
        if(this.prjDialogSelected.length>0){
          //Segundo, actualiza la fila por medio del método [updateRow]
          if(this.prjDialogSelected[0].estado==true){
            this.selected.forEach(rowToUpdate=>{
                //Actualiza las líneas
                let newRows = JSON.parse(JSON.stringify(this.lines))
                newRows.filter(x=>x.lineID==rowToUpdate.lineID).map(y=>{
                    y.prjID = this.prjDialogSelected[0].value;
                    y.prjName = this.prjDialogSelected[0].label;
                    return y
                })
                this.lines = newRows
            })
            this.isPrjDialog = false
          }
          this.$emit('onAccMoveCompute')
        }
      },
      updateValues(selectedRows, lookupValueField, lookupLabelField){
        if(selectedRows.length>0){
          let newRows = JSON.parse(JSON.stringify(this.lines))
          newRows.filter(x=>this.selected.some(y=>y.lineID==x.lineID)).map(row=>{
            row.account_id = selectedRows[0].value;
            row.account_name = selectedRows[0].fullLabel;
          })
          this.lines = newRows
          this.isAccDialog = false
          this.$emit('onAccMoveCompute')
        }
      },
      updateSustentoValues(selectedRows, lookupValueField, lookupLabelField){
        if(selectedRows.length>0){
          let newRows = JSON.parse(JSON.stringify(this.lines))
          newRows.filter(x=>this.selected.some(y=>y.lineID==x.lineID)).map(row=>{
            row.sri_sustento = selectedRows[0].value;
            //row.sri_sustentoName = selectedRows[0].label;
            row.sri_sustentoName = selectedRows[0].short_name_es;
          })
          this.lines = newRows
          this.isSustentoDialog = false
          this.$emit('onAccMoveCompute')
        }
      },
      updateRow(newVal, colName, row){
        if(colName=='taxes'){
          newVal.map(x=>{
            x.taxAmount = x.isPercent?row.lineUntaxed*x.factor*x.factor_base:x.factor
            //this.$refs.taxSelector.set()
            return 
          })
        }
        let newRows = JSON.parse(JSON.stringify(this.lines))
        newRows.find(x=>x.lineID==row.lineID)[colName] = newVal
        this.lines = newRows
        this.$emit('onAccMoveCompute')
      },
      updateTaxRows(newVal, colName, row){
        newVal.taxAmount = newVal.isPercent?row.lineUntaxed*newVal.factor*newVal.factor_base:newVal.factor
        let newRows = JSON.parse(JSON.stringify(this.lines))
        this.selected.map(x=>{
          newRows.find(y=>y.lineID==x.lineID).taxes = []
          newRows.find(y=>y.lineID==x.lineID).taxes.push(newVal)
        })
        this.lines = newRows
        this.$emit('onAccMoveCompute')
      },
      getAccountName(account_id){
        let resultado = ''
        if(account_id&&this.lookup_accounts.some(x=>x.value==account_id)){
          const temp = this.lookup_accounts.find(x=>x.value==account_id)
          resultado = temp.code_es + ' ' + temp.label
        }
        return resultado
      },
      closePopup(evento, refName){
        this.$refs[refName].hide()
      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
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
        linesTaxes: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLinesTaxes', val) }
        },
        /*
        accountLines: {
            get () { return this.$store.state[this.moduleName].editData.accountLines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAccountLines', val) }
        },*/
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
        },
        partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
        },
        account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.account_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'account_id', value: val}) }
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
        },
        lookup_taxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxes },
        },
        lookup_SRI_Tabla_Tipo_Sustento: {
            get () { return this.$store.state[this.moduleName].editData.lookup_SRI_Tabla_Tipo_Sustento },
        },
        lookup_prj: {
            get () { return this.$store.state[this.moduleName].editData.lookup_prj },
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
    }
})
</script>
