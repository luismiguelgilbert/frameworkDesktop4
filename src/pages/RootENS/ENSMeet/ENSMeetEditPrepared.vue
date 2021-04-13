<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div>
      <q-toggle
        tabindex="-1"
        v-model="Prepared" color="primary" label="Se realizó reunión preparatoria?" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>

    <q-list dense bordered v-if="Prepared" >
        <q-item-label header class="text-primary text-subtitle2">Quiénes asistieron a preparar la reunión?</q-item-label>

        <q-item tag="label"  v-for="(persona, index) in ensMeetTeamPreparePersonas" :key="index" >
            <q-item-section avatar>
                <q-avatar size="20px">
                    <q-icon v-if="persona.uploadFileName == null" name="fas fa-camera" :color="userColor=='blackDark'?'white':'grey-7'" />
                    <q-img v-if="persona.uploadFileName != null" :src="$q.sessionStorage.getItem('serverFilesPath') + persona.uploadFileName">
                        <q-tooltip anchor="top left" self="top left" :content-class="userColor=='blackDark'?'bg-grey-9':'bg-grey-4'" >
                            <q-img  style="width: 250px" :src="$q.sessionStorage.getItem('serverFilesPath') + persona.uploadFileName" />
                        </q-tooltip>
                    </q-img>
                </q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label>{{persona.label}}</q-item-label>
            </q-item-section>
            <q-item-section side >
                <q-toggle  color="primary" :value="persona.attended" @input="changeRowState(persona)" />
            </q-item-section>
        </q-item>
    </q-list>
        


    <q-input v-if="Prepared" 
        label="Comentarios sobre la reunión preparatoria" placeholder="Ingrese comentarios, avisos, o mensajes importantes sobre la reunión preparatoria" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="PreparedComments" class="q-mt-lg"
        />


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
            let nuevaAsistencia = JSON.parse(JSON.stringify(this.ensMeetTeamPreparePersonas))
            nuevaAsistencia.map(x=>{
                if(x.sys_user_code==persona.sys_user_code){
                    x.attended = !x.attended
                }
                return x
            })
            this.ensMeetTeamPreparePersonas = nuevaAsistencia
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
        Prepared: {
            get () { return this.$store.state[this.moduleName].editData.basic.Prepared },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'Prepared', value: val}) }
        },
        PreparedComments: {
            get () { return this.$store.state[this.moduleName].editData.basic.PreparedComments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'PreparedComments', value: val}) }
        },
        ensMeetTeamPreparePersonas: {
            get () { return this.$store.state[this.moduleName].editData.ensMeetTeamPreparePersonas },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditDataAttribute', {key: 'ensMeetTeamPreparePersonas', value: val}) }
        },
        lookup_places: {
            get () { return this.$store.state[this.moduleName].editData.lookup_places },
        },
    },
})
</script>
