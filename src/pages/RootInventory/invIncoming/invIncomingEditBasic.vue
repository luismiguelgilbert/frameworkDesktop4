<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <!--partnerID-->
    <selectSearchable 
        prependIcon="fas fa-handshake"
        labelText="Proveedor/Cliente (*)" labelSearchText="Buscar Proveedor/Cliente"
        :optionsList="this.lookup_partners"
        rowValueField="value" optionsListLabel="label" optionsListCaption="partner_ruc"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        :initialValue="partnerID"
        :tableSearchColumns="[
                 { name: 'label', label: 'Proveedor', field: 'label', align: 'left'}
                ,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
                ,{ name: 'pendingOrders', label: 'Órdenes Pendientes', field: 'pendingOrders', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.partnerID=row.value;
                this.lines = []
                this.loadPendingInv()
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />
    <!--<q-input
        ref="partnerName" :readonly="!editMode"
        placeholder="Seleccione el Proveedor/Cliente (*)" label="Proveedor/Cliente (*)" filled
        :value="partnerName" 
        @keyup.keyCodes.113="openSearchPartner('partnerID','partnerName',partnerID)"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-handshake" /></template>
        <template v-if="editMode" v-slot:append><q-icon name="fas fa-search"  @click="openSearchPartner('partnerID','partnerName',partnerID)"/></template>
    </q-input>-->

    
    <q-select
        label="Bodega (*)" placeholder="Seleccione la Bodega donde está recibiendo los Items (*)" emit-value map-options filled
        :options="lookup_wh" 
        :option-disable="opt => !opt.estado" :readonly="!(partnerID>0&&editMode)"
        v-model="whID" @input="loadPendingInv()"
        ref="whID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-warehouse" /></template>
    </q-select>

    <q-input filled v-model="moveDate" mask="date" :rules="['date']" 
        placeholder="Fecha del Ingreso (*)" label="Fecha del Ingreso (*)" readonly>
      <template v-slot:prepend>
        <q-icon name="fas fa-calendar" class="cursor-pointer" />
      </template>
    </q-input>

    <q-select
        label="Tipo de Documento de Recepción (*)" placeholder="Seleccione el Tipo de Documento de Recepción (*)" emit-value map-options filled
        :options="lookup_invDocTypes" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :option-disable="opt => !opt.estado" 
        v-model="invDocTypeID"
        ref="invDocTypeID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-file-invoice" /></template>
    </q-select>

    
    <q-input class="q-mb-md"
        ref="invDocNumber" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el Número del Documento (*)" label="Número del Documento (*)" filled
        v-model="invDocNumber"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Ingreso" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />

    <br><br>

    <q-dialog v-model="isPartnerDialog">
        <mainLookup 
            titleBar="Seleccionar Proveedor"
            :data="this.lookup_partners"
            :dataRowKey="'value'"
            :selectionMode="'single'"
            :predefinedValue="mainLookupPredefinedValue"
            :columns="[
                    { name: 'label', required: true, label: 'Proveedor', align: 'left', field: row => row.label , sortable: false, style: 'min-width: 300px;' }
                    ,{ name: 'partner_ruc', required: true, label: 'Número de Identificación', align: 'left', field: row => row.partner_ruc , sortable: false, style: 'min-width: 100px; max-width: 100px;' }
                    ,{ name: 'pendingOrders', required: true, label: 'Órdenes Pendientes', align: 'left', field: row => row.pendingOrders , sortable: false, style: 'min-width: 100px; max-width: 100px;' }
                    
                    ]"
            @onCancel="isPartnerDialog=false"
            @onSelect="(selectedRows)=>{updateValues(selectedRows, 'value', 'label')}"
        />
    </q-dialog>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import mainLookup from '../../../components/mainLookup/mainLookup.vue'
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
    components: {
        mainLookup: mainLookup
        ,selectSearchable:selectSearchable
    },
    data () {
        return {
            moduleName: "invIncoming"
            ,isPartnerDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        openSearchPartner(UpdateFieldValueName, UpdateFieldLabelName, predefinedValue){
            if(this.editMode){
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
            this.lines = []
            this.loadPendingInv()
        },
        loadPendingInv(){
            if(this.whID>0&&this.partnerID>0){
                this.$q.loading.show()
                this.$axios({
                    method: 'GET',
                    url: this.apiURL + 'spInvKardexSelectPending',
                    headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
                    params: {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        userLanguage: 'es',
                        partnerID: this.partnerID,
                        whID: this.whID,
                        direction: 1,//1=Incoming || 0==Outgoing
                        editMode: this.editMode
                    }
                }).then((response) => {
                    this.lines = JSON.parse(response.data[0].lines)
                    this.lookup_lots = JSON.parse(response.data[0].lookup_lots)
                    this.lots = [];
                    //Build New lots
                    /*let newRows = [];
                    this.lines.filter(x=>x.systemType==4).map(x=>{
                        newRows.push({
                             lineID: x.lineID
                            ,invID: x.invID
                            ,invName: x.invName
                            ,whID: x.whID
                            ,maxQuantity: x.quantity
                            ,quantity: 0
                        })
                    })
                    this.lots = newRows;*/
                    this.$q.loading.hide()
                }).catch((error) => {
                    console.dir(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                    })
                    this.$q.loading.hide()
                })
            }
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
        partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerName', value: val}) }
        },
        moveDate: {
            get () { return this.$store.state[this.moduleName].editData.basic.moveDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'moveDate', value: val}) }
        },
        whID: {
            get () { return this.$store.state[this.moduleName].editData.basic.whID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'whID', value: val}) }
        },
        invDocTypeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.invDocTypeID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'invDocTypeID', value: val}) }
        },
        invDocNumber:  {
            get () { return this.$store.state[this.moduleName].editData.basic.invDocNumber },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'invDocNumber', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_partners: {
            get () { return this.$store.state[this.moduleName].editData.lookup_partners },
        },
        lookup_wh: {
            get () { return this.$store.state[this.moduleName].editData.lookup_wh },
        },
        lookup_invDocTypes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_invDocTypes },
        },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        lots: {
            get () { return this.$store.state[this.moduleName].editData.lots },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLots', val) }
        },
        lookup_lots: {
            get () { return this.$store.state[this.moduleName].editData.lookup_lots },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLookupLots', val) }
        },
    },
})
</script>
