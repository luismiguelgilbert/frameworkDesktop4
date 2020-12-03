<template>
    <q-select
        borderless :use-input="!isReadonly" input-debounce="650" hide-bottom-space
        v-model="componentValue" style="height: 20px !important;"  input-style="maxWidth: 50px !important;"
        :options="optionsListFiltered" map-options  multiple
        :disable="isDisable" 
        :readonly="isReadonly"
        :option-label="optionLabelField"
            dense
        :option-value="rowValueField"
        :option-disable="(item) => (this.optionDisableField) ? !(item[this.optionDisableField]) : undefined"
        @keyup.keyCodes.113="openSearch"
        @filter="filterList"
        :clearable="isClearable" 
        @input="(itemSelected)=>{this.itemSelected(itemSelected)}"
        >
        <template v-slot:no-option> 
            <q-item> <q-item-section class="text-italic text-grey"> No hay datos </q-item-section> </q-item>
        </template>
        <template v-slot:selected-item="scope"> 
            <div style="display: inline-block; margin-top: 5px;"> {{`${scope.opt[optionLabelField]}`}} </div>
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
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';

export default({
    name: 'inlineMultipleSelect',
    props: {
        labelSearchText: { type: String, required: true, default: 'Buscar' },
        optionLabelField: { type: String, required: false, default: 'label' },
        optionDisableField: { type: String, required: false },
        optionsList: { type: Array, required: true, default: [] },
        isClearable: { type: Boolean, required: true, default: false },
        isReadonly: { type: Boolean, required: false, default: false },
        isDisable: { type: Boolean, required: false, default: false },
        isDense: { type: Boolean, required: false, default: false },
        initialValue: { required: false, default: null },
        rowValueField: { type: String, required: true, default: 'value' },
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
        try{//Backup Complete Data
            this.optionsListFiltered = JSON.parse(JSON.stringify(this.optionsList))
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
            const resultado = row[this.rowValueField]//get value (instead of complete object)
            if(this.optionDisableField){//desactivar filas NO permitidas
                if(row[this.optionDisableField]){
                    this.componentValue=row
                    this.isDialogOpen = false
                    this.$emit('onItemSelected',resultado)//emit value only
                }else{
                    this.$q.notify({ html: false, multiLine: false, color: 'red'
                        ,message: "No puede seleccionar ese registro"
                        ,timeout: 500, progress: false , icon: "fas fa-exclamation-circle"
                    })
                }
            }else{//como NO hay que desactivar nada, simplemente envía el dato
                this.componentValue=row
                this.isDialogOpen = false
                this.$emit('onItemSelected',resultado)//emit value only
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
        }
    }
})
</script>