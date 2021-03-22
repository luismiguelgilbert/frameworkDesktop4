<template>
<q-form style="margin: -16px;" ref="formulario" greedy autofocus no-error-focus spellcheck="false" autocorrect="off" autocapitalize="off" class="q-gutter-sm q-pa-md">
    <div>
      <q-toggle
        tabindex="-1"
        v-model="estado" color="positive" label="Estado" :disable="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        />
    </div>
   
    <selectSearchable 
        autocomplete="off"
        prependIcon="far fa-user"
        labelText="Usuario (*)" labelSearchText="Buscar Usuario"
        :optionsList="this.lookup_users"
        rowValueField="value" optionsListLabel="label"
        :isRequired="true" 
        :isDisable="true" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="sys_user_code"
        :tableSearchColumns="[
                 { name: 'label', label: 'Usuario', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.sys_user_code=row.value;
            }"
        />

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

    <selectSearchable 
        autocomplete="off"
        prependIcon="fas fa-heart"
        labelText="Espos@ (*)" labelSearchText="Buscar Espos@"
        :optionsList="this.lookup_users"
        rowValueField="value" optionsListLabel="label"
        :isRequired="false" 
        :isDisable="false" 
        :isReadonly="(!editMode&&!allow_edit)||(editMode&&!allow_insert)"
        :initialValue="related_persona_id"
        :tableSearchColumns="[
                 { name: 'label', label: 'Usuario', field: 'label', align: 'left'}
            ]"
        @onItemSelected="(row)=>{
                this.related_persona_id=row.value;
            }"
        />

    <q-input
        class="q-mt-lg"
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
/*
import Vue from 'vue';
import Vuex from 'vuex';
*/
import selectSearchable from '../../../components/selectSearchable/selectSearchable.vue'

export default ({
  props: {
      moduleName: { type: String , required: true },
  },
  components:{
    selectSearchable
  },
  mounted(){
      this.$refs.formulario.validate()
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
