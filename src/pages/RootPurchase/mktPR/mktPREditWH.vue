<template>
<div style="margin: -16px;">
  <div class="q-pa-xs row justify-center q-gutter-lg q-mb-md">
    <!--Lines Count-->
    <q-card style="width: 100%; max-width: 200px; height: 150px;">
      <q-toolbar class="bg-primary text-white">
        <q-item>
          <q-item-section avatar>
            <q-icon color="white" name="fas fa-boxes" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Items</q-item-label>
          </q-item-section>
        </q-item>
      </q-toolbar>
      <q-card-section class="absolute-center text-primary q-mt-lg" style="fontSize: 100px; ">
        {{ lines.length }}
      </q-card-section>
    </q-card>

    <!--Cancels Count-->
    <q-card style="width: 100%; max-width: 200px; height: 150px;">
      <q-toolbar class="bg-red text-white">
        <q-item>
          <q-item-section avatar>
            <q-icon color="white" name="fas fa-ban" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Cancelaciones</q-item-label>
          </q-item-section>
        </q-item>
      </q-toolbar>
      <q-card-section class="absolute-center text-red q-mt-lg" style="fontSize: 100px; ">
        
        <!--{{lines.reduce((total,item)=>{return total + item.quantityCancel}, 0)}}-->
        {{lines.filter(x=>x.quantityCancel>0).length}}
      </q-card-section>
    </q-card>

     <!--Comprado Count-->
    <q-card style="width: 100%; max-width: 200px; height: 150px;">
      <q-toolbar class="bg-primary text-white">
        <q-item>
          <q-item-section avatar>
            <q-icon color="white" name="fas fa-shopping-bag" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Comprados</q-item-label>
          </q-item-section>
        </q-item>
      </q-toolbar>
      <q-card-section class="absolute-center text-primary q-mt-lg" style="fontSize: 100px; ">
        {{lines.filter(x=>x.quantityPurchased>0).length}}
      </q-card-section>
    </q-card>

    <!--Recevied Count-->
    <q-card style="width: 100%; max-width: 200px; height: 150px;">
      <q-toolbar class="bg-primary text-white">
        <q-item>
          <q-item-section avatar>
            <q-icon color="white" name="fas fa-warehouse" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Recepciones</q-item-label>
          </q-item-section>
        </q-item>
      </q-toolbar>
      <q-card-section class="absolute-center text-primary q-mt-lg" style="fontSize: 100px; ">
        {{lines.filter(x=>x.quantityRcvd>0).length}}
      </q-card-section>
    </q-card>

   
  </div>
  
  <q-separator />

  <q-list separator dense>
    <q-item v-for="row in lines" :key="row.lineID" clickable>
      <q-item-section side> 
        <q-item-label class="text-primary" style="max-width: 100px;">{{lookup_items.find(x=>x.value==row.invID).label}}</q-item-label> 
        <q-item-label caption>Cantidad: {{row.quantity}}</q-item-label> 
      </q-item-section>
      <q-item-section>
        <q-stepper :value="0" flat ref="stepper" color="primary" animated class="no-padding" >

          <q-step :name="1"
            :title="$q.screen.gt.sm?'Pedido':undefined" 
            :caption="$q.screen.gt.sm?(row.creation_date):undefined" 
            icon="fas fa-watch" done-icon="fas fa-plus" 
            :done="row.uploaded" />

          <q-step :name="2"
            :title="$q.screen.gt.sm?'Cancelado':undefined"
            :caption="$q.screen.gt.sm?(row.quantityCancel):undefined" 
            icon="fas fa-times" done-icon="fas fa-times"
            :done="(row.quantityCancel>0)" done-color="red" />

          <q-step :name="3"
            :title="$q.screen.gt.sm?'Comprado':undefined" 
            :caption="$q.screen.gt.sm?(row.quantityPurchased):undefined" 
            icon="fas fa-shopping-bag" done-icon="fas fa-shopping-bag"
            :done="row.quantityPurchased>0" />

          <q-step :name="4"
            :title="$q.screen.gt.sm?'Recibido':undefined" 
            :caption="$q.screen.gt.sm?(row.quantityRcvd):undefined" 
            icon="fas fa-warehouse" done-icon="fas fa-warehouse"
            :done="row.quantityRcvd>0" />




          <q-step :name="5"
            :title="$q.screen.gt.sm?'Finalizado':undefined" 
            :caption="$q.screen.gt.sm?(row.quantitymktPO):undefined" 
            icon="fas fa-check" done-icon="fas fa-check"
            :done="(row.uploaded&&!row.estado)" done-color="positive" />
          
        </q-stepper>
      </q-item-section>
    </q-item>
  </q-list>
  <q-separator />

</div>
</template>

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
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
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
        this.updateRow(false, 'estado', rowToUpdate)
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
