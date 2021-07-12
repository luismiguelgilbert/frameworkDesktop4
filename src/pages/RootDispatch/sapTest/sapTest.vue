<template>
    <!-- <reportList :rootName="rootName" :rootTitle="rootTitle" /> -->
    <div>
        <div class="fixed-center">
            <q-card style="width: 600px;">
                <q-toolbar class="text-primary">Pruebas SAP de Interface: <div class="text-subtitle2 q-ml-sm">GetTag_Out_Sync</div></q-toolbar>
                <q-separator />
                <q-splitter v-model="splitterModel" style="height: calc(100vh - 300px);" >
                    <template v-slot:before>
                        <div class="q-pa-md">
                            <q-input v-model="land" label="LAND1" />
                            <q-input v-model="vstel" label="VSTEL" />
                            <q-input v-model="tag" label="TAG" />
                            <q-input v-model="atividade" label="ATIVIDADE" />
                        </div>
                    </template>
                    <template v-slot:after>
                        <div class="q-pa-md">
                            <q-checkbox v-model="completo" :label="completo?'Mostando Respuesta Completa':'Mostrando Solamente Data'" />
                            <q-input type="textarea" v-model="completo?JSON.stringify(resultado):resultado.data" label="Resultado" readonly rows="10" />
                        </div>
                    </template>
                </q-splitter>
                <q-card-actions align="around">
                    <q-btn label="Ejecutar" icon="fas fa-play" @click="loadData" color="primary" />
                </q-card-actions>
            </q-card>
        </div>
    </div>
    
</template>
<script>
//import reportList from 'components/reportList/reportList'

export default ({
    /*components: {
        reportList
    },*/
    data () {
        return {
            rootName: "RootDispatch",
            rootTitle: "Pruebas SAP (sapTest)",
            splitterModel: 35,
            completo: true,
            land: 'EC',
            vstel: 'ACB0',
            tag: 'EGQW0341',
            atividade: 'A',
            resultado: '',
        }
    },
    methods:{
        loadData(){
            this.$q.loading.show()
            let parametroXML = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:com:lh:logistics:la:pegasus:guardia"><soapenv:Header/><soapenv:Body><urn:GetTagRequest><LAND1>' + this.land + '</LAND1><VSTEL>' + this.vstel + '</VSTEL><TAG>' + this.tag + '</TAG><ATIVIDADE>' + this.atividade + '</ATIVIDADE></urn:GetTagRequest></soapenv:Body></soapenv:Envelope>'
            //POST data to server
                this.$axios.post( this.apiURL + 'sde_' + 'GetTag_Out_Sync', {
                        userCode: this.userCode,
                        userCompany: this.userCompany,
                        //xmlRequest: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:com:lh:logistics:la:pegasus:guardia"><soapenv:Header/><soapenv:Body><urn:GetTagRequest><LAND1>EC</LAND1><VSTEL>ACB0</VSTEL><TAG>EGQW0341</TAG><ATIVIDADE>A</ATIVIDADE></urn:GetTagRequest></soapenv:Body></soapenv:Envelope>'
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