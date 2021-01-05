<template>
<q-form ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
        <q-toggle class="col-12 col-md-4"
            v-model="estado" icon="fas fa-check" color="positive" label="Estado" disable
            />
        <q-toggle class="col-12 col-md-4"
            v-model="voided" icon="fas fa-ban" color="red" label="Anulado?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
            />
        <!--<q-btn label="pruebas" @click="openPartnerCreate" />-->
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
                this.partner_account_id=row.account_id;//se usa en asiento contable
                this.partnerName=row.label;
                this.lines = [];
                this.$emit('onAccMoveCompute')
                this.loadPendingInvoices();
            }"
        />

    
    <selectSearchable 
        prependIcon="fas fa-store"
        labelText="Establecimiento (*)" labelSearchText="Buscar Establecimiento"
        :optionsList="this.lookup_establecimientos"
        rowValueField="value" optionsListLabel="label" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        :initialValue="sys_location_id"
        :tableSearchColumns="[
                 { name: 'label', label: 'Establecimiento', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.sys_location_id=row.value;
                this.sys_location_pos_id=null;
                this.numeroDoc='000000000';
            }"
        />

    <selectSearchable 
        prependIcon="fas fa-cash-register"
        labelText="Punto de Emisión (*)" labelSearchText="Buscar Punto de Emisión"
        :optionsList="sys_location_id>0?lookup_pos.filter(x=>x.sys_location_id==this.sys_location_id):[]"
        rowValueField="value" optionsListLabel="label" optionDisableField="estado"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        :initialValue="sys_location_pos_id"
        :tableSearchColumns="[
                 { name: 'label', label: 'Punto de Emisión', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.sys_location_pos_id=row.value;
                if(row.value){
                    if(this.lookup_pos.some(x=>x.sys_location_id==this.sys_location_id&&x.value==this.sys_location_pos_id)){
                        if(!(this.lookup_pos.find(x=>x.sys_location_id==this.sys_location_id&&x.value==this.sys_location_pos_id).esElectronica)){
                            this.ambiente = 2
                            this.autorizacionDoc='0';
                        }else{
                            this.autorizacionDoc='0000000000000000000000000000000000000000000000000';
                        }
                    }
                }
                //this.ambiente='000000000';
            }"
        />
    
    
    <q-input
        ref="numeroDoc"
        placeholder="Ingrese el Número del Documento (*)" label="Número del Documento (*)" filled
        v-model="numeroDoc" counter
        mask="#########" unmasked-value
        :readonly="sys_location_id&&sys_location_pos_id?lookup_pos.filter(x=>x.sys_location_id==sys_location_id && x.value==sys_location_pos_id)[0].esElectronica:false"
        :rules="[
                val => !!val || '* Requerido',
                val => val.length == 9  || '* Secuencial debe ser de 9 dígitos',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    <selectSearchable 
        prependIcon="fas fa-flask"
        labelText="Ambiente (*)" labelSearchText="Buscar Ambiente"
        :optionsList="lookup_ambientes"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="sys_location_id&&sys_location_pos_id?!(lookup_pos.filter(x=>x.sys_location_id==sys_location_id && x.value==sys_location_pos_id)[0].esElectronica):true"
        :initialValue="ambiente"
        :tableSearchColumns="[
                 { name: 'label', label: 'Punto de Emisión', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.ambiente=row.value;
            }"
        />
    
    <!--
        :readonly="sys_location_id&&sys_location_pos_id?lookup_pos.filter(x=>x.sys_location_id==sys_location_id && x.value==sys_location_pos_id)[0].esElectronica:false"
    -->
    <q-input
        ref="headerDate" 
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha de Retención (aaaa/mm/dd)" label="Fecha de Retención (aaaa/mm/dd) (*)" filled
        v-model="headerDate" :title="dateName(headerDate)"
        :readonly="sys_location_id&&sys_location_pos_id?lookup_pos.filter(x=>x.sys_location_id==sys_location_id && x.value==sys_location_pos_id)[0].esElectronica:false"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
              <q-date :locale="myQDateLocale" minimal v-model="headerDate" 
                :readonly="sys_location_id&&sys_location_pos_id?lookup_pos.filter(x=>x.sys_location_id==sys_location_id && x.value==sys_location_pos_id)[0].esElectronica:false" >
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
        ref="autorizacionDoc"
        placeholder="Ingreso el Número de Autorización del Documento (*)" label="Número de Autorización (*)" filled
        v-model="autorizacionDoc" counter
        mask="##################################################"
        :readonly="sys_location_id&&sys_location_pos_id?lookup_pos.filter(x=>x.sys_location_id==sys_location_id && x.value==sys_location_pos_id)[0].esElectronica:false"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-check" /></template>
    </q-input>
    
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Pedido" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />
    <br><br>
    

