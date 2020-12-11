<template>
<div>
    <isAccountComponent v-if="initialTypeID==1||initialTypeID==3" ref="isAccountComponent" @onAccMoveCompute="updateAccountMove" />
    <isDocumentComponent v-if="initialTypeID==2" ref="isDocumentComponent" @onAccMoveCompute="updateAccountMove" />
</div>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';
import { date } from 'quasar';
import isAccountComponent from './accVoucherOutEditLinesAccounts'
import isDocumentComponent from './accVoucherOutEditLinesDocs'

export default ({
    components: {
        isAccountComponent: isAccountComponent
        ,isDocumentComponent: isDocumentComponent
    },
    data () {
        return {
            moduleName: "accVoucherOut"
            //,isPartnerDialog: false, mainLookupUpdateFieldValueName: '', mainLookupUpdateFieldLabelName: '', mainLookupPredefinedValue: null
            //,xmlFile: null
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
        //this.$refs.formulario.validate()
    },
    methods:{
        dateName(fecha){
            return date.formatDate(fecha, 'dddd, D-MMMM-YYYY', {
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            }
            )
        },
        updateAccountMove(){
            //como este componente "contiene" a 2 subcomponentes
            //entonces simplemente re-emite el evento hacia accVoucherOutEdit
            //que es donde SÍ se actualiza asiento contable
            this.$emit('onAccMoveCompute')
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
        partnerID: {
            get () { return this.$store.state[this.moduleName].editData.basic.partnerID },
        },
        methodID: {
            get () { return this.$store.state[this.moduleName].editData.basic.methodID },
        },
        initialTypeID: {
            get () { return this.$store.state[this.moduleName].editData.basic.initialTypeID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'initialTypeID', value: val}) }
        },
    },
})
</script>
