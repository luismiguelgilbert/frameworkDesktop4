<template>
<q-page style="min-height: 200px; height: calc(100vh - 100px);" class="q-pa-none">
    
    <q-card class="q-ma-md rounder-corners shadow-3">
        <q-toolbar :class="'q-pr-none text-subtitle2 '+(userColor=='blackDark'?'text-white':'text-primary')">
            <q-toolbar-title class="text-weight-bolder">{{editMode?'Nueva Requisición':'Requisión '+editRecord.value}}</q-toolbar-title>
            <q-space />
            <q-btn label="Guardar" color="positive"  flat icon="fas fa-save" stretch @click="goBack" />
            <q-btn label="Cancelar" :color="userColor=='blackDark'?'white':'primary'" flat icon="fas fa-times" stretch @click="goBack" />
        </q-toolbar>
        <q-separator />
        <q-splitter
            v-model="splitterModel"
            style="height: calc(100vh - 140px);" unit="px"
            >

            <template v-slot:before>
                <q-list>
                    <q-item clickable @click="tab='basic'" :active="tab=='basic'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-info-circle" :color="tab=='basic'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='basic'?'text-white':'text-grey-7')">Datos de Requisición</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='items'" :active="tab=='items'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-th"  :color="tab=='items'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='items'?'text-white':'text-grey-7')">Lista de Items</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='partners'" :active="tab=='partners'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-users"  :color="tab=='partners'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='partners'?'text-white':'text-grey-7')">Proveedores Sugeridos</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='files'" :active="tab=='files'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-paperclip" :color="tab=='files'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='files'?'text-white':'text-grey-7')">Lista de Archivos</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="tab='history'" :active="tab=='history'" active-class="bg-primary text-white" >
                        <q-item-section side>
                            <q-icon name="fas fa-history" :color="tab=='history'?'white':'grey-7'" />
                        </q-item-section>
                        <q-item-section v-if="$q.screen.gt.xs">
                            <q-item-label :class="'text-subtitle2 '+(tab=='history'?'text-white':'text-grey-7')">Historia del Documento</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </template>

            <template v-slot:after>
                <q-tab-panels
                    v-model="tab"
                    animated
                    swipeable
                    vertical
                    transition-prev="jump-up"
                    transition-next="jump-up"
                    >
                    <q-tab-panel name="basic">
                        <basicComponent />
                        <br><br>editRecord : {{editMode}}
                        <br><br>editRecord: {{editRecord}}
                        <br><br>currentPathModule: {{JSON.stringify(currentPathModule)}}
                    </q-tab-panel>

                    <q-tab-panel name="items">
                        <itemsComponent />
                    </q-tab-panel>

                    <q-tab-panel name="partners">
                        <itemsComponent />
                    </q-tab-panel>

                    <q-tab-panel name="files">
                        <itemsComponent />
                    </q-tab-panel>

                    <q-tab-panel name="history">
                        <itemsHistory />
                    </q-tab-panel>
                </q-tab-panels>
        
            </template>

            </q-splitter>
    </q-card>
    
    <q-inner-loading :showing="loadingData" style="z-index: 999;">
        <q-spinner-ios size="50px" color="amber" />
    </q-inner-loading>
</q-page>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import basicComponent from './PurchaseRequisitionEditBasic'
import itemsComponent from './PurchaseRequisitionEditItems'
import itemsHistory from './PurchaseRequisitionEditHistory'


export default ({
  components:{
     basicComponent: basicComponent
    ,itemsComponent: itemsComponent
    ,itemsHistory: itemsHistory
  },
  data () {
    return {
        moduleName: "PurchaseRequisition", router: this.$router,
        tab: 'basic', splitterModel: 250
    }
  },
  created(){
      if(this.$q.screen.lt.sm){this.splitterModel = 60}
  },
  methods:{
    goBack(){
        this.router.replace('/'+this.currentPathModule); //navigate to previous Main module
    },
  },
  computed:{
    userMainToolbarComponentClass: { get () { 
        let result = 'no-padding '
        if(this.$store.state.main.userColor=='default'){
            result=result + 'bg-white text-primary'
        }
        if(this.$store.state.main.userColor=='blackDark'){
            result=result + 'bg-grey-10 text-white'
        }
        return result
    }},
    userColor: { get () { return this.$store.state.main.userColor }  },
    editRecord: { get () { 
        return this.$store.state.main[this.moduleName].editRecord;
      },
      set(val) {
        let cambio = { module: this.moduleName, key: 'editRecord', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    editMode: { get () { 
        return this.$store.state.main[this.moduleName].editMode;
      },
      set(val) {
        let cambio = { module: this.moduleName, key: 'editMode', value: val }
        this.$store.commit('main/updateModuleState', cambio)
      }
    },
    loadingData: { get () { 
            return this.$store.state.main[this.moduleName].loadingData
        }, 
        set(val) {
            let cambio = { module: this.moduleName, key: 'loadingData', value: val }
            this.$store.commit('main/updateModuleState', cambio)
        }
    },
    currentPath: { get () { return this.$store.state.main.currentPath }, set (val) { this.$store.commit('main/updateState', {key: 'currentPath', value: val}) } },
    currentPathModule: { get () { return this.$store.state.main.currentPathModule }, set (val) { this.$store.commit('main/updateState', {key: 'currentPathModule', value: val}) } },
  },
})
</script>