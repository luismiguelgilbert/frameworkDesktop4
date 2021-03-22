<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div>
        
      <q-toggle
        tabindex="-1"
        v-model="anulado" color="red" label="Anulado" icon="fas fa-trash-alt" disable
        />
    </div>
    <q-input
        ref="accMoveID" readonly class="q-pt-md"
        placeholder="Número de Asiento Contable (*)" label="Asiento # (*)" filled type="number"
        v-model="accMoveID"
        :rules="[
                val => !!val || '* Requerido',
                val => val >= 0 || 'Campo debe ser mayor al 2000',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-hashtag" /></template>
    </q-input>
    <!--se inactiva cuando NO tiene permisos para editar/crear o cuando sea un journalID distinto a "Contabilidad"-->
    <q-select 
        label="Diario (*)" placeholder="Seleccione el Diario (*)" emit-value map-options filled
        :options="lookup_journals" :readonly="(allow_edit==false || allow_insert==false || journalID!=1)"
        v-model="journalID"
        :option-disable="opt => !opt.estado"
        ref="journalID"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="far fa-folder" /></template>
    </q-select>
    <q-input
        ref="accMoveDate" :readonly="(allow_edit==false || allow_insert==false || journalID!=1)"
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha del Asiento Contable" label="Fecha de Asiento Contable" filled
        v-model="accMoveDate"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy  ref="qDateProxy_accMoveDate" transition-show="scale" transition-hide="scale">
              <q-date v-model="accMoveDate" :readonly="(allow_edit==false || allow_insert==false || journalID!=1)">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-calendar" /></template>
    </q-input>
    
    <q-input
        label="Comentarios" placeholder="Ingrese comentarios sobre este Socio" filled
        type="textarea" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="comments"
        />
    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
    data () {
        return {
            moduleName: "AccMoves"
        }
    },
    mounted(){
        this.$refs.formulario.validate()
    },
    methods:{
      changeMonth(){
        /*if(this.parent_id){
          let temporal = this.lookup_accounts.find(x=>x.value == this.parent_id)
          this.code_es = temporal.code_es + '.xxx'
          this.account_type_root = temporal.account_type_root
          this.account_level = temporal.account_level?parseInt(temporal.account_level+1):1
        }else{
          this.code_es = ''
          this.account_type_root = 1
          this.account_level = 0
        }*/
      }
    },
    computed:{
        userColor: { get () { return this.$store.state.main.userColor }  },
        allow_view: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_view').value }, },
        allow_edit: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_edit').value }, },
        allow_insert: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_insert').value }, },
        allow_report: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_report').value }, },
        allow_disable: { get () { return this.$store.state[this.moduleName].security.find(x=>x.label=='allow_disable').value }, },
        editMode: { get () { return this.$store.state[this.moduleName].editMode }, },
        anulado: {
            get () { return this.$store.state[this.moduleName].editData.basic.anulado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'anulado', value: val}) }
        },
        accMoveID: {
            get () { return this.$store.state[this.moduleName].editData.basic.accMoveID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accMoveID', value: val}) }
        },
        accMoveDate:  {
            get () { return this.$store.state[this.moduleName].editData.basic.accMoveDate },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'accMoveDate', value: val}) }
        },
        journalID:  {
            get () { return this.$store.state[this.moduleName].editData.basic.journalID },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'journalID', value: val}) }
        },
        comments:  {
            get () { return this.$store.state[this.moduleName].editData.basic.comments },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'comments', value: val}) }
        },
        lookup_journals: {
            get () { return this.$store.state[this.moduleName].editData.lookup_journals },
        },
    },
})
</script>
