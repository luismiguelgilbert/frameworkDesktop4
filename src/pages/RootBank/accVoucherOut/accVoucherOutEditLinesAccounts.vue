<template>
<div>
    <q-table
            ref="mainTable"
            :data="lines"
            :class="userColor=='blackDark'?'col-12 my-sticky-header-usercompany-dark bg-grey-10 ':'col-12 my-sticky-header-usercompany'"
            table-style="min-height: calc(100vh - 230px); max-height: calc(100vh - 230px)"
            row-key="lineID"
            :separator="userTableLines"
            :rows-per-page-options="[0]"
            hide-bottom dense
            selection="multiple" :selected.sync="selected"
            :filter="filterString"
            :columns="[
            //{ name: 'lineID', required: true, label: 'ID', align: 'left', field: row => row.lineID, sortable: true },
            { name: 'account_id', required: true, label: 'Cuenta Conable', align: 'left', field: row => row.account_id, sortable: true, style: 'min-width: 300px;' },
            { name: 'amount', required: true, label: 'Monto', align: 'right', field: row => row.amount, sortable: true, style: 'max-width: 100px;', headerStyle: 'padding-right: 20px;' },
            { name: 'comments', required: true, label: 'Comentario', align: 'left', field: row => row.comments, sortable: true },
            { name: 'prjID', required: true, label: 'Obra/Proyecto', align: 'left', field: row => row.prjID, sortable: true },
            //{ name: 'whID', required: true, label: 'Bodega', align: 'right', field: row => row.whID, sortable: true },
            //{ name: 'prjID', required: true, label: 'Centro de Costo?', align: 'right', field: row => row.prjID, sortable: true },
            //{ name: 'transportTypeID', required: true, label: 'Entrega?', align: 'right', field: row => row.transportTypeID, sortable: true },
            ]"
        >

        <template v-slot:body="props">
        <q-tr :props="props" >
            <q-td auto-width>
                <q-checkbox v-model="props.selected" size="md" dense :title="props.row.lineID" />
            </q-td>
            <!--<q-td key="lineID" :props="props">
                {{props.row.lineID}}
            </q-td>-->
            <q-td key="account_id" :props="props">
                {{lookup_accounts.filter(x=>x.value==props.row.account_id).map(y => {return y.code_es + " - " + y.label}).join("")}}
            </q-td>
            <q-td key="amount" :props="props" class="no-padding" :tabindex="(props.key*10)+2">
                <q-input class="no-padding" style="height: 20px !important;"
                    :value="props.row.amount" type="number" :min="0" :readonly="(editMode==false)"
                    dense item-aligned borderless input-class="text-right"
                    :rules="[val => parseFloat(val)>=0 || 'Requerido']"
                    debounce="1000" @input="(value)=>{updateRow(value,'amount',props.row)}" />
            </q-td>
            <q-td key="comments" :props="props">
                <q-input class="no-padding" style="height: 20px !important;"
                    :value="props.row.comments" debounce="1000"
                    dense item-aligned borderless
                    @input="(value)=>{updateRow(value,'comments',props.row)}" />
            </q-td>
            <q-td key="prjID" :props="props">{{ props.row.prjName }}</q-td>
        </q-tr>
        </template>
        <template v-slot:top >
            <q-btn :label="$q.screen.gt.sm?'Agregar':''" title="Agregar Cuenta" @click="()=>{isItemsBatchDialog=true}" icon="fas fa-plus" color="primary"  no-caps />
            <q-btn :label="$q.screen.gt.sm?'Quitar':''" title="Quitar líneas seleccionadas" @click="removeRows" icon="fas fa-trash-alt" color="primary" class="q-ml-md"  no-caps />
            <q-btn :label="$q.screen.gt.sm?'Centro de Costos':''" title="Cambiar Centro de Costo a líneas seleccionadas" @click="isPrjDialog=true" icon="bookmarks" color="primary" class="q-ml-md" no-caps :disable="selected.length<=0" />
            <!--<q-btn v-if="editMode==true" :label="$q.screen.gt.sm?'Buscar':''" title="Agregar Varios Servicios" @click="addBatch" icon="fas fa-search-plus" color="primary" no-caps  class="q-ml-sm"/>-->
            
        </template>
        <template v-slot:bottom-row>
            <q-tr>
                <q-td class="text-right text-subtitle2 text-primary">
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary" >
                    Suma:
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary">
                    {{lines.reduce((total,item)=>{return total + item.amount}, 0).toFixed(userMoneyFormat)}}
                </q-td>
                <q-td class="text-right text-subtitle2 text-primary">
                </q-td>
                <q-td></q-td>
            </q-tr>
            <q-tr></q-tr>
        </template>
    </q-table>

    <q-dialog v-model="isItemsBatchDialog" >
        <q-card style="minWidth: 900px;">
            <selectSearchable class="col-12"
                prependIcon="account_tree" autofocus
                labelText="Cuenta Contable (*)" labelSearchText="Buscar Cuenta Contable"
                :optionsList="lookup_accounts"
                rowValueField="value" optionLabelField="label" optionsListCaption="code_es" optionsListLabel="label" 
                optionDisableField="estado"
                :isRequired="false" 
                :isDisable="false" 
                :isReadonly="false"
                
                :tableSearchColumns="[
                    { name: 'code_es', label: 'Código', field: 'code_es', align: 'left'}
                    ,{ name: 'label', label: 'Cuenta Contable', field: 'label', align: 'left'}
                    ]"
                @onItemSelected="(row)=>{
                    this.addRow(row)
                        /*if(row){
                            this.selected.forEach(line => this.updateRow(row.value, 'account_id', line) );
                        }
                        this.isAccDialog = false*/
                    }"
            />
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
                :options="lookup_prj.filter(x=>x.parent==null&&x.estado)" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
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

