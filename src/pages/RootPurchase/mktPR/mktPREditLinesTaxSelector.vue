<template>
    <DxTagBox
            :items="lookupData"
            :value="selectedRowKeys"
            :show-selection-controls="true"
            :max-displayed-tags="1"
            display-expr="short_name_es"
            value-expr="taxID"
            :width="220"
            :opened="true"
            applyValueMode="useButtons"
            :dropDownOptions="{ resizeEnabled: true,  }"
            @value-changed="valuechanged"
        >
        <div slot="tagTemplate" slot-scope="{ tagData }"><!--espacio vacío--></div>
    </DxTagBox>
</template>
<script>
import DxTagBox from 'devextreme-vue/tag-box';

//import { DxDataGrid, DxColumn, DxColumnFixing, DxScrolling, DxPaging, DxPager, DxStateStoring, DxSorting, DxHeaderFilter, DxSelection, DxEditing, DxLookup, DxSummary, DxTotalItem, DxValueFormat, DxColumnChooser /*, DxSearchPanel*/ } from 'devextreme-vue/data-grid';
//import DxDropDownBox from 'devextreme-vue/drop-down-box';


export default {
    props: {
        moduleName: { type: String , required: true },
        selectedRowKeys: { type: Array , required: true },
        lookupData: { type: Array , required: true },
        currentLine: { type: Object , required: true },
    },
    components:{
        DxTagBox
        /*
        DxDataGrid,
        DxColumn,
        DxSelection,
        DxDropDownBox
        */
    },
    mounted(){
        //console.dir('mounted')
        //this.gridSelectedRows = this.selectedRowKeys;
    },
    data () {
        return {
            gridSelectedRows: [],
            isVisible: true,
        }
    },
    methods:{
        emitSelection(){
            this.$emit('onSelection',this.$refs['grid'].instance.getSelectedRowKeys())
            //this.$refs['dropDownBoxRefName'].instance.close();
        },
        valuechanged(e){
            this.$emit('onSelection',e.value)
        }
    }
}
</script>