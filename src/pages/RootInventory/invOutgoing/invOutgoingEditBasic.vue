<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <!--partnerID-->
    <selectSearchable 
        prependIcon="fas fa-handshake"
        labelText="Proveedor/Cliente (*)" labelSearchText="Buscar Proveedor/Cliente"
        :optionsList="this.lookup_partners"
        rowValueField="value" optionsListLabel="label" optionsListCaption="partner_ruc"
        :isRequired="(editMode?true:false)" :allowZeroValue="true"
        :class="(editMode?undefined:'q-pb-md')"
        :isDisable="false" 
        :initialValue="partnerID"
        :isReadonly="editStatus.editMode=='edit'"
        :tableSearchColumns="[
                 { name: 'label', label: 'Proveedor', field: 'label', align: 'left'}
                ,{ name: 'partner_ruc', label: '# Identificación', field: 'partner_ruc', align: 'left'}
                ,{ name: 'pendingOrders', label: 'Órdenes Pendientes', field: 'pendingOrders', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.partnerID=row.value;
                //this.lines = []
                //this.$emit('onAccMoveCompute')
                this.loadPendingInv()
                //this.partnerName=row.label;
                //this.partner_account_id=row.account_id
            }"
        />
    <q-select
        label="Bodega (*)" placeholder="Seleccione la Bodega donde está recibiendo los Items (*)" emit-value map-options filled
        :options="lookup_wh" 
        :option-disable="opt => !opt.estado" 
        :readonly="editStatus.editMode=='edit'||editStatus.editMode=='create'&&!(partnerID>=0)"
        v-model="whID" @input="loadPendingInv()"
        ref="whID"
        :rules="[
                val => val!= null || '* Requerido',
                val => val>0      || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-warehouse" /></template>
    </q-select>

    <q-input filled v-model="moveDate" mask="date" :rules="['date']" 
        placeholder="Fecha del Egreso (*)" label="Fecha del Egreso (*)" readonly>
      <template v-slot:prepend>
        <q-icon name="fas fa-calendar" class="cursor-pointer" />
      </template>
    </q-input>

    <q-select
        label="Tipo de Documento de Entrega(*)" placeholder="Seleccione el Tipo de Documento con el que se entrega (*)" emit-value map-options filled
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

    <q-select
        label="Establecimiento (*)" placeholder="Seleccione el Establecimiento correspondiente al despacho los Items (*)" emit-value map-options filled
        :options="lookup_establecimientos" 
        :option-disable="opt => !opt.estado" :readonly="!(partnerID>=0&&editMode)"
        v-model="sys_location_id"
        ref="sys_location_id" @input="sys_location_pos_id=null"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-store" /></template>
    </q-select>
    
    <q-select
        label="Punto de Emisión (*)" placeholder="Seleccione el Punto de Emisión correspondiente al despacho los Items (*)" emit-value map-options filled
        :options="sys_location_id>0?lookup_pos.filter(x=>x.sys_location_id==sys_location_id):[]"
        :option-disable="opt => !opt.estado" :readonly="!(partnerID>=0&&editMode)"
        v-model="sys_location_pos_id"
        ref="sys_location_pos_id"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-cash-register" /></template>
    </q-select>
    
    <q-input class="q-mb-md"
        ref="invDocNumber" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Escriba el Número de Secuencia del Documento (*)" label="Número de Secuencia del Documento (*)" filled
        v-model="invDocNumber" :disable="sys_location_pos_id>0?lookup_pos.find(x=>x.sys_location_id==sys_location_id&&x.value==sys_location_pos_id).esElectronica:true"
        mask="#########" unmasked-value
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Ingreso" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />

    <br><br>

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
            moduleName: "invOutgoing"
            ,mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
        loadPendingInv(){
            if(this.whID>0&&this.partnerID>=0){
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
                        direction: 0,//1=Incoming || 0==Outgoing
                        editMode: this.editMode
                    }
                }).then((response) => {
                    this.lines = JSON.parse(response.data[0].lines)
                    this.lookup_lots = JSON.parse(response.data[0].lookup_lots)
                    this.lots = [];
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
        console: () => console,
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        allow_view: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_view').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_edit: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_edit').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_insert: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_insert').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_report: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_report').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_disable: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_disable').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
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
        sys_location_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_location_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_location_id', value: val}) }
        },
        sys_location_pos_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_location_pos_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_location_pos_id', value: val}) }
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
        lookup_establecimientos: {
            get () { return this.$store.state[this.moduleName].editData.lookup_establecimientos },
        },
        lookup_pos: {
            get () { return this.$store.state[this.moduleName].editData.lookup_pos },
        },
        editStatus: {
          get () { return this.$store.state[this.moduleName].editStatus },
        },
        lines: {
          get () { return this.$store.state[this.moduleName].editData.lines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
        },
        lots: {
          get () { return this.$store.state[this.moduleName].editData.lots },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lots', value: val}) }
        },
        lookup_lots: {
          get () { return this.$store.state[this.moduleName].editData.lookup_lots },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lookup_lots', value: val}) }
        },
    },
})
</script>
