<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">

    <q-list  bordered separator >
        <q-item-label header class="text-primary">Quiénes asistieron a la Reunión de Equipo?</q-item-label>

        <q-item tag="label"  v-for="(persona, index) in ensMeetTeamPersonas" :key="index" >
            <q-item-section avatar side >
                <q-toggle  color="primary" :value="persona.attended" @input="changeRowState(persona)" checked-icon="fas fa-check" unchecked-icon="fas fa-times" />
            </q-item-section>

            <q-item-section side class="q-ml-xl">
                <q-avatar size="20px">
                    <q-icon v-if="persona.uploadFileName == null" name="fas fa-camera" :color="userColor=='blackDark'?'white':'grey-7'" />
                    <q-img v-if="persona.uploadFileName != null" :src="$q.sessionStorage.getItem('serverFilesPath') + persona.uploadFileName">
                        <q-tooltip anchor="top left" self="top left" :content-class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" >
                            <q-img  style="width: 250px" :src="$q.sessionStorage.getItem('serverFilesPath') + persona.uploadFileName" />
                        </q-tooltip>
                    </q-img>
                </q-avatar>
            </q-item-section>
            
            <q-item-section >
                <q-item-label >{{persona.label}}</q-item-label>
            </q-item-section>
            <q-item-section >
                <q-select dense borderless :label="'Por qué faltó '+persona.label+'?'" v-if="persona.attended==false" :options="lookup_absentReasons" emit-value map-options
                    :value="persona.absentReasonID" @input="(value) => { changeRowReason(value, persona) }" />
            </q-item-section>

        </q-item>
    </q-list>
        
    <br><br>
</q-form>
</template>
<script>
import { date } from 'quasar';
import { DxAutocomplete, DxButton as DxAutocompleteButton } from 'devextreme-vue/autocomplete';
import { DxTextBox, DxButton as DxTextBoxButton } from 'devextreme-vue/text-box';

export default ({
    props: {
        moduleName: { type: String , required: true },
    },
    components: {
        DxAutocomplete, DxAutocompleteButton, DxTextBox, DxTextBoxButton
    },
    data () {
        return {
            
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods: {
        changeRowState(persona){
            let nuevaAsistencia = JSON.parse(JSON.stringify(this.ensMeetTeamPersonas))
            nuevaAsistencia.map(x=>{
                if(x.sys_user_code==persona.sys_user_code){
                    x.attended = !x.attended
                }
                return x
            })
            this.ensMeetTeamPersonas = nuevaAsistencia
        },
        changeRowReason(value, persona){


            let nuevaAsistencia = JSON.parse(JSON.stringify(this.ensMeetTeamPersonas))
            nuevaAsistencia.map(x=>{
                if(x.sys_user_code==persona.sys_user_code){
                    x.absentReasonID = value
                }
                return x
            })
            this.ensMeetTeamPersonas = nuevaAsistencia
        }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_view').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_edit: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_edit').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_insert: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_insert').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_report: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_report').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        allow_disable: { get () { 
            let resultado = false;
            this.$store.state[this.moduleName].editData.security.filter(x=>x.label=='allow_disable').map(y=>{
              resultado = y.value;  
            }).value; 
            return resultado }, 
        },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        ensMeetTeamPersonas: {
            get () { return this.$store.state[this.moduleName].editData.ensMeetTeamPersonas },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'ensMeetTeamPersonas', value: val}) }
        },
        lookup_absentReasons: {
            get () { return this.$store.state[this.moduleName].editData.lookup_absentReasons },
        },
    },
})
</script>
