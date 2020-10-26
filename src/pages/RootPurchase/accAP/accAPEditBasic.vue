<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div class="row">
        <q-toggle class="col-12 col-md-4"
            v-model="estado" icon="fas fa-check" color="positive" label="Estado" readonly
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
    </div>

    <!--partnerID-->
    <q-input
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
    </q-input>

    <q-select
        label="Tipo de Comprobante - ATS (*)" placeholder="Seleccione el Tipo de Comprobante (*)" emit-value map-options filled
        :options="lookup_SRI_Tabla_Tipo_Comprobante" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        :option-disable="opt => !opt.estado"
        v-model="tipoComprobanteID"
        ref="tipoComprobanteID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-file" /></template>
    </q-select>
    
    <q-input
        ref="headerDate" 
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha de Pedido (aaaa/mm/dd)" label="Fecha de Pedido (aaaa/mm/dd) (*)" filled
        v-model="headerDate" :title="dateName(headerDate)"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_headerDate" transition-show="scale" transition-hide="scale">
              <q-date v-model="headerDate" >
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
    
    <q-select
        label="Forma de Pago - ATS/Documento Electrónico (*)" placeholder="Seleccione la Forma de Pago - ATS/Documento Electrónico (*)" emit-value map-options filled
        :options="lookup_SRI_Tabla_FormaPago" :readonly="(editMode==false) || (allow_edit==false && allow_insert==false)"
        :option-disable="opt => !opt.estado"
        v-model="formaPagoID"
        ref="formaPagoID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-money-check" /></template>
    </q-select>

    <!--<q-select
        label="Usuario que Registra Documento (*)" placeholder="Usuario que Registraó Documento (*)" emit-value map-options filled
        :options="lookup_users" :readonly="true"
        v-model="headerUser"
        ref="headerUser"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="far fa-user" /></template>
    </q-select>-->
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
import xml2js from 'xml2js'

export default ({
    components: {
        mainLookup: mainLookup
    },
    data () {
        return {
            moduleName: "accAP"
            ,isPartnerDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            ,xmlFile: null
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
            this.partner_account_id = selectedRows[0].account_id;//usado para calcular el asiento contable
            this.isPartnerDialog = false
        },
        readXmlFile(file){
            const reader = new FileReader();
            var parser = new xml2js.Parser();
            reader.addEventListener('load', (event) => {
                parser.parseString(event.target.result, (err, result)=>{//lee XML
                    if(err){ console.error(err); return;}
                    try{ this.autorizacionDoc = result.autorizacion.numeroAutorizacion[0] }catch(ex){}
                        parser.parseString(result.autorizacion.comprobante[0], (errA, resultA)=>{//lee Comprobante dentro del resultado
                            if(errA){console.error(errA);return;}
                            try{ //arma numero de documento
                                let numerodocumento = resultA.factura.infoTributaria[0].estab[0]
                                numerodocumento += resultA.factura.infoTributaria[0].ptoEmi[0]
                                numerodocumento += resultA.factura.infoTributaria[0].secuencial[0]
                                this.numeroDoc = numerodocumento 
                            }catch(ex){}
                            try{ //arma fecha
                                let fechaemision = resultA.factura.infoFactura[0].fechaEmision[0].substring(6,11) + '/'
                                fechaemision += resultA.factura.infoFactura[0].fechaEmision[0].substring(3,5) + '/'
                                fechaemision += resultA.factura.infoFactura[0].fechaEmision[0].substring(0,2)
                                this.headerDate = fechaemision
                            }catch(ex){}
                            try{ //arma fecha
                                let ruc = resultA.factura.infoTributaria[0].ruc[0].trim()
                                if(this.lookup_partners.some(x=>x.partner_ruc==ruc)){
                                    let partner = this.lookup_partners.find(x=>x.partner_ruc==ruc);
                                    this.partnerID = partner.value
                                    this.partnerName = partner.label
                                    this.partner_account_id = partner.account_id;//usado para calcular el asiento contable
                                }
                                
                                //this.lookup_partners.some(x=>)
                                //numerodocumento += resultA.factura.infoTributaria[0].ptoEmi[0]
                            }catch(ex){}
                            try{ //arma fecha
                                this.comments = JSON.stringify(resultA.factura.infoAdicional[0].campoAdicional)
                            }catch(ex){}
                            
                        })
                });
            });
            reader.readAsText(file);
        }
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
