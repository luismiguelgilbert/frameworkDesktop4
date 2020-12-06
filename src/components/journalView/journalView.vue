<template>
<div>
    <div class="row q-col-gutter-xs">
        <q-input class="col-sm-12 col-md-4"
            label="Asiento Contable #"  filled readonly
            :value="accountHeader.accMoveID"
            >
                <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
        </q-input>
        <q-input class="col-sm-12 col-md-4" 
            label="Fecha del Asiento (aaaa/mm/dd)"  filled readonly
            :value="accountHeader.accMoveDateNew" :title="showDateName(accountHeader.accMoveDateNew)"
            >
                <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
                <template v-slot:append v-if="accountHeader.accMoveDate&&accountHeader.accMoveDateNew!=accountHeader.accMoveDate"><q-icon name="fas fa-edit" color="red" :title="`Modificado \n Fecha Original: ${accountHeader.accMoveDate}`" /></template>
        </q-input>
      <q-input class="col-sm-12 col-md-4"
          label="Tipo de Diario"  filled readonly
          v-model="accountHeader.journalName"
          >
            <template v-slot:prepend><q-icon name="fas fa-book" /></template>
      </q-input>
    </div>
    <br />
    <q-table
        ref="mainTable"
        :data="accMoveGrouped?accountLinesGrouped:accountLines"
        :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
        table-style="min-height: calc(100vh - 305px); max-height: calc(100vh - 305px)"
        row-key="lineID"
        hide-bottom
        :separator="userTableLines"
        :rows-per-page-options="[0]"
        dense
        :filter="filterString"
        :columns="[
          //{ name: 'stockID', required: true, label: 'ID', align: 'left', field: row => row.stockID, sortable: true },
          //{ name: 'lineID', required: true, label: 'línea', align: 'right', field: row => row.lineID, sortable: false, style: 'min-width: 150px;' },
          { name: 'account_id', required: true, label: 'Cuenta Contable', align: 'left', field: row => row.account_id, sortable: true, style: 'min-width: 100px;' },
          { name: 'debit', required: true, label: 'DEBE', align: 'right', field: row => row.debit, sortable: true, style: 'min-width: 200px;' },
          { name: 'credit', required: true, label: 'HABER', align: 'right', field: row => row.credit, sortable: true, style: 'max-width: 70px;', headerStyle: 'padding-right: 20px;' },
          { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true, headerStyle: 'padding-right: 20px;' },
          
          //{ name: 'whID', required: true, label: 'Bodega', align: 'right', field: row => row.whID, sortable: true },
          //{ name: 'prjID', required: true, label: 'Centro de Costo?', align: 'right', field: row => row.prjID, sortable: true },
          //{ name: 'transportTypeID', required: true, label: 'Entrega?', align: 'right', field: row => row.transportTypeID, sortable: true },
        ]"
    >
    <template v-slot:top>
      <div class="q-table__title">Detalle Contable</div>
      <q-space />
      <q-toggle v-model="accMoveGrouped" class="text-right" color="primary" label="Agrupado por Cuenta?" />
    </template>

    <template v-slot:body="props">
      <q-tr :props="props" v-if="props.row.account_id>0" >
        <q-td key="account_id" :props="props" :tabindex="(props.key*10)+1" >
          {{lookup_accounts.find(x=>x.value==props.row.account_id).code_es}} - {{lookup_accounts.find(x=>x.value==props.row.account_id).label}}
        </q-td>
        <q-td key="debit" :props="props" >
          {{ props.row.debit.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="credit" :props="props" >
          {{ props.row.credit.toFixed(userMoneyFormat) }}
        </q-td>
        <q-td key="comments" :props="props" >
          {{ props.row.comments }}
        </q-td>
      </q-tr>
    </template>

    <template v-slot:bottom-row>
        <q-tr>
          <q-td class="text-right text-subtitle2 text-primary" >
            Suma:
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            {{accountLines.reduce((total,item)=>{return total + item.debit}, 0).toFixed(userMoneyFormat)}}
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
            {{accountLines.reduce((total,item)=>{return total + item.credit}, 0).toFixed(userMoneyFormat)}}
          </q-td>
          <q-td class="text-right text-subtitle2 text-primary">
          </q-td>
        </q-tr>
        <q-tr></q-tr>
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
    props: {
        moduleName: { type: String, required: true },
        accountHeader: { type: Object, required: true },
        accountLines: { type: Array, required: true },
    },
    data () {
        return {
            filterString: '', accMoveGrouped: true
        }
    },
    methods:{
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
        },
        accountLinesComputed(){
            let resultado = []
            console.dir('calcular accountLinesComputed con ' + this.accMoveGrouped)
            return this.accMoveGrouped?this.accountLines:this.accountLinesGrouped
        }
      /*rowTitleInventory(fila){
        let resultado = 'Seleccionar...'
        let target = null
        if(fila&&fila.invID&&fila.invID>0){
          try{
            target = this.lines.find(x=>x.invID == fila.invID)
            resultado = 'Código: ' + target.internal_code + ' || Tipo: ' + target.groupName + ' || Unidad: ' + target.uomName + ' || Marca: ' + target.brandName
          }catch(ex){}
        }
        return resultado
      },
      receiveAll(){
        let newRows = JSON.parse(JSON.stringify(this.lines))
        this.selected.map(x=>{
          if(newRows.some(y=>y.stockID==x.stockID)){ //para aplicar solamente a los items seleccionados
            newRows.find(y=>y.stockID==x.stockID).['newQuantity']=x.quantityOpen
          }
          return x
        })
        this.lines = newRows
      },
      clearAll(){
        let newRows = JSON.parse(JSON.stringify(this.lines))
        this.selected.map(x=>{
          newRows.find(y=>y.stockID==x.stockID).['newQuantity']=0
          return x
        })
        this.lines = newRows
      },
      updateRow(newVal, colName, row){
        try{
          //Actualiza las líneas
          let newRows = JSON.parse(JSON.stringify(this.lines))
          newRows.find(x=>x.stockID==row.stockID)[colName] = newVal;
          this.lines = newRows
        }catch(ex){
          console.error(ex)
        }
      },
      */
    },
    computed:{
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        accountLinesGrouped:{
            get () { 
              let resultado = [];
              this.accountLines.map(x=>{
                if(resultado.some(y=>y.account_id==x.account_id)){
                  resultado.find(y=>y.account_id==x.account_id).debit += x.debit
                  resultado.find(y=>y.account_id==x.account_id).credit += x.credit
                }else{
                  resultado.push({
                     account_id: x.account_id
                    ,debit: x.debit
                    ,credit: x.credit 
                  })
                }
              })
              return resultado;
            }
        },
        /*
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        
        
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        serverFilesPath: { get () { return this.$q.sessionStorage.getItem('serverFilesPath') } },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        accountLines: {
            get () { return this.$store.state[this.moduleName].editData.accountLines },
            //set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        accMoveID: {
            get () { 
              let resultado = 0;
              try{
                resultado = this.$store.state[this.moduleName].editData.accountLines[0].accMoveID
              }catch(ex){}
              return resultado;
            }
        },
        moveDate: {
            get () { 
              let resultado = '';
              try{
                resultado = this.$store.state[this.moduleName].editData.accountLines[0].moveDate
              }catch(ex){}
              return resultado;
            }
        },
        
        journalName: {
            get () { 
              let resultado = '';
              try{
                resultado = this.$store.state[this.moduleName].editData.accountLines[0].journalName
              }catch(ex){}
              return resultado;
            }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
        partner_account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.partner_account_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partner_account_id', value: val}) }
        },
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        */
    },
    /*watch: { 
        accountMove: function(newVal, oldVal) { // update component display value when changed happend from outside component (e.g. programatically)
            console.dir('component data has changed')
            this.componentData=newVal
        }
    }*/
})
</script>
