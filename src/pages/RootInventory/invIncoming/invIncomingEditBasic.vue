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
        placeholder="Fecha del Ingreso (*)" label="Fecha del Ingreso (*)" readonly>
      <template v-slot:prepend>
        <q-icon name="fas fa-calendar" class="cursor-pointer" />
      </template>
    </q-input>

    <!-- :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" -->
    <q-select
        label="Tipo de Documento de Recepción (*)" placeholder="Seleccione el Tipo de Documento de Recepción (*)" emit-value map-options filled
        :options="lookup_invDocTypes" 
        :option-disable="opt => !opt.estado" 
        v-model="invDocTypeID"
        ref="invDocTypeID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-file-invoice" /></template>
    </q-select>

    <!-- :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" -->
    <q-input class="q-mb-md"
        ref="invDocNumber" 
        
        placeholder="Escriba el Número del Documento (*)" label="Número del Documento (*)" filled
        v-model="invDocNumber"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    
    <!-- :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)" -->
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Ingreso" filled
        type="textarea" 
        
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
    props: {
        moduleName: { type: String , required: true },
    },            
    components: {
        mainLookup: mainLookup
        ,selectSearchable:selectSearchable
    },
    data () {
        return {
            mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
        }
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
                        direction: 1,//1=Incoming || 0==Outgoing
                        editMode: this.editMode
                    }
                }).then((response) => {
                    this.accountLines = []
                    this.lines = []
                    this.lines = JSON.parse(response.data[0].lines)
                    this.lookup_lots = JSON.parse(response.data[0].lookup_lots)
                    this.lots = [];
                    //this.$emit('onAccMoveCompute')
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
        editStatus: {
          get () { return this.$store.state[this.moduleName].editStatus },
        },
        lines: {
          get () { return this.$store.state[this.moduleName].editData.lines },
          set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'lines', value: val}) }
        },
        accountLines: {
            get () { return this.$store.state[this.moduleName].editData.accountLines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'accountLines', value: val}) }
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
