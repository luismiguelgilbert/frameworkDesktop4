<template>
    <div>
        <q-select
            ref="selectSearchableRef"
            filled use-input hide-dropdown-icon input-debounce="500"
            v-model="componentValue"
            :label="labelText"
            :options="optionsListFiltered" map-options
            :disable="isDisable" 
            :readonly="isReadonly"
            :option-label="optionLabelField"
            :autofocus="autofocus"
            
            :dense="isDense"
            :option-disable="(item) => (this.optionDisableField) ? !(item[this.optionDisableField]) : undefined"
            @keyup.keyCodes.113="openSearch"
            @filter="filterList"
            :clearable="!isRequired"
            :rules="isRequired?[ val => !!val || '* Requerido', ]:undefined"
            @input="(itemSelected)=>{this.itemSelected(itemSelected)}"
            >
            <template v-slot:prepend><q-icon :name="prependIcon" /></template>
            <template v-slot:append="props">
                <q-btn v-if="showSelectButton" icon="fas fa-check" title="Seleccionar" flat dense @click="(props)=>{itemSelected(props)}"  /> 
                <q-btn :icon="appendIcon" flat dense @click="openSearch"  /> 
            </template>
            <template v-slot:no-option> <q-item> <q-item-section class="text-italic text-grey"> No hay datos </q-item-section>
          </q-item>
        </template>
            <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" >
                    <q-item-section>
                        <q-item-label v-html="scope.opt[optionsListLabel]" />
                        <q-item-label v-if="optionsListCaption" caption>{{ scope.opt[optionsListCaption] }}</q-item-label>
                    </q-item-section>
                </q-item>
            </template>
        </q-select>
        
        <q-dialog v-model="isDialogOpen" @show="tryScroll"  square>
            <q-card style="min-width: 850px;">
                <q-bar class="bg-primary text-white">
                    {{labelSearchText}}
                    <q-space />
                    <q-input 
                        ref="inputSearch"
                        input-class="text-white" borderless dense debounce="300" autofocus v-model="filterString" placeholder="Buscar"
                        @keydown.native.keyCodes.115="emitSelect">
                        <template v-slot:append>
                            <q-icon v-if="!filterString" name="fas fa-search" flat round size="xs" color="white" />
                            <q-btn v-if="filterString" @click="filterString=''" flat round icon="fas fa-times" size="xs" color="white" />
                        </template>
                    </q-input>
                </q-bar>
                <q-card-section class="no-padding">
                    <q-table
                        ref="searchTable"
                        :data="optionsList"
                        :row-key="rowValueField"
                        :filter="filterString"
                        hide-bottom dense square flat
                        virtual-scroll :rows-per-page-options="[0]"
                        :class="userColor=='blackDark'?'my-sticky-header-table-dark bg-grey-10 ':'my-sticky-header-table '"
                        table-style="min-height: calc(100vh - 270px); max-height: calc(100vh - 270px)"
                        no-data-label= "No hay registros"
                        no-results-label= "No se encontraron registros"
                        loading-label= "Cargando datos"
                        :columns="tableSearchColumns"
                        >
                        <template v-slot:body="props">
                            <q-tr :props="props"        
                                :class="rowStyle(props.row)"
                                >
                                <q-td v-for="col in props.cols" :key="col.name" :props="props"
                                    @click="itemSelected(props.row)" >
                                    {{ col.value }}
                                </q-td>
                            </q-tr>
                        </template>
                    </q-table>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default({
    name: 'selectSearchable',
    props: {
        prependIcon: { type: String, required: true, default: 'fas fa-search' },
        appendIcon: { type: String, required: false, default: 'fas fa-search' },
        labelText: { type: String, required: true, default: 'Buscar' },
        labelSearchText: { type: String, required: true, default: 'Buscar' },
        optionLabelField: { type: String, required: false, default: 'label' },
        optionDisableField: { type: String, required: false },
        optionsList: { type: Array, required: true, default: [] },
        isRequired: { type: Boolean, required: true, default: false },
        isReadonly: { type: Boolean, required: false, default: false },
        isDisable: { type: Boolean, required: false, default: false },
        isDense: { type: Boolean, required: false, default: false },
        initialValue: { required: false, default: null },
        rowValueField: { type: String, required: true, default: 'value' },
        showSelectButton: { type: Boolean, required: false, default: false },
        autofocus: { type: Boolean, required: false, default: false },
        autoShowPopup: { type: Boolean, required: false, default: false },
        optionsListLabel: { type: String, required: true, default: 'label' },
        optionsListCaption: { type: String, required: false },
        tableSearchColumns: { type: Array, required: true, default: [
                            { name: 'value', label: 'ID', field: 'value'}
                            ,{ name: 'label', label: 'Valor', field: 'label'}
                    ] },
    },
    data () {
        return {
            componentValue: null, optionsListFiltered:[], isDialogOpen: false, filterString: '', isTableBusy: false
        }
    },
    mounted(){
        if(this.autoShowPopup==true){
            this.$refs.selectSearchableRef.showPopup ()
        }
        try{//Backup Complete Data
            this.optionsListFiltered = JSON.parse(JSON.stringify(this.optionsList))
            //this.optionsListFiltered = Object.freeze(JSON.parse(JSON.stringify(this.optionsList)))
        }catch(ex){}
        try{//Preselect Default Value
            if(this.initialValue){
                if(this.optionsList.some(x=>x[this.rowValueField]==this.initialValue)){
                    this.componentValue=this.optionsList.find(x=>x[this.rowValueField]==this.initialValue)
                }
            }
        }catch(ex){}
    },
    methods: {
        rowStyle(row){
            let result = ''
            if(this.componentValue&&row&&this.rowValueField){
                if(row[this.rowValueField]==this.initialValue){
                    result = 'text-primary text-bold '
                }
            }
            if(this.optionDisableField&&!(row[this.optionDisableField])){
                result = result + 'text-grey'
            }else{
                result = result + 'cursor-pointer'
            }
            return result
        },
        openSearch(){
            if(!(this.isReadonly||this.isDisable)){
                this.$refs.selectSearchableRef.hidePopup()
                this.isDialogOpen = true
            }
        },
        tryScroll(){
            try{
                this.isTableBusy = true
                if(this.initialValue){
                    let index = this.optionsList.findIndex(x=>x[this.rowValueField]==this.initialValue)
                    index=parseInt(index)+parseInt(5)
                    if(index>7){
                        this.$refs.searchTable.scrollTo(index)
                    }
                    this.isTableBusy = false
                }else{
                    this.isTableBusy = false
                }
            }catch(ex){this.isTableBusy = false}
        },
        itemSelected(row){
            if(row){
                if(row.type=='click'){//cuando se permite botón para seleccionar cuenta predeterminada, se recibe "click" mouse event
                    if(this.$refs.selectSearchableRef&&this.$refs.selectSearchableRef.value){
                        row = this.$refs.selectSearchableRef.value
                    }
                }
                if(this.optionDisableField){//desactivar filas NO permitidas
                    if(row[this.optionDisableField]){
                        this.$emit('onItemSelected',row)
                        this.componentValue=row
                        this.isDialogOpen = false
                    }else{
                        this.$q.notify({ html: false, multiLine: false, color: 'red'
                            ,message: "No puede seleccionar ese registro"
                            ,timeout: 500, progress: false , icon: "fas fa-exclamation-circle"
                        })
                    }
                }else{//como NO hay que desactivar nada, simplemente envía el dato
                    this.$emit('onItemSelected',row)
                    this.componentValue=row
                    this.isDialogOpen = false
                }
            }else{
                let resultado = {
                     value: null
                    ,label: ''
                }
                this.$emit('onItemSelected',resultado)
                this.componentValue=row
                this.isDialogOpen = false
            }
        },
        filterList (val, update) {
            if (val === '') {
                this.optionsListFiltered = this.optionsList
            }
            update(() => {
                const needle = val.toLowerCase()
                try{
                    if(this.optionsListCaption && (this.optionsListCaption.length>0) ){
                        this.optionsListFiltered = this.optionsList.filter(x=> (x[this.optionsListLabel].toLowerCase().indexOf(needle) > -1)    ||      (x[this.optionsListCaption].toLowerCase().indexOf(needle) > -1))
                    }else{
                        this.optionsListFiltered = this.optionsList.filter(x=> (x[this.optionsListLabel].toLowerCase().indexOf(needle) > -1)    )
                    }
                }catch(ex){
                    this.optionsListFiltered = this.optionsListFiltered
                }
                
            })
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
    },
    watch: { 
        initialValue: function(newVal, oldVal) { // update component display value when changed happend from outside component (e.g. programatically)
            this.componentValue=newVal
        },
        isRequired: function(newVal, oldVal) { // update component display value when changed happend from outside component (e.g. programatically)
            this.$refs.selectSearchableRef.resetValidation();
        }


    }
})
</script>