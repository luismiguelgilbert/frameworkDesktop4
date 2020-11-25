<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
        <q-toggle class="col-12 col-md-4"
            v-model="estado" icon="fas fa-check" color="positive" label="Estado" disable
            />
        <q-toggle class="col-12 col-md-4"
            v-model="voided" icon="fas fa-ban" color="red" label="Anulado?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
            />
        <q-file class="col-12 col-md-4"
            v-model="xmlFile" label="Cargar XML" filled @input="readXmlFile" dense
            accept=".xml"
            >
            <template v-slot:prepend><q-icon name="fas fa-upload" /></template>
        </q-file>
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
                this.partnerName=row.label;//usado en el asiento contable, en la línea de proveedor (campo comentario), 
                this.partner_account_id=row.account_id
                this.$emit('onAccMoveCompute')
            }"
        />
    
    <!--tipoComprobanteID-->
    <selectSearchable 
        prependIcon="fas fa-file"
        labelText="Tipo de Comprobante - ATS (*)" labelSearchText="Buscar Tipo de Comprobante"
        :optionsList="this.lookup_SRI_Tabla_Tipo_Comprobante"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="tipoComprobanteID"
        :tableSearchColumns="[
                { name: 'label', label: 'Tipo de Comprobante', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.tipoComprobanteID=row.value;
            }"
        />

    <q-input
        ref="headerDate" 
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha de Factura (aaaa/mm/dd)" label="Fecha de Factura (aaaa/mm/dd) (*)" filled
        v-model="headerDate" :title="dateName(headerDate)"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
              <q-date :locale="myQDateLocale" minimal v-model="headerDate" >
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
        ref="numeroDoc" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        placeholder="Ingrese el Número del Documento (*)" label="Número del Documento (*)" filled
        v-model="numeroDoc" counter
        mask="### - ### - #########" unmasked-value
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>

    <q-input
        ref="autorizacionDoc" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        placeholder="Ingreso el Número de Autorización del Documento (*)" label="Número de Autorización (*)" filled
        v-model="autorizacionDoc" counter
        mask="##################################################"
        :rules="[
                val => !!val || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-check" /></template>
    </q-input>
    
    <selectSearchable 
        prependIcon="fas fa-money-check"
        labelText="Forma de Pago - ATS/Documento Electrónico (*)" labelSearchText="Buscar Forma de Pago"
        :optionsList="this.lookup_SRI_Tabla_FormaPago"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="false" 
        :isReadonly="(allow_edit==false && allow_insert==false)"
        :initialValue="formaPagoID"
        :tableSearchColumns="[
                { name: 'label', label: 'Forma de Pago', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.formaPagoID=row.value;
            }"
        />

    
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Pedido" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />
    <br><br>

    <q-dialog v-model="isPartnerDialog">
        <q-card style="minWidth: 1000px; width: 1000px;">
            <partnersEdit />
        </q-card>
    </q-dialog>

</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'
import mainLookup from '../../../components/mainLookup/mainLookup.vue'
import xml2js from 'xml2js'
import computeFunctions from './computeFunctions.js'

