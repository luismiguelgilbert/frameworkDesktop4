<template>
<q-form ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div>
      <q-toggle
        v-model="estado" color="positive" label="Estado" icon="fas fa-check" :disable="true"
        />
    </div>

    <!--partnerID-->
    <selectSearchable 
        prependIcon="fas fa-handshake"
        labelText="Proveedor (*)" labelSearchText="Buscar Proveedor"
        :optionsList="this.lookup_partners"
        rowValueField="value" optionsListLabel="label" optionsListCaption="partner_ruc"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        :initialValue="partnerID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Proveedor', field: 'label', align: 'left'}
                ,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.partnerID=row.value;
                this.partnerName=row.label;
                this.partner_account_id=row.account_id
            }"
        />
    
    <!--<q-input
        ref="partnerName" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        placeholder="Seleccione el Proveedor (*)" label="Proveedor (*)" filled
        :value="partnerName"
        @keyup.keyCodes.113="openSearchPartner('partnerID','partnerName',partnerID)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-handshake" /></template>
        <template v-slot:append><q-icon name="fas fa-search" @click="openSearchPartner('partnerID','partnerName',partnerID)"/></template>
    </q-input>-->

    <q-select
        label="Usuario que Pide (*)" placeholder="Seleccione el usuario (*)" emit-value map-options filled
        :options="lookup_users" :readonly="true"
        v-model="headerUser"
        ref="headerUser"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="far fa-user" /></template>
    </q-select>
    <q-select
        label="Bodega de Destino Predeterminada (*)" placeholder="Seleccione la bodega predeterminada donde desea recibir los ítems (*)" emit-value map-options filled
        :options="lookup_wh" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        :option-disable="opt => !opt.estado"
        v-model="defaultWhID"
        ref="defaultWhID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-warehouse" /></template>
    </q-select>
    <q-select
        label="Tipo de Entrega Predeterminada" placeholder="Seleccione el Tipo Predeterminado de Entrega de los Ítems" emit-value map-options filled
        :options="lookup_transports" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        :option-disable="opt => !opt.estado" clearable
        v-model="defaultTransportID"
        ref="defaultTransportID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-truck" /></template>
    </q-select>
    
    <q-input
        ref="headerDate" :readonly="true"
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha de Pedido" label="Fecha de Pedido" filled
        v-model="headerDate" :title="dateName(headerDate)"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
              <q-date v-model="headerDate" :readonly="true" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
    </q-input>
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Pedido" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />
    <br><br>

    <q-dialog v-model="isPartnerDialog">
        <mainLookup 
            titleBar="Buscar Proveedor"
            :data="this.lookup_partners"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :predefinedValue="mainLookupPredefinedValue"
            :columns="[
                     { name: 'label', required: true, label: 'Proveedor', align: 'left', field: row => row.label , sortable: false, style: 'min-width: 300px;' }
                    ,{ name: 'partner_ruc', required: true, label: 'Número de Identificación', align: 'left', field: row => row.partner_ruc , sortable: false, style: 'min-width: 100px;' }
                    //,{ name: 'estado', required: true, label: 'Estado', align: 'left', field: row => row.estado, sortable: false, style: 'max-width: 75px;', }
                    ]"
            
            @onCancel="isPartnerDialog=false"
            @onSelect="(selectedRows)=>{updateValues(selectedRows, 'value', 'label')}"
        /><!--boldIfChildrenFielname="account_has_children"-->
    </q-dialog>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import mainLookup from '../../../components/mainLookup/mainLookup.vue'
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    props: {
      moduleName: { type: String , required: true },
    },
    components: {
        mainLookup: mainLookup
        ,selectSearchable:selectSearchable
    },
    data () {
        return {
            isPartnerDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null, 
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            }
            )
        },
        openSearchPartner(UpdateFieldValueName, UpdateFieldLabelName, predefinedValue){
            if(this.editMode==true){
                this.mainLookupUpdateFieldValueName = UpdateFieldValueName
                this.mainLookupUpdateFieldLabelName = UpdateFieldLabelName
                this.mainLookupPredefinedValue = predefinedValue
                this.isPartnerDialog = true
            }
            
        },
        updateValues(selectedRows, lookupValueField, lookupLabelField){
            this[this.mainLookupUpdateFieldValueName] = selectedRows[0][lookupValueField];
            this[this.mainLookupUpdateFieldLabelName] = selectedRows[0][lookupLabelField];
            this.isPartnerDialog = false
        },

    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        headerUser: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerUser },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerUser', value: val}) }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
        partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerName', value: val}) }
        },
        defaultWhID: {
            get () { return this.$store.state[this.moduleName].editData.basic.defaultWhID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'defaultWhID', value: val}) }
        },
        defaultTransportID: {
            get () { return this.$store.state[this.moduleName].editData.basic.defaultTransportID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'defaultTransportID', value: val}) }
        },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        headerDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerDate', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },
        lookup_wh: {
            get () { return this.$store.state[this.moduleName].editData.lookup_wh },
        },
        lookup_transports: {
            get () { return this.$store.state[this.moduleName].editData.lookup_transports },
        },
        lookup_partners: {
            get () { return this.$store.state[this.moduleName].editData.lookup_partners },
        },
    },
})
</script>