</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import mainLookup from '../../../components/mainLookup/mainLookup.vue'
import xml2js from 'xml2js'


export default ({
    components: {
        mainLookup: mainLookup
        ,selectSearchable: selectSearchable
        ,partnersEdit: () => import('../../../pages/RootMaster/Partners/PartnersEdit.vue')
    },
    data () {
        return {
            moduleName: "accRet"
            ,isPartnerDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,xmlFile: null
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
        openPartnerCreate(){
            let editRecord = {value: 0, row: null};
            let editMode = true;
            this.$store.commit('Partners/updateState', {key: 'editMode', value: editMode})
            this.$store.commit('Partners/updateState', {key: 'editRecord', value: editRecord})
            
            
            
            let security = JSON.parse('[{"label":"allow_view","value":true},{"label":"allow_edit","value":true},{"label":"allow_insert","value":true},{"label":"allow_report","value":true},{"label":"allow_disable","value":true},{"label":"allow_accounting","value":true}]')
            //this.security = JSON.parse(response.data[0].security)
            this.$store.commit('Partners/updateState', {key: 'security', value: security})

            this.isPartnerDialog = true
        },
        loadPendingInvoices(){
            this.$q.loading.show()
            this.$axios({
            method: 'GET',
            url: this.apiURL + 'spAccRETSelectPendingInvoices',
            headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') },
            params: {
                userCode: this.userCode,
                userCompany: this.userCompany,
                userLanguage: 'es',
                partnerID: this.partnerID
            }
        }).then((response) => {
            this.lookup_invoices = response.data
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
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        userCompanies: { get () { return this.$store.state.main.userCompanies } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        lookup_invoices: {
            get () { return this.$store.state[this.moduleName].editData.lookup_invoices },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLookupInvoices', val) }
        },
        headerUser: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerUser },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerUser', value: val}) }
        },
        sys_location_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_location_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_location_id', value: val}) }
        },
        sys_location_pos_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_location_pos_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_location_pos_id', value: val}) }
        },
        partner_account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.partner_account_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partner_account_id', value: val}) }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
        ambiente: {
            get () { return this.$store.state[this.moduleName].editData.basic.ambiente },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'ambiente', value: val}) }
        },
        numeroDoc: {
            get () { return this.$store.state[this.moduleName].editData.basic.numeroDoc },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'numeroDoc', value: val}) }
        },
        autorizacionDoc: {
            get () { return this.$store.state[this.moduleName].editData.basic.autorizacionDoc },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'autorizacionDoc', value: val}) }
        },
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        voided: {
            get () { return this.$store.state[this.moduleName].editData.basic.voided },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'voided', value: val}) }
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
        lookup_establecimientos: {
            get () { return this.$store.state[this.moduleName].editData.lookup_establecimientos },
        },
        lookup_pos: {
            get () { return this.$store.state[this.moduleName].editData.lookup_pos },
        },
        lookup_SRI_Tabla_Tipo_Comprobante: {
            get () { return this.$store.state[this.moduleName].editData.lookup_SRI_Tabla_Tipo_Comprobante },
        },
        lookup_ambientes: {
            get () { return this.$store.state[this.moduleName].editData.lookup_ambientes },
        },
        lookup_partners: {
            get () { return this.$store.state[this.moduleName].editData.lookup_partners },
        },
    },
})
</script>
