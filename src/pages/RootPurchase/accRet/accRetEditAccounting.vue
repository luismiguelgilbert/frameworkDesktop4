<template>
<q-form>
    <div class="row q-col-gutter-xs">
      <q-input v-if="!editMode" class="col-sm-12 col-md-4"
          label="Asiento Contable #"  filled readonly
          v-model="accMoveID"
          >
          <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
      </q-input>
       <q-input v-if="!editMode" class="col-sm-12 col-md-4"
          label="Fecha del Asiento"  filled readonly
          v-model="moveDate"
          >
          <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
      </q-input>
      <q-input v-if="!editMode" class="col-sm-12 col-md-4"
          label="Tipo de Diario"  filled readonly
          v-model="journalName"
          >
          <template v-slot:prepend><q-icon name="fas fa-book" /></template>
      </q-input>
      
      
    </div>
    <br />
    
    <q-table
        ref="mainTable"
        :data="accMoveGrouped?accountLinesGrouped:accountLines"
        :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
        :table-style="editMode?'min-height: calc(100vh - 255px); max-height: calc(100vh - 255px)':'min-height: calc(100vh - 335px); max-height: calc(100vh - 335px)'"
        row-key="accLineID"
        hide-bottom
        :rows-per-page-options="[0]"
        dense
        selection="none" :selected.sync="selected"
        :filter="filterString"
        :columns="[
          //{ name: 'stockID', required: true, label: 'ID', align: 'left', field: row => row.stockID, sortable: true },
          //{ name: 'lineID', required: true, label: 'línea', align: 'right', field: row => row.lineID, sortable: false, style: 'min-width: 150px;' },
          { name: 'accountID', required: true, label: 'Cuenta Contable', align: 'left', field: row => row.accountID, sortable: true, style: 'min-width: 100px;' },
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
      <q-tr :props="props" v-if="props.row.accountID>0" >
        <q-td key="accountID" :props="props" :tabindex="(props.key*10)+1" >
          {{lookup_accounts.find(x=>x.value==props.row.accountID).code_es}} - {{lookup_accounts.find(x=>x.value==props.row.accountID).label}}
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
          
        </q-tr>
    </template>

    <!--<template v-slot:top >
      <q-space />
      <q-input borderless dense v-model="filterString" placeholder="Buscar...">
        <template v-slot:append>
          <q-icon :name="filterString?'fas fa-times':'fas fa-search'" @click="filterString?filterString='':undefined" />
        </template>
      </q-input>
    </template>
    -->
  </q-table>
</q-form>

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
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
  components: {
        selectSearchable: selectSearchable
    },
    data () {
        return {
            moduleName: "accRet"
            ,selected: []
            ,row_id: 32	/*32=casClientes*/, filterString: '', dialogVisible: false
            ,accMoveGrouped: true
        }
    },
    methods:{
      rowTitleInventory(fila){
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
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userColor: { get () { return this.$store.state.main.userColor }  },
        userDateFormat: { get () { return this.$store.state.main.userDateFormat=='dddd, dd MMMM yyyy'?'dddd, DD MMMM YYYY':this.$store.state.main.userDateFormat.toUpperCase() }  },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
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
        accountLinesGrouped:{
            get () { 
              let resultado = [];
              this.accountLines.map(x=>{
                if(resultado.some(y=>y.accountID==x.accountID)){
                  resultado.find(y=>y.accountID==x.accountID).debit += x.debit
                  resultado.find(y=>y.accountID==x.accountID).credit += x.credit
                }else{
                  resultado.push({
                     accountID: x.accountID
                    ,debit: x.debit
                    ,credit: x.credit 
                  })
                }
              })
              return resultado;
            }
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
        sys_user_color: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_color },
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
    }
})
</script>