export default ({
    components: {
        mainLookup: mainLookup
        ,selectSearchable: selectSearchable
        ,computeFunctions: computeFunctions
        ,partnersEdit: () => import('../../../pages/RootMaster/Partners/PartnersEdit.vue')
    },
    data () {
        return {
            moduleName: "accAP"
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
        
        
        readXmlFile(file){
            const reader = new FileReader();
            var parser = new xml2js.Parser();
            reader.addEventListener('load', (event) => {
                parser.parseString(event.target.result, (err, result)=>{//lee XML
                    if(err){ console.error(err); return;}
                        try{
                            parser.parseString(result.autorizacion.comprobante[0], (errA, resultA)=>{//lee Comprobante dentro del resultado
                                console.dir(resultA)
                                if(errA){
                                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                                        ,message: "No se pudo obtener datos de factura del XML.<br/>"
                                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                                        ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                                    })
                                    console.error(errA);return;
                                }else{
                                    let facturaPara = resultA.factura.infoFactura[0].identificacionComprador[0].trim()
                                    let razonSocialComprador = resultA.factura.infoFactura[0].razonSocialComprador[0].trim()
                                    let currentRUC = this.userCompanies.find(x=>x.companyID==this.userCompany).companyNumber.trim()
                                    let currentRUCname = this.userCompanies.find(x=>x.companyID==this.userCompany).companyShortName.trim()
                                    
                                    if(facturaPara!=currentRUC){//valida que RUC de Factura y Compañía coincidan
                                        this.xmlFile = null
                                        this.$q.notify({ html: true, multiLine: false, color: 'red'
                                            ,message: "<b>El XML NO pertenece a la compañía actual.</b><br/>Factura para: " + razonSocialComprador + " (" + facturaPara + ")" + "<br/>Compañía Actual: " + currentRUCname + " (" + currentRUC +")"
                                            ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                                            ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                                        })
                                    }else{
                                        let ruc = resultA.factura.infoTributaria[0].ruc[0].trim()
                                        let razonSocial = resultA.factura.infoTributaria[0].razonSocial[0].trim()
                                        let nombreComercial = resultA.factura.infoTributaria[0].nombreComercial[0].trim()
                                        //let nombre = resultA.factura.infoTributaria[0].ruc[0].trim()
                                        
                                        if(!(this.lookup_partners.some(x=>x.partner_ruc==ruc))){
                                            this.xmlFile = null
                                            this.$q.notify({ html: true, multiLine: false, color: 'red'
                                                ,message: "<b>No existe el proveedor!</b><br/>" + "Nombre Comercial: " + nombreComercial + "<br>" + "Razón Social: " + razonSocial + "<br>"+ "Ruc: " + ruc
                                                ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                                                ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                                            })
                                        }else{
                                            //arma numero de documento
                                            let numerodocumento = resultA.factura.infoTributaria[0].estab[0]
                                            numerodocumento += resultA.factura.infoTributaria[0].ptoEmi[0]
                                            numerodocumento += resultA.factura.infoTributaria[0].secuencial[0]
                                            this.numeroDoc = numerodocumento 
                                            //arma numero de autorizacion
                                            this.autorizacionDoc = result.autorizacion.numeroAutorizacion[0]
                                            //arma fecha
                                            let fechaemision = resultA.factura.infoFactura[0].fechaEmision[0].substring(6,11) + '/'
                                            fechaemision += resultA.factura.infoFactura[0].fechaEmision[0].substring(3,5) + '/'
                                            fechaemision += resultA.factura.infoFactura[0].fechaEmision[0].substring(0,2)
                                            this.headerDate = fechaemision
                                            //aplica Proveedor
                                            if(this.lookup_partners.some(x=>x.partner_ruc==ruc)){
                                                let partner = this.lookup_partners.find(x=>x.partner_ruc==ruc);
                                                this.partnerID = partner.value
                                                this.partnerName = partner.label
                                                this.partner_account_id = partner.account_id;//usado para calcular el asiento contable
                                                this.$emit('onAccMoveCompute')
                                            }
                                            //arma comentarios
                                            let resultado = ''
                                            resultA.factura.infoAdicional[0].campoAdicional.map(x=>{
                                                resultado += x.$.nombre + ': ' + x._ + '  ||  '
                                            })
                                            this.comments = resultado
                                        }
                                        
                                    }
                                }
                            })
                        }catch(ex){
                            this.xmlFile = null
                            this.$q.notify({ html: true, multiLine: false, color: 'red'
                                ,message: "No se pudo obtener datos del archivo.<br/>Verifique que corresponda a un XML de una factura."
                                ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                                ,actions: [ { icon: 'fas fa-times', color: 'white' } ]
                            })
                        }
                });
            });
            reader.readAsText(file);
        }
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
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        lines: {
            get () { return this.$store.state[this.moduleName].editData.lines },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataLines', val) }
        },
        headerUser: {
            get () { return this.$store.state[this.moduleName].editData.basic.headerUser },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'headerUser', value: val}) }
        },
        partner_account_id: {
            get () { return this.$store.state[this.moduleName].editData.basic.partner_account_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partner_account_id', value: val}) }
        },
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerID', value: val}) }
        },
        partnerName: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerName },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'partnerName', value: val}) }
        },
        tipoComprobanteID: {
            get () { return this.$store.state[this.moduleName].editData.basic.tipoComprobanteID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'tipoComprobanteID', value: val}) }
        },
        formaPagoID: {
            get () { return this.$store.state[this.moduleName].editData.basic.formaPagoID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'formaPagoID', value: val}) }
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
        lookup_wh: {
            get () { return this.$store.state[this.moduleName].editData.lookup_wh },
        },
        lookup_SRI_Tabla_Tipo_Comprobante: {
            get () { return this.$store.state[this.moduleName].editData.lookup_SRI_Tabla_Tipo_Comprobante },
        },
        lookup_SRI_Tabla_FormaPago: {
            get () { return this.$store.state[this.moduleName].editData.lookup_SRI_Tabla_FormaPago },
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
