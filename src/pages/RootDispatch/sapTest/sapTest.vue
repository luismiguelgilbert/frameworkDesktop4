<template>
    <!-- <reportList :rootName="rootName" :rootTitle="rootTitle" /> -->
    <div>
        <div class="fixed-center">
            <q-card style="width: calc(100vw - 100px); height: calc(100vh - 150px);">
                <q-tabs v-model="tab" class="text-grey" active-color="primary" indicator-color="primary" align="justify" no-caps >
                    <q-tab name="wsA" label="Interface: GetTag_Out_Sync" />
                    <q-tab name="wsB" label="Interface: PlantTimesV03_Out_Sync" />
                </q-tabs>

                  <q-separator />

                <q-tab-panels v-model="tab" animated>
                    <q-tab-panel name="wsA" class="q-pa-none">
                        <wsA />
                    </q-tab-panel>
                    <q-tab-panel name="wsB" class="q-pa-none">
                        <wsB />
                    </q-tab-panel>
                </q-tab-panels>
            </q-card>
        </div>
    </div>
    
</template>
<script>
//import reportList from 'components/reportList/reportList'
import wsA from './wsA.vue'
import wsB from './wsB.vue'

export default ({
    components: {
        wsA: wsA, wsB: wsB
    },
    data () {
        return {
            tab: 'wsA'
            /*
            rootName: "RootDispatch",
            rootTitle: "Pruebas SAP (sapTest)",
            splitterModel: 35,
            completo: true,
            land: 'EC',
            vstel: 'ACB0',
            tag: 'EGQW0341',
            atividade: 'A',
            resultado: '',
            */
        }
    },
})
</script>