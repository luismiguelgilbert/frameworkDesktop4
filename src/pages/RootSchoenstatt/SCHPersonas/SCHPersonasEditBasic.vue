<template>
<q-form ref="formulario" greedy spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm">
    <div>
      <q-toggle
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
    <q-select
        label="Usuario (*)" placeholder="Seleccione el usuario (*)" emit-value map-options filled
        :options="lookup_users" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="sys_user_code"
        :option-disable="opt => !opt.estado"
        ref="sys_user_code"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="far fa-user" /></template>
    </q-select>
    <q-select
        label="Sexo (*)" placeholder="Seleccione el sexo (*)" emit-value map-options filled
        :options="lookup_sexo" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        v-model="sexo"
        ref="sexo"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-restroom" /></template>
    </q-select>
    <q-select
        label="Espos@ (*)" placeholder="Seleccione espos@ de la persona (*)" emit-value map-options filled
        :options="lookup_users" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :option-disable="opt => !opt.estado"
        v-model="related_persona_id"
        ref="related_persona_id"
        :rules="[
                val => val!= null || '* Requerido',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-heart" /></template>
    </q-select>

    <q-input
        ref="fecha_matrimonio" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha de matrimonio" label="Fecha de Matrimonio" filled
        v-model="fecha_matrimonio"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_fecha_matrimonio" transition-show="scale" transition-hide="scale">
              <q-date v-model="fecha_matrimonio">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-ring" /></template>
    </q-input>

    <q-input
        ref="birthday" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        mask="date" :rules="['date']"
        placeholder="Ingrese la fecha de nacimiento" label="Fecha de Nacimiento" filled
        v-model="birthday"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy_birthday" transition-show="scale" transition-hide="scale">
              <q-date v-model="birthday">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Seleccionar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:prepend><q-icon name="fas fa-birthday-cake" /></template>
    </q-input>

    <q-input
        ref="cedula" :readonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        placeholder="Ingrese la cédula de la persona (*)" label="Cédula (*)" filled
        v-model="cedula"
        :rules="[
                val => val.length > 4 || 'Campo debe tener al menos 5 carateres',
        ]"
        >
        <template v-slot:prepend><q-icon name="fas fa-id-card" /></template>
    </q-input>

    <br><br>
</q-form>
</template>
<script>
import Vue from 'vue';
import Vuex from 'vuex';


export default ({
    data () {
        return {
            moduleName: "SCHPersonas"
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
        estado: {
            get () { return this.$store.state[this.moduleName].editData.basic.estado },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'estado', value: val}) }
        },
        sys_user_code: {
            get () { return this.$store.state[this.moduleName].editData.basic.sys_user_code },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sys_user_code', value: val}) }
        },
        sexo:  {
            get () { return this.$store.state[this.moduleName].editData.basic.sexo },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'sexo', value: val}) }
        },
        related_persona_id:  {
            get () { return this.$store.state[this.moduleName].editData.basic.related_persona_id },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'related_persona_id', value: val}) }
        },
        fecha_matrimonio: {
            get () { return this.$store.state[this.moduleName].editData.basic.fecha_matrimonio },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'fecha_matrimonio', value: val}) }
        },
        birthday: {
            get () { return this.$store.state[this.moduleName].editData.basic.birthday },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'birthday', value: val}) }
        },
        cedula: {
            get () { return this.$store.state[this.moduleName].editData.basic.cedula },
            set (val) { this.$store.commit((this.moduleName)+'/updateEditData', {section: 'basic', key: 'cedula', value: val}) }
        },
        lookup_users: {
            get () { return this.$store.state[this.moduleName].editData.lookup_users },
        },
        lookup_sexo: {
            get () { return this.$store.state[this.moduleName].editData.lookup_sexo },
        },
    },
})
</script>