</div>
</template>
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
             moduleName: "accVoucherOut"
            ,selected: [], filterString: ''
            ,isItemsBatchDialog: false, itemsBatchDialogTableBusy: false, itemsBatchDialogFilter: '', itemsBatchDialogSelected: []
            ,isPrjDialog: false, prjDialogFilter: '', prjDialogSelected: [], prjDialogTableBusy: false, rootPrjIDSelected: null, prjIDSelected: null
            //,isPartnerDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            //,xmlFile: null
            ,myQDateLocale: {
                /* starting with Sunday */
                days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
                daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
                months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
                monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
                firstDayOfWeek: 1
            }
        }
    },
    mounted(){
        //this.$refs.formulario.validate()
    },
    methods:{
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            }
            )
        },
        updateRow(newVal, colName, row){
        try{
          this.$q.loading.show()
          let newRows = JSON.parse(JSON.stringify(this.lines))
          newRows.filter(x=>x.lineID==row.lineID).map(result=>{
            if(colName=="amount"){
              result[colName] = parseFloat(newVal);
            }else{
              result[colName] = newVal;
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
        getMax(arr, prop) {
            var max;
            for (var i=0 ; i<arr.length ; i++) {
                if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
                    max = arr[i];
            }
            return max;
        },
        addRow(row){
            try{
                this.$q.loading.show()
                let newLineID = 0
                if(this.lines.length > 0){
                    let temp = this.getMax(this.lines, "lineID");
                    newLineID = parseInt(temp.lineID);
                }
                let newRows = JSON.parse(JSON.stringify(this.lines))
                newLineID++;
                let nuevaFila = {
                    lineID: newLineID//
                    ,account_id: row.value//
                    ,amount: 0//
                    ,comments: ''//
                    ,prjID: 0//
                }
                newRows.push(nuevaFila)
                
                this.lines = newRows
                this.isItemsBatchDialog=false;
                this.$q.loading.hide()
                this.$emit('onAccMoveCompute')
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
                        //.prjID = this.prjDialogSelected[0].value;
                        this.lines = newRows
                    })
                    this.isPrjDialog = false
                }
                this.$emit('onAccMoveCompute')
            }
        },
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userCompanies: { get () { return this.$store.state.main.userCompanies } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        userTableLines: { get () { return this.$store.state.main.userTableLines } },
        userMoneyFormat: { get () { return this.$store.state.main.userMoneyFormat }  },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        isAccount: {
            get () { return this.$store.state[this.moduleName].editData.basic.isAccount },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'isAccount', value: val}) }
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        lookup_accounts: {
            get () { return this.$store.state[this.moduleName].editData.lookup_accounts },
        },
        lookup_prj: {
            get () { return this.$store.state[this.moduleName].editData.lookup_prj },
        },
        
    },
})
</script>
