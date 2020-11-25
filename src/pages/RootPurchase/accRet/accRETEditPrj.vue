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
           //{ name: 'tipoComprobanteName', required: true, label: 'Documento', align: 'left', field: row => row.tipoComprobanteName, sortable: true, style: 'min-width: 50px;' },
           { name: 'accAPnumeroDoc', required: true, label: '# Documento', align: 'left', field: row => row.accAPnumeroDoc, sortable: true, style: 'min-width: 100px;' },
          ,{ name: 'sustentoName', required: true, label: 'Sustento', align: 'left', field: row => row.sustentoName, sortable: true, style: 'min-width: 100px;' },
          ,{ name: 'lineSubtotal', required: true, label: 'Subtotal', align: 'right', field: row => row.lineSubtotal, sortable: true , style: 'max-width: 100px;' },
          //,{ name: 'accAP_account_id', required: true, label: 'accAP_account_id', align: 'right', field: row => row.accAP_account_id, sortable: true , style: 'max-width: 100px;' },
          //,{ name: 'tax_account_id', required: true, label: 'tax_account_id', align: 'right', field: row => row.tax_account_id, sortable: true , style: 'max-width: 100px;' },
          ,{ name: 'taxID', required: true, label: 'Retención', align: 'left', field: row => row.taxID, sortable: true },
          ,{ name: 'baseImponible', required: true, label: 'Base Imponible', align: 'right', field: row => row.baseImponible, sortable: true , style: 'max-width: 100px;' },
          ,{ name: 'valorRetenido', required: true, label: 'Valor Retenido', align: 'right', field: row => row.valorRetenido, sortable: true , style: 'max-width: 100px;' },
        ]"
    >

    <template v-slot:body="props">
      <q-tr :props="props" >
        <q-td auto-width>
          <q-checkbox v-model="props.selected" size="sm" dense :title="props.row.lineID" />
        </q-td>

        <q-td key="tipoComprobanteName" :props="props">
          {{ props.row.tipoComprobanteName }}
        </q-td>
        <q-td key="accAPnumeroDoc" :props="props">
          {{ props.row.accAPnumeroDoc }}
        </q-td>
        <q-td key="sustentoName" :props="props">
          {{ props.row.sustentoName }}
        </q-td>
        <q-td key="lineSubtotal" :props="props" :tabindex="(props.key*10)+2">
          {{ props.row.lineSubtotal.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="taxID" :props="props" :tabindex="(props.key*10)+3">
          <inlineSelectSearchable 
            labelSearchText="Buscar Retención"
            :optionsList="lookup_taxes"
            rowValueField="taxID" 
            optionsListLabel="short_name_es" optionsListCaption="name_es" optionDisableField="estado"
            optionLabelField="short_name_es"
            :isClearable="false"
            :isDense="true"
            :isDisable="false" 
            :isReadonly="true"
            :initialValue="props.row.taxID"
            :tableSearchColumns="[
                    { name: 'name_es', label: 'Retención', field: 'name_es', align: 'left'}
                    //,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
                ]"
            @onItemSelected="(row)=>{
                    //let impuesto = lookup_taxes.find(x=>x.taxID==row.taxID)
                    updateRow(row,'taxID',props.row)
                }"
            />
        </q-td>
         <q-td key="baseImponible" :props="props" :tabindex="(props.key*10)+4">
          <!--{{ props.row.baseImponible }}-->
          {{ props.row.baseImponible.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="valorRetenido" :props="props" :tabindex="(props.key*10)+5">
          <!--{{ props.row.valorRetenido }}-->
          {{ props.row.valorRetenido.toFixed(userMoneyFormat) }}
        </q-td>
      </q-tr>
    </template>
    <template v-slot:top >
        <q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Cuenta Contable':''" title="Cambiar Cuenta Contable a líneas seleccionadas" @click="isAccDialog=true" icon="fas fa-book" color="primary" no-caps class="q-ml-sm" :disable="selected.length<=0"/>
        <q-btn :label="$q.screen.gt.sm?'Cuenta Activo':''" title="Cambiar Cuenta Contable del Activo" icon="fas fa-handshake" color="primary" no-caps class="q-ml-sm" @click="isPartnerAccountDialog=true" />
        <!--<q-btn v-if="editMode==false" :label="$q.screen.gt.sm?'Cancelar':''" title="Cancelar líneas seleccionadas" @click="cancelRows" icon="fas fa-ban" color="primary" class="q-ml-sm" no-caps   :disable="selected.length<=0" />-->
        <q-space />
    </template>
  </q-table>



    <q-dialog v-model="isAccDialog" >
        <q-card style="minWidth: 900px;">
            <selectSearchable class="col-12"
                    prependIcon="fas fa-cash-register"
                    labelText="Cuenta del Impuesto (*)" labelSearchText="Buscar Cuenta Contable"
                    :optionsList="lookup_accounts"
                    rowValueField="value" optionLabelField="label" optionsListCaption="code_es" optionsListLabel="label" 
                    optionDisableField="estado"
                    :isRequired="true" 
                    :isDisable="false" 
                    :isReadonly="false"
                    
                    :tableSearchColumns="[
                        { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                        ,{ name: 'label', label: 'Cuenta Contable', field: 'label', align: 'left'}
                        ]"
                    @onItemSelected="(row)=>{
                            if(row){
                                this.selected.forEach(line => this.updateRow(row.value, 'tax_account_id', line) );
                            }
                            this.isAccDialog = false
                        }"
                    />
        </q-card>
    </q-dialog>

    <q-dialog v-model="isPartnerAccountDialog" >
        <q-card style="minWidth: 900px;">
        <selectSearchable class="col-12"
                prependIcon="fas fa-cash-register"
                labelText="Cuenta del Activo (*)" labelSearchText="Buscar Cuenta Contable"
                :optionsList="lookup_accounts"
                rowValueField="value" optionLabelField="label" optionsListCaption="code_es" optionsListLabel="label" 
                optionDisableField="estado"
                :isRequired="true" 
                :isDisable="false" 
                :isReadonly="false"
                :initialValue="partner_account_id"
                :tableSearchColumns="[
                    { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                    ,{ name: 'label', label: 'Cuenta Contable', field: 'label', align: 'left'}
                    ]"
                @onItemSelected="(row)=>{
                        this.partner_account_id=row.value;
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
import inlineSelectSearchable from '../../../components/selectSearchable/inlineSelectSearchable.vue'

export default ({
    components: {
        mainLookup: mainLookup
        ,selectSearchable:selectSearchable
        ,inlineSelectSearchable: inlineSelectSearchable
    },
    data () {
      return {
          moduleName: "accRet", filterString: '', selected: []
        ,isAccDialog: false, accDialogFilter: '', accDialogSelected: [], accDialogTableBusy: false
        ,isPrjDialog: false, prjDialogFilter: '', prjDialogSelected: [], prjDialogTableBusy: false, rootPrjIDSelected: null, prjIDSelected: null
        ,isSustentoDialog: false, sustentoDialogFilter: '', sustentoDialogSelected: [], sustentoDialogTableBusy: false
        ,isExpectedDialog: false, expectedDialogDate: ''
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
                newRows.find(x=>x.lineID==rowToUpdate.lineID).prjID = this.prjDialogSelected[0].value;
                let prjID = newRows.find(x=>x.lineID==rowToUpdate.lineID).prjID
                let prjName = prjID?this.lookup_prj.find(x => x.value == prjID).label:''
                newRows.find(x=>x.lineID==rowToUpdate.lineID).prjName = prjName
                this.lines = newRows
            })
            this.isPrjDialog = false
          }
          this.$emit('onAccMoveCompute')
        }
      },
      /*updateValues(selectedRows, lookupValueField, lookupLabelField){
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
      },*/
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
        let newRows = JSON.parse(JSON.stringify(this.lines))
        newRows.find(x=>x.lineID==row.lineID)[colName] = newVal
        this.lines = newRows
        this.$emit('onAccMoveCompute')
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
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'system', key: 'table_lines', value: val}) }
        },
        linesTaxes: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLinesTaxes', val) }
        },
        accountLines: {
            get () { return this.$store.state[this.moduleName].editData.linesTaxes },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAccountLines', val) }
        },
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
        partner_account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.partner_account_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partner_account_id', value: val}) }
        },
        lookup_items: {
            get () { return this.$store.state[this.moduleName].editData.lookup_items },
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
        lookup_taxes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_taxes },
        },
    }
})
</script>
