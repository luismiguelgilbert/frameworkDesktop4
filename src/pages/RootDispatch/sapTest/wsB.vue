<template>
<q-card flat>
    <q-splitter v-model="splitterModel" style="height: calc(100vh - 260px);" >
        <template v-slot:before>
            <div class="q-pa-md">
                <q-input v-model="pais" label="PAIS" />
                <q-input v-model="centro" label="CENTRO" />
                <q-input v-model="fecha" label="FECHA" />
                <q-input v-model="hora" label="HORA" />
                <q-input v-model="idantena" label="IDANTENA" />
                <q-input v-model="idtag" label="IDTAG" />
                <q-input v-model="peso" label="PESO" />
                <q-input v-model="tknum" label="TKNUM" />
                <q-input v-model="peso_tara_1_parc" label="PESO_TARA_1_PARC" />
                <q-input v-model="peso_bruto_1_parc" label="PESO_BRUTO_1_PARC" />
                <q-input v-model="vbeln" label="VBELN" />
                <q-input v-model="dadosentrega_vbeln" label="T_DADOS_ENTREGA_VBELN" />
                <q-input v-model="dadosentrega_ref_ext" label="T_DADOS_ENTREGA_REF_EXT" />
            </div>
        </template>
        <template v-slot:after>
            <div class="q-pa-md">
                <q-checkbox v-model="completo" :label="completo?'Mostando Respuesta Completa':'Mostrando Solamente Data'" />
                <q-input type="textarea" v-model="completo?JSON.stringify(resultado):resultado.data" label="Resultado" readonly rows="10" />
            </div>
        </template>
    </q-splitter>
    <q-separator />
    <q-card-actions align="around">
        <q-btn label="Ejecutar" icon="fas fa-play" @click="loadData" color="primary" />
    </q-card-actions>
</q-card>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default({
    name: 'wsB',
     data () {
        return {
            splitterModel: 35,
            completo: true,
            pais: 'EC',
            centro: 'ACB0',
            fecha: '2021-06-18',
            hora: '09:35:12',
            idantena: 'ACVIGIN',
            idtag: 'EGSI2736',
            peso: '',
            tknum: '63401533',
            peso_tara_1_parc: '',
            peso_bruto_1_parc: '',
            vbeln: '330101406',
            dadosentrega_vbeln: '330102016',
            dadosentrega_ref_ext: 'X1234',
            resultado: '',
        }
    },
    methods:{
        loadData(){
            this.$q.loading.show()
            let parametroXML = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:com:lh:logistics:la:pegasus:guardia"><soapenv:Header/><soapenv:Body>'
            parametroXML = parametroXML + '<urn:PlantTimesV03Request>'
            parametroXML = parametroXML + '<PAIS>' + this.pais + '</PAIS>'
            parametroXML = parametroXML + '<CENTRO>' + this.centro + '</CENTRO>'
            parametroXML = parametroXML + '<FECHA>' + this.fecha + '</FECHA>'
            parametroXML = parametroXML + '<HORA>' + this.hora + '</HORA>'
            parametroXML = parametroXML + '<IDANTENA>' + this.idantena + '</IDANTENA>'
            parametroXML = parametroXML + '<IDTAG>' + this.idtag + '</IDTAG>'
            parametroXML = parametroXML + '<PESO>' + this.peso + '</PESO>'
            parametroXML = parametroXML + '<TKNUM>' + this.tknum + '</TKNUM>'
            parametroXML = parametroXML + '<PESO_TARA_1_PARC>' + this.peso_tara_1_parc + '</PESO_TARA_1_PARC>'
            parametroXML = parametroXML + '<PESO_BRUTO_1_PARC>' + this.peso_bruto_1_parc + '</PESO_BRUTO_1_PARC>'
            parametroXML = parametroXML + '<VBELN>' + this.vbeln + '</VBELN>'
            parametroXML = parametroXML + '<T_DADOS_ENTREGA><VBELN>' + this.dadosentrega_vbeln + '</VBELN><REF_EXT>' + this.dadosentrega_ref_ext + '</REF_EXT></T_DADOS_ENTREGA>'
            parametroXML = parametroXML + '</urn:PlantTimesV03Request></soapenv:Body></soapenv:Envelope>'
           //let parametroXML = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:com:lh:logistics:la:pegasus:planta"> <soapenv:Header/> <soapenv:Body> <urn:PlantTimesV03Request> <PAIS>EC</PAIS> <CENTRO>ACB0</CENTRO> <FECHA>2021-06-18</FECHA> <HORA>09:35:12</HORA> <IDANTENA>ACVIGIN</IDANTENA> <IDTAG>EGSI2736</IDTAG> <PESO></PESO> <PRECINTOS></PRECINTOS> <PESO_MANUAL></PESO_MANUAL> <PESO_TANDEM> <CAPAC></CAPAC> </PESO_TANDEM> <TKNUM>63401533</TKNUM> <PESO_TARA_1_PARC></PESO_TARA_1_PARC> <PESO_BRUTO_1_PARC></PESO_BRUTO_1_PARC> <PESO_TARA_2_PARC></PESO_TARA_2_PARC> <PESO_BRUTO_2_PARC></PESO_BRUTO_2_PARC> <VBELN>330101406</VBELN> <PRECINTOS_2></PRECINTOS_2> <PONTO_CARGA></PONTO_CARGA> <CONTINGENCIA></CONTINGENCIA> <T_DADOS_ENTREGA> <VBELN>330102016</VBELN> <REF_EXT>X1234</REF_EXT> </T_DADOS_ENTREGA> </urn:PlantTimesV03Request> </soapenv:Body> </soapenv:Envelope>'

            //POST data to server
                this.$axios.post( this.apiURL + 'sde_' + 'PlantTimesV03_Out_Sync', {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        xmlRequest: parametroXML
                    }
                , { headers: { Authorization: "Bearer " + this.$q.sessionStorage.getItem('jwtToken') } }
                ).then((response) => {
                    console.dir(response)
                    //this.resultado = JSON.stringify(response)
                    this.resultado = response
                    this.$q.notify({ html: true, multiLine: false, color: 'positive'
                        ,message: 'OK'
                        ,timeout: 800, progress: false , icon: "fas fa-check"
                        //,actions: [ { icon: 'fas fa-times', color: 'white', } ]
                    })
                    this.$q.loading.hide()
                }).catch((error) => {
                    console.dir(error)
                    let mensaje = ''
                    if(error.message){ mensaje = error.message }
                    if(error.response && error.response.data && error.response.data.message){mensaje = mensaje + '<br/>' + error.response.data.message }
                    if(error.response && error.response.data && error.response.data.info && error.response.data.info.message){mensaje = mensaje + '<br/>' + error.response.data.info.message }
                    mensaje = mensaje.replace('Request failed with status code 400<br/>','')
                    this.$q.notify({ html: true, multiLine: false, color: 'red'
                        ,message: "Lo sentimos, no se pudo obtener datos.<br/>" + mensaje
                        ,timeout: 0, progress: false , icon: "fas fa-exclamation-circle"
                        ,actions: [ { icon: 'fas fa-times', color: 'white', } ]
                    })
                    this.$q.loading.hide()
                })
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        userCode: { get () { return this.$store.state.main.userCode } },
        userCompany: { get () { return this.$store.state.main.userCompany } },
        apiURL: { get () { return this.$q.sessionStorage.getItem('URL_Data') + (this.$q.sessionStorage.getItem('URL_Port')?(':' + this.$q.sessionStorage.getItem('URL_Port')):'') + this.$q.sessionStorage.getItem('URL_Path') } },
    }
})
</script>